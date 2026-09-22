import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

interface RawRegistro {
  idregistro: string;
  fecha: string;
  completado: boolean;
  progreso_actual: number;
  puntos_ganados: number;
  observacion: string | null;
  idhabito: string;
  idusuario: string;
}

@Injectable()
export class RecordsRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  private getLocalHoy(tzOffset: number): string {
    const utcNow = new Date();
    const localTime = new Date(utcNow.getTime() + tzOffset * 60000);
    return localTime.toISOString().split('T')[0];
  }

  private get db() {
    return this.supabaseService.getClient().schema('seguimiento');
  }

  private mapToDomain(row: RawRegistro) {
    return {
      idRegistro: row.idregistro,
      fecha: row.fecha,
      completado: row.completado,
      progresoActual: row.progreso_actual,
      puntosGanados: row.puntos_ganados,
      observacion: row.observacion,
      idHabito: row.idhabito,
      idUsuario: row.idusuario,
    };
  }

  async findByHabitoId(habitoId: string) {
    const { data, error } = await this.db
      .schema('seguimiento').from('registro_habitos')
      .select('*')
      .eq('idhabito', habitoId)
      .order('fecha', { ascending: false })
      .returns<RawRegistro[]>();

    if (error) {
      throw new InternalServerErrorException(
        `Error al obtener registros: ${error.message}`,
      );
    }
    return (data ?? []).map(this.mapToDomain);
  }

  async findByUsuarioId(usuarioId: string) {
    const { data, error } = await this.db
      .schema('seguimiento').from('registro_habitos')
      .select(
        `
        idregistro, fecha, completado, progreso_actual, puntos_ganados,
        observacion, idhabito, idusuario,
        habitos(nombre, puntos, idcategoria)
      `,
      )
      .eq('idusuario', usuarioId)
      .order('fecha', { ascending: false })
      .returns<any[]>();

    if (error) {
      throw new InternalServerErrorException(
        `Error al obtener registros del usuario: ${error.message}`,
      );
    }

    return (data ?? []).map((row: any) => ({
      ...this.mapToDomain(row),
      habito: {
        nombre: row.habitos?.nombre ?? '',
        puntos: row.habitos?.puntos ?? 0,
        idCategoria: row.habitos?.idcategoria ?? '',
      },
    }));
  }

  async findHoy(habitoId: string, usuarioId: string, tzOffset: number = 0) {
    const hoy = this.getLocalHoy(tzOffset);

    const { data, error } = await this.db
      .schema('seguimiento').from('registro_habitos')
      .select('*')
      .eq('idhabito', habitoId)
      .eq('idusuario', usuarioId)
      .eq('fecha', hoy)
      .returns<RawRegistro[]>()
      .limit(1);

    if (error) {
      throw new InternalServerErrorException(
        `Error al buscar registro de hoy: ${error.message}`,
      );
    }
    return data && data.length > 0 ? this.mapToDomain(data[0]) : null;
  }

  async marcarCompletado(
    payload: {
      idhabito: string;
      idusuario: string;
      fecha: string;
      observacion?: string;
      metaDiaria: number;
    },
    tzOffset: number = 0,
  ) {
    const hoy = this.getLocalHoy(tzOffset);
    const { data, error } = await this.db
      .schema('seguimiento').from('registro_habitos')
      .upsert(
        {
          idhabito: payload.idhabito,
          idusuario: payload.idusuario,
          fecha: hoy,
          completado: true,
          progreso_actual: payload.metaDiaria,
          observacion: payload.observacion ?? null,
        },
        { onConflict: 'idhabito,idusuario,fecha' },
      )
      .select('*')
      .returns<RawRegistro[]>();

    if (error) {
      throw new InternalServerErrorException(
        `Error al marcar hábito: ${error.message}`,
      );
    }
    return data && data.length > 0 ? this.mapToDomain(data[0]) : null;
  }

  async desmarcarCompletado(habitoId: string, usuarioId: string, tzOffset: number = 0) {
    const hoy = this.getLocalHoy(tzOffset);

    const { data, error } = await this.db
      .schema('seguimiento').from('registro_habitos')
      .update({ completado: false, progreso_actual: 0 })
      .eq('idhabito', habitoId)
      .eq('idusuario', usuarioId)
      .eq('fecha', hoy)
      .select('*')
      .returns<RawRegistro[]>();

    if (error) {
      throw new InternalServerErrorException(
        `Error al desmarcar hábito: ${error.message}`,
      );
    }
    return data && data.length > 0 ? this.mapToDomain(data[0]) : null;
  }

  async avanzarProgreso(
    payload: {
      idhabito: string;
      idusuario: string;
      fecha: string;
      cantidadASumar: number;
      metaDiaria: number;
      observacion?: string;
    },
    tzOffset: number = 0,
  ) {
    const hoy = this.getLocalHoy(tzOffset);
    // Buscar progreso actual del día
    const { data: hoyRegs } = await this.db
      .schema('seguimiento').from('registro_habitos')
      .select('progreso_actual')
      .eq('idhabito', payload.idhabito)
      .eq('idusuario', payload.idusuario)
      .eq('fecha', hoy)
      .limit(1);

    const currentProgress = (hoyRegs && hoyRegs.length > 0) ? (hoyRegs[0] as any).progreso_actual : 0;
    const newProgress = Math.min(
      payload.metaDiaria,
      currentProgress + payload.cantidadASumar,
    );
    const completado = newProgress >= payload.metaDiaria;

    const { data, error } = await this.db
      .schema('seguimiento').from('registro_habitos')
      .upsert(
        {
          idhabito: payload.idhabito,
          idusuario: payload.idusuario,
          fecha: hoy,
          completado,
          progreso_actual: newProgress,
          observacion: payload.observacion ?? null,
        },
        { onConflict: 'idhabito,idusuario,fecha' },
      )
      .select('*')
      .returns<RawRegistro[]>();

    if (error) {
      throw new InternalServerErrorException(
        `Error al avanzar progreso: ${error.message}`,
      );
    }
    return data && data.length > 0 ? this.mapToDomain(data[0]) : null;
  }

  async calcularRacha(habitoId: string, usuarioId: string, tzOffset: number = 0) {
    const { data, error } = await this.db
      .schema('seguimiento').from('registro_habitos')
      .select('fecha, completado')
      .eq('idhabito', habitoId)
      .eq('idusuario', usuarioId)
      .eq('completado', true)
      .order('fecha', { ascending: false })
      .returns<{ fecha: string; completado: boolean }[]>();

    if (error) {
      throw new InternalServerErrorException(
        `Error al calcular racha: ${error.message}`,
      );
    }

    const registros = data ?? [];
    const totalCompletados = registros.length;

    if (totalCompletados === 0) {
      return {
        idHabito: habitoId,
        rachaActual: 0,
        rachaMaxima: 0,
        totalCompletados: 0,
      };
    }

    const hoyStr = this.getLocalHoy(tzOffset);
    const ayerDate = new Date(new Date().getTime() + tzOffset * 60000 - 86400000);
    const ayerStr = ayerDate.toISOString().split('T')[0];

    let rachaActual = 0;
    
    // Si el registro más reciente no es ni hoy ni ayer, la racha actual se rompió (es 0).
    if (registros[0].fecha !== hoyStr && registros[0].fecha !== ayerStr) {
      rachaActual = 0;
    } else {
      // La racha está viva. Empezamos a contar desde la fecha del registro más reciente.
      const fechaBase = new Date(registros[0].fecha + 'T00:00:00Z'); 
      for (let i = 0; i < registros.length; i++) {
        const fechaEsperada = new Date(fechaBase.getTime() - i * 86400000);
        if (registros[i].fecha === fechaEsperada.toISOString().split('T')[0]) {
          rachaActual++;
        } else {
          break;
        }
      }
    }

    let rachaMaxima = 0;
    let rachaTemp = 1;
    const fechasAsc = [...registros]
      .map((r) => r.fecha)
      .sort((a, b) => a.localeCompare(b));

    for (let i = 1; i < fechasAsc.length; i++) {
      const diffDias = Math.round(
        (new Date(fechasAsc[i]).getTime() -
          new Date(fechasAsc[i - 1]).getTime()) /
          86400000,
      );
      if (diffDias === 1) {
        rachaTemp++;
        rachaMaxima = Math.max(rachaMaxima, rachaTemp);
      } else {
        rachaTemp = 1;
      }
    }
    rachaMaxima = Math.max(rachaMaxima, rachaTemp);

    return { idHabito: habitoId, rachaActual, rachaMaxima, totalCompletados };
  }
}

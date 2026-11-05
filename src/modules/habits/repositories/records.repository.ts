import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../../core/supabase/services/supabase.service';

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

  private getLocalHoy(tzOffset?: number): string {
    const d = new Date();
    if (tzOffset && Number.isFinite(tzOffset)) {
      const localTime = new Date(d.getTime() - tzOffset * 60000);
      return localTime.toISOString().split("T")[0];
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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
      fecha?: string;
      observacion?: string;
      metaDiaria: number;
    },
    tzOffset: number = 0,
  ) {
    const hoy = payload.fecha && /^\d{4}-\d{2}-\d{2}$/.test(payload.fecha)
      ? payload.fecha
      : this.getLocalHoy(tzOffset);
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
      fecha?: string;
      cantidadASumar: number;
      metaDiaria: number;
      observacion?: string;
    },
    tzOffset: number = 0,
  ) {
    const hoy = payload.fecha && /^\d{4}-\d{2}-\d{2}$/.test(payload.fecha)
      ? payload.fecha
      : this.getLocalHoy(tzOffset);
    // Buscar progreso actual del día
    const { data: hoyRegs } = await this.db
      .schema('seguimiento').from('registro_habitos')
      .select('progreso_actual')
      .eq('idhabito', payload.idhabito)
      .eq('idusuario', payload.idusuario)
      .eq('fecha', hoy)
      .limit(1);

    const currentProgress = (hoyRegs && hoyRegs.length > 0) ? (hoyRegs[0] as any).progreso_actual : 0;
    const newProgress = Math.max(0, Math.min(
      payload.metaDiaria,
      currentProgress + payload.cantidadASumar,
    ));
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
      .from('registro_habitos')
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

    const { data: habitoData } = await this.db
      .from('habitos')
      .select('dias_semana')
      .eq('idhabito', habitoId)
      .maybeSingle<{ dias_semana?: number[] }>();

    const diasProgramados: number[] =
      habitoData?.dias_semana && Array.isArray(habitoData.dias_semana) && habitoData.dias_semana.length > 0
        ? habitoData.dias_semana
        : [1, 2, 3, 4, 5, 6, 7];

    const esDiaProgramado = (fechaStr: string): boolean => {
      const date = new Date(fechaStr + 'T12:00:00Z');
      const jsDay = date.getUTCDay();
      const habDay = jsDay === 0 ? 7 : jsDay;
      return diasProgramados.includes(habDay);
    };

    const getDiaProgramadoAnterior = (fechaStr: string): string => {
      let cur = new Date(new Date(fechaStr + 'T12:00:00Z').getTime() - 86400000);
      for (let k = 0; k < 14; k++) {
        const iso = cur.toISOString().split('T')[0];
        if (esDiaProgramado(iso)) return iso;
        cur = new Date(cur.getTime() - 86400000);
      }
      return cur.toISOString().split('T')[0];
    };

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
    const hoyEsProgramado = esDiaProgramado(hoyStr);
    const ultimoProgramadoRequerido = hoyEsProgramado ? hoyStr : getDiaProgramadoAnterior(hoyStr);
    const penultimoProgramadoRequerido = getDiaProgramadoAnterior(ultimoProgramadoRequerido);

    const registroMasReciente = registros[0].fecha;
    const fechasCompletadas = new Set(registros.map((r) => r.fecha));

    let rachaActual = 0;

    // La racha se mantiene viva si completó hoy (si es programado), o si completó el último día programado exigido
    const estaRachaViva =
      registroMasReciente === ultimoProgramadoRequerido ||
      (hoyEsProgramado && registroMasReciente === penultimoProgramadoRequerido);

    if (estaRachaViva) {
      let fechaEval = registroMasReciente;
      while (fechasCompletadas.has(fechaEval)) {
        rachaActual++;
        fechaEval = getDiaProgramadoAnterior(fechaEval);
      }
    }

    let rachaMaxima = 0;
    let rachaTemp = 0;
    const fechasAsc = Array.from(fechasCompletadas).sort((a, b) => a.localeCompare(b));

    for (let i = 0; i < fechasAsc.length; i++) {
      const fechaActual = fechasAsc[i];
      if (i === 0) {
        rachaTemp = 1;
      } else {
        const fechaAnterior = fechasAsc[i - 1];
        const esperadoAnterior = getDiaProgramadoAnterior(fechaActual);
        if (fechaAnterior === esperadoAnterior) {
          rachaTemp++;
        } else {
          rachaTemp = 1;
        }
      }
      if (rachaTemp > rachaMaxima) {
        rachaMaxima = rachaTemp;
      }
    }

    return { idHabito: habitoId, rachaActual, rachaMaxima, totalCompletados };
  }
}

import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

interface RawHabito {
  idhabito: string;
  nombre: string;
  descripcion: string | null;
  fechainicio: string;
  fechafin: string | null;
  estado: string;
  puntos: number;
  meta_diaria: number;
  unidad_medida: string;
  idusuario: string;
  idcategoria: string;
  dias_semana?: number[];
  categorias_habitos?: {
    idcategoria: string;
    nombre: string;
    descripcion: string | null;
    icono: string | null;
  } | null;
}

@Injectable()
export class HabitsRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  private getLocalHoy(tzOffset: number): string {
    const utcNow = new Date();
    const localTime = new Date(utcNow.getTime() + tzOffset * 60000);
    return localTime.toISOString().split('T')[0];
  }

  private get db() {
    return this.supabaseService.getClient().schema('seguimiento');
  }

  private readonly SELECT_WITH_CATEGORIA = `
    idhabito, nombre, descripcion, fechainicio, fechafin, estado,
    puntos, meta_diaria, unidad_medida, idusuario, idcategoria, dias_semana,
    categorias_habitos!fk_habitos_categoria(idcategoria, nombre, descripcion, icono)
  `;

  mapToDomain(row: RawHabito) {
    return {
      idHabito: row.idhabito,
      nombre: row.nombre,
      descripcion: row.descripcion,
      fechaInicio: row.fechainicio,
      fechaFin: row.fechafin,
      estado: row.estado,
      puntos: row.puntos,
      metaDiaria: row.meta_diaria,
      unidadMedida: row.unidad_medida,
      idUsuario: row.idusuario,
      idCategoria: row.idcategoria,
      diasSemana: row.dias_semana ?? [1, 2, 3, 4, 5, 6, 7],
      categoria: row.categorias_habitos
        ? {
            idCategoria: row.categorias_habitos.idcategoria,
            nombre: row.categorias_habitos.nombre,
            descripcion: row.categorias_habitos.descripcion,
            icono: row.categorias_habitos.icono,
          }
        : null,
    };
  }

  async findById(idHabito: string) {
    const { data, error } = await this.db
      .from('habitos')
      .select(this.SELECT_WITH_CATEGORIA)
      .eq('idhabito', idHabito)
      .returns<RawHabito>()
      .single<RawHabito>();

    if (error && error.code !== 'PGRST116') {
      throw new InternalServerErrorException(
        `Error al buscar hábito: ${error.message}`,
      );
    }
    return data ? this.mapToDomain(data) : null;
  }

  async findByUserId(userId: string, estado?: string) {
    let query = this.db
      .from('habitos')
      .select(this.SELECT_WITH_CATEGORIA)
      .eq('idusuario', userId)
      .order('fechainicio', { ascending: false })
      .returns<RawHabito[]>();

    if (estado) query = (query as any).eq('estado', estado);

    const { data, error } = await query;
    if (error) {
      throw new InternalServerErrorException(
        `Error al obtener hábitos: ${error.message}`,
      );
    }
    return (data ?? []).map((row: RawHabito) => this.mapToDomain(row));
  }

  async findByUserIdWithRecordToday(userId: string, tzOffset: number = 0) {
    // Calculamos el 'hoy' respetando la zona horaria del usuario
    const hoy = this.getLocalHoy(tzOffset);

    const { data, error } = await this.db
      .from('habitos')
      .select(
        `
        idhabito, nombre, descripcion, fechainicio, fechafin, estado,
        puntos, meta_diaria, unidad_medida, idusuario, idcategoria, dias_semana,
        categorias_habitos!fk_habitos_categoria(idcategoria, nombre, descripcion, icono),
        registro_habitos(idregistro, completado, progreso_actual, puntos_ganados, observacion, fecha)
      `,
      )
      .eq('idusuario', userId)
      .eq('estado', 'Activo')
      .order('nombre', { ascending: true })
      .returns<any[]>();

    if (error) {
      throw new InternalServerErrorException(
        `Error al obtener dashboard: ${error.message}`,
      );
    }

    return (data ?? []).map((row: any) => {
      const registros = row.registro_habitos ?? [];
      const registroHoy = registros.find((r: any) => r.fecha === hoy) ?? null;
      const fechasCompletadas = registros
        .filter((r: any) => r.completado)
        .map((r: any) => r.fecha);

      // Calcular racha actual
      const sortedRegistros = [...registros].sort((a: any, b: any) => 
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
      
      let rachaActual = 0;
      let checkingCurrentStreak = true;
      for (const record of sortedRegistros) {
        if (record.completado) {
          if (checkingCurrentStreak) rachaActual++;
        } else {
          checkingCurrentStreak = false;
        }
      }

      return {
        ...this.mapToDomain(row),
        registroHoy: registroHoy
          ? {
              idRegistro: registroHoy.idregistro,
              completado: registroHoy.completado,
              progresoActual: registroHoy.progreso_actual,
              puntosGanados: registroHoy.puntos_ganados,
              observacion: registroHoy.observacion,
            }
          : null,
        fechasCompletadas,
        rachaActual,
      };
    });
  }

  async findCategorias() {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('seguimiento')
      .from('categorias_habitos')
      .select('idcategoria, nombre, descripcion, icono')
      .order('nombre', { ascending: true })
      .returns<
        { idcategoria: string; nombre: string; descripcion: string | null; icono: string | null }[]
      >();

    if (error) {
      throw new InternalServerErrorException(
        `Error al obtener categorías: ${error.message}`,
      );
    }
    return (data ?? []).map((row) => ({
      idCategoria: row.idcategoria,
      nombre: row.nombre,
      descripcion: row.descripcion,
      icono: row.icono,
    }));
  }

  async create(payload: {
    nombre: string;
    descripcion?: string;
    fechainicio: string;
    fechafin?: string;
    estado: string;
    puntos: number;
    meta_diaria: number;
    unidad_medida: string;
    idusuario: string;
    idcategoria: string;
    dias_semana: number[];
  }) {
    const { data, error } = await this.db
      .from('habitos')
      .insert(payload)
      .select(this.SELECT_WITH_CATEGORIA)
      .returns<RawHabito>()
      .single<RawHabito>();

    if (error) {
      throw new InternalServerErrorException(
        `Error al crear hábito: ${error.message}`,
      );
    }
    return this.mapToDomain(data);
  }

  async update(idHabito: string, payload: any) {
    const { data, error } = await this.db
      .from('habitos')
      .update(payload)
      .eq('idhabito', idHabito)
      .select(this.SELECT_WITH_CATEGORIA)
      .returns<RawHabito>()
      .single<RawHabito>();

    if (error) {
      throw new InternalServerErrorException(
        `Error al actualizar hábito: ${error.message}`,
      );
    }
    return this.mapToDomain(data);
  }

  async getHabitStats(idHabito: string) {
    // Buscar todos los registros de este hábito
    const { data: records, error } = await this.db
      .schema('seguimiento').from('registro_habitos')
      .select('*')
      .eq('idhabito', idHabito)
      .order('fecha', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(
        `Error al obtener registros del hábito: ${error.message}`,
      );
    }

    // Calcular estadísticas
    let rachaActual = 0;
    let mejorRacha = 0;
    let totalCumplido = 0;
    let currentStreak = 0;

    // Los records vienen ordenados de más reciente a más antiguo
    // Para calcular racha actual, revisamos desde el principio (fechas recientes)
    let checkingCurrentStreak = true;
    for (const record of records) {
      if (record.completado) {
        if (checkingCurrentStreak) rachaActual++;
        totalCumplido++;
      } else {
        checkingCurrentStreak = false;
      }
    }

    // Para calcular mejor racha, necesitamos iterar en orden cronológico (de antiguo a reciente), o simplemente hacerlo aquí
    for (let i = records.length - 1; i >= 0; i--) {
      if (records[i].completado) {
        currentStreak++;
        if (currentStreak > mejorRacha) mejorRacha = currentStreak;
      } else {
        currentStreak = 0;
      }
    }

    // Obtener los últimos 7 días (historialReciente)
    // Asumimos que los registros se crean uno por día, tomamos los primeros 7 (que son los más recientes por el order descending)
    const historialReciente = records.slice(0, 7).map(r => ({
      fecha: r.fecha,
      completado: r.completado,
      progresoActual: r.progreso_actual,
      puntosGanados: r.puntos_ganados,
    })).reverse(); // Invertir para que el más reciente quede al final (L, M, M...)

    return {
      rachaActual,
      mejorRacha,
      totalCumplido,
      historialReciente,
    };
  }

  async delete(idHabito: string): Promise<void> {
    // Borrar registros y recordatorios primero
    await this.db.schema('seguimiento').from('registro_habitos').delete().eq('idhabito', idHabito);

    await this.db.from('recordatorios').delete().eq('idhabito', idHabito);

    const { error } = await this.db
      .from('habitos')
      .delete()
      .eq('idhabito', idHabito);

    if (error) {
      throw new InternalServerErrorException(
        `Error al eliminar hábito: ${error.message}`,
      );
    }
  }
}

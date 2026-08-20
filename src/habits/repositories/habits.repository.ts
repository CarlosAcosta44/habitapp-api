import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
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
  categorias_habitos?: {
    idcategoria: string;
    nombre: string;
    descripcion: string | null;
  } | null;
}

@Injectable()
export class HabitsRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get db() {
    return this.supabaseService.getClient().schema('seguimiento');
  }

  private readonly SELECT_WITH_CATEGORIA = `
    idhabito, nombre, descripcion, fechainicio, fechafin, estado,
    puntos, meta_diaria, unidad_medida, idusuario, idcategoria,
    categorias_habitos!fk_habitos_categoria(idcategoria, nombre, descripcion)
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
      categoria: row.categorias_habitos
        ? {
            idCategoria: row.categorias_habitos.idcategoria,
            nombre: row.categorias_habitos.nombre,
            descripcion: row.categorias_habitos.descripcion,
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

  async findByUserIdWithRecordToday(userId: string) {
    const hoy = new Date().toISOString().split('T')[0];

    const { data, error } = await this.db
      .from('habitos')
      .select(`
        idhabito, nombre, descripcion, fechainicio, fechafin, estado,
        puntos, meta_diaria, unidad_medida, idusuario, idcategoria,
        categorias_habitos!fk_habitos_categoria(idcategoria, nombre, descripcion),
        registro_habitos(idregistro, completado, progreso_actual, puntos_ganados, observacion, fecha)
      `)
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
      const registroHoy =
        registros.find((r: any) => r.fecha === hoy) ?? null;
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
      };
    });
  }

  async findCategorias() {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('seguimiento')
      .from('categorias_habitos')
      .select('idcategoria, nombre, descripcion')
      .order('nombre', { ascending: true })
      .returns<{ idcategoria: string; nombre: string; descripcion: string | null }[]>();

    if (error) {
      throw new InternalServerErrorException(
        `Error al obtener categorías: ${error.message}`,
      );
    }
    return (data ?? []).map((row) => ({
      idCategoria: row.idcategoria,
      nombre: row.nombre,
      descripcion: row.descripcion,
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
    return this.mapToDomain(data!);
  }

  async update(idHabito: string, updates: Record<string, unknown>) {
    const { data, error } = await this.db
      .from('habitos')
      .update(updates)
      .eq('idhabito', idHabito)
      .select(this.SELECT_WITH_CATEGORIA)
      .returns<RawHabito>()
      .single<RawHabito>();

    if (error) {
      throw new InternalServerErrorException(
        `Error al actualizar hábito: ${error.message}`,
      );
    }
    return this.mapToDomain(data!);
  }

  async delete(idHabito: string): Promise<void> {
    // Borrar registros y recordatorios primero
    await this.db
      .from('registro_habitos')
      .delete()
      .eq('idhabito', idHabito);

    await this.db
      .from('recordatorios')
      .delete()
      .eq('idhabito', idHabito);

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

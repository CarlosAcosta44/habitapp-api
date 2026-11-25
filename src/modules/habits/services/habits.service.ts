import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { HabitsRepository } from '../repositories/habits.repository';
import { CreateHabitDto } from '../dto/create-habit.dto';
import { UpdateHabitDto } from '../dto/update-habit.dto';

@Injectable()
export class HabitsService {
  constructor(private readonly habitsRepo: HabitsRepository) {}

  async getDashboard(userId: string, tzOffset: number = 0) {
    return this.habitsRepo.findByUserIdWithRecordToday(userId, tzOffset);
  }

  async findAll(userId: string, estado?: string) {
    const estadoDb = (estado === "Archivado" || estado === "Pausado") ? "Inactivo" : estado;
    return this.habitsRepo.findByUserId(userId, estadoDb);
  }

  async findById(idHabito: string, userId: string) {
    const habito = await this.habitsRepo.findById(idHabito);
    if (!habito)
      throw new NotFoundException(`Hábito ${idHabito} no encontrado`);
    if (habito.idUsuario !== userId)
      throw new ForbiddenException('Acceso denegado');
    return habito;
  }

  async getHabitStats(idHabito: string, userId: string) {
    const habito = await this.findById(idHabito, userId);
    const stats = await this.habitsRepo.getHabitStats(idHabito);

    // Calcular tasa de éxito
    // Días desde la creación hasta hoy
    const fechaInicio = new Date(habito.fechaInicio);
    const hoy = new Date();
    
    // Contar cuántos días de la semana seleccionados pasaron desde la creación
    let diasEsperados = 0;
    const current = new Date(fechaInicio);
    while (current <= hoy) {
      // 0 = Sunday, 1 = Monday... in JS. Our dias_semana is 1=Monday...7=Sunday.
      const jsDay = current.getDay();
      const habitDay = jsDay === 0 ? 7 : jsDay;
      if (habito.diasSemana.includes(habitDay)) {
        diasEsperados++;
      }
      current.setDate(current.getDate() + 1);
    }

    const tasaExito = diasEsperados > 0 
      ? Math.round((stats.totalCumplido / diasEsperados) * 100) 
      : 100; // si no han pasado días esperados aún (ej. se creó hoy pero para un día futuro)

    return {
      ...habito, // Enviar también los datos del hábito
      rachaActual: stats.rachaActual,
      mejorRacha: stats.mejorRacha,
      totalCumplido: stats.totalCumplido,
      tasaExito: Math.min(100, tasaExito), // Capped at 100% just in case of multiple completions per day
      historialReciente: stats.historialReciente,
    };
  }

  async getCategorias() {
    return this.habitsRepo.findCategorias();
  }

  async create(dto: CreateHabitDto, userId: string) {
    const today = new Date().toISOString().split('T')[0];
    const fechaInicio = dto.fechaInicio || today;

    // ─── Reglas de negocio ────────────────────────────────────────────────────
    if (dto.fechaFin && dto.fechaFin <= fechaInicio) {
      throw new BadRequestException(
        'La fecha de fin debe ser posterior a la fecha de inicio',
      );
    }
    // puntos 1-100 ya validado por class-validator en el DTO

    const created = await this.habitsRepo.create({
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      fechainicio: fechaInicio,
      fechafin: dto.fechaFin,
      estado: 'Activo',
      puntos: dto.puntos,
      meta_diaria: dto.metaDiaria ?? 1,
      unidad_medida: dto.unidadMedida ?? 'veces',
      idusuario: userId,
      idcategoria: dto.idCategoria,
      dias_semana: dto.diasSemana ?? [1, 2, 3, 4, 5, 6, 7],
    });

    if (Array.isArray(dto.recordatorios) && dto.recordatorios.length > 0) {
      const habitId = (created as any)?.idHabito || (created as any)?.idhabito;
      if (habitId) {
        await this.habitsRepo.syncRecordatorios(habitId, dto.recordatorios);
      }
    }

    return created;
  }

  private buildHabitDbUpdates(dto: UpdateHabitDto): Record<string, unknown> {
    const fieldMap: Array<[keyof UpdateHabitDto, string]> = [
      ['nombre', 'nombre'],
      ['descripcion', 'descripcion'],
      ['fechaFin', 'fechafin'],
      ['puntos', 'puntos'],
      ['idCategoria', 'idcategoria'],
      ['diasSemana', 'dias_semana'],
      ['metaDiaria', 'meta_diaria'],
      ['unidadMedida', 'unidad_medida'],
    ];

    const dbUpdates: Record<string, unknown> = {};
    for (const [dtoKey, dbKey] of fieldMap) {
      if (dto[dtoKey] !== undefined) {
        dbUpdates[dbKey] = dto[dtoKey];
      }
    }

    if (dto.estado !== undefined) {
      const inactiveStates = new Set(['Archivado', 'Pausado', 'Inactivo']);
      dbUpdates.estado = inactiveStates.has(dto.estado) ? 'Inactivo' : dto.estado;
    }

    return dbUpdates;
  }

  async update(idHabito: string, dto: UpdateHabitDto, userId: string) {
    const habito = await this.findById(idHabito, userId);

    // ─── Reglas de negocio ────────────────────────────────────────────────────
    if (habito.estado === 'Completado' && dto.estado === 'Activo') {
      throw new BadRequestException(
        'No se puede reactivar un hábito ya completado',
      );
    }
    if (dto.fechaFin && dto.fechaFin <= habito.fechaInicio) {
      throw new BadRequestException(
        'La fecha de fin debe ser posterior a la fecha de inicio',
      );
    }

    const dbUpdates = this.buildHabitDbUpdates(dto);

    if (Array.isArray(dto.recordatorios)) {
      await this.habitsRepo.syncRecordatorios(idHabito, dto.recordatorios);
    }

    return this.habitsRepo.update(idHabito, dbUpdates);
  }

  async completar(idHabito: string, userId: string) {
    return this.update(idHabito, { estado: 'Completado' }, userId);
  }

  async delete(idHabito: string, userId: string) {
    const habito = await this.habitsRepo.findById(idHabito);
    if (!habito)
      throw new NotFoundException(`Hábito ${idHabito} no encontrado`);
    if (habito.idUsuario !== userId)
      throw new ForbiddenException('Acceso denegado');
    await this.habitsRepo.delete(idHabito);
    return { success: true };
  }
}

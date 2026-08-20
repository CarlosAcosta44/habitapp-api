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

  async getDashboard(userId: string) {
    return this.habitsRepo.findByUserIdWithRecordToday(userId);
  }

  async findAll(userId: string, estado?: string) {
    return this.habitsRepo.findByUserId(userId, estado);
  }

  async findById(idHabito: string, userId: string) {
    const habito = await this.habitsRepo.findById(idHabito);
    if (!habito)
      throw new NotFoundException(`Hábito ${idHabito} no encontrado`);
    if (habito.idUsuario !== userId)
      throw new ForbiddenException('Acceso denegado');
    return habito;
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

    return this.habitsRepo.create({
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
    });
  }

  async update(idHabito: string, dto: UpdateHabitDto, userId: string) {
    const habito = await this.habitsRepo.findById(idHabito);
    if (!habito)
      throw new NotFoundException(`Hábito ${idHabito} no encontrado`);
    if (habito.idUsuario !== userId)
      throw new ForbiddenException('Acceso denegado');

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

    const dbUpdates: Record<string, unknown> = {};
    if (dto.nombre !== undefined) dbUpdates.nombre = dto.nombre;
    if (dto.descripcion !== undefined) dbUpdates.descripcion = dto.descripcion;
    if (dto.fechaFin !== undefined) dbUpdates.fechafin = dto.fechaFin;
    if (dto.estado !== undefined) dbUpdates.estado = dto.estado;
    if (dto.puntos !== undefined) dbUpdates.puntos = dto.puntos;
    if (dto.idCategoria !== undefined) dbUpdates.idcategoria = dto.idCategoria;

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

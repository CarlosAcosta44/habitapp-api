import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { RecordsRepository } from '../repositories/records.repository';
import { HabitsRepository } from '../../habits/repositories/habits.repository';
import { CreateRecordDto, AvanzarProgresoDto } from '../dto/create-record.dto';

@Injectable()
export class RecordsService {
  constructor(
    private readonly recordsRepo: RecordsRepository,
    private readonly habitsRepo: HabitsRepository,
  ) {}

  async getByHabito(habitoId: string, userId: string) {
    // Verificar ownership del hábito
    const habito = await this.habitsRepo.findById(habitoId);
    if (!habito)
      throw new NotFoundException(`Hábito ${habitoId} no encontrado`);
    if (habito.idUsuario !== userId)
      throw new ForbiddenException('Acceso denegado');

    return this.recordsRepo.findByHabitoId(habitoId);
  }

  async getHistorial(userId: string) {
    return this.recordsRepo.findByUsuarioId(userId);
  }

  async marcarCompletado(dto: CreateRecordDto, userId: string) {
    // Verificar ownership del hábito
    const habito = await this.habitsRepo.findById(dto.idHabito);
    if (!habito)
      throw new NotFoundException(`Hábito ${dto.idHabito} no encontrado`);
    if (habito.idUsuario !== userId)
      throw new ForbiddenException('Acceso denegado');

    const hoy = new Date().toISOString().split('T')[0];

    // Verificar si ya fue completado hoy
    const registroHoy = await this.recordsRepo.findHoy(dto.idHabito, userId);
    if (registroHoy?.completado) {
      throw new BadRequestException('Este hábito ya fue completado hoy');
    }

    return this.recordsRepo.marcarCompletado({
      idhabito: dto.idHabito,
      idusuario: userId,
      fecha: hoy,
      observacion: dto.observacion,
    });
  }

  async desmarcarCompletado(habitoId: string, userId: string) {
    const habito = await this.habitsRepo.findById(habitoId);
    if (!habito)
      throw new NotFoundException(`Hábito ${habitoId} no encontrado`);
    if (habito.idUsuario !== userId)
      throw new ForbiddenException('Acceso denegado');

    const registroHoy = await this.recordsRepo.findHoy(habitoId, userId);
    if (!registroHoy) {
      throw new BadRequestException('No hay registro de hoy para desmarcar');
    }
    if (!registroHoy.completado) {
      throw new BadRequestException(
        'Este hábito no está marcado como completado hoy',
      );
    }

    return this.recordsRepo.desmarcarCompletado(habitoId, userId);
  }

  async avanzarProgreso(dto: AvanzarProgresoDto, userId: string) {
    const habito = await this.habitsRepo.findById(dto.idHabito);
    if (!habito)
      throw new NotFoundException(`Hábito ${dto.idHabito} no encontrado`);
    if (habito.idUsuario !== userId)
      throw new ForbiddenException('Acceso denegado');

    if (dto.cantidadASumar <= 0) {
      throw new BadRequestException(
        'La cantidad a sumar debe ser mayor a cero',
      );
    }

    const hoy = new Date().toISOString().split('T')[0];

    return this.recordsRepo.avanzarProgreso({
      idhabito: dto.idHabito,
      idusuario: userId,
      fecha: hoy,
      cantidadASumar: dto.cantidadASumar,
      metaDiaria: habito.metaDiaria,
      observacion: dto.observacion,
    });
  }

  async getRacha(habitoId: string, userId: string) {
    const habito = await this.habitsRepo.findById(habitoId);
    if (!habito)
      throw new NotFoundException(`Hábito ${habitoId} no encontrado`);
    if (habito.idUsuario !== userId)
      throw new ForbiddenException('Acceso denegado');

    return this.recordsRepo.calcularRacha(habitoId, userId);
  }
}

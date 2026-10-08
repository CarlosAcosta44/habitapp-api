import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { RecordsRepository } from '../repositories/records.repository';
import { HabitsRepository } from '../repositories/habits.repository';
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

  async marcarCompletado(dto: CreateRecordDto, userId: string, tzOffset: number = 0) {
    // Verificar ownership del hábito
    const habito = await this.habitsRepo.findById(dto.idHabito);
    if (!habito)
      throw new NotFoundException(`Hábito ${dto.idHabito} no encontrado`);
    if (habito.idUsuario !== userId)
      throw new ForbiddenException('Acceso denegado');

    return this.recordsRepo.marcarCompletado(
      {
        idhabito: dto.idHabito,
        idusuario: userId,
        fecha: '', // Calculated in repo
        observacion: dto.observacion,
        metaDiaria: habito.metaDiaria,
      },
      tzOffset,
    );
  }

  async desmarcarCompletado(habitoId: string, userId: string, tzOffset: number = 0) {
    const habito = await this.habitsRepo.findById(habitoId);
    if (!habito)
      throw new NotFoundException(`Hábito ${habitoId} no encontrado`);
    if (habito.idUsuario !== userId)
      throw new ForbiddenException('Acceso denegado');

    const registroHoy = await this.recordsRepo.findHoy(habitoId, userId, tzOffset);
    if (!registroHoy) {
      throw new BadRequestException('No hay registro de hoy para desmarcar');
    }
    if (!registroHoy.completado) {
      throw new BadRequestException(
        'Este hábito no está marcado como completado hoy',
      );
    }

    return this.recordsRepo.desmarcarCompletado(habitoId, userId, tzOffset);
  }

  async avanzarProgreso(dto: AvanzarProgresoDto, userId: string, tzOffset: number = 0) {
    const habito = await this.habitsRepo.findById(dto.idHabito);
    if (!habito)
      throw new NotFoundException(`Hábito ${dto.idHabito} no encontrado`);
    if (habito.idUsuario !== userId)
      throw new ForbiddenException('Acceso denegado');

    if (dto.cantidadASumar === 0) {
      throw new BadRequestException(
        'La cantidad a sumar/restar no puede ser cero',
      );
    }

    return this.recordsRepo.avanzarProgreso(
      {
        idhabito: dto.idHabito,
        idusuario: userId,
        fecha: '', // Calculated in repo
        cantidadASumar: dto.cantidadASumar,
        metaDiaria: habito.metaDiaria,
        observacion: dto.observacion,
      },
      tzOffset,
    );
  }

  async getRacha(habitoId: string, userId: string, tzOffset: number = 0) {
    const habito = await this.habitsRepo.findById(habitoId);
    if (!habito)
      throw new NotFoundException(`Hábito ${habitoId} no encontrado`);
    if (habito.idUsuario !== userId)
      throw new ForbiddenException('Acceso denegado');

    return this.recordsRepo.calcularRacha(habitoId, userId, tzOffset);
  }
}

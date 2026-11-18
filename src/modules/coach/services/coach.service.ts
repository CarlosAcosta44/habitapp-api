import { Injectable } from '@nestjs/common';
import { CoachRepository } from '../repositories/coach.repository';
import { CreateRoutineDto } from '../dto/create-routine.dto';
import { UpdateRoutineDto } from '../dto/update-routine.dto';
import { ReportsService } from '../../reports/services/reports.service';

@Injectable()
export class CoachService {
  constructor(
    private readonly coachRepository: CoachRepository,
    private readonly reportsService: ReportsService,
  ) {}

  private async getTrainerId(userId: string): Promise<string> {
    return this.coachRepository.getTrainerId(userId);
  }

  async getClients(userId: string) {
    const trainerId = await this.getTrainerId(userId);
    const data = await this.coachRepository.getClientsByTrainer(trainerId);

    const clientsWithProfiles = await Promise.all(
      data.map(async (item: any) => {
        const profile = await this.coachRepository.getUserProfile(item.idusuario);

        return {
          assigned_at: item.fechainicio,
          client: profile
            ? {
                id: profile.idusuario,
                idusuario: profile.idusuario,
                nombre: profile.nombre,
                apellido: profile.apellido,
                full_name: `${profile.nombre || ''} ${profile.apellido || ''}`.trim(),
                email: profile.email || '',
                correo: profile.email || '',
                fotoperfil: profile.fotoperfil,
                avatar_url: profile.fotoperfil,
                puntostotales: profile.puntostotales || 0,
                total_points: profile.puntostotales || 0,
                idrol: profile.idrol,
                nombrerol: profile?.roles?.nombrerol || 'Usuario',
              }
            : null,
        };
      }),
    );

    return clientsWithProfiles;
  }

  async createRoutine(userId: string, dto: CreateRoutineDto) {
    const trainerId = await this.getTrainerId(userId);

    const routine = await this.coachRepository.createRoutine(
      trainerId, 
      dto.description || '', 
      dto.name
    );

    if (dto.habits && dto.habits.length > 0) {
      console.warn(
        'Asignación detallada de hábitos pausada por falta de tabla rutina_habitos',
      );
    }

    return this.getRoutineById(userId, routine.idrutina);
  }

  async getRoutines(userId: string) {
    const trainerId = await this.getTrainerId(userId);
    const data = await this.coachRepository.getRoutinesByTrainer(trainerId);

    return data.map((r: any) => ({
      ...r,
      name: r.objetivo,
      description: r.descripcion,
      id: r.idrutina,
      routine_habits: [],
    }));
  }

  async getRoutineById(userId: string, routineId: string) {
    const trainerId = await this.getTrainerId(userId);
    const data = await this.coachRepository.getRoutineByIdAndTrainer(routineId, trainerId);

    return {
      ...data,
      name: data.objetivo,
      description: data.descripcion,
      id: data.idrutina,
      routine_habits: [],
    };
  }

  async updateRoutine(
    userId: string,
    routineId: string,
    dto: UpdateRoutineDto,
  ) {
    const trainerId = await this.getTrainerId(userId);
    await this.getRoutineById(userId, routineId);

    const updateData: any = {};
    if (dto.name !== undefined) updateData.objetivo = dto.name;
    if (dto.description !== undefined) updateData.descripcion = dto.description;

    if (Object.keys(updateData).length > 0) {
      await this.coachRepository.updateRoutine(routineId, trainerId, updateData);
    }

    if (dto.habits) {
      console.warn(
        'Actualización de hábitos pausada por falta de tabla rutina_habitos',
      );
    }

    return this.getRoutineById(userId, routineId);
  }

  async deleteRoutine(userId: string, routineId: string) {
    const trainerId = await this.getTrainerId(userId);
    await this.getRoutineById(userId, routineId);

    // 1. Eliminar asignaciones de usuarios a esta rutina (cascada manual)
    await this.coachRepository.deleteRoutineAssignments(routineId);

    // 2. Eliminar la rutina
    await this.coachRepository.deleteRoutine(routineId, trainerId);
  }

  async assignRoutineToClient(
    userId: string,
    clientId: string,
    routineId: string,
  ) {
    const trainerId = await this.getTrainerId(userId);

    await this.coachRepository.getClientTrainerRelationship(trainerId, clientId);
    await this.getRoutineById(userId, routineId);
    await this.coachRepository.assignRoutineToClient(clientId, routineId);

    return {
      message: 'Routine assigned successfully to client',
      habitsAssigned: 0,
    };
  }

  async getClientProgress(userId: string, clientId: string) {
    const trainerId = await this.getTrainerId(userId);
    await this.coachRepository.getClientTrainerRelationship(trainerId, clientId);

    return this.reportsService.getUserSummary(clientId);
  }

  async sendRecommendation(
    userId: string,
    clientId: string,
    dto: { message: string; type?: string },
  ) {
    const trainerId = await this.getTrainerId(userId);
    await this.coachRepository.getClientTrainerRelationship(trainerId, clientId);

    return this.coachRepository.createRecommendation(
      clientId,
      dto.message,
      dto.type || 'Recomendación',
    );
  }
}

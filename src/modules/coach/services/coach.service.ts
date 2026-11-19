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
        const [profile, summary] = await Promise.all([
          this.coachRepository.getUserProfile(item.idusuario),
          this.reportsService.getUserSummary(item.idusuario).catch(() => null),
        ]);

        const activeHabits = summary?.activeHabits || [];
        const completedToday = activeHabits.filter((h: any) => h.completadoHoy).length;

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
                racha_actual: summary?.racha_actual || 0,
                racha_maxima: summary?.racha_maxima || 0,
                cumplimiento: summary?.cumplimiento_global || 0,
                completados_hoy: completedToday,
                total_habitos: activeHabits.length,
              }
            : null,
        };
      }),
    );

    return clientsWithProfiles;
  }

  private encodeRoutineDescription(
    description?: string,
    habits?: Array<{ habit_name: string }>,
  ): string {
    const cleanDesc = (description || '').split('||HABITS:')[0].trim();
    const validHabits = (habits || [])
      .map((h) => (h.habit_name || '').trim())
      .filter(Boolean);

    if (validHabits.length === 0) {
      return cleanDesc.slice(0, 500);
    }

    const encodedHabits = `||HABITS:${validHabits.join(';')}`;
    const maxDescLen = Math.max(0, 500 - encodedHabits.length - 1);
    return `${cleanDesc.slice(0, maxDescLen)} ${encodedHabits}`.trim();
  }

  private parseRoutineRow(r: any) {
    const rawDesc = r.descripcion || '';
    const [cleanDesc, habitsPart] = rawDesc.split('||HABITS:');
    const habitNames = habitsPart
      ? habitsPart
          .split(';')
          .map((s: string) => s.trim())
          .filter(Boolean)
      : [];

    const routineHabits =
      habitNames.length > 0
        ? habitNames.map((name: string, idx: number) => ({
            habit_name: name,
            order_index: idx,
          }))
        : [{ habit_name: r.objetivo || 'Hábito principal', order_index: 0 }];

    return {
      ...r,
      id: r.idrutina,
      name: r.objetivo,
      description: cleanDesc.trim(),
      tipo: r.tipo || 'Bienestar',
      nivel: r.nivel || 'Principiante',
      duracion: r.duracion ?? 21,
      routine_habits: routineHabits,
    };
  }

  async createRoutine(userId: string, dto: CreateRoutineDto) {
    const trainerId = await this.getTrainerId(userId);
    const encodedDesc = this.encodeRoutineDescription(dto.description, dto.habits);

    const routine = await this.coachRepository.createRoutine(
      trainerId,
      encodedDesc,
      dto.name,
      {
        tipo: dto.tipo,
        nivel: dto.nivel,
        duracion: dto.duracion,
      },
    );

    return this.getRoutineById(userId, routine.idrutina);
  }

  async getRoutines(userId: string) {
    const trainerId = await this.getTrainerId(userId);
    const data = await this.coachRepository.getRoutinesByTrainer(trainerId);

    return data.map((r: any) => this.parseRoutineRow(r));
  }

  async getRoutineById(userId: string, routineId: string) {
    const trainerId = await this.getTrainerId(userId);
    const data = await this.coachRepository.getRoutineByIdAndTrainer(routineId, trainerId);

    return this.parseRoutineRow(data);
  }

  async updateRoutine(
    userId: string,
    routineId: string,
    dto: UpdateRoutineDto,
  ) {
    const trainerId = await this.getTrainerId(userId);
    const current = await this.getRoutineById(userId, routineId);

    const updateData: any = {};
    if (dto.name !== undefined) updateData.objetivo = dto.name.slice(0, 200);
    if (dto.tipo !== undefined) updateData.tipo = dto.tipo.slice(0, 30);
    if (dto.nivel !== undefined) updateData.nivel = dto.nivel.slice(0, 20);
    if (dto.duracion !== undefined) updateData.duracion = dto.duracion;
    if (dto.description !== undefined || dto.habits !== undefined) {
      updateData.descripcion = this.encodeRoutineDescription(
        dto.description !== undefined ? dto.description : current.description,
        dto.habits !== undefined ? dto.habits : current.routine_habits,
      );
    }

    if (Object.keys(updateData).length > 0) {
      await this.coachRepository.updateRoutine(routineId, trainerId, updateData);
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
    const routine = await this.getRoutineById(userId, routineId);
    await this.coachRepository.assignRoutineToClient(clientId, routineId);

    // Materializar los hábitos de la rutina directamente en el perfil del cliente
    const habitsAssigned =
      (await this.coachRepository.materializeRoutineHabitsForClient?.(
        clientId,
        routine,
      )) ?? 0;

    // Notificar al alumno en su bandeja de notificaciones
    if (this.coachRepository.createRecommendation) {
      await this.coachRepository
        .createRecommendation(
          clientId,
          `[Rutina Asignada] Tu entrenador te ha asignado el protocolo "${routine.name}" (${routine.tipo} • Nivel ${routine.nivel}). Se han activado los hábitos en tu panel diario.`,
          'Recomendación',
        )
        .catch(() => null);
    }

    return {
      message: 'Routine assigned successfully to client',
      habitsAssigned,
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

  async linkClient(userId: string, clientId: string) {
    const trainerId = await this.getTrainerId(userId);
    return this.coachRepository.linkClient(trainerId, clientId);
  }

  async unlinkClient(userId: string, clientId: string) {
    const trainerId = await this.getTrainerId(userId);
    return this.coachRepository.unlinkClient(trainerId, clientId);
  }

  async getAvailableClients(userId: string) {
    const trainerId = await this.getTrainerId(userId);
    return this.coachRepository.getAvailableClients(trainerId, userId);
  }

  async getClientRecommendations(userId: string, clientId: string) {
    const trainerId = await this.getTrainerId(userId);
    await this.coachRepository.getClientTrainerRelationship(trainerId, clientId);
    return this.coachRepository.getClientRecommendations(clientId);
  }
}

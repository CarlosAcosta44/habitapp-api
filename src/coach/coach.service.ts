import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { ReportsService } from '../reports/services/reports.service';

@Injectable()
export class CoachService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly reportsService: ReportsService,
  ) {}

  private async getTrainerId(userId: string): Promise<string> {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('seguimiento')
      .from('entrenadores')
      .select('identrenador')
      .eq('idusuario', userId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Perfil de entrenador no encontrado para este usuario');
    }
    return data.identrenador;
  }

  async getClients(userId: string) {
    const trainerId = await this.getTrainerId(userId);
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('seguimiento')
      .from('usuario_entrenador')
      .select('fechainicio, idusuario')
      .eq('identrenador', trainerId);

    if (error) {
      throw new InternalServerErrorException(
        `Failed to fetch clients: ${error.message}`,
      );
    }

    const clientsWithProfiles = await Promise.all(
      data.map(async (item: any) => {
        const { data: profile } = await this.supabaseService
          .getClient()
          .schema('gestion')
          .from('usuarios')
          .select('*, roles(nombrerol)')
          .eq('idusuario', item.idusuario)
          .single();
          
        return {
          assigned_at: item.fechainicio,
          client: profile ? {
            idusuario: profile.idusuario,
            nombre: profile.nombre,
            apellido: profile.apellido,
            fotoperfil: profile.fotoperfil,
            puntostotales: profile.puntostotales,
            idrol: profile.idrol,
            nombrerol: profile?.roles?.nombrerol || 'Usuario',
          } : null,
        };
      })
    );

    return clientsWithProfiles;
  }

  async createRoutine(userId: string, dto: CreateRoutineDto) {
    const trainerId = await this.getTrainerId(userId);
    const client = this.supabaseService.getClient();

    const { data: routine, error: routineError } = await client
      .schema('seguimiento')
      .from('rutinas')
      .insert({
        identrenador: trainerId,
        tipo: 'General',
        descripcion: dto.description || '',
        nivel: 'Principiante',
        objetivo: dto.name,
      })
      .select()
      .single();

    if (routineError) {
      throw new InternalServerErrorException(
        `Failed to create routine: ${routineError.message}`,
      );
    }

    if (dto.habits && dto.habits.length > 0) {
      console.warn('Asignación detallada de hábitos pausada por falta de tabla rutina_habitos');
    }

    return this.getRoutineById(userId, routine.idrutina);
  }

  async getRoutines(userId: string) {
    const trainerId = await this.getTrainerId(userId);
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('seguimiento')
      .from('rutinas')
      .select('*')
      .eq('identrenador', trainerId);

    if (error) {
      throw new InternalServerErrorException(
        `Failed to fetch routines: ${error.message}`,
      );
    }

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
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('seguimiento')
      .from('rutinas')
      .select('*')
      .eq('idrutina', routineId)
      .eq('identrenador', trainerId)
      .single();

    if (error) {
      throw new NotFoundException(`Routine not found or not owned by trainer`);
    }

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

    const client = this.supabaseService.getClient();
    const updateData: any = {};
    if (dto.name !== undefined) updateData.objetivo = dto.name;
    if (dto.description !== undefined) updateData.descripcion = dto.description;

    if (Object.keys(updateData).length > 0) {
      const { error } = await client
        .schema('seguimiento')
        .from('rutinas')
        .update(updateData)
        .eq('idrutina', routineId)
        .eq('identrenador', trainerId);

      if (error) {
        throw new InternalServerErrorException(
          `Failed to update routine: ${error.message}`,
        );
      }
    }

    if (dto.habits) {
      console.warn('Actualización de hábitos pausada por falta de tabla rutina_habitos');
    }

    return this.getRoutineById(userId, routineId);
  }

  async deleteRoutine(userId: string, routineId: string) {
    const trainerId = await this.getTrainerId(userId);
    await this.getRoutineById(userId, routineId);

    const client = this.supabaseService.getClient();

    // 1. Eliminar asignaciones de usuarios a esta rutina (cascada manual)
    const { error: deleteAssignsError } = await client
      .schema('seguimiento')
      .from('usuario_rutina')
      .delete()
      .eq('idrutina', routineId);

    if (deleteAssignsError) {
      throw new InternalServerErrorException(
        `Failed to delete routine assignments: ${deleteAssignsError.message}`,
      );
    }

    // 2. Eliminar la rutina
    const { error } = await client
      .schema('seguimiento')
      .from('rutinas')
      .delete()
      .eq('idrutina', routineId)
      .eq('identrenador', trainerId);

    if (error) {
      throw new InternalServerErrorException(
        `Failed to delete routine: ${error.message}`,
      );
    }
  }

  async assignRoutineToClient(
    userId: string,
    clientId: string,
    routineId: string,
  ) {
    const trainerId = await this.getTrainerId(userId);
    const client = this.supabaseService.getClient();

    const { data: relationship, error: relError } = await client
      .schema('seguimiento')
      .from('usuario_entrenador')
      .select('fechainicio')
      .eq('identrenador', trainerId)
      .eq('idusuario', clientId)
      .single();

    if (relError || !relationship) {
      throw new NotFoundException(
        `Client ${clientId} is not assigned to trainer ${trainerId}`,
      );
    }

    await this.getRoutineById(userId, routineId);

    const { error: assignError } = await client
      .schema('seguimiento')
      .from('usuario_rutina')
      .insert({
        idusuario: clientId,
        idrutina: routineId,
        estado: 'Activo'
      });

    if (assignError) {
      throw new InternalServerErrorException(
        `Failed to assign routine to client: ${assignError.message}`,
      );
    }

    return {
      message: 'Routine assigned successfully to client',
      habitsAssigned: 0,
    };
  }

  async getClientProgress(userId: string, clientId: string) {
    const trainerId = await this.getTrainerId(userId);
    const client = this.supabaseService.getClient();

    const { data: relationship, error: relError } = await client
      .schema('seguimiento')
      .from('usuario_entrenador')
      .select('fechainicio')
      .eq('identrenador', trainerId)
      .eq('idusuario', clientId)
      .single();

    if (relError || !relationship) {
      throw new NotFoundException(
        `Client ${clientId} is not assigned to trainer ${trainerId}`,
      );
    }

    return this.reportsService.getUserSummary(clientId);
  }
}

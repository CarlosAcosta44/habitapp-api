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

  async getClients(trainerId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('user_trainers')
      .select('assigned_at, user_profiles(*)')
      .eq('trainer_id', trainerId);

    if (error) {
      throw new InternalServerErrorException(
        `Failed to fetch clients: ${error.message}`,
      );
    }

    return data.map((item: any) => ({
      assigned_at: item.assigned_at,
      client: item.user_profiles,
    }));
  }

  async createRoutine(trainerId: string, dto: CreateRoutineDto) {
    const client = this.supabaseService.getClient();

    // 1. Crear la rutina principal
    const { data: routine, error: routineError } = await client
      .from('routines')
      .insert({
        trainer_id: trainerId,
        name: dto.name,
        description: dto.description,
      })
      .select()
      .single();

    if (routineError) {
      throw new InternalServerErrorException(
        `Failed to create routine: ${routineError.message}`,
      );
    }

    // 2. Crear los hábitos asociados en la misma operación si están presentes
    if (dto.habits && dto.habits.length > 0) {
      const habitsToInsert = dto.habits.map((habit) => ({
        routine_id: routine.id,
        habit_name: habit.habit_name,
        habit_icon: habit.habit_icon || '⭐',
        frequency: habit.frequency || 'diaria',
        order_index: habit.order_index || 0,
      }));

      const { error: habitsError } = await client
        .from('routine_habits')
        .insert(habitsToInsert);

      if (habitsError) {
        // Compensación manual: Si fallan los hábitos, deshacemos la creación de la rutina
        // En un entorno de BD con RPC esto sería un solo bloque transaccional SQL
        await client.from('routines').delete().eq('id', routine.id);
        throw new InternalServerErrorException(
          `Failed to insert routine habits: ${habitsError.message}`,
        );
      }
    }

    return this.getRoutineById(trainerId, routine.id);
  }

  async getRoutines(trainerId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('routines')
      .select('*, routine_habits(*)')
      .eq('trainer_id', trainerId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(
        `Failed to fetch routines: ${error.message}`,
      );
    }

    return data;
  }

  async getRoutineById(trainerId: string, routineId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('routines')
      .select('*, routine_habits(*)')
      .eq('id', routineId)
      .eq('trainer_id', trainerId)
      .single();

    if (error) {
      throw new NotFoundException(`Routine not found or not owned by trainer`);
    }

    return data;
  }

  async updateRoutine(
    trainerId: string,
    routineId: string,
    dto: UpdateRoutineDto,
  ) {
    // Validar existencia y propiedad
    await this.getRoutineById(trainerId, routineId);

    const client = this.supabaseService.getClient();
    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;

    if (Object.keys(updateData).length > 0) {
      const { error } = await client
        .from('routines')
        .update(updateData)
        .eq('id', routineId)
        .eq('trainer_id', trainerId);

      if (error) {
        throw new InternalServerErrorException(
          `Failed to update routine: ${error.message}`,
        );
      }
    }

    // Actualización de hábitos: Eliminamos y reinsertamos (Estrategia sencilla para sync array)
    if (dto.habits) {
      const { error: deleteError } = await client
        .from('routine_habits')
        .delete()
        .eq('routine_id', routineId);

      if (deleteError) {
        throw new InternalServerErrorException(
          `Failed to reset routine habits: ${deleteError.message}`,
        );
      }

      if (dto.habits.length > 0) {
        const habitsToInsert = dto.habits.map((habit) => ({
          routine_id: routineId,
          habit_name: habit.habit_name,
          habit_icon: habit.habit_icon || '⭐',
          frequency: habit.frequency || 'diaria',
          order_index: habit.order_index || 0,
        }));

        const { error: insertError } = await client
          .from('routine_habits')
          .insert(habitsToInsert);

        if (insertError) {
          throw new InternalServerErrorException(
            `Failed to insert new routine habits: ${insertError.message}`,
          );
        }
      }
    }

    return this.getRoutineById(trainerId, routineId);
  }

  async deleteRoutine(trainerId: string, routineId: string) {
    // Validar existencia
    await this.getRoutineById(trainerId, routineId);

    const { error } = await this.supabaseService
      .getClient()
      .from('routines')
      .delete()
      .eq('id', routineId)
      .eq('trainer_id', trainerId);

    if (error) {
      throw new InternalServerErrorException(
        `Failed to delete routine: ${error.message}`,
      );
    }
  }

  async assignRoutineToClient(
    trainerId: string,
    clientId: string,
    routineId: string,
  ) {
    const client = this.supabaseService.getClient();

    // 1. Validar que el clientId sea pupilo del trainerId
    const { data: relationship, error: relError } = await client
      .from('user_trainers')
      .select('assigned_at')
      .eq('trainer_id', trainerId)
      .eq('user_id', clientId)
      .single();

    if (relError || !relationship) {
      throw new NotFoundException(
        `Client ${clientId} is not assigned to trainer ${trainerId}`,
      );
    }

    // 2. Validar existencia y propiedad de la rutina, y obtener los hábitos
    const routine = await this.getRoutineById(trainerId, routineId);

    if (!routine.routine_habits || routine.routine_habits.length === 0) {
      throw new InternalServerErrorException(
        'Cannot assign an empty routine (no habits found)',
      );
    }

    // 3. Mapear los hábitos de la rutina hacia la estructura de la tabla habits del cliente
    // El category_id quedará como null implícitamente al no enviarlo.
    const habitsToInsert = routine.routine_habits.map((routineHabit: any) => ({
      user_id: clientId,
      name: routineHabit.habit_name,
      icon: routineHabit.habit_icon || '⭐',
      frequency: routineHabit.frequency || 'diaria',
      is_active: true,
      description: `Asignado por el entrenador (Rutina: ${routine.name})`,
    }));

    // 4. Inserción masiva en la tabla habits
    // Si falla, el Supabase client JS fallará la operación completa del insert.
    const { error: insertError } = await client
      .from('habits')
      .insert(habitsToInsert);

    if (insertError) {
      throw new InternalServerErrorException(
        `Failed to assign routine habits to client: ${insertError.message}`,
      );
    }

    return {
      message: 'Routine assigned successfully',
      habitsAssigned: habitsToInsert.length,
    };
  }

  async getClientProgress(trainerId: string, clientId: string) {
    const client = this.supabaseService.getClient();

    // 1. Validar que el clientId sea pupilo del trainerId
    const { data: relationship, error: relError } = await client
      .from('user_trainers')
      .select('assigned_at')
      .eq('trainer_id', trainerId)
      .eq('user_id', clientId)
      .single();

    if (relError || !relationship) {
      throw new NotFoundException(
        `Client ${clientId} is not assigned to trainer ${trainerId}`,
      );
    }

    // 2. Delegar la recopilación de datos al ReportsService
    return this.reportsService.getUserSummary(clientId);
  }
}

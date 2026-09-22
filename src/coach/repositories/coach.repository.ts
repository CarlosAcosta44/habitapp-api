import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/services/supabase.service';

@Injectable()
export class CoachRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getTrainerId(userId: string): Promise<string> {
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

  async getClientsByTrainer(trainerId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('seguimiento')
      .from('usuario_entrenador')
      .select('fechainicio, idusuario')
      .eq('identrenador', trainerId);

    if (error) {
      throw new InternalServerErrorException(`Failed to fetch clients: ${error.message}`);
    }
    return data;
  }

  async getUserProfile(userId: string) {
    const { data } = await this.supabaseService
      .getClient()
      .schema('gestion')
      .from('usuarios')
      .select('*, roles(nombrerol)')
      .eq('idusuario', userId)
      .single();
    
    return data;
  }

  async createRoutine(trainerId: string, description: string, name: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('seguimiento')
      .from('rutinas')
      .insert({
        identrenador: trainerId,
        tipo: 'General',
        descripcion: description,
        nivel: 'Principiante',
        objetivo: name,
      })
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(`Failed to create routine: ${error.message}`);
    }
    return data;
  }

  async getRoutinesByTrainer(trainerId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('seguimiento')
      .from('rutinas')
      .select('*')
      .eq('identrenador', trainerId);

    if (error) {
      throw new InternalServerErrorException(`Failed to fetch routines: ${error.message}`);
    }
    return data;
  }

  async getRoutineByIdAndTrainer(routineId: string, trainerId: string) {
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
    return data;
  }

  async updateRoutine(routineId: string, trainerId: string, updateData: any) {
    const { error } = await this.supabaseService
      .getClient()
      .schema('seguimiento')
      .from('rutinas')
      .update(updateData)
      .eq('idrutina', routineId)
      .eq('identrenador', trainerId);

    if (error) {
      throw new InternalServerErrorException(`Failed to update routine: ${error.message}`);
    }
  }

  async deleteRoutineAssignments(routineId: string) {
    const { error } = await this.supabaseService
      .getClient()
      .schema('seguimiento')
      .from('usuario_rutina')
      .delete()
      .eq('idrutina', routineId);

    if (error) {
      throw new InternalServerErrorException(`Failed to delete routine assignments: ${error.message}`);
    }
  }

  async deleteRoutine(routineId: string, trainerId: string) {
    const { error } = await this.supabaseService
      .getClient()
      .schema('seguimiento')
      .from('rutinas')
      .delete()
      .eq('idrutina', routineId)
      .eq('identrenador', trainerId);

    if (error) {
      throw new InternalServerErrorException(`Failed to delete routine: ${error.message}`);
    }
  }

  async getClientTrainerRelationship(trainerId: string, clientId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('seguimiento')
      .from('usuario_entrenador')
      .select('fechainicio')
      .eq('identrenador', trainerId)
      .eq('idusuario', clientId)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Client ${clientId} is not assigned to trainer ${trainerId}`);
    }
    return data;
  }

  async assignRoutineToClient(clientId: string, routineId: string) {
    const { error } = await this.supabaseService
      .getClient()
      .schema('seguimiento')
      .from('usuario_rutina')
      .insert({
        idusuario: clientId,
        idrutina: routineId,
        estado: 'Activo',
      });

    if (error) {
      throw new InternalServerErrorException(`Failed to assign routine to client: ${error.message}`);
    }
  }
}

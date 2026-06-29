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
      .schema('seguimiento')
      .from('usuario_entrenador')
      .select('fechainicio, idusuario')
      .eq('identrenador', trainerId);

    if (error) {
      throw new InternalServerErrorException(
        `Failed to fetch clients: ${error.message}`,
      );
    }

    // Para evitar problemas de joins entre esquemas, obtenemos los perfiles en paralelo
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

  async createRoutine(trainerId: string, dto: CreateRoutineDto) {
    const client = this.supabaseService.getClient();

    // 1. Crear la rutina principal
    const { data: routine, error: routineError } = await client
      .schema('seguimiento')
      .from('rutinas')
      .insert({
        identrenador: trainerId,
        tipo: 'General', // Asignamos tipo por defecto ya que el DTO asume menos campos
        descripcion: dto.description || '',
        nivel: 'Principiante', // Asignamos por defecto
        objetivo: dto.name, // Usamos el nombre de la rutina como objetivo
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
      // TODO: Implementar la inserción de hábitos de rutina
      // Actualmente la base de datos no tiene una tabla 'seguimiento.rutina_habitos'.
      // Esta sección queda pausada hasta que el equipo de BD actualice el esquema DDL agregando la tabla intermedia.
      console.warn('Asignación detallada de hábitos pausada por falta de tabla rutina_habitos');
    }

    return this.getRoutineById(trainerId, routine.idrutina);
  }

  async getRoutines(trainerId: string) {
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
      name: r.objetivo, // Parseamos al DTO
      description: r.descripcion,
      id: r.idrutina,
      routine_habits: [], // TODO: Agregar consulta a rutina_habitos cuando exista en BD
    }));
  }

  async getRoutineById(trainerId: string, routineId: string) {
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
      routine_habits: [], // TODO: Agregar consulta a rutina_habitos cuando exista en BD
    };
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
    if (dto.name !== undefined) updateData.objetivo = dto.name; // Parseamos al esquema real
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

    // Actualización de hábitos: Eliminamos y reinsertamos (Estrategia sencilla para sync array)
    if (dto.habits) {
      // TODO: Implementar la actualización de hábitos de rutina
      // Actualmente la base de datos no tiene una tabla 'seguimiento.rutina_habitos'.
      // Esta sección queda pausada hasta que el equipo de BD actualice el esquema DDL agregando la tabla intermedia.
      console.warn('Actualización de hábitos pausada por falta de tabla rutina_habitos');
    }

    return this.getRoutineById(trainerId, routineId);
  }

  async deleteRoutine(trainerId: string, routineId: string) {
    // Validar existencia
    await this.getRoutineById(trainerId, routineId);

    const { error } = await this.supabaseService
      .getClient()
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
    trainerId: string,
    clientId: string,
    routineId: string,
  ) {
    const client = this.supabaseService.getClient();

    // 1. Validar que el clientId sea pupilo del trainerId
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

    // 2. Validar existencia y propiedad de la rutina, y obtener los hábitos
    const routine = await this.getRoutineById(trainerId, routineId);

    // TODO: Cuando exista la tabla de `seguimiento.rutina_habitos`, reactivar esta validación.
    // if (!routine.routine_habits || routine.routine_habits.length === 0) {
    //   throw new InternalServerErrorException(
    //     'Cannot assign an empty routine (no habits found)',
    //   );
    // }

    // TODO: Clonación profunda pausada temporalmente hasta que se resuelva la tabla intermedia.
    // 3. Mapear los hábitos de la rutina hacia la estructura de la tabla habits del cliente
    // 4. Inserción masiva en la tabla habits
    
    // Por ahora, solo asignamos la rutina al usuario (tabla intermedia seguimiento.usuario_rutina)
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

  async getClientProgress(trainerId: string, clientId: string) {
    const client = this.supabaseService.getClient();

    // 1. Validar que el clientId sea pupilo del trainerId
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

    // 2. Delegar la recopilación de datos al ReportsService
    return this.reportsService.getUserSummary(clientId);
  }
}

import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../../core/supabase/services/supabase.service';

@Injectable()
export class CoachRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getTrainerId(userId: string): Promise<string> {
    const { data } = await this.supabaseService
      .getClient()
      .schema('seguimiento')
      .from('entrenadores')
      .select('identrenador')
      .eq('idusuario', userId)
      .maybeSingle();

    if (data?.identrenador) {
      return data.identrenador;
    }

    const { data: newTrainer } = await this.supabaseService
      .getClient()
      .schema('seguimiento')
      .from('entrenadores')
      .insert({
        idusuario: userId,
        especialidad: 'Bienestar y Hábitos',
        experiencia: 3,
      })
      .select('identrenador')
      .single();

    if (newTrainer?.identrenador) {
      return newTrainer.identrenador;
    }

    throw new NotFoundException('Perfil de entrenador no encontrado para este usuario');
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

  async createRoutine(
    trainerId: string,
    description: string,
    name: string,
    options?: { tipo?: string; nivel?: string; duracion?: number },
  ) {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('seguimiento')
      .from('rutinas')
      .insert({
        identrenador: trainerId,
        tipo: (options?.tipo || 'Bienestar').slice(0, 30),
        descripcion: (description || '').slice(0, 500),
        nivel: (options?.nivel || 'Principiante').slice(0, 20),
        duracion: options?.duracion ?? 21,
        objetivo: name.slice(0, 200),
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
      if (error.code === '23505') {
        throw new ConflictException(
          'El cliente ya tiene asignada esta rutina actualmente.',
        );
      }
      throw new InternalServerErrorException(`Failed to assign routine to client: ${error.message}`);
    }
  }

  async materializeRoutineHabitsForClient(
    clientId: string,
    routine: {
      name: string;
      description?: string;
      tipo?: string;
      duracion?: number;
      routine_habits?: Array<{ habit_name: string }>;
    },
  ): Promise<number> {
    const client = this.supabaseService.getClient();

    // 1. Resolver idcategoria de seguimiento.categorias_habitos según routine.tipo
    const { data: categories } = await client
      .schema('seguimiento')
      .from('categorias_habitos')
      .select('idcategoria, nombre');

    const catList = categories || [];
    const targetTipo = (routine.tipo || '').toLowerCase();
    const matchedCat =
      catList.find((c: any) => (c.nombre || '').toLowerCase().includes(targetTipo)) ||
      catList.find((c: any) => targetTipo.includes((c.nombre || '').toLowerCase())) ||
      catList[0];

    const categoryId = matchedCat?.idcategoria;
    if (!categoryId) return 0;

    // 2. Obtener hábitos activos actuales del cliente para no duplicar nombres idénticos
    const { data: existingHabits } = await client
      .schema('seguimiento')
      .from('habitos')
      .select('nombre')
      .eq('idusuario', clientId)
      .eq('estado', 'Activo');

    const existingNames = new Set(
      (existingHabits || []).map((h: any) => (h.nombre || '').trim().toLowerCase()),
    );

    const habitsToCreate =
      routine.routine_habits && routine.routine_habits.length > 0
        ? routine.routine_habits
        : [{ habit_name: routine.name }];

    const today = new Date();
    const fechaInicio = today.toISOString().split('T')[0];
    let fechaFin: string | null = null;
    if (routine.duracion && routine.duracion > 0) {
      const end = new Date(today);
      end.setDate(today.getDate() + routine.duracion);
      fechaFin = end.toISOString().split('T')[0];
    }

    let createdCount = 0;
    for (const h of habitsToCreate) {
      const cleanName = (h.habit_name || routine.name || 'Hábito de Rutina').trim().slice(0, 45);
      if (!cleanName || existingNames.has(cleanName.toLowerCase())) {
        continue;
      }

      const cleanDesc = `[Coach: ${routine.name}] ${routine.description || 'Protocolo asignado por tu entrenador'}`.slice(0, 200);

      const { error } = await client
        .schema('seguimiento')
        .from('habitos')
        .insert({
          nombre: cleanName,
          descripcion: cleanDesc,
          fechainicio: fechaInicio,
          fechafin: fechaFin,
          estado: 'Activo',
          puntos: 15,
          idusuario: clientId,
          idcategoria: categoryId,
          meta_diaria: 1,
          unidad_medida: 'veces',
          dias_semana: [1, 2, 3, 4, 5, 6, 7],
        });

      if (!error) {
        createdCount++;
        existingNames.add(cleanName.toLowerCase());
      }
    }

    return createdCount;
  }

  async createRecommendation(clientId: string, message: string, type: string = 'Recomendación') {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('gestion')
      .from('notificaciones')
      .insert({
        idusuario: clientId,
        mensaje: message,
        tipo: type,
        leida: false,
      })
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(`Failed to send recommendation: ${error.message}`);
    }
    return data;
  }

  async linkClient(trainerId: string, clientId: string) {
    const { data: existing } = await this.supabaseService
      .getClient()
      .schema('seguimiento')
      .from('usuario_entrenador')
      .select('identrenador')
      .eq('identrenador', trainerId)
      .eq('idusuario', clientId)
      .maybeSingle();

    if (existing) {
      throw new ConflictException('Este usuario ya está vinculado como tu pupilo.');
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .schema('seguimiento')
      .from('usuario_entrenador')
      .insert({
        identrenador: trainerId,
        idusuario: clientId,
        fechainicio: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(`No se pudo vincular el pupilo: ${error.message}`);
    }
    return data;
  }

  async unlinkClient(trainerId: string, clientId: string) {
    const { error } = await this.supabaseService
      .getClient()
      .schema('seguimiento')
      .from('usuario_entrenador')
      .delete()
      .eq('identrenador', trainerId)
      .eq('idusuario', clientId);

    if (error) {
      throw new InternalServerErrorException(`No se pudo desvincular el pupilo: ${error.message}`);
    }
    return { success: true, message: 'Pupilo desvinculado exitosamente.' };
  }

  async getAvailableClients(trainerId: string, trainerUserId: string) {
    const { data: assigned } = await this.supabaseService
      .getClient()
      .schema('seguimiento')
      .from('usuario_entrenador')
      .select('idusuario')
      .eq('identrenador', trainerId);

    const assignedIds = (assigned || []).map((a) => a.idusuario);
    assignedIds.push(trainerUserId);

    const { data: users, error } = await this.supabaseService
      .getClient()
      .schema('gestion')
      .from('usuarios')
      .select('idusuario, nombre, apellido, email, fotoperfil, puntostotales, roles(nombrerol)')
      .order('nombre', { ascending: true })
      .limit(50);

    if (error) {
      throw new InternalServerErrorException(`Error al obtener usuarios: ${error.message}`);
    }

    return (users || [])
      .filter((u) => !assignedIds.includes(u.idusuario))
      .map((u) => ({
        id: u.idusuario,
        idusuario: u.idusuario,
        nombre: u.nombre,
        apellido: u.apellido,
        full_name: `${u.nombre || ''} ${u.apellido || ''}`.trim(),
        email: u.email,
        fotoperfil: u.fotoperfil,
        puntostotales: u.puntostotales || 0,
        nombrerol: (u.roles as any)?.nombrerol || 'Usuario',
      }));
  }

  async getClientRecommendations(clientId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('gestion')
      .from('notificaciones')
      .select('*')
      .eq('idusuario', clientId)
      .in('tipo', ['Recomendación', 'Recomendacion', 'Consejo', 'Motivación', 'Ajuste de Meta', 'Feedback'])
      .order('fecha', { ascending: false })
      .limit(20);

    if (error) {
      throw new InternalServerErrorException(`Error al buscar recomendaciones: ${error.message}`);
    }
    return (data || []).map((n: any) => ({
      id: n.idnotificacion,
      mensaje: n.mensaje,
      tipo: n.tipo,
      fecha: n.fecha,
      leida: n.leida,
    }));
  }
}

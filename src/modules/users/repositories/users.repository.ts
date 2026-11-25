import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../../../core/supabase/services/supabase.service';
import { RoleName } from '../dto/user-profile.dto';
import { UserProfileRow } from '../entities/user-profile.entity';

@Injectable()
export class UsersRepository {
  private readonly logger = new Logger(UsersRepository.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  private parseHabitLocalDate(dateStr: string): Date {
    const [hYear, hMonth, hDay] = dateStr.split('T')[0].split('-').map(Number);
    const d = new Date(hYear, hMonth - 1, hDay);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private computeTotalExpectedDays(activeHabits: any[], hoy: Date): number {
    let totalEsperado = 0;
    for (const h of activeHabits) {
      const current = this.parseHabitLocalDate(h.fechainicio);
      while (current <= hoy) {
        const jsDay = current.getDay();
        const habDay = jsDay === 0 ? 7 : jsDay;
        if (h.dias_semana?.includes(habDay)) {
          totalEsperado++;
        }
        current.setDate(current.getDate() + 1);
      }
    }
    return totalEsperado;
  }

  private groupRecordsByDate(records: any[]): Record<string, string[]> {
    const recordsByDate: Record<string, string[]> = {};
    for (const r of records) {
      if (!recordsByDate[r.fecha]) {
        recordsByDate[r.fecha] = [];
      }
      recordsByDate[r.fecha].push(r.idhabito);
    }
    return recordsByDate;
  }

  private computeCurrentStreak(allHabits: any[], recordsByDate: Record<string, string[]>): number {
    if (allHabits.length === 0) {
      return 0;
    }

    const oldestTime = Math.min(
      ...allHabits.map((h) => this.parseHabitLocalDate(h.fechainicio).getTime()),
    );
    const oldestHabitDate = new Date(oldestTime);
    oldestHabitDate.setHours(0, 0, 0, 0);

    let rachaActual = 0;
    const checkDate = new Date();
    let firstCheck = true;

    while (checkDate >= oldestHabitDate) {
      const y = checkDate.getFullYear();
      const m = String(checkDate.getMonth() + 1).padStart(2, '0');
      const d = String(checkDate.getDate()).padStart(2, '0');
      const dStr = `${y}-${m}-${d}`;
      const jsDay = checkDate.getDay();
      const habDay = jsDay === 0 ? 7 : jsDay;

      const scheduledForDay = allHabits.filter((h) => {
        const startDate = this.parseHabitLocalDate(h.fechainicio);
        return checkDate >= startDate && h.dias_semana?.includes(habDay);
      });

      if (scheduledForDay.length > 0) {
        const completedIds = recordsByDate[dStr] || [];
        const allCompleted = scheduledForDay.every((h) => completedIds.includes(h.idhabito));
        if (allCompleted) {
          rachaActual++;
        } else if (!firstCheck) {
          break;
        }
      }

      checkDate.setDate(checkDate.getDate() - 1);
      firstCheck = false;
    }

    return rachaActual;
  }

  async getUserStats(userId: string) {
    const client = this.supabaseService.getClient().schema('seguimiento');

    const { data: allHabits, error: err1 } = await client
      .from('habitos')
      .select('idhabito, fechainicio, dias_semana, estado')
      .eq('idusuario', userId);

    if (err1) throw new InternalServerErrorException('Error fetch habits');

    const safeAllHabits = allHabits ?? [];
    const activeHabits = safeAllHabits.filter((h) => h.estado === 'Activo');

    const { data: records, error: err2 } = await client
      .schema('seguimiento')
      .from('registro_habitos')
      .select('idhabito, fecha')
      .eq('idusuario', userId)
      .eq('completado', true);

    if (err2) throw new InternalServerErrorException('Error fetch records');

    const safeRecords = records ?? [];
    const activeHabitsCount = activeHabits.length;
    const totalCumplido = safeRecords.length;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const totalEsperado = this.computeTotalExpectedDays(activeHabits, hoy);
    const tasaExito =
      totalEsperado > 0
        ? Math.min(100, Math.round((totalCumplido / totalEsperado) * 100))
        : 100;

    const recordsByDate = this.groupRecordsByDate(safeRecords);
    const rachaActual = this.computeCurrentStreak(safeAllHabits, recordsByDate);

    return {
      activeHabitsCount,
      tasaExito,
      diasTotales: totalCumplido,
      rachaActual,
    };
  }

  async findProfileById(userId: string, email?: string): Promise<UserProfileRow> {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('gestion')
      .from('usuarios')
      .select('*, roles(nombrerol)')
      .eq('idusuario', userId)
      .single<any>();

    if (error || !data) {
      throw new NotFoundException('Perfil de usuario no encontrado');
    }

    // Obtener el puntaje del top 1
    const { data: topUser } = await this.supabaseService
      .getClient()
      .schema('gestion')
      .from('usuarios')
      .select('puntostotales')
      .order('puntostotales', { ascending: false })
      .limit(1)
      .single();

    const maxPuntos = topUser?.puntostotales || 0;
    const puntosFaltantesTop1 = maxPuntos > data.puntostotales ? maxPuntos - data.puntostotales : 0;

    return {
      ...this.mapUserProfileRow(data),
      correo: data.email || data.correo || email || '',
      email: data.email || data.correo || email || '',
      puntosFaltantesTop1,
    };
  }

  private mapUserProfileRow(u: any): UserProfileRow {
    return {
      idusuario: u.idusuario,
      nombre: u.nombre,
      apellido: u.apellido,
      correo: u.email || u.correo || '',
      email: u.email || u.correo || '',
      fotoperfil: u.fotoperfil,
      telefono: u.telefono,
      genero: u.genero,
      fechanacimiento: u.fechanacimiento,
      puntostotales: u.puntostotales,
      idrol: u.idrol,
      nombrerol: u.roles?.nombrerol || 'Usuario',
      estado_cuenta: u.estado_cuenta || 'Activo',
    };
  }

  async findAllProfiles(): Promise<UserProfileRow[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('gestion')
      .from('usuarios')
      .select('*, roles(nombrerol)')
      .order('nombre', { ascending: true })
      .returns<any[]>();

    if (error) {
      throw new InternalServerErrorException(
        `No se pudo listar usuarios: ${error.message}`,
      );
    }

    return (data ?? []).map((u: any) => this.mapUserProfileRow(u));
  }

  async findAllProfilesPaginated(page: number, limit: number): Promise<{
    data: UserProfileRow[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const fromIndex = (page - 1) * limit;
    const toIndex = fromIndex + limit - 1;

    const { data, count, error } = await this.supabaseService
      .getClient()
      .schema('gestion')
      .from('usuarios')
      .select('*, roles(nombrerol)', { count: 'exact' })
      .order('nombre', { ascending: true })
      .range(fromIndex, toIndex);

    if (error) {
      throw new InternalServerErrorException(
        `No se pudo listar usuarios paginados: ${error.message}`,
      );
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / limit) || 1;
    const users = (data ?? []).map((u: any) => this.mapUserProfileRow(u));

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async updateStatus(
    userId: string,
    estado: string,
  ): Promise<UserProfileRow> {
    const { error: updateError } = await this.supabaseService
      .getClient()
      .schema('gestion')
      .from('usuarios')
      .update({ estado_cuenta: estado })
      .eq('idusuario', userId);

    if (updateError) {
      throw new InternalServerErrorException(
        `No se pudo actualizar el estado de cuenta: ${updateError.message}`,
      );
    }

    return this.findProfileById(userId);
  }

  async updateProfile(
    userId: string,
    payload: Partial<
      Pick<
        UserProfileRow,
        | 'nombre'
        | 'apellido'
        | 'fotoperfil'
        | 'telefono'
        | 'genero'
        | 'fechanacimiento'
      >
    >,
  ): Promise<UserProfileRow> {
    const { error: updateError } = await this.supabaseService
      .getClient()
      .schema('gestion')
      .from('usuarios')
      .update(payload)
      .eq('idusuario', userId);

    if (updateError) {
      throw new InternalServerErrorException(
        `No se pudo actualizar el perfil: ${updateError.message}`,
      );
    }

    return this.findProfileById(userId);
  }

  async updateRole(
    userId: string,
    roleName: RoleName,
  ): Promise<UserProfileRow> {
    const { data: role, error: roleError } = await this.supabaseService
      .getClient()
      .schema('gestion')
      .from('roles')
      .select('idrol')
      .eq('nombrerol', roleName)
      .single<{ idrol: string }>();

    if (roleError || !role) {
      throw new NotFoundException(`Rol ${roleName} no encontrado`);
    }

    const { error: updateError } = await this.supabaseService
      .getClient()
      .schema('gestion')
      .from('usuarios')
      .update({ idrol: role.idrol })
      .eq('idusuario', userId);

    if (updateError) {
      throw new InternalServerErrorException(
        `No se pudo actualizar el rol: ${updateError.message}`,
      );
    }

    if (roleName === RoleName.TRAINER) {
      const { data: existingTrainer } = await this.supabaseService
        .getClient()
        .schema('seguimiento')
        .from('entrenadores')
        .select('identrenador')
        .eq('idusuario', userId)
        .maybeSingle();

      if (!existingTrainer) {
        await this.supabaseService
          .getClient()
          .schema('seguimiento')
          .from('entrenadores')
          .insert({
            idusuario: userId,
            especialidad: 'Bienestar y Hábitos',
            experiencia: 1,
          });
      }
    }

    return this.findProfileById(userId);
  }
  async updateFcmToken(userId: string, token: string): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .schema('gestion')
      .from('usuarios')
      .update({ fcm_token: token })
      .eq('idusuario', userId);

    if (error) {
      this.logger.error(`Error updating fcm_token for user ${userId}:`, error.message);
      throw new InternalServerErrorException('Error al actualizar el token FCM');
    }
  }

  async uploadAvatar(
    userId: string,
    file: Express.Multer.File,
    _token?: string,
  ): Promise<{ url: string }> {
    const fileExt = file.originalname.split('.').pop() || 'png';
    const fileName = `${userId}_${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // We MUST use a clean client with the service_role key explicitly in the Authorization header.
    // Otherwise, the in-memory session set by JwtAuthGuard causes the client to act as the user,
    // which fails because the bucket has no RLS policies allowing user inserts.
    const { createClient } = require('@supabase/supabase-js');
    const client = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      {
        global: {
          headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
          fetch: require('node-fetch'),
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    const { error: uploadError } = await client
      .storage.from('avatars')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      throw new InternalServerErrorException(
        `Error al subir imagen al bucket: ${uploadError.message}`,
      );
    }

    const { data } = client
      .storage.from('avatars')
      .getPublicUrl(filePath);

    await this.updateProfile(userId, { fotoperfil: data.publicUrl });

    return { url: data.publicUrl };
  }

  async findByEmail(email: string): Promise<any> {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('gestion')
      .from('usuarios')
      .select('*, roles(nombrerol)')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new InternalServerErrorException(
        `Error al buscar usuario por email: ${error.message}`,
      );
    }

    return data || null;
  }

  async getDefaultRoleId(): Promise<string> {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('gestion')
      .from('roles')
      .select('idrol')
      .eq('nombrerol', RoleName.USER)
      .single();

    if (error || !data) {
      throw new InternalServerErrorException(
        'No se pudo encontrar el rol por defecto (Usuario)',
      );
    }

    return data.idrol;
  }

  async createLocalUser(payload: any): Promise<any> {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('gestion')
      .from('usuarios')
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(
        `Error al crear usuario: ${error.message}`,
      );
    }

    return data;
  }

  async markEmailVerified(userId: string): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .schema('gestion')
      .from('usuarios')
      .update({ email_verified: true })
      .eq('idusuario', userId);

    if (error) {
      throw new InternalServerErrorException(
        `Error al verificar email: ${error.message}`,
      );
    }
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .schema('gestion')
      .from('usuarios')
      .update({ password_hash: passwordHash })
      .eq('idusuario', userId);

    if (error) {
      throw new InternalServerErrorException(
        `Error al actualizar contraseña: ${error.message}`,
      );
    }
  }

  async getSimpleProfile(userId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('perfiles_usuarios_api')
      .select('nombre, apellido, fotoperfil, puntostotales')
      .eq('idusuario', userId)
      .maybeSingle<any>();

    if (error) {
      throw new InternalServerErrorException(
        `Error al obtener perfil simplificado: ${error.message}`,
      );
    }
    if (!data) return null;
    return {
      nombre: data.nombre ?? 'Usuario',
      apellido: data.apellido ?? '',
      fotoperfil: data.fotoperfil ?? null,
      puntos: data.puntostotales ?? 0,
    };
  }

  async getPointsHistory(userId: string, limit: number) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('api_historial_puntos')
      .select('*')
      .eq('idusuario', userId)
      .order('fecha', { ascending: false })
      .limit(limit)
      .returns<any[]>();

    if (error) {
      throw new InternalServerErrorException(
        `Error al obtener historial de puntos: ${error.message}`,
      );
    }
    return data ?? [];
  }

  async getAchievements(userId: string) {
    const { data: logrosGanados, error: ganadosError } =
      await this.supabaseService
        .getClient()
        .from('api_usuario_logro')
        .select('*')
        .eq('idusuario', userId)
        .returns<any[]>();

    if (ganadosError) {
      throw new InternalServerErrorException(
        `Error al obtener logros: ${ganadosError.message}`,
      );
    }

    const idsGanados = (logrosGanados ?? []).map((l: any) => l.idlogro);
    if (idsGanados.length === 0) return [];

    const { data: catalogoLogros, error: catalogoError } =
      await this.supabaseService
        .getClient()
        .from('api_logros')
        .select('*')
        .in('idlogro', idsGanados)
        .returns<any[]>();

    if (catalogoError) {
      throw new InternalServerErrorException(
        `Error al obtener catálogo de logros: ${catalogoError.message}`,
      );
    }

    return (catalogoLogros ?? []).map((lg: any) => {
      const meta = (logrosGanados ?? []).find(
        (ul: any) => ul.idlogro === lg.idlogro,
      );
      return {
        id: lg.idlogro,
        nombre: lg.nombre,
        desc: lg.descripcion,
        fecha: meta?.fechaobtenido || 'Recientemente',
        icono: lg.icono,
      };
    });
  }

  /**
   * Obtiene los entrenadores vinculados al usuario y las rutinas asignadas activas.
   */
  async getMyTrainerAndRoutines(userId: string) {
    const client = this.supabaseService.getClient();

    // 1. Obtener vínculos usuario_entrenador
    const { data: links } = await client
      .schema('seguimiento')
      .from('usuario_entrenador')
      .select('identrenador, fechainicio')
      .eq('idusuario', userId);

    const trainerIds = (links || []).map((l: any) => l.identrenador);
    let trainers: any[] = [];

    if (trainerIds.length > 0) {
      const { data: trainerRows } = await client
        .schema('seguimiento')
        .from('entrenadores')
        .select('identrenador, idusuario, especialidad, experiencia, certificacion')
        .in('identrenador', trainerIds);

      const userIds = (trainerRows || []).map((t: any) => t.idusuario).filter(Boolean);
      let userProfiles: any[] = [];
      if (userIds.length > 0) {
        const { data: usersData } = await client
          .schema('gestion')
          .from('usuarios')
          .select('idusuario, nombre, apellido, email, fotoperfil')
          .in('idusuario', userIds);
        userProfiles = usersData || [];
      }

      trainers = (trainerRows || []).map((t: any) => {
        const u = userProfiles.find((p: any) => p.idusuario === t.idusuario);
        const link = (links || []).find((l: any) => l.identrenador === t.identrenador);
        return {
          identrenador: t.identrenador,
          idusuario: t.idusuario,
          nombre: u?.nombre || 'Entrenador',
          apellido: u?.apellido || '',
          full_name: `${u?.nombre || 'Entrenador'} ${u?.apellido || ''}`.trim(),
          email: u?.email || '',
          fotoperfil: u?.fotoperfil || null,
          especialidad: t.especialidad || 'Salud Mental & Hábitos',
          experiencia: t.experiencia ?? 3,
          certificacion: t.certificacion || 'Coach Certificado HabitApp',
          fechainicio: link?.fechainicio || null,
        };
      });
    }

    // 2. Obtener rutinas asignadas al usuario
    const { data: routineLinks } = await client
      .schema('seguimiento')
      .from('usuario_rutina')
      .select('idrutina, fechainicio, estado')
      .eq('idusuario', userId)
      .eq('estado', 'Activo');

    const routineIds = (routineLinks || []).map((rl: any) => rl.idrutina);
    let routines: any[] = [];

    if (routineIds.length > 0) {
      const { data: routineRows } = await client
        .schema('seguimiento')
        .from('rutinas')
        .select('idrutina, objetivo, tipo, nivel, duracion, descripcion, identrenador')
        .in('idrutina', routineIds);

      routines = (routineRows || []).map((r: any) => {
        const rl = (routineLinks || []).find((item: any) => item.idrutina === r.idrutina);
        const [cleanDesc, habitsPart] = (r.descripcion || '').split('||HABITS:');
        const habits = habitsPart
          ? habitsPart.split(';').map((s: string) => s.trim()).filter(Boolean)
          : [r.objetivo];
        return {
          idrutina: r.idrutina,
          nombre: r.objetivo,
          tipo: r.tipo || 'Bienestar',
          nivel: r.nivel || 'Principiante',
          duracion: r.duracion ?? 21,
          descripcion: cleanDesc.trim(),
          habits,
          fechainicio: rl?.fechainicio || null,
          estado: rl?.estado || 'Activo',
          identrenador: r.identrenador,
        };
      });
    }

    return { trainers, routines };
  }

  /**
   * Vincula al usuario autenticado como pupilo de un entrenador (por identrenador o idusuario del coach).
   */
  async linkMyTrainer(userId: string, trainerIdOrUserId: string) {
    const client = this.supabaseService.getClient();

    // Resolver el registro de seguimiento.entrenadores
    let { data: trainer } = await client
      .schema('seguimiento')
      .from('entrenadores')
      .select('identrenador, idusuario, especialidad')
      .eq('identrenador', trainerIdOrUserId)
      .maybeSingle();

    if (!trainer) {
      const { data: byUser } = await client
        .schema('seguimiento')
        .from('entrenadores')
        .select('identrenador, idusuario, especialidad')
        .eq('idusuario', trainerIdOrUserId)
        .maybeSingle();
      trainer = byUser;
    }

    // Si aún no existe fila en seguimiento.entrenadores pero el id pertenece a un usuario Entrenador, crearla
    if (!trainer) {
      const { data: coachUser } = await client
        .schema('gestion')
        .from('usuarios')
        .select('idusuario, roles(nombrerol)')
        .eq('idusuario', trainerIdOrUserId)
        .maybeSingle<any>();

      if (coachUser) {
        const { data: createdTrainer } = await client
          .schema('seguimiento')
          .from('entrenadores')
          .insert({
            idusuario: coachUser.idusuario,
            especialidad: 'Salud Mental & Hábitos',
            experiencia: 3,
          })
          .select('identrenador, idusuario, especialidad')
          .single();
        trainer = createdTrainer;
      }
    }

    if (!trainer) {
      throw new NotFoundException('No se encontró el entrenador seleccionado.');
    }

    if (trainer.idusuario === userId) {
      throw new BadRequestException('No puedes vincularte a ti mismo como entrenador.');
    }

    const { data: existing } = await client
      .schema('seguimiento')
      .from('usuario_entrenador')
      .select('identrenador')
      .eq('idusuario', userId)
      .eq('identrenador', trainer.identrenador)
      .maybeSingle();

    if (!existing) {
      const { error } = await client
        .schema('seguimiento')
        .from('usuario_entrenador')
        .insert({
          idusuario: userId,
          identrenador: trainer.identrenador,
          fechainicio: new Date().toISOString().split('T')[0],
        });

      if (error) {
        throw new InternalServerErrorException(`No se pudo vincular al entrenador: ${error.message}`);
      }

      // Notificar al entrenador
      const { data: pupil } = await client
        .schema('gestion')
        .from('usuarios')
        .select('nombre, apellido')
        .eq('idusuario', userId)
        .maybeSingle();

      const pupilName = pupil ? `${pupil.nombre || ''} ${pupil.apellido || ''}`.trim() : 'Un nuevo alumno';
      if (trainer.idusuario) {
        await client
          .schema('gestion')
          .from('notificaciones')
          .insert({
            idusuario: trainer.idusuario,
            mensaje: `¡Nuevo pupilo! ${pupilName} se ha vinculado a tu supervisión como cliente desde la comunidad.`,
            tipo: 'Entrenador',
            leida: false,
          });
      }
    }

    return {
      success: true,
      identrenador: trainer.identrenador,
      idusuario_entrenador: trainer.idusuario,
      message: 'Te has vinculado exitosamente al entrenador.',
    };
  }

  /**
   * Desvincula al usuario autenticado de un entrenador.
   */
  async unlinkMyTrainer(userId: string, trainerIdOrUserId: string) {
    const client = this.supabaseService.getClient();

    let targetTrainerId = trainerIdOrUserId;
    const { data: byUser } = await client
      .schema('seguimiento')
      .from('entrenadores')
      .select('identrenador')
      .eq('idusuario', trainerIdOrUserId)
      .maybeSingle();

    if (byUser?.identrenador) {
      targetTrainerId = byUser.identrenador;
    }

    const { error } = await client
      .schema('seguimiento')
      .from('usuario_entrenador')
      .delete()
      .eq('idusuario', userId)
      .eq('identrenador', targetTrainerId);

    if (error) {
      throw new InternalServerErrorException(`No se pudo desvincular del entrenador: ${error.message}`);
    }

    return {
      success: true,
      message: 'Te has desvinculado del entrenador exitosamente.',
    };
  }
}

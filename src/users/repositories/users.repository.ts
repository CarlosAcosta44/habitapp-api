import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { RoleName } from '../dto/user-profile.dto';
import { UserProfileRow } from '../entities/user-profile.entity';

@Injectable()
export class UsersRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findProfileById(userId: string): Promise<UserProfileRow> {
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

    return {
      idusuario: data.idusuario,
      nombre: data.nombre,
      apellido: data.apellido,
      fotoperfil: data.fotoperfil,
      telefono: data.telefono,
      genero: data.genero,
      fechanacimiento: data.fechanacimiento,
      puntostotales: data.puntostotales,
      idrol: data.idrol,
      nombrerol: data.roles?.nombrerol || 'Usuario',
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

    return (data ?? []).map((u: any) => ({
      idusuario: u.idusuario,
      nombre: u.nombre,
      apellido: u.apellido,
      fotoperfil: u.fotoperfil,
      telefono: u.telefono,
      genero: u.genero,
      fechanacimiento: u.fechanacimiento,
      puntostotales: u.puntostotales,
      idrol: u.idrol,
      nombrerol: u.roles?.nombrerol || 'Usuario',
    }));
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

    return this.findProfileById(userId);
  }

  async uploadAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ url: string }> {
    const fileExt = file.originalname.split('.').pop() || 'png';
    const fileName = `${userId}_${Date.now()}.${fileExt}`;
    const filePath = `profiles/${fileName}`;

    const { error: uploadError } = await this.supabaseService
      .getClient()
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

    const { data } = this.supabaseService
      .getClient()
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
}

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
      puntostotales: u.puntostotales,
      idrol: u.idrol,
      nombrerol: u.roles?.nombrerol || 'Usuario',
    }));
  }

  async updateProfile(
    userId: string,
    payload: Partial<
      Pick<UserProfileRow, 'nombre' | 'apellido' | 'fotoperfil'>
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
}

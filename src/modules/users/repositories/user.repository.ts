
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { IUserRepository } from '../interfaces/user.repository.interface';
import { SupabaseService } from '../../../core/supabase/services/supabase.service';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get client() {
    return this.supabaseService.getClient().schema('gestion');
  }

  async findByEmail(email: string): Promise<any> {
    const { data, error } = await this.client
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    return data;
  }

  async findById(id: string): Promise<any> {
    const { data, error } = await this.client
      .from('usuarios')
      .select('*')
      .eq('idusuario', id)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    return data;
  }

  async getDefaultRoleId(): Promise<string> {
    const { data, error } = await this.client
      .from('roles')
      .select('idrol')
      .eq('nombrerol', 'Usuario')
      .maybeSingle();
    if (error) throw new InternalServerErrorException(error.message);
    return data?.idrol || null;
  }

  async update(id: string, updateData: any): Promise<any> {
    const { data, error } = await this.client
      .from('usuarios')
      .update(updateData)
      .eq('idusuario', id)
      .select()
      .single();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async create(userData: any): Promise<any> {
    const { data, error } = await this.client
      .from('usuarios')
      .insert([userData])
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    return data;
  }
}

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/services/supabase.service';

@Injectable()
export class ReportsRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getRanking() {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('gestion')
      .from('vista_ranking')
      .select('*')
      .limit(100);

    if (error) throw new InternalServerErrorException(`Supabase error: ${error.message}`);
    return data;
  }

  async getUserProfile(userId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('gestion')
      .from('usuarios')
      .select('nombre, puntostotales')
      .eq('idusuario', userId)
      .single();

    if (error) throw new InternalServerErrorException(`Supabase error: ${error.message}`);
    return data;
  }

  async getAllHabits(userId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('seguimiento')
      .from('habitos')
      .select('idhabito, fechainicio, dias_semana, estado, nombre')
      .eq('idusuario', userId);

    if (error) throw new InternalServerErrorException(`Supabase error: ${error.message}`);
    return data;
  }

  async getHabitRecordsFromDate(userId: string, startDate: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('seguimiento')
      .from('registro_habitos')
      .select('idhabito, fecha, completado')
      .eq('idusuario', userId)
      .eq('completado', true)
      .gte('fecha', startDate);

    if (error) throw new InternalServerErrorException(`Supabase error: ${error.message}`);
    return data;
  }

  async getActiveHabitsInfo(userId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .schema('seguimiento')
      .from('habitos')
      .select('idhabito, nombre, descripcion, color')
      .eq('idusuario', userId)
      .eq('estado', 'Activo');

    if (error) throw new InternalServerErrorException(`Supabase error: ${error.message}`);
    return data;
  }
}

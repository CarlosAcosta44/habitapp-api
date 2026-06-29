import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class ReportsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getRanking() {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .schema('gestion')
        .from('vista_ranking')
        .select('*')
        .limit(100);

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      throw new InternalServerErrorException(
        'Error al obtener el ranking de usuarios: ' + error.message,
      );
    }
  }

  async getUserSummary(userId: string) {
    try {
      const client = this.supabaseService.getClient();
      const today = new Date().toISOString().split('T')[0];

      // 1. Obtener datos del perfil de usuario (puntos, nombre)
      const { data: userProfile, error: profileError } = await client
        .schema('gestion')
        .from('usuarios')
        .select('nombre, puntostotales')
        .eq('idusuario', userId)
        .single();

      if (profileError) throw new Error(`Profile error: ${profileError.message}`);

      // 2. Obtener número de hábitos activos
      const { count: activeHabits, error: habitsError } = await client
        .schema('seguimiento')
        .from('habitos')
        .select('*', { count: 'exact', head: true })
        .eq('idusuario', userId)
        .eq('estado', 'Activo');

      if (habitsError) throw new Error(`Habits error: ${habitsError.message}`);

      // 3. Obtener hábitos completados hoy
      const { count: completedToday, error: completionsError } = await client
        .schema('seguimiento')
        .from('registro_habitos')
        .select('*', { count: 'exact', head: true })
        .eq('idusuario', userId)
        .eq('fecharegistro', today);

      if (completionsError) {
        console.warn(`Error buscando historial: ${completionsError.message}`);
      }

      const active = activeHabits ?? 0;
      const completed = completedToday ?? 0;
      const dailyRate = active > 0 ? Math.round((completed / active) * 100) : 0;

      return {
        userId,
        nombre: userProfile?.nombre,
        puntos_totales: userProfile?.puntostotales || 0,
        habitos_activos: active,
        completados_hoy: completed,
        tasa_diaria: dailyRate,
      };
    } catch (error: any) {
      throw new InternalServerErrorException(
        'Error al obtener el resumen del usuario: ' + error.message,
      );
    }
  }
}

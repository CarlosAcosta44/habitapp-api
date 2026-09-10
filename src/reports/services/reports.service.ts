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

  async getUserSummary(userId: string, period: 'week' | 'month' | 'year' = 'week') {
    try {
      const client = this.supabaseService.getClient();
      const today = new Date();
      today.setHours(0,0,0,0);
      const todayStr = today.toISOString().split('T')[0];

      // 1. Obtener datos del perfil
      const { data: userProfile, error: profileError } = await client
        .schema('gestion')
        .from('usuarios')
        .select('nombre, puntostotales')
        .eq('idusuario', userId)
        .single();
      if (profileError) throw new Error(`Profile error: ${profileError.message}`);

      // 2. Obtener hábitos activos
      const { data: activeHabits, error: habitsError } = await client
        .schema('seguimiento')
        .from('habitos')
        .select('*')
        .eq('idusuario', userId)
        .eq('estado', 'Activo');
      if (habitsError) throw new Error(`Habits error: ${habitsError.message}`);

      // 3. Obtener registros de hábitos completados (hasta 1 año para cálculos)
      const oneYearAgo = new Date(today);
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      const { data: records, error: recordsError } = await client
        .schema('seguimiento')
        .from('registro_habitos')
        .select('idhabito, fecha, completado')
        .eq('idusuario', userId)
        .eq('completado', true)
        .gte('fecha', oneYearAgo.toISOString().split('T')[0]);
      if (recordsError) throw new Error(`Records error: ${recordsError.message}`);

      // Variables para resultados
      let cumplimientoGlobal = 0;
      let totalEsperado = 0;
      let totalCumplido = 0;
      let rachaActual = 0;
      let rachaMaxima = 0;
      let masConstante: any = null;
      let oportunidadMejora: any = null;
      const volumenSemanal = [0, 0, 0, 0, 0, 0, 0]; // L, M, X, J, V, S, D
      const consistenciaMes: any[] = [];
      const recordsByDate: Record<string, string[]> = {};
      const statsByHabit: Record<string, { expected: number, completed: number, currentStreak: number, maxStreak: number }> = {};

      if (records) {
        for (const r of records) {
          if (!recordsByDate[r.fecha]) recordsByDate[r.fecha] = [];
          recordsByDate[r.fecha].push(r.idhabito);
        }
      }

      if (activeHabits && activeHabits.length > 0) {
        // Inicializar stats por hábito
        activeHabits.forEach(h => {
          statsByHabit[h.idhabito] = { expected: 0, completed: 0, currentStreak: 0, maxStreak: 0 };
        });

        // Filtrar periodo (para el cumplimiento global)
        const periodDays = period === 'week' ? 7 : (period === 'month' ? 30 : 365);
        const periodStartDate = new Date(today);
        periodStartDate.setDate(today.getDate() - periodDays + 1);

        // Procesar días desde el más antiguo hasta hoy
        const oldestHabitDate = new Date(Math.min(...activeHabits.map(h => new Date(h.fechainicio).getTime())));
        let currentDate = new Date(oldestHabitDate);
        currentDate.setHours(0,0,0,0);

        let globalCurrentStreak = 0;

        while (currentDate <= today) {
          const dStr = currentDate.toISOString().split('T')[0];
          let jsDay = currentDate.getDay();
          let habDay = jsDay === 0 ? 7 : jsDay;
          const completedIds = recordsByDate[dStr] || [];
          
          let allCompletedForDay = true;
          let anyScheduled = false;

          for (const h of activeHabits) {
            const hStart = new Date(h.fechainicio);
            hStart.setHours(0,0,0,0);
            
            if (currentDate >= hStart && h.dias_semana && h.dias_semana.includes(habDay)) {
              anyScheduled = true;
              statsByHabit[h.idhabito].expected++;
              const isCompleted = completedIds.includes(h.idhabito);
              
              if (currentDate >= periodStartDate) {
                totalEsperado++;
                if (isCompleted) totalCumplido++;
              }

              if (isCompleted) {
                statsByHabit[h.idhabito].completed++;
                statsByHabit[h.idhabito].currentStreak++;
                statsByHabit[h.idhabito].maxStreak = Math.max(statsByHabit[h.idhabito].maxStreak, statsByHabit[h.idhabito].currentStreak);
              } else if (currentDate < today || (currentDate.getTime() === today.getTime() && false)) {
                // Si no es hoy, rompe racha. Si es hoy, todavía hay tiempo.
                if (currentDate < today) {
                  statsByHabit[h.idhabito].currentStreak = 0;
                  allCompletedForDay = false;
                }
              }

              // Calcular volumen semanal
              if (currentDate >= new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000)) {
                if (isCompleted) {
                  // Mapear JS day (0=Dom, 1=Lun) a índice de arreglo (0=Lun, 6=Dom)
                  const arrIndex = jsDay === 0 ? 6 : jsDay - 1;
                  volumenSemanal[arrIndex]++;
                }
              }
            }
          }

          if (anyScheduled) {
             if (allCompletedForDay) globalCurrentStreak++;
             else if (currentDate < today) {
               rachaMaxima = Math.max(rachaMaxima, globalCurrentStreak);
               globalCurrentStreak = 0;
             }
          }

          // Consistencia mes
          if (currentDate >= new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000)) {
             consistenciaMes.push({
               fecha: dStr,
               activos: completedIds.length
             });
          }

          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        rachaActual = globalCurrentStreak;
        rachaMaxima = Math.max(rachaMaxima, rachaActual);

        // Identificar constante y oportunidad
        let maxRate = -1;
        let minRate = 101;
        activeHabits.forEach(h => {
          const stats = statsByHabit[h.idhabito];
          const rate = stats.expected > 0 ? (stats.completed / stats.expected) * 100 : 0;
          if (rate > maxRate && stats.expected > 0) {
            maxRate = rate;
            masConstante = { nombre: h.titulo, racha: stats.currentStreak, rate: Math.round(rate) };
          }
          if (rate < minRate && stats.expected > 0) {
            minRate = rate;
            oportunidadMejora = { nombre: h.titulo, rate: Math.round(rate) };
          }
        });
      }

      cumplimientoGlobal = totalEsperado > 0 ? Math.round((totalCumplido / totalEsperado) * 100) : 0;

      return {
        userId,
        nombre: userProfile?.nombre,
        puntos_totales: userProfile?.puntostotales || 0,
        cumplimiento_global: cumplimientoGlobal,
        total_esperado: totalEsperado,
        total_cumplido: totalCumplido,
        racha_actual: rachaActual,
        racha_maxima: rachaMaxima,
        mas_constante: masConstante,
        oportunidad_mejora: oportunidadMejora,
        volumen_semanal: volumenSemanal,
        consistencia_mes: consistenciaMes,
        insight: oportunidadMejora 
          ? `El hábito "${oportunidadMejora.nombre}" requiere más de tu atención. Intenta configurar recordatorios para mantener el impulso.` 
          : "¡Excelente trabajo! Estás manteniendo una consistencia increíble."
      };
    } catch (error: any) {
      throw new InternalServerErrorException('Error al obtener el resumen del usuario: ' + error.message);
    }
  }
  async getHabitsReport(userId: string) {
    try {
      const client = this.supabaseService.getClient();
      const { data: habitos, error } = await client
        .schema('seguimiento')
        .from('habitos')
        .select('idhabito, titulo, descripcion, color')
        .eq('idusuario', userId)
        .eq('estado', 'Activo');

      if (error) throw new Error(error.message);

      return habitos.map((h: any) => ({
        idHabito: h.idhabito,
        nombre: h.titulo,
        porcentajeCambio: '+5%',
        descripcion: h.descripcion || '',
        progreso: 50,
        color: h.color || 'bg-blue-500',
      }));
    } catch (error: any) {
      throw new InternalServerErrorException(
        'Error al obtener reporte de hábitos: ' + error.message,
      );
    }
  }

  async getComparativeReport() {
    // Retornamos datos de ejemplo que coincidan con la estructura ComparativaGraphed del frontend
    return {
      diasSemana: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      data: [
        { categoriaId: 'salud', vals: [2, 3, 4, 3, 5, 4, 6] },
        { categoriaId: 'enfoque', vals: [1, 2, 2, 4, 3, 5, 4] },
      ],
    };
  }
}

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ReportsRepository } from '../repositories/reports.repository';

@Injectable()
export class ReportsService {
  constructor(private readonly reportsRepository: ReportsRepository) {}

  async getRanking() {
    try {
      const data = await this.reportsRepository.getRanking();

      if (!data) {
        throw new Error('No data found');
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
      const today = new Date();
      today.setHours(0,0,0,0);

      // 1. Obtener datos del perfil
      const userProfile = await this.reportsRepository.getUserProfile(userId);

      // 2. Obtener TODOS los hábitos (Activos e Inactivos) para calcular historial real
      const allHabits = await this.reportsRepository.getAllHabits(userId);
      const activeHabits = allHabits.filter(h => h.estado === 'Activo');

      // 3. Obtener registros de hábitos completados (hasta 1 año para cálculos)
      const oneYearAgo = new Date(today);
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      const startDate = oneYearAgo.toISOString().split('T')[0];
      const records = await this.reportsRepository.getHabitRecordsFromDate(userId, startDate);

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

        // Procesar días desde el más antiguo hasta hoy usando TODOS los hábitos
        const oldestHabitDate = new Date(Math.min(...allHabits.map(h => new Date(h.fechainicio).getTime())));
        const currentDate = new Date(oldestHabitDate);
        currentDate.setHours(0,0,0,0);

        let globalCurrentStreak = 0;

        while (currentDate <= today) {
          const dStr = currentDate.toISOString().split('T')[0];
          const jsDay = currentDate.getDay();
          const habDay = jsDay === 0 ? 7 : jsDay;
          const completedIds = recordsByDate[dStr] || [];
          
          let allCompletedForDay = true;
          let anyScheduled = false;

          for (const h of allHabits) {
            const hStart = new Date(h.fechainicio);
            hStart.setHours(0,0,0,0);
            
            if (h.estado !== 'Activo') continue;

            if (currentDate >= hStart && h.dias_semana && h.dias_semana.includes(habDay)) {
              anyScheduled = true;
              
              if (h.estado === 'Activo') {
                statsByHabit[h.idhabito].expected++;
              }
              
              const isCompleted = completedIds.includes(h.idhabito);
              
              if (currentDate >= periodStartDate) {
                totalEsperado++;
                if (isCompleted) totalCumplido++;
              }

              if (isCompleted) {
                if (h.estado === 'Activo') {
                  statsByHabit[h.idhabito].completed++;
                  statsByHabit[h.idhabito].currentStreak++;
                  statsByHabit[h.idhabito].maxStreak = Math.max(statsByHabit[h.idhabito].maxStreak, statsByHabit[h.idhabito].currentStreak);
                }
              } else {
                allCompletedForDay = false;
                if (currentDate < today) {
                  if (h.estado === 'Activo') {
                    statsByHabit[h.idhabito].currentStreak = 0;
                  }
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
             if (allCompletedForDay) {
               globalCurrentStreak++;
               rachaMaxima = Math.max(rachaMaxima, globalCurrentStreak);
             } else if (currentDate < today) {
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
            masConstante = { nombre: h.nombre, racha: stats.currentStreak, rate: Math.round(rate) };
          }
          if (rate < minRate && stats.expected > 0) {
            minRate = rate;
            oportunidadMejora = { nombre: h.nombre, rate: Math.round(rate) };
          }
        });
      }

      cumplimientoGlobal = totalEsperado > 0 ? Math.round((totalCumplido / totalEsperado) * 100) : 0;

      return {
        userId,
        nombre: userProfile?.nombre,
        apellido: userProfile?.apellido,
        email: userProfile?.email,
        fotoperfil: userProfile?.fotoperfil,
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
        recordsByDate,
        activeHabits: (activeHabits || []).map((h: any) => {
          const desc = h.descripcion || '';
          const isCoachAssigned =
            desc.startsWith('[Coach') ||
            desc.toLowerCase().includes('[asignado');
          return {
            id: h.idhabito,
            nombre: h.nombre,
            descripcion: desc,
            tipo: isCoachAssigned ? 'Asignado' : (h.tipo || 'Personal'),
            meta: h.meta_diaria ? `${h.meta_diaria} / día` : 'Meta diaria',
            completadoHoy: recordsByDate[today.toISOString().split('T')[0]]?.includes(h.idhabito) || false,
            stats: statsByHabit[h.idhabito] || { completed: 0, expected: 0 },
          };
        }),
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
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const startDate = thirtyDaysAgo.toISOString().split('T')[0];

      const [habitos, records] = await Promise.all([
        this.reportsRepository.getActiveHabitsInfo(userId),
        this.reportsRepository.getHabitRecordsFromDate(userId, startDate),
      ]);

      const recordsByHabit: Record<string, number> = {};
      if (records) {
        for (const r of records) {
          recordsByHabit[r.idhabito] = (recordsByHabit[r.idhabito] || 0) + 1;
        }
      }

      const defaultColors = ['#2563EB', '#7C3AED', '#059669', '#EA580C', '#EC4899', '#0284C7'];

      return (habitos || []).map((h: any, idx: number) => {
        const completed = recordsByHabit[h.idhabito] || 0;
        const habitStart = h.fechainicio ? new Date(h.fechainicio) : thirtyDaysAgo;
        habitStart.setHours(0, 0, 0, 0);
        const effectiveStart = habitStart > thirtyDaysAgo ? habitStart : thirtyDaysAgo;

        let expected = 1;
        if (h.dias_semana && Array.isArray(h.dias_semana) && h.dias_semana.length > 0) {
          let count = 0;
          const cur = new Date(effectiveStart);
          while (cur <= today) {
            const jsDay = cur.getDay();
            const habDay = jsDay === 0 ? 7 : jsDay;
            if (h.dias_semana.includes(habDay)) count++;
            cur.setDate(cur.getDate() + 1);
          }
          expected = Math.max(1, count);
        } else {
          const daysDiff = Math.round((today.getTime() - effectiveStart.getTime()) / (24 * 60 * 60 * 1000)) + 1;
          expected = Math.max(1, daysDiff);
        }

        const progreso = Math.min(100, Math.round((completed / expected) * 100));

        return {
          idHabito: h.idhabito,
          nombre: h.nombre,
          porcentajeCambio: `${progreso}%`,
          descripcion: h.descripcion || (h.meta_diaria ? `Meta: ${h.meta_diaria} al día` : 'Hábito activo'),
          progreso,
          color: h.color || defaultColors[idx % defaultColors.length],
        };
      });
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

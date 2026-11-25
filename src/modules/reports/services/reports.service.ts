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

  private resolvePeriodDays(period: 'week' | 'month' | 'year'): number {
    if (period === 'week') return 7;
    if (period === 'month') return 30;
    return 365;
  }

  private groupHabitRecordsByDate(records: any[] | null | undefined): Record<string, string[]> {
    const recordsByDate: Record<string, string[]> = {};
    if (!records) return recordsByDate;
    for (const r of records) {
      if (!recordsByDate[r.fecha]) recordsByDate[r.fecha] = [];
      recordsByDate[r.fecha].push(r.idhabito);
    }
    return recordsByDate;
  }

  private evaluateSingleDayForHabit(
    h: any,
    currentDate: Date,
    today: Date,
    periodStartDate: Date,
    habDay: number,
    jsDay: number,
    completedIds: string[],
    statsByHabit: Record<string, { expected: number; completed: number; currentStreak: number; maxStreak: number }>,
    volumenSemanal: number[],
  ): { scheduled: boolean; completed: boolean; inPeriod: boolean } {
    const hStart = new Date(h.fechainicio);
    hStart.setHours(0, 0, 0, 0);

    if (h.estado !== 'Activo' || currentDate < hStart || !h.dias_semana?.includes(habDay)) {
      return { scheduled: false, completed: true, inPeriod: false };
    }

    statsByHabit[h.idhabito].expected++;
    const isCompleted = completedIds.includes(h.idhabito);
    const inPeriod = currentDate >= periodStartDate;

    if (isCompleted) {
      statsByHabit[h.idhabito].completed++;
      statsByHabit[h.idhabito].currentStreak++;
      statsByHabit[h.idhabito].maxStreak = Math.max(
        statsByHabit[h.idhabito].maxStreak,
        statsByHabit[h.idhabito].currentStreak,
      );
      const sevenDaysAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
      if (currentDate >= sevenDaysAgo) {
        const arrIndex = jsDay === 0 ? 6 : jsDay - 1;
        volumenSemanal[arrIndex]++;
      }
    } else if (currentDate < today) {
      statsByHabit[h.idhabito].currentStreak = 0;
    }

    return { scheduled: true, completed: isCompleted, inPeriod };
  }

  private findBestAndWorstHabit(
    activeHabits: any[],
    statsByHabit: Record<string, { expected: number; completed: number; currentStreak: number; maxStreak: number }>,
  ) {
    let masConstante: any = null;
    let oportunidadMejora: any = null;
    let maxRate = -1;
    let minRate = 101;

    for (const h of activeHabits) {
      const stats = statsByHabit[h.idhabito];
      if (!stats || stats.expected <= 0) continue;
      const rate = (stats.completed / stats.expected) * 100;
      if (rate > maxRate) {
        maxRate = rate;
        masConstante = { nombre: h.nombre, racha: stats.currentStreak, rate: Math.round(rate) };
      }
      if (rate < minRate) {
        minRate = rate;
        oportunidadMejora = { nombre: h.nombre, rate: Math.round(rate) };
      }
    }

    return { masConstante, oportunidadMejora };
  }

  private computeActiveHabitsAnalytics(
    allHabits: any[],
    activeHabits: any[],
    recordsByDate: Record<string, string[]>,
    today: Date,
    periodDays: number,
  ) {
    let totalEsperado = 0;
    let totalCumplido = 0;
    let rachaMaxima = 0;
    let globalCurrentStreak = 0;
    const volumenSemanal = [0, 0, 0, 0, 0, 0, 0];
    const consistenciaMes: any[] = [];
    const statsByHabit: Record<string, { expected: number; completed: number; currentStreak: number; maxStreak: number }> = {};

    for (const h of activeHabits) {
      statsByHabit[h.idhabito] = { expected: 0, completed: 0, currentStreak: 0, maxStreak: 0 };
    }

    const periodStartDate = new Date(today);
    periodStartDate.setDate(today.getDate() - periodDays + 1);
    const thirtyDaysAgo = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000);

    const oldestHabitDate = new Date(Math.min(...allHabits.map((h) => new Date(h.fechainicio).getTime())));
    const currentDate = new Date(oldestHabitDate);
    currentDate.setHours(0, 0, 0, 0);

    while (currentDate <= today) {
      const dStr = currentDate.toISOString().split('T')[0];
      const jsDay = currentDate.getDay();
      const habDay = jsDay === 0 ? 7 : jsDay;
      const completedIds = recordsByDate[dStr] || [];

      let allCompletedForDay = true;
      let anyScheduled = false;

      for (const h of allHabits) {
        const res = this.evaluateSingleDayForHabit(
          h,
          currentDate,
          today,
          periodStartDate,
          habDay,
          jsDay,
          completedIds,
          statsByHabit,
          volumenSemanal,
        );
        if (res.scheduled) {
          anyScheduled = true;
          if (res.inPeriod) {
            totalEsperado++;
            if (res.completed) totalCumplido++;
          }
          if (!res.completed) {
            allCompletedForDay = false;
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

      if (currentDate >= thirtyDaysAgo) {
        consistenciaMes.push({ fecha: dStr, activos: completedIds.length });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    const rachaActual = globalCurrentStreak;
    rachaMaxima = Math.max(rachaMaxima, rachaActual);
    const { masConstante, oportunidadMejora } = this.findBestAndWorstHabit(activeHabits, statsByHabit);

    return {
      totalEsperado,
      totalCumplido,
      rachaActual,
      rachaMaxima,
      masConstante,
      oportunidadMejora,
      volumenSemanal,
      consistenciaMes,
      statsByHabit,
    };
  }

  private mapActiveHabitsForSummary(
    activeHabits: any[],
    recordsByDate: Record<string, string[]>,
    statsByHabit: Record<string, { expected: number; completed: number }>,
    todayStr: string,
  ) {
    return activeHabits.map((h: any) => {
      const desc = h.descripcion || '';
      const isCoachAssigned = desc.startsWith('[Coach') || desc.toLowerCase().includes('[asignado');
      return {
        id: h.idhabito,
        nombre: h.nombre,
        descripcion: desc,
        tipo: isCoachAssigned ? 'Asignado' : (h.tipo || 'Personal'),
        meta: h.meta_diaria ? `${h.meta_diaria} / día` : 'Meta diaria',
        completadoHoy: recordsByDate[todayStr]?.includes(h.idhabito) || false,
        stats: statsByHabit[h.idhabito] || { completed: 0, expected: 0 },
      };
    });
  }

  async getUserSummary(userId: string, period: 'week' | 'month' | 'year' = 'week') {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const userProfile = await this.reportsRepository.getUserProfile(userId);
      const allHabits = await this.reportsRepository.getAllHabits(userId);
      const activeHabits = allHabits.filter((h) => h.estado === 'Activo');

      const oneYearAgo = new Date(today);
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      const startDate = oneYearAgo.toISOString().split('T')[0];
      const records = await this.reportsRepository.getHabitRecordsFromDate(userId, startDate);

      const recordsByDate = this.groupHabitRecordsByDate(records);
      const periodDays = this.resolvePeriodDays(period);

      const analytics =
        activeHabits.length > 0
          ? this.computeActiveHabitsAnalytics(allHabits, activeHabits, recordsByDate, today, periodDays)
          : {
              totalEsperado: 0,
              totalCumplido: 0,
              rachaActual: 0,
              rachaMaxima: 0,
              masConstante: null,
              oportunidadMejora: null,
              volumenSemanal: [0, 0, 0, 0, 0, 0, 0],
              consistenciaMes: [],
              statsByHabit: {},
            };

      const cumplimientoGlobal =
        analytics.totalEsperado > 0
          ? Math.round((analytics.totalCumplido / analytics.totalEsperado) * 100)
          : 0;

      const todayStr = today.toISOString().split('T')[0];

      return {
        userId,
        nombre: userProfile?.nombre,
        apellido: userProfile?.apellido,
        email: userProfile?.email,
        fotoperfil: userProfile?.fotoperfil,
        puntos_totales: userProfile?.puntostotales || 0,
        cumplimiento_global: cumplimientoGlobal,
        total_esperado: analytics.totalEsperado,
        total_cumplido: analytics.totalCumplido,
        racha_actual: analytics.rachaActual,
        racha_maxima: analytics.rachaMaxima,
        mas_constante: analytics.masConstante,
        oportunidad_mejora: analytics.oportunidadMejora,
        volumen_semanal: analytics.volumenSemanal,
        consistencia_mes: analytics.consistenciaMes,
        recordsByDate,
        activeHabits: this.mapActiveHabitsForSummary(
          activeHabits,
          recordsByDate,
          analytics.statsByHabit,
          todayStr,
        ),
        insight: analytics.oportunidadMejora
          ? `El hábito "${analytics.oportunidadMejora.nombre}" requiere más de tu atención. Intenta configurar recordatorios para mantener el impulso.`
          : '¡Excelente trabajo! Estás manteniendo una consistencia increíble.',
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

  getComparativeReport() {
    // Retornamos datos de ejemplo que coincidan con la estructura ComparativaGraphed del frontend
    return Promise.resolve({
      diasSemana: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      data: [
        { categoriaId: 'salud', vals: [2, 3, 4, 3, 5, 4, 6] },
        { categoriaId: 'enfoque', vals: [1, 2, 2, 4, 3, 5, 4] },
      ],
    });
  }
}

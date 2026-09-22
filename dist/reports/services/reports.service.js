"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const reports_repository_1 = require("../repositories/reports.repository");
let ReportsService = class ReportsService {
    reportsRepository;
    constructor(reportsRepository) {
        this.reportsRepository = reportsRepository;
    }
    async getRanking() {
        try {
            const data = await this.reportsRepository.getRanking();
            if (!data) {
                throw new Error('No data found');
            }
            return data;
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Error al obtener el ranking de usuarios: ' + error.message);
        }
    }
    async getUserSummary(userId, period = 'week') {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayStr = today.toISOString().split('T')[0];
            const userProfile = await this.reportsRepository.getUserProfile(userId);
            const allHabits = await this.reportsRepository.getAllHabits(userId);
            const activeHabits = allHabits.filter(h => h.estado === 'Activo');
            const oneYearAgo = new Date(today);
            oneYearAgo.setFullYear(today.getFullYear() - 1);
            const startDate = oneYearAgo.toISOString().split('T')[0];
            const records = await this.reportsRepository.getHabitRecordsFromDate(userId, startDate);
            let cumplimientoGlobal = 0;
            let totalEsperado = 0;
            let totalCumplido = 0;
            let rachaActual = 0;
            let rachaMaxima = 0;
            let masConstante = null;
            let oportunidadMejora = null;
            const volumenSemanal = [0, 0, 0, 0, 0, 0, 0];
            const consistenciaMes = [];
            const recordsByDate = {};
            const statsByHabit = {};
            if (records) {
                for (const r of records) {
                    if (!recordsByDate[r.fecha])
                        recordsByDate[r.fecha] = [];
                    recordsByDate[r.fecha].push(r.idhabito);
                }
            }
            if (activeHabits && activeHabits.length > 0) {
                activeHabits.forEach(h => {
                    statsByHabit[h.idhabito] = { expected: 0, completed: 0, currentStreak: 0, maxStreak: 0 };
                });
                const periodDays = period === 'week' ? 7 : (period === 'month' ? 30 : 365);
                const periodStartDate = new Date(today);
                periodStartDate.setDate(today.getDate() - periodDays + 1);
                const oldestHabitDate = new Date(Math.min(...allHabits.map(h => new Date(h.fechainicio).getTime())));
                let currentDate = new Date(oldestHabitDate);
                currentDate.setHours(0, 0, 0, 0);
                let globalCurrentStreak = 0;
                while (currentDate <= today) {
                    const dStr = currentDate.toISOString().split('T')[0];
                    let jsDay = currentDate.getDay();
                    let habDay = jsDay === 0 ? 7 : jsDay;
                    const completedIds = recordsByDate[dStr] || [];
                    let allCompletedForDay = true;
                    let anyScheduled = false;
                    for (const h of allHabits) {
                        const hStart = new Date(h.fechainicio);
                        hStart.setHours(0, 0, 0, 0);
                        if (h.estado !== 'Activo')
                            continue;
                        if (currentDate >= hStart && h.dias_semana && h.dias_semana.includes(habDay)) {
                            anyScheduled = true;
                            if (h.estado === 'Activo') {
                                statsByHabit[h.idhabito].expected++;
                            }
                            const isCompleted = completedIds.includes(h.idhabito);
                            if (currentDate >= periodStartDate) {
                                totalEsperado++;
                                if (isCompleted)
                                    totalCumplido++;
                            }
                            if (isCompleted) {
                                if (h.estado === 'Activo') {
                                    statsByHabit[h.idhabito].completed++;
                                    statsByHabit[h.idhabito].currentStreak++;
                                    statsByHabit[h.idhabito].maxStreak = Math.max(statsByHabit[h.idhabito].maxStreak, statsByHabit[h.idhabito].currentStreak);
                                }
                            }
                            else {
                                allCompletedForDay = false;
                                if (currentDate < today) {
                                    if (h.estado === 'Activo') {
                                        statsByHabit[h.idhabito].currentStreak = 0;
                                    }
                                }
                            }
                            if (currentDate >= new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000)) {
                                if (isCompleted) {
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
                        }
                        else if (currentDate < today) {
                            globalCurrentStreak = 0;
                        }
                    }
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
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Error al obtener el resumen del usuario: ' + error.message);
        }
    }
    async getHabitsReport(userId) {
        try {
            const habitos = await this.reportsRepository.getActiveHabitsInfo(userId);
            return habitos.map((h) => ({
                idHabito: h.idhabito,
                nombre: h.nombre,
                porcentajeCambio: '+5%',
                descripcion: h.descripcion || '',
                progreso: 50,
                color: h.color || 'bg-blue-500',
            }));
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Error al obtener reporte de hábitos: ' + error.message);
        }
    }
    async getComparativeReport() {
        return {
            diasSemana: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            data: [
                { categoriaId: 'salud', vals: [2, 3, 4, 3, 5, 4, 6] },
                { categoriaId: 'enfoque', vals: [1, 2, 2, 4, 3, 5, 4] },
            ],
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [reports_repository_1.ReportsRepository])
], ReportsService);
//# sourceMappingURL=reports.service.js.map
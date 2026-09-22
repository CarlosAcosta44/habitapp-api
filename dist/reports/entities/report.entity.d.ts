export interface RankingEntry {
    idusuario: string;
    nombre: string;
    apellido?: string;
    puntostotales: number;
    posicion?: number;
}
export interface HabitStats {
    expected: number;
    completed: number;
    currentStreak: number;
    maxStreak: number;
}
export interface UserSummary {
    userId: string;
    nombre?: string;
    puntos_totales: number;
    cumplimiento_global: number;
    total_esperado: number;
    total_cumplido: number;
    racha_actual: number;
    racha_maxima: number;
    mas_constante?: {
        nombre: string;
        racha: number;
        rate: number;
    };
    oportunidad_mejora?: {
        nombre: string;
        rate: number;
    };
    volumen_semanal: number[];
    consistencia_mes: {
        fecha: string;
        activos: number;
    }[];
    insight: string;
}

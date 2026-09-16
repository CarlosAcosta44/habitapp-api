import { SupabaseService } from '../../supabase/supabase.service';
export declare class ReportsService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    getRanking(): Promise<any[]>;
    getUserSummary(userId: string, period?: 'week' | 'month' | 'year'): Promise<{
        userId: string;
        nombre: any;
        puntos_totales: any;
        cumplimiento_global: number;
        total_esperado: number;
        total_cumplido: number;
        racha_actual: number;
        racha_maxima: number;
        mas_constante: any;
        oportunidad_mejora: any;
        volumen_semanal: number[];
        consistencia_mes: any[];
        insight: string;
    }>;
    getHabitsReport(userId: string): Promise<{
        idHabito: any;
        nombre: any;
        porcentajeCambio: string;
        descripcion: any;
        progreso: number;
        color: any;
    }[]>;
    getComparativeReport(): Promise<{
        diasSemana: string[];
        data: {
            categoriaId: string;
            vals: number[];
        }[];
    }>;
}

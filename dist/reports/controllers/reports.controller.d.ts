import { ReportsService } from '../services/reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getRanking(): Promise<any[]>;
    getUserSummary(userId: string): Promise<{
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
    getUserHabits(userId: string): Promise<{
        idHabito: any;
        nombre: any;
        porcentajeCambio: string;
        descripcion: any;
        progreso: number;
        color: any;
    }[]>;
    getUserComparative(): Promise<{
        diasSemana: string[];
        data: {
            categoriaId: string;
            vals: number[];
        }[];
    }>;
}

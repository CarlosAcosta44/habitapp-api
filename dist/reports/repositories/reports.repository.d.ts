import { SupabaseService } from '../../supabase/services/supabase.service';
export declare class ReportsRepository {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    getRanking(): Promise<any[]>;
    getUserProfile(userId: string): Promise<{
        nombre: any;
        puntostotales: any;
    }>;
    getAllHabits(userId: string): Promise<{
        idhabito: any;
        fechainicio: any;
        dias_semana: any;
        estado: any;
        nombre: any;
    }[]>;
    getHabitRecordsFromDate(userId: string, startDate: string): Promise<{
        idhabito: any;
        fecha: any;
        completado: any;
    }[]>;
    getActiveHabitsInfo(userId: string): Promise<{
        idhabito: any;
        nombre: any;
        descripcion: any;
        color: any;
    }[]>;
}

import { SupabaseService } from '../supabase/supabase.service';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { ReportsService } from '../reports/services/reports.service';
export declare class CoachService {
    private readonly supabaseService;
    private readonly reportsService;
    constructor(supabaseService: SupabaseService, reportsService: ReportsService);
    private getTrainerId;
    getClients(userId: string): Promise<{
        assigned_at: any;
        client: {
            idusuario: any;
            nombre: any;
            apellido: any;
            fotoperfil: any;
            puntostotales: any;
            idrol: any;
            nombrerol: any;
        } | null;
    }[]>;
    createRoutine(userId: string, dto: CreateRoutineDto): Promise<any>;
    getRoutines(userId: string): Promise<any[]>;
    getRoutineById(userId: string, routineId: string): Promise<any>;
    updateRoutine(userId: string, routineId: string, dto: UpdateRoutineDto): Promise<any>;
    deleteRoutine(userId: string, routineId: string): Promise<void>;
    assignRoutineToClient(userId: string, clientId: string, routineId: string): Promise<{
        message: string;
        habitsAssigned: number;
    }>;
    getClientProgress(userId: string, clientId: string): Promise<{
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
}

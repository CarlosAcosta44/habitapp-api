import { CoachService } from './coach.service';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
export declare class CoachController {
    private readonly coachService;
    constructor(coachService: CoachService);
    getClients(user: any): Promise<{
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
    createRoutine(user: any, dto: CreateRoutineDto): Promise<any>;
    getRoutines(user: any): Promise<any[]>;
    getRoutineById(user: any, id: string): Promise<any>;
    updateRoutine(user: any, id: string, dto: UpdateRoutineDto): Promise<any>;
    deleteRoutine(user: any, id: string): Promise<void>;
    assignRoutine(user: any, clientId: string, routineId: string): Promise<{
        message: string;
        habitsAssigned: number;
    }>;
    getClientProgress(user: any, clientId: string): Promise<{
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

import { SupabaseService } from '../../supabase/services/supabase.service';
export declare class CoachRepository {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    getTrainerId(userId: string): Promise<string>;
    getClientsByTrainer(trainerId: string): Promise<{
        fechainicio: any;
        idusuario: any;
    }[]>;
    getUserProfile(userId: string): Promise<any>;
    createRoutine(trainerId: string, description: string, name: string): Promise<any>;
    getRoutinesByTrainer(trainerId: string): Promise<any[]>;
    getRoutineByIdAndTrainer(routineId: string, trainerId: string): Promise<any>;
    updateRoutine(routineId: string, trainerId: string, updateData: any): Promise<void>;
    deleteRoutineAssignments(routineId: string): Promise<void>;
    deleteRoutine(routineId: string, trainerId: string): Promise<void>;
    getClientTrainerRelationship(trainerId: string, clientId: string): Promise<{
        fechainicio: any;
    }>;
    assignRoutineToClient(clientId: string, routineId: string): Promise<void>;
}

export interface TrainerProfile {
    identrenador: string;
    idusuario: string;
    especialidad?: string;
}
export interface ClientAssignment {
    idusuario: string;
    identrenador: string;
    fechainicio: string;
}
export interface Routine {
    idrutina: string;
    identrenador: string;
    tipo: string;
    descripcion?: string;
    nivel: string;
    objetivo: string;
    name?: string;
    description?: string;
    id?: string;
    routine_habits?: RoutineHabit[];
}
export interface RoutineHabit {
    idrutina: string;
    idhabito: string;
    order_index?: number;
}
export interface ClientWithProfile {
    assigned_at: string;
    client: {
        idusuario: string;
        nombre: string;
        apellido: string;
        fotoperfil?: string;
        puntostotales?: number;
        idrol: number;
        nombrerol: string;
    } | null;
}
export interface AssignRoutineResult {
    message: string;
    habitsAssigned: number;
}

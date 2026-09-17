import { RecordsRepository } from '../repositories/records.repository';
import { HabitsRepository } from '../../habits/repositories/habits.repository';
import { CreateRecordDto, AvanzarProgresoDto } from '../dto/create-record.dto';
export declare class RecordsService {
    private readonly recordsRepo;
    private readonly habitsRepo;
    constructor(recordsRepo: RecordsRepository, habitsRepo: HabitsRepository);
    getByHabito(habitoId: string, userId: string): Promise<{
        idRegistro: string;
        fecha: string;
        completado: boolean;
        progresoActual: number;
        puntosGanados: number;
        observacion: string | null;
        idHabito: string;
        idUsuario: string;
    }[]>;
    getHistorial(userId: string): Promise<{
        habito: {
            nombre: any;
            puntos: any;
            idCategoria: any;
        };
        idRegistro: string;
        fecha: string;
        completado: boolean;
        progresoActual: number;
        puntosGanados: number;
        observacion: string | null;
        idHabito: string;
        idUsuario: string;
    }[]>;
    marcarCompletado(dto: CreateRecordDto, userId: string, tzOffset?: number): Promise<{
        idRegistro: string;
        fecha: string;
        completado: boolean;
        progresoActual: number;
        puntosGanados: number;
        observacion: string | null;
        idHabito: string;
        idUsuario: string;
    } | null>;
    desmarcarCompletado(habitoId: string, userId: string, tzOffset?: number): Promise<{
        idRegistro: string;
        fecha: string;
        completado: boolean;
        progresoActual: number;
        puntosGanados: number;
        observacion: string | null;
        idHabito: string;
        idUsuario: string;
    } | null>;
    avanzarProgreso(dto: AvanzarProgresoDto, userId: string, tzOffset?: number): Promise<{
        idRegistro: string;
        fecha: string;
        completado: boolean;
        progresoActual: number;
        puntosGanados: number;
        observacion: string | null;
        idHabito: string;
        idUsuario: string;
    } | null>;
    getRacha(habitoId: string, userId: string, tzOffset?: number): Promise<{
        idHabito: string;
        rachaActual: number;
        rachaMaxima: number;
        totalCompletados: number;
    }>;
}

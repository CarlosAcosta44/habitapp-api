import { RecordsService } from '../services/records.service';
import { AvanzarProgresoDto, CreateRecordDto } from '../dto/create-record.dto';
export declare class RecordsController {
    private readonly recordsService;
    constructor(recordsService: RecordsService);
    getHistorial(req: any): Promise<{
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
    getByHabito(habitoId: string, req: any): Promise<{
        idRegistro: string;
        fecha: string;
        completado: boolean;
        progresoActual: number;
        puntosGanados: number;
        observacion: string | null;
        idHabito: string;
        idUsuario: string;
    }[]>;
    getRacha(habitoId: string, req: any): Promise<{
        idHabito: string;
        rachaActual: number;
        rachaMaxima: number;
        totalCompletados: number;
    }>;
    marcarCompletado(dto: CreateRecordDto, req: any): Promise<{
        idRegistro: string;
        fecha: string;
        completado: boolean;
        progresoActual: number;
        puntosGanados: number;
        observacion: string | null;
        idHabito: string;
        idUsuario: string;
    } | null>;
    desmarcarCompletado(habitoId: string, req: any): Promise<{
        idRegistro: string;
        fecha: string;
        completado: boolean;
        progresoActual: number;
        puntosGanados: number;
        observacion: string | null;
        idHabito: string;
        idUsuario: string;
    } | null>;
    avanzarProgreso(dto: AvanzarProgresoDto, req: any): Promise<{
        idRegistro: string;
        fecha: string;
        completado: boolean;
        progresoActual: number;
        puntosGanados: number;
        observacion: string | null;
        idHabito: string;
        idUsuario: string;
    } | null>;
}

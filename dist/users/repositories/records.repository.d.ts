import { SupabaseService } from '../../supabase/supabase.service';
export declare class RecordsRepository {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    private getLocalHoy;
    private get db();
    private mapToDomain;
    findByHabitoId(habitoId: string): Promise<{
        idRegistro: string;
        fecha: string;
        completado: boolean;
        progresoActual: number;
        puntosGanados: number;
        observacion: string | null;
        idHabito: string;
        idUsuario: string;
    }[]>;
    findByUsuarioId(usuarioId: string): Promise<{
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
    findHoy(habitoId: string, usuarioId: string, tzOffset?: number): Promise<{
        idRegistro: string;
        fecha: string;
        completado: boolean;
        progresoActual: number;
        puntosGanados: number;
        observacion: string | null;
        idHabito: string;
        idUsuario: string;
    } | null>;
    marcarCompletado(payload: {
        idhabito: string;
        idusuario: string;
        fecha: string;
        observacion?: string;
        metaDiaria: number;
    }, tzOffset?: number): Promise<{
        idRegistro: string;
        fecha: string;
        completado: boolean;
        progresoActual: number;
        puntosGanados: number;
        observacion: string | null;
        idHabito: string;
        idUsuario: string;
    } | null>;
    desmarcarCompletado(habitoId: string, usuarioId: string, tzOffset?: number): Promise<{
        idRegistro: string;
        fecha: string;
        completado: boolean;
        progresoActual: number;
        puntosGanados: number;
        observacion: string | null;
        idHabito: string;
        idUsuario: string;
    } | null>;
    avanzarProgreso(payload: {
        idhabito: string;
        idusuario: string;
        fecha: string;
        cantidadASumar: number;
        metaDiaria: number;
        observacion?: string;
    }, tzOffset?: number): Promise<{
        idRegistro: string;
        fecha: string;
        completado: boolean;
        progresoActual: number;
        puntosGanados: number;
        observacion: string | null;
        idHabito: string;
        idUsuario: string;
    } | null>;
    calcularRacha(habitoId: string, usuarioId: string, tzOffset?: number): Promise<{
        idHabito: string;
        rachaActual: number;
        rachaMaxima: number;
        totalCompletados: number;
    }>;
}

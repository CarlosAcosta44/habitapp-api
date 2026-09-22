import { SupabaseService } from '../../supabase/services/supabase.service';
interface RawHabito {
    idhabito: string;
    nombre: string;
    descripcion: string | null;
    fechainicio: string;
    fechafin: string | null;
    estado: string;
    puntos: number;
    meta_diaria: number;
    unidad_medida: string;
    idusuario: string;
    idcategoria: string;
    dias_semana?: number[];
    categorias_habitos?: {
        idcategoria: string;
        nombre: string;
        descripcion: string | null;
        icono: string | null;
    } | null;
}
export declare class HabitsRepository {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    private getLocalHoy;
    private get db();
    private readonly SELECT_WITH_CATEGORIA;
    mapToDomain(row: RawHabito): {
        idHabito: string;
        nombre: string;
        descripcion: string | null;
        fechaInicio: string;
        fechaFin: string | null;
        estado: string;
        puntos: number;
        metaDiaria: number;
        unidadMedida: string;
        idUsuario: string;
        idCategoria: string;
        diasSemana: number[];
        categoria: {
            idCategoria: string;
            nombre: string;
            descripcion: string | null;
            icono: string | null;
        } | null;
    };
    findById(idHabito: string): Promise<{
        idHabito: string;
        nombre: string;
        descripcion: string | null;
        fechaInicio: string;
        fechaFin: string | null;
        estado: string;
        puntos: number;
        metaDiaria: number;
        unidadMedida: string;
        idUsuario: string;
        idCategoria: string;
        diasSemana: number[];
        categoria: {
            idCategoria: string;
            nombre: string;
            descripcion: string | null;
            icono: string | null;
        } | null;
    } | null>;
    findByUserId(userId: string, estado?: string): Promise<{
        idHabito: string;
        nombre: string;
        descripcion: string | null;
        fechaInicio: string;
        fechaFin: string | null;
        estado: string;
        puntos: number;
        metaDiaria: number;
        unidadMedida: string;
        idUsuario: string;
        idCategoria: string;
        diasSemana: number[];
        categoria: {
            idCategoria: string;
            nombre: string;
            descripcion: string | null;
            icono: string | null;
        } | null;
    }[]>;
    findByUserIdWithRecordToday(userId: string, tzOffset?: number): Promise<{
        registroHoy: {
            idRegistro: any;
            completado: any;
            progresoActual: any;
            puntosGanados: any;
            observacion: any;
        } | null;
        fechasCompletadas: any;
        rachaActual: number;
        idHabito: string;
        nombre: string;
        descripcion: string | null;
        fechaInicio: string;
        fechaFin: string | null;
        estado: string;
        puntos: number;
        metaDiaria: number;
        unidadMedida: string;
        idUsuario: string;
        idCategoria: string;
        diasSemana: number[];
        categoria: {
            idCategoria: string;
            nombre: string;
            descripcion: string | null;
            icono: string | null;
        } | null;
    }[]>;
    findCategorias(): Promise<{
        idCategoria: string;
        nombre: string;
        descripcion: string | null;
        icono: string | null;
    }[]>;
    create(payload: {
        nombre: string;
        descripcion?: string;
        fechainicio: string;
        fechafin?: string;
        estado: string;
        puntos: number;
        meta_diaria: number;
        unidad_medida: string;
        idusuario: string;
        idcategoria: string;
        dias_semana: number[];
    }): Promise<{
        idHabito: string;
        nombre: string;
        descripcion: string | null;
        fechaInicio: string;
        fechaFin: string | null;
        estado: string;
        puntos: number;
        metaDiaria: number;
        unidadMedida: string;
        idUsuario: string;
        idCategoria: string;
        diasSemana: number[];
        categoria: {
            idCategoria: string;
            nombre: string;
            descripcion: string | null;
            icono: string | null;
        } | null;
    }>;
    update(idHabito: string, payload: any): Promise<{
        idHabito: string;
        nombre: string;
        descripcion: string | null;
        fechaInicio: string;
        fechaFin: string | null;
        estado: string;
        puntos: number;
        metaDiaria: number;
        unidadMedida: string;
        idUsuario: string;
        idCategoria: string;
        diasSemana: number[];
        categoria: {
            idCategoria: string;
            nombre: string;
            descripcion: string | null;
            icono: string | null;
        } | null;
    }>;
    getHabitStats(idHabito: string): Promise<{
        rachaActual: number;
        mejorRacha: number;
        totalCumplido: number;
        historialReciente: {
            fecha: any;
            completado: any;
            progresoActual: any;
            puntosGanados: any;
        }[];
    }>;
    delete(idHabito: string): Promise<void>;
}
export {};

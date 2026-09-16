import { HabitsService } from './services/habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
export declare class HabitsController {
    private readonly habitsService;
    constructor(habitsService: HabitsService);
    getDashboard(req: any): Promise<{
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
    getCategorias(): Promise<{
        idCategoria: string;
        nombre: string;
        descripcion: string | null;
        icono: string | null;
    }[]>;
    findAll(req: any, estado?: string): Promise<{
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
    findOne(id: string, req: any): Promise<{
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
    findStats(id: string, req: any): Promise<{
        rachaActual: number;
        mejorRacha: number;
        totalCumplido: number;
        tasaExito: number;
        historialReciente: {
            fecha: any;
            completado: any;
            progresoActual: any;
            puntosGanados: any;
        }[];
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
    create(dto: CreateHabitDto, req: any): Promise<{
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
    update(id: string, dto: UpdateHabitDto, req: any): Promise<{
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
    completar(id: string, req: any): Promise<{
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
    delete(id: string, req: any): Promise<{
        success: boolean;
    }>;
}

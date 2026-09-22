import { HabitsRepository } from '../repositories/habits.repository';
import { CreateHabitDto } from '../dto/create-habit.dto';
import { UpdateHabitDto } from '../dto/update-habit.dto';
export declare class HabitsService {
    private readonly habitsRepo;
    constructor(habitsRepo: HabitsRepository);
    getDashboard(userId: string, tzOffset?: number): Promise<{
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
    findAll(userId: string, estado?: string): Promise<{
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
    findById(idHabito: string, userId: string): Promise<{
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
    getHabitStats(idHabito: string, userId: string): Promise<{
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
    getCategorias(): Promise<{
        idCategoria: string;
        nombre: string;
        descripcion: string | null;
        icono: string | null;
    }[]>;
    create(dto: CreateHabitDto, userId: string): Promise<{
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
    update(idHabito: string, dto: UpdateHabitDto, userId: string): Promise<{
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
    completar(idHabito: string, userId: string): Promise<{
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
    delete(idHabito: string, userId: string): Promise<{
        success: boolean;
    }>;
}

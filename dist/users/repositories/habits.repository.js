"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HabitsRepository = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/services/supabase.service");
let HabitsRepository = class HabitsRepository {
    supabaseService;
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    getLocalHoy(tzOffset) {
        const utcNow = new Date();
        const localTime = new Date(utcNow.getTime() + tzOffset * 60000);
        return localTime.toISOString().split('T')[0];
    }
    get db() {
        return this.supabaseService.getClient().schema('seguimiento');
    }
    SELECT_WITH_CATEGORIA = `
    idhabito, nombre, descripcion, fechainicio, fechafin, estado,
    puntos, meta_diaria, unidad_medida, idusuario, idcategoria, dias_semana,
    categorias_habitos!fk_habitos_categoria(idcategoria, nombre, descripcion, icono)
  `;
    mapToDomain(row) {
        return {
            idHabito: row.idhabito,
            nombre: row.nombre,
            descripcion: row.descripcion,
            fechaInicio: row.fechainicio,
            fechaFin: row.fechafin,
            estado: row.estado,
            puntos: row.puntos,
            metaDiaria: row.meta_diaria,
            unidadMedida: row.unidad_medida,
            idUsuario: row.idusuario,
            idCategoria: row.idcategoria,
            diasSemana: row.dias_semana ?? [1, 2, 3, 4, 5, 6, 7],
            categoria: row.categorias_habitos
                ? {
                    idCategoria: row.categorias_habitos.idcategoria,
                    nombre: row.categorias_habitos.nombre,
                    descripcion: row.categorias_habitos.descripcion,
                    icono: row.categorias_habitos.icono,
                }
                : null,
        };
    }
    async findById(idHabito) {
        const { data, error } = await this.db
            .from('habitos')
            .select(this.SELECT_WITH_CATEGORIA)
            .eq('idhabito', idHabito)
            .returns()
            .single();
        if (error && error.code !== 'PGRST116') {
            throw new common_1.InternalServerErrorException(`Error al buscar hábito: ${error.message}`);
        }
        return data ? this.mapToDomain(data) : null;
    }
    async findByUserId(userId, estado) {
        let query = this.db
            .from('habitos')
            .select(this.SELECT_WITH_CATEGORIA)
            .eq('idusuario', userId)
            .order('fechainicio', { ascending: false })
            .returns();
        if (estado)
            query = query.eq('estado', estado);
        const { data, error } = await query;
        if (error) {
            throw new common_1.InternalServerErrorException(`Error al obtener hábitos: ${error.message}`);
        }
        return (data ?? []).map((row) => this.mapToDomain(row));
    }
    async findByUserIdWithRecordToday(userId, tzOffset = 0) {
        const hoy = this.getLocalHoy(tzOffset);
        const { data, error } = await this.db
            .from('habitos')
            .select(`
        idhabito, nombre, descripcion, fechainicio, fechafin, estado,
        puntos, meta_diaria, unidad_medida, idusuario, idcategoria, dias_semana,
        categorias_habitos!fk_habitos_categoria(idcategoria, nombre, descripcion, icono),
        registro_habitos(idregistro, completado, progreso_actual, puntos_ganados, observacion, fecha)
      `)
            .eq('idusuario', userId)
            .eq('estado', 'Activo')
            .order('nombre', { ascending: true })
            .returns();
        if (error) {
            throw new common_1.InternalServerErrorException(`Error al obtener dashboard: ${error.message}`);
        }
        return (data ?? []).map((row) => {
            const registros = row.registro_habitos ?? [];
            const registroHoy = registros.find((r) => r.fecha === hoy) ?? null;
            const fechasCompletadas = registros
                .filter((r) => r.completado)
                .map((r) => r.fecha);
            const sortedRegistros = [...registros].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
            let rachaActual = 0;
            let checkingCurrentStreak = true;
            for (const record of sortedRegistros) {
                if (record.completado) {
                    if (checkingCurrentStreak)
                        rachaActual++;
                }
                else {
                    checkingCurrentStreak = false;
                }
            }
            return {
                ...this.mapToDomain(row),
                registroHoy: registroHoy
                    ? {
                        idRegistro: registroHoy.idregistro,
                        completado: registroHoy.completado,
                        progresoActual: registroHoy.progreso_actual,
                        puntosGanados: registroHoy.puntos_ganados,
                        observacion: registroHoy.observacion,
                    }
                    : null,
                fechasCompletadas,
                rachaActual,
            };
        });
    }
    async findCategorias() {
        const { data, error } = await this.supabaseService
            .getClient()
            .schema('seguimiento')
            .from('categorias_habitos')
            .select('idcategoria, nombre, descripcion, icono')
            .order('nombre', { ascending: true })
            .returns();
        if (error) {
            throw new common_1.InternalServerErrorException(`Error al obtener categorías: ${error.message}`);
        }
        return (data ?? []).map((row) => ({
            idCategoria: row.idcategoria,
            nombre: row.nombre,
            descripcion: row.descripcion,
            icono: row.icono,
        }));
    }
    async create(payload) {
        const { data, error } = await this.db
            .from('habitos')
            .insert(payload)
            .select(this.SELECT_WITH_CATEGORIA)
            .returns()
            .single();
        if (error) {
            throw new common_1.InternalServerErrorException(`Error al crear hábito: ${error.message}`);
        }
        return this.mapToDomain(data);
    }
    async update(idHabito, payload) {
        const { data, error } = await this.db
            .from('habitos')
            .update(payload)
            .eq('idhabito', idHabito)
            .select(this.SELECT_WITH_CATEGORIA)
            .returns()
            .single();
        if (error) {
            throw new common_1.InternalServerErrorException(`Error al actualizar hábito: ${error.message}`);
        }
        return this.mapToDomain(data);
    }
    async getHabitStats(idHabito) {
        const { data: records, error } = await this.db
            .schema('seguimiento').from('registro_habitos')
            .select('*')
            .eq('idhabito', idHabito)
            .order('fecha', { ascending: false });
        if (error) {
            throw new common_1.InternalServerErrorException(`Error al obtener registros del hábito: ${error.message}`);
        }
        let rachaActual = 0;
        let mejorRacha = 0;
        let totalCumplido = 0;
        let currentStreak = 0;
        let checkingCurrentStreak = true;
        for (const record of records) {
            if (record.completado) {
                if (checkingCurrentStreak)
                    rachaActual++;
                totalCumplido++;
            }
            else {
                checkingCurrentStreak = false;
            }
        }
        for (let i = records.length - 1; i >= 0; i--) {
            if (records[i].completado) {
                currentStreak++;
                if (currentStreak > mejorRacha)
                    mejorRacha = currentStreak;
            }
            else {
                currentStreak = 0;
            }
        }
        const historialReciente = records.slice(0, 7).map(r => ({
            fecha: r.fecha,
            completado: r.completado,
            progresoActual: r.progreso_actual,
            puntosGanados: r.puntos_ganados,
        })).reverse();
        return {
            rachaActual,
            mejorRacha,
            totalCumplido,
            historialReciente,
        };
    }
    async delete(idHabito) {
        await this.db.schema('seguimiento').from('registro_habitos').delete().eq('idhabito', idHabito);
        await this.db.from('recordatorios').delete().eq('idhabito', idHabito);
        const { error } = await this.db
            .from('habitos')
            .delete()
            .eq('idhabito', idHabito);
        if (error) {
            throw new common_1.InternalServerErrorException(`Error al eliminar hábito: ${error.message}`);
        }
    }
};
exports.HabitsRepository = HabitsRepository;
exports.HabitsRepository = HabitsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], HabitsRepository);
//# sourceMappingURL=habits.repository.js.map
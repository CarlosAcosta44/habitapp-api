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
exports.RecordsRepository = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let RecordsRepository = class RecordsRepository {
    supabaseService;
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    get db() {
        return this.supabaseService.getClient().schema('seguimiento');
    }
    mapToDomain(row) {
        return {
            idRegistro: row.idregistro,
            fecha: row.fecha,
            completado: row.completado,
            progresoActual: row.progreso_actual,
            puntosGanados: row.puntos_ganados,
            observacion: row.observacion,
            idHabito: row.idhabito,
            idUsuario: row.idusuario,
        };
    }
    async findByHabitoId(habitoId) {
        const { data, error } = await this.db
            .from('registro_habitos')
            .select('*')
            .eq('idhabito', habitoId)
            .order('fecha', { ascending: false })
            .returns();
        if (error) {
            throw new common_1.InternalServerErrorException(`Error al obtener registros: ${error.message}`);
        }
        return (data ?? []).map(this.mapToDomain);
    }
    async findByUsuarioId(usuarioId) {
        const { data, error } = await this.db
            .from('registro_habitos')
            .select(`
        idregistro, fecha, completado, progreso_actual, puntos_ganados,
        observacion, idhabito, idusuario,
        habitos(nombre, puntos, idcategoria)
      `)
            .eq('idusuario', usuarioId)
            .order('fecha', { ascending: false })
            .returns();
        if (error) {
            throw new common_1.InternalServerErrorException(`Error al obtener registros del usuario: ${error.message}`);
        }
        return (data ?? []).map((row) => ({
            ...this.mapToDomain(row),
            habito: {
                nombre: row.habitos?.nombre ?? '',
                puntos: row.habitos?.puntos ?? 0,
                idCategoria: row.habitos?.idcategoria ?? '',
            },
        }));
    }
    async findHoy(habitoId, usuarioId) {
        const hoy = new Date().toISOString().split('T')[0];
        const { data, error } = await this.db
            .from('registro_habitos')
            .select('*')
            .eq('idhabito', habitoId)
            .eq('idusuario', usuarioId)
            .eq('fecha', hoy)
            .returns()
            .limit(1);
        if (error) {
            throw new common_1.InternalServerErrorException(`Error al buscar registro de hoy: ${error.message}`);
        }
        return data && data.length > 0 ? this.mapToDomain(data[0]) : null;
    }
    async marcarCompletado(payload) {
        const { data, error } = await this.db
            .from('registro_habitos')
            .upsert({
            idhabito: payload.idhabito,
            idusuario: payload.idusuario,
            fecha: payload.fecha,
            completado: true,
            progreso_actual: payload.metaDiaria,
            observacion: payload.observacion ?? null,
        }, { onConflict: 'idhabito,idusuario,fecha' })
            .select('*')
            .returns();
        if (error) {
            throw new common_1.InternalServerErrorException(`Error al marcar hábito: ${error.message}`);
        }
        return data && data.length > 0 ? this.mapToDomain(data[0]) : null;
    }
    async desmarcarCompletado(habitoId, usuarioId) {
        const hoy = new Date().toISOString().split('T')[0];
        const { data, error } = await this.db
            .from('registro_habitos')
            .update({ completado: false, progreso_actual: 0 })
            .eq('idhabito', habitoId)
            .eq('idusuario', usuarioId)
            .eq('fecha', hoy)
            .select('*')
            .returns();
        if (error) {
            throw new common_1.InternalServerErrorException(`Error al desmarcar hábito: ${error.message}`);
        }
        return data && data.length > 0 ? this.mapToDomain(data[0]) : null;
    }
    async avanzarProgreso(payload) {
        const { data: hoyRegs } = await this.db
            .from('registro_habitos')
            .select('progreso_actual')
            .eq('idhabito', payload.idhabito)
            .eq('idusuario', payload.idusuario)
            .eq('fecha', payload.fecha)
            .limit(1);
        const currentProgress = (hoyRegs && hoyRegs.length > 0) ? hoyRegs[0].progreso_actual : 0;
        const newProgress = Math.min(payload.metaDiaria, currentProgress + payload.cantidadASumar);
        const completado = newProgress >= payload.metaDiaria;
        const { data, error } = await this.db
            .from('registro_habitos')
            .upsert({
            idhabito: payload.idhabito,
            idusuario: payload.idusuario,
            fecha: payload.fecha,
            completado,
            progreso_actual: newProgress,
            observacion: payload.observacion ?? null,
        }, { onConflict: 'idhabito,idusuario,fecha' })
            .select('*')
            .returns();
        if (error) {
            throw new common_1.InternalServerErrorException(`Error al avanzar progreso: ${error.message}`);
        }
        return data && data.length > 0 ? this.mapToDomain(data[0]) : null;
    }
    async calcularRacha(habitoId, usuarioId) {
        const { data, error } = await this.db
            .from('registro_habitos')
            .select('fecha, completado')
            .eq('idhabito', habitoId)
            .eq('idusuario', usuarioId)
            .eq('completado', true)
            .order('fecha', { ascending: false })
            .returns();
        if (error) {
            throw new common_1.InternalServerErrorException(`Error al calcular racha: ${error.message}`);
        }
        const registros = data ?? [];
        const totalCompletados = registros.length;
        if (totalCompletados === 0) {
            return {
                idHabito: habitoId,
                rachaActual: 0,
                rachaMaxima: 0,
                totalCompletados: 0,
            };
        }
        let rachaActual = 0;
        const hoy = new Date();
        for (let i = 0; i < registros.length; i++) {
            const fechaEsperada = new Date(hoy);
            fechaEsperada.setDate(hoy.getDate() - i);
            if (registros[i].fecha === fechaEsperada.toISOString().split('T')[0]) {
                rachaActual++;
            }
            else {
                break;
            }
        }
        let rachaMaxima = 0;
        let rachaTemp = 1;
        const fechasAsc = [...registros]
            .map((r) => r.fecha)
            .sort((a, b) => a.localeCompare(b));
        for (let i = 1; i < fechasAsc.length; i++) {
            const diffDias = Math.round((new Date(fechasAsc[i]).getTime() -
                new Date(fechasAsc[i - 1]).getTime()) /
                86400000);
            if (diffDias === 1) {
                rachaTemp++;
                rachaMaxima = Math.max(rachaMaxima, rachaTemp);
            }
            else {
                rachaTemp = 1;
            }
        }
        rachaMaxima = Math.max(rachaMaxima, rachaTemp);
        return { idHabito: habitoId, rachaActual, rachaMaxima, totalCompletados };
    }
};
exports.RecordsRepository = RecordsRepository;
exports.RecordsRepository = RecordsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], RecordsRepository);
//# sourceMappingURL=records.repository.js.map
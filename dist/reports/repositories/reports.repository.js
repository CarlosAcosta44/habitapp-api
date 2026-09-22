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
exports.ReportsRepository = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/services/supabase.service");
let ReportsRepository = class ReportsRepository {
    supabaseService;
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async getRanking() {
        const { data, error } = await this.supabaseService
            .getClient()
            .schema('gestion')
            .from('vista_ranking')
            .select('*')
            .limit(100);
        if (error)
            throw new common_1.InternalServerErrorException(`Supabase error: ${error.message}`);
        return data;
    }
    async getUserProfile(userId) {
        const { data, error } = await this.supabaseService
            .getClient()
            .schema('gestion')
            .from('usuarios')
            .select('nombre, puntostotales')
            .eq('idusuario', userId)
            .single();
        if (error)
            throw new common_1.InternalServerErrorException(`Supabase error: ${error.message}`);
        return data;
    }
    async getAllHabits(userId) {
        const { data, error } = await this.supabaseService
            .getClient()
            .schema('seguimiento')
            .from('habitos')
            .select('idhabito, fechainicio, dias_semana, estado, nombre')
            .eq('idusuario', userId);
        if (error)
            throw new common_1.InternalServerErrorException(`Supabase error: ${error.message}`);
        return data;
    }
    async getHabitRecordsFromDate(userId, startDate) {
        const { data, error } = await this.supabaseService
            .getClient()
            .schema('seguimiento')
            .from('registro_habitos')
            .select('idhabito, fecha, completado')
            .eq('idusuario', userId)
            .eq('completado', true)
            .gte('fecha', startDate);
        if (error)
            throw new common_1.InternalServerErrorException(`Supabase error: ${error.message}`);
        return data;
    }
    async getActiveHabitsInfo(userId) {
        const { data, error } = await this.supabaseService
            .getClient()
            .schema('seguimiento')
            .from('habitos')
            .select('idhabito, nombre, descripcion, color')
            .eq('idusuario', userId)
            .eq('estado', 'Activo');
        if (error)
            throw new common_1.InternalServerErrorException(`Supabase error: ${error.message}`);
        return data;
    }
};
exports.ReportsRepository = ReportsRepository;
exports.ReportsRepository = ReportsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], ReportsRepository);
//# sourceMappingURL=reports.repository.js.map
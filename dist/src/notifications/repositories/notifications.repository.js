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
exports.NotificationsRepository = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let NotificationsRepository = class NotificationsRepository {
    supabaseService;
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async findByUser(userId) {
        const { data, error } = await this.supabaseService
            .getClient()
            .schema('gestion')
            .from('notificaciones')
            .select('*')
            .eq('idusuario', userId)
            .order('fecha', { ascending: false })
            .limit(30)
            .returns();
        if (error) {
            throw new common_1.InternalServerErrorException(`Error al buscar notificaciones: ${error.message}`);
        }
        return data ?? [];
    }
    async findById(notificationId) {
        const { data, error } = await this.supabaseService
            .getClient()
            .schema('gestion')
            .from('notificaciones')
            .select('*')
            .eq('idnotificacion', notificationId)
            .single();
        if (error || !data) {
            throw new common_1.NotFoundException(`Notificación con ID ${notificationId} no encontrada`);
        }
        return data;
    }
    async create(dto) {
        const { data, error } = await this.supabaseService
            .getClient()
            .schema('gestion')
            .from('notificaciones')
            .insert({
            mensaje: dto.mensaje,
            tipo: dto.tipo,
            idusuario: dto.idusuario,
            leida: false,
        })
            .select()
            .single();
        if (error) {
            throw new common_1.InternalServerErrorException(`Error al crear la notificación: ${error.message}`);
        }
        return data;
    }
    async markAsRead(notificationId, userId) {
        await this.findById(notificationId);
        const { error } = await this.supabaseService
            .getClient()
            .schema('gestion')
            .from('notificaciones')
            .update({ leida: true })
            .eq('idnotificacion', notificationId)
            .eq('idusuario', userId);
        if (error) {
            throw new common_1.InternalServerErrorException(`Error al marcar la notificación como leída: ${error.message}`);
        }
    }
    async markAllAsRead(userId) {
        const { error } = await this.supabaseService
            .getClient()
            .schema('gestion')
            .from('notificaciones')
            .update({ leida: true })
            .eq('idusuario', userId)
            .eq('leida', false);
        if (error) {
            throw new common_1.InternalServerErrorException(`Error al marcar todas las notificaciones como leídas: ${error.message}`);
        }
    }
};
exports.NotificationsRepository = NotificationsRepository;
exports.NotificationsRepository = NotificationsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], NotificationsRepository);
//# sourceMappingURL=notifications.repository.js.map
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
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const notifications_repository_1 = require("../repositories/notifications.repository");
const email_service_1 = require("./email.service");
const supabase_service_1 = require("../../supabase/supabase.service");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    notificationsRepository;
    emailService;
    supabaseService;
    logger = new common_1.Logger(NotificationsService_1.name);
    constructor(notificationsRepository, emailService, supabaseService) {
        this.notificationsRepository = notificationsRepository;
        this.emailService = emailService;
        this.supabaseService = supabaseService;
    }
    async getNotificationsForUser(userId) {
        const rows = await this.notificationsRepository.findByUser(userId);
        return rows.map((row) => this.mapRowToDto(row));
    }
    async createNotification(dto) {
        const row = await this.notificationsRepository.create(dto);
        const dtoResponse = this.mapRowToDto(row);
        this.sendNotificationEmailAsync(dto.idusuario, dto.mensaje, dto.tipo).catch((err) => {
            const error = err;
            this.logger.error(`Fallo asíncrono al intentar enviar correo: ${error.message}`);
        });
        return dtoResponse;
    }
    async markAsRead(notificationId, userId) {
        await this.notificationsRepository.markAsRead(notificationId, userId);
    }
    async markAllAsRead(userId) {
        await this.notificationsRepository.markAllAsRead(userId);
    }
    async sendNotificationEmailAsync(userId, message, type) {
        try {
            const { data, error } = await this.supabaseService
                .getClient()
                .auth.admin.getUserById(userId);
            if (error || !data?.user || !data.user.email) {
                this.logger.warn(`No se pudo obtener el correo para el usuario ${userId} para enviar la notificación.`);
                return;
            }
            const email = data.user.email;
            const subject = `HabitApp: Nueva notificación de ${type}`;
            const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #6366f1;">¡Hola de parte de HabitApp!</h2>
          <p>Tienes una nueva notificación de tipo <strong>${type}</strong>:</p>
          <blockquote style="background: #f3f4f6; border-left: 4px solid #6366f1; padding: 15px; margin: 20px 0;">
            ${message}
          </blockquote>
          <p>Inicia sesión en HabitApp para ver más detalles.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          <span style="font-size: 12px; color: #9ca3af;">Este es un mensaje automático de HabitApp. Por favor, no respondas a este correo.</span>
        </div>
      `;
            await this.emailService.sendEmail(email, subject, html);
        }
        catch (err) {
            const error = err;
            this.logger.error(`Error al intentar enviar correo de notificación al usuario ${userId}: ${error.message}`);
        }
    }
    mapRowToDto(row) {
        return {
            id: row.idnotificacion,
            message: row.mensaje,
            type: row.tipo,
            isRead: row.leida,
            createdAt: row.fecha,
            userId: row.idusuario,
        };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_repository_1.NotificationsRepository,
        email_service_1.EmailService,
        supabase_service_1.SupabaseService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map
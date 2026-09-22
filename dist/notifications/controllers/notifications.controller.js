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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const notification_dto_1 = require("../dto/notification.dto");
const notifications_service_1 = require("../services/notifications.service");
let NotificationsController = class NotificationsController {
    notificationsService;
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    getNotifications(user) {
        return this.notificationsService.getNotificationsForUser(user.userId);
    }
    markAsRead(user, notificationId) {
        return this.notificationsService.markAsRead(notificationId, user.userId);
    }
    markAllAsRead(user) {
        return this.notificationsService.markAllAsRead(user.userId);
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener notificaciones del usuario autenticado',
        description: 'Devuelve las últimas 30 notificaciones del usuario logueado.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de notificaciones.',
        type: [notification_dto_1.NotificationDto],
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Token ausente o inválido.' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Error interno del servidor.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({
        summary: 'Marcar una notificación como leída',
        description: 'Marca la notificación específica del usuario autenticado como leída.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'UUID de la notificación',
        type: String,
    }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Notificación marcada como leída.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Token ausente o inválido.' }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Notificación no encontrada o no pertenece al usuario.',
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Error interno del servidor.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Patch)('read-all'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({
        summary: 'Marcar todas las notificaciones como leídas',
        description: 'Marca todas las notificaciones no leídas del usuario autenticado como leídas.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 204,
        description: 'Todas las notificaciones marcadas como leídas.',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Token ausente o inválido.' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Error interno del servidor.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "markAllAsRead", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, swagger_1.ApiTags)('notifications'),
    (0, swagger_1.ApiBearerAuth)('supabase-jwt'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map
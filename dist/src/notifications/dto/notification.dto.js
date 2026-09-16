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
exports.NotificationDto = exports.CreateNotificationDto = exports.NotificationType = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var NotificationType;
(function (NotificationType) {
    NotificationType["HABITO"] = "Habito";
    NotificationType["COMUNIDAD"] = "Comunidad";
    NotificationType["ENTRENADOR"] = "Entrenador";
    NotificationType["SISTEMA"] = "Sistema";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
class CreateNotificationDto {
    mensaje;
    tipo;
    idusuario;
}
exports.CreateNotificationDto = CreateNotificationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Tienes un nuevo mensaje de tu entrenador.',
        description: 'Mensaje de la notificación.',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "mensaje", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: NotificationType,
        example: NotificationType.ENTRENADOR,
        description: 'Tipo de la notificación.',
    }),
    (0, class_validator_1.IsEnum)(NotificationType),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "tipo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'UUID del usuario destinatario.',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "idusuario", void 0);
class NotificationDto {
    id;
    message;
    type;
    isRead;
    createdAt;
    userId;
}
exports.NotificationDto = NotificationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '550e8400-e29b-41d4-a716-446655440002',
        description: 'UUID de la notificación.',
    }),
    __metadata("design:type", String)
], NotificationDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '¡Has completado tu reto de hoy!',
        description: 'Mensaje de la notificación.',
    }),
    __metadata("design:type", String)
], NotificationDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: NotificationType,
        example: NotificationType.HABITO,
        description: 'Tipo de la notificación.',
    }),
    __metadata("design:type", String)
], NotificationDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Estado de lectura de la notificación.',
    }),
    __metadata("design:type", Boolean)
], NotificationDto.prototype, "isRead", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2026-06-17T12:00:00.000Z',
        description: 'Fecha y hora de creación de la notificación.',
    }),
    __metadata("design:type", String)
], NotificationDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'UUID del usuario al que pertenece la notificación.',
    }),
    __metadata("design:type", String)
], NotificationDto.prototype, "userId", void 0);
//# sourceMappingURL=notification.dto.js.map
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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../auth/roles.guard");
const current_user_decorator_1 = require("../../auth/current-user.decorator");
const user_profile_dto_1 = require("../dto/user-profile.dto");
const users_service_1 = require("../services/users.service");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    getUserStats(user) {
        return this.usersService.getUserStats(user.userId);
    }
    getMe(user) {
        return this.usersService.getProfile(user.userId, user.email);
    }
    updateMe(user, dto) {
        return this.usersService.updateProfile(user.userId, dto);
    }
    uploadAvatar(user, file, req) {
        let token = null;
        if (req.cookies && req.cookies['access_token']) {
            token = req.cookies['access_token'];
        }
        else if (req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
            }
        }
        return this.usersService.uploadAvatar(user.userId, file, token);
    }
    getProfile(user) {
        return this.usersService.getSimpleProfile(user.userId);
    }
    getPointsHistory(user, limit) {
        const parsedLimit = limit ? parseInt(limit, 10) : 20;
        return this.usersService.getPointsHistory(user.userId, parsedLimit);
    }
    getAchievements(user) {
        return this.usersService.getAchievements(user.userId);
    }
    updateFcmToken(user, fcmToken) {
        return this.usersService.updateFcmToken(user.userId, fcmToken);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('me/stats'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener estadísticas del usuario',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Estadísticas del usuario (tasa de éxito, racha, etc).',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getUserStats", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener perfil del usuario autenticado',
        description: 'Devuelve el perfil completo del usuario cuyo JWT se envía en el header.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Perfil del usuario.',
        type: user_profile_dto_1.UserProfileDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Token ausente o inválido.' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Error interno del servidor.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getMe", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, swagger_1.ApiOperation)({
        summary: 'Actualizar perfil del usuario autenticado',
        description: 'Permite actualizar nombre, apellido y foto de perfil del usuario autenticado.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Perfil actualizado.',
        type: user_profile_dto_1.UserProfileDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Token ausente o inválido.' }),
    (0, swagger_1.ApiResponse)({
        status: 422,
        description: 'Datos de entrada inválidos (validación).',
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Error interno del servidor.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_profile_dto_1.UpdateUserProfileDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateMe", null);
__decorate([
    (0, common_1.Post)('me/avatar'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiOperation)({
        summary: 'Subir foto de perfil',
        description: 'Sube un archivo de imagen al bucket de Supabase y actualiza la URL en el perfil.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Avatar actualizado exitosamente.',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Archivo inválido o faltante.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Token ausente o inválido.' }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Error interno del servidor o en el bucket.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' })
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 })
        .build({ errorHttpStatusCode: common_1.HttpStatus.UNPROCESSABLE_ENTITY }))),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "uploadAvatar", null);
__decorate([
    (0, common_1.Get)('me/profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Resumen básico de perfil: nombre, foto y puntos' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)('me/points-history'),
    (0, swagger_1.ApiOperation)({ summary: 'Historial de puntos del usuario' }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Número de registros (default: 20)',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getPointsHistory", null);
__decorate([
    (0, common_1.Get)('me/achievements'),
    (0, swagger_1.ApiOperation)({ summary: 'Logros desbloqueados por el usuario' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getAchievements", null);
__decorate([
    (0, common_1.Patch)('me/fcm-token'),
    (0, swagger_1.ApiOperation)({
        summary: 'Registrar token FCM para notificaciones Push',
        description: 'Guarda el token de Firebase Cloud Messaging del dispositivo móvil del usuario.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token FCM actualizado exitosamente.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)('fcm_token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateFcmToken", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, swagger_1.ApiCookieAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map
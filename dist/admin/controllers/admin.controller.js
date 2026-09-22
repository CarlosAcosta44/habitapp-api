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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_profile_dto_1 = require("../../users/dto/user-profile.dto");
const admin_service_1 = require("../services/admin.service");
const users_service_1 = require("../../users/services/users.service");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const update_user_role_dto_1 = require("../../users/dto/update-user-role.dto");
const admin_dto_1 = require("../dto/admin.dto");
let AdminController = class AdminController {
    adminService;
    usersService;
    constructor(adminService, usersService) {
        this.adminService = adminService;
        this.usersService = usersService;
    }
    listUsers() {
        return this.usersService.listProfiles();
    }
    updateUserRole(user, targetUserId, dto) {
        return this.usersService.updateUserRole(user.userId, targetUserId, dto);
    }
    async deleteForum(id) {
        return this.adminService.deleteForum(id);
    }
    async deleteForumComment(id) {
        return this.adminService.deleteForumComment(id);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({
        summary: 'Listar todos los usuarios',
        description: 'Solo accesible para usuarios con rol administrador.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de perfiles.',
        type: [user_profile_dto_1.UserProfileDto],
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Token ausente o inválido.' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Rol insuficiente. Se requiere administrador.',
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Error interno del servidor.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "listUsers", null);
__decorate([
    (0, common_1.Patch)('users/:id/role'),
    (0, swagger_1.ApiOperation)({
        summary: 'Cambiar rol de un usuario',
        description: 'Solo accesible para administradores. Modifica el rol de otro usuario.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'UUID del usuario objetivo',
        type: String,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Rol actualizado.',
        type: user_profile_dto_1.UserProfileDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Token ausente o inválido.' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Rol insuficiente. Se requiere administrador.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 422,
        description: 'Datos de entrada inválidos (validación).',
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Error interno del servidor.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_user_role_dto_1.UpdateUserRoleDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateUserRole", null);
__decorate([
    (0, common_1.Delete)('forum/:id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Eliminar un foro',
        description: 'Elimina un foro completo y todos sus comentarios en cascada. Solo accesible para administradores.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, description: 'UUID del foro' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Foro y comentarios eliminados exitosamente.',
        type: admin_dto_1.DeleteForumResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Token ausente o inválido.' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Rol insuficiente. Se requiere administrador.',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Foro no encontrado.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteForum", null);
__decorate([
    (0, common_1.Delete)('forum/comments/:id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Eliminar un comentario del foro',
        description: 'Elimina un comentario específico de un foro. Solo accesible para administradores.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, description: 'UUID del comentario' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Comentario eliminado exitosamente.',
        type: admin_dto_1.DeleteCommentResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Token ausente o inválido.' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Rol insuficiente. Se requiere administrador.',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Comentario no encontrado.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteForumComment", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('admin'),
    (0, swagger_1.ApiBearerAuth)('supabase-jwt'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_profile_dto_1.UserRole.ADMIN),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService,
        users_service_1.UsersService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map
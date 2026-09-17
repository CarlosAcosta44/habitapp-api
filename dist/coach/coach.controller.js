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
exports.CoachController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const coach_service_1 = require("./coach.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const client_dto_1 = require("./dto/client.dto");
const user_profile_dto_1 = require("../users/dto/user-profile.dto");
const create_routine_dto_1 = require("./dto/create-routine.dto");
const update_routine_dto_1 = require("./dto/update-routine.dto");
let CoachController = class CoachController {
    coachService;
    constructor(coachService) {
        this.coachService = coachService;
    }
    async getClients(user) {
        return this.coachService.getClients(user.userId);
    }
    async createRoutine(user, dto) {
        return this.coachService.createRoutine(user.userId, dto);
    }
    async getRoutines(user) {
        return this.coachService.getRoutines(user.userId);
    }
    async getRoutineById(user, id) {
        return this.coachService.getRoutineById(user.userId, id);
    }
    async updateRoutine(user, id, dto) {
        return this.coachService.updateRoutine(user.userId, id, dto);
    }
    async deleteRoutine(user, id) {
        return this.coachService.deleteRoutine(user.userId, id);
    }
    async assignRoutine(user, clientId, routineId) {
        return this.coachService.assignRoutineToClient(user.userId, clientId, routineId);
    }
    async getClientProgress(user, clientId) {
        return this.coachService.getClientProgress(user.userId, clientId);
    }
};
exports.CoachController = CoachController;
__decorate([
    (0, common_1.Get)('clients'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener clientes asignados al entrenador',
        description: 'Devuelve la lista de usuarios asignados al entrenador autenticado. Solo accesible para roles entrenador y administrador.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de clientes asignados.',
        type: [client_dto_1.ClientDto],
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Token ausente o inválido.' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Rol insuficiente. Se requiere entrenador o administrador.',
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Error interno del servidor.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CoachController.prototype, "getClients", null);
__decorate([
    (0, common_1.Post)('routines'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear una rutina con hábitos asociados' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Rutina creada exitosamente.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_routine_dto_1.CreateRoutineDto]),
    __metadata("design:returntype", Promise)
], CoachController.prototype, "createRoutine", null);
__decorate([
    (0, common_1.Get)('routines'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener todas las rutinas del entrenador' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de rutinas.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CoachController.prototype, "getRoutines", null);
__decorate([
    (0, common_1.Get)('routines/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener el detalle de una rutina' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, description: 'UUID de la rutina' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Detalle de la rutina.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Rutina no encontrada.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CoachController.prototype, "getRoutineById", null);
__decorate([
    (0, common_1.Patch)('routines/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar una rutina y sus hábitos' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, description: 'UUID de la rutina' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Rutina actualizada.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_routine_dto_1.UpdateRoutineDto]),
    __metadata("design:returntype", Promise)
], CoachController.prototype, "updateRoutine", null);
__decorate([
    (0, common_1.Delete)('routines/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar una rutina' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, description: 'UUID de la rutina' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Rutina eliminada exitosamente.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CoachController.prototype, "deleteRoutine", null);
__decorate([
    (0, common_1.Post)('clients/:clientId/routines/:routineId/assign'),
    (0, swagger_1.ApiOperation)({
        summary: 'Asignar una rutina a un cliente',
        description: 'Copia los hábitos de la rutina seleccionada y los inserta en el perfil del cliente como hábitos personales activos. El entrenador debe tener asignado al cliente.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'clientId',
        type: String,
        description: 'UUID del cliente (pupilo)',
    }),
    (0, swagger_1.ApiParam)({
        name: 'routineId',
        type: String,
        description: 'UUID de la rutina a asignar',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Rutina asignada exitosamente.',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Token ausente o inválido.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Rol insuficiente.' }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Cliente no asignado al entrenador o rutina no encontrada.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('clientId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('routineId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], CoachController.prototype, "assignRoutine", null);
__decorate([
    (0, common_1.Get)('clients/:clientId/progress'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener el progreso de un cliente',
        description: 'Retorna el resumen de progreso (rachas, estadísticas) de un cliente asignado. La información es delegada internamente al motor de reportes del sistema.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'clientId',
        type: String,
        description: 'UUID del cliente (pupilo)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Progreso del cliente obtenido exitosamente.',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Token ausente o inválido.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Rol insuficiente.' }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Cliente no asignado al entrenador.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('clientId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CoachController.prototype, "getClientProgress", null);
exports.CoachController = CoachController = __decorate([
    (0, swagger_1.ApiTags)('coach'),
    (0, swagger_1.ApiBearerAuth)('supabase-jwt'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_profile_dto_1.UserRole.TRAINER, user_profile_dto_1.UserRole.ADMIN),
    (0, common_1.Controller)('coach'),
    __metadata("design:paramtypes", [coach_service_1.CoachService])
], CoachController);
//# sourceMappingURL=coach.controller.js.map
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
exports.CommunityController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const community_service_1 = require("./community.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const community_dto_1 = require("./dto/community.dto");
let CommunityController = class CommunityController {
    communityService;
    constructor(communityService) {
        this.communityService = communityService;
    }
    getForums(user) {
        return this.communityService.getForums(user.userId);
    }
    getComments(forumId) {
        return this.communityService.getComments(forumId);
    }
    createComment(dto, user) {
        return this.communityService.createComment({
            ...dto,
            idUsuario: user.userId,
        });
    }
    toggleReaction(dto, user) {
        return this.communityService.toggleReaction({
            ...dto,
            idUsuario: user.userId,
        });
    }
    subscribeToForum(forumId, user) {
        return this.communityService.subscribeToForum(user.userId, forumId);
    }
    unsubscribeFromForum(forumId, user) {
        return this.communityService.unsubscribeFromForum(user.userId, forumId);
    }
    getArticles() {
        return this.communityService.getArticles();
    }
    getTrainers(lat, lng) {
        return this.communityService.getTrainers(lat, lng);
    }
    createForum(req, dto) {
        return { message: 'Foro creado (Stub)' };
    }
    updateComment(commentId, req, dto) {
        return { message: 'Comentario actualizado (Stub)' };
    }
    deleteComment(commentId, req) {
        return { message: 'Comentario eliminado (Stub)' };
    }
    getRetos() {
        return this.communityService.getRetos();
    }
    joinReto(retoId, user) {
        return this.communityService.joinReto(retoId, user.userId);
    }
};
exports.CommunityController = CommunityController;
__decorate([
    (0, common_1.Get)('forums'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener lista de foros activos' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de foros retornada con éxito.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommunityController.prototype, "getForums", null);
__decorate([
    (0, common_1.Get)('forums/:id/comments'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener todos los comentarios de un foro específico',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Comentarios retornados con éxito.',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommunityController.prototype, "getComments", null);
__decorate([
    (0, common_1.Post)('comments'),
    (0, swagger_1.ApiOperation)({
        summary: 'Crear un nuevo comentario en un foro o responder a otro comentario',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Comentario creado con éxito.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [community_dto_1.CreateCommentDto, Object]),
    __metadata("design:returntype", void 0)
], CommunityController.prototype, "createComment", null);
__decorate([
    (0, common_1.Post)('react'),
    (0, swagger_1.ApiOperation)({
        summary: 'Dar o quitar una reacción (Me gusta, Me motiva, Util) a un comentario o artículo',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reacción actualizada con éxito.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [community_dto_1.ToggleReactionDto, Object]),
    __metadata("design:returntype", void 0)
], CommunityController.prototype, "toggleReaction", null);
__decorate([
    (0, common_1.Post)('forums/:id/subscribe'),
    (0, swagger_1.ApiOperation)({
        summary: 'Suscribirse a un foro para recibir notificaciones',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Suscrito con éxito.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CommunityController.prototype, "subscribeToForum", null);
__decorate([
    (0, common_1.Delete)('forums/:id/subscribe'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancelar la suscripción a un foro' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Suscripción cancelada con éxito.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CommunityController.prototype, "unsubscribeFromForum", null);
__decorate([
    (0, common_1.Get)('articles'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener lista de artículos educativos publicados' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Artículos retornados con éxito.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CommunityController.prototype, "getArticles", null);
__decorate([
    (0, common_1.Get)('trainers'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener lista de entrenadores disponibles en la comunidad',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Entrenadores retornados con éxito.',
    }),
    __param(0, (0, common_1.Query)('lat')),
    __param(1, (0, common_1.Query)('lng')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], CommunityController.prototype, "getTrainers", null);
__decorate([
    (0, common_1.Post)('forums'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear un nuevo hilo en el foro' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CommunityController.prototype, "createForum", null);
__decorate([
    (0, common_1.Put)('comments/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Editar un comentario propio' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], CommunityController.prototype, "updateComment", null);
__decorate([
    (0, common_1.Delete)('comments/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar un comentario propio' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CommunityController.prototype, "deleteComment", null);
__decorate([
    (0, common_1.Get)('retos'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener lista de retos de la comunidad' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Retos retornados con éxito.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CommunityController.prototype, "getRetos", null);
__decorate([
    (0, common_1.Post)('retos/:id/join'),
    (0, swagger_1.ApiOperation)({ summary: 'Unirse a un reto' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Te has unido al reto.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CommunityController.prototype, "joinReto", null);
exports.CommunityController = CommunityController = __decorate([
    (0, swagger_1.ApiTags)('community'),
    (0, swagger_1.ApiBearerAuth)('supabase-jwt'),
    (0, common_1.Controller)('community'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [community_service_1.CommunityService])
], CommunityController);
//# sourceMappingURL=community.controller.js.map
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
exports.ComunidadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const community_service_1 = require("../services/community.service");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
let ComunidadController = class ComunidadController {
    comunidadService;
    constructor(comunidadService) {
        this.comunidadService = comunidadService;
    }
    async getForums(req) {
        const token = req.headers.authorization?.split(' ')[1];
        return this.comunidadService.getForums(token);
    }
    async getComments(req, id) {
        const token = req.headers.authorization?.split(' ')[1];
        return this.comunidadService.getCommentsByForumId(id, token);
    }
    async createForum(req, titulo, descripcion, categoria, imagenUrl) {
        const userId = req.user?.userId;
        if (!userId)
            throw new common_1.UnauthorizedException('No autenticado');
        return this.comunidadService.createForum(userId, titulo, descripcion, categoria, imagenUrl);
    }
    async uploadImage(req, file) {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token)
            throw new common_1.UnauthorizedException('Token no encontrado');
        return this.comunidadService.uploadImage(token, file);
    }
    async updateForum(req, id, titulo, descripcion, categoria, imagenUrl) {
        const userId = req.user?.userId;
        if (!userId)
            throw new common_1.UnauthorizedException('No autenticado');
        return this.comunidadService.updateForum(userId, id, { titulo, descripcion, categoria, imagenUrl });
    }
    async deleteForum(req, id) {
        const userId = req.user?.userId;
        if (!userId)
            throw new common_1.UnauthorizedException('No autenticado');
        return this.comunidadService.deleteForum(userId, id);
    }
    async addComment(req, forumId, contenido, parentId, imagenUrl) {
        const userId = req.user?.userId;
        if (!userId)
            throw new common_1.UnauthorizedException('No autenticado');
        return this.comunidadService.addComment(userId, forumId, contenido, parentId, imagenUrl);
    }
    async updateComment(req, id, contenido, imagenUrl) {
        const userId = req.user?.userId;
        if (!userId)
            throw new common_1.UnauthorizedException('No autenticado');
        return this.comunidadService.updateComment(userId, id, contenido, imagenUrl);
    }
    async deleteComment(req, id) {
        const userId = req.user?.userId;
        if (!userId)
            throw new common_1.UnauthorizedException('No autenticado');
        return this.comunidadService.deleteComment(userId, id);
    }
    async addReaction(req, targetType, targetId, tipo) {
        const userId = req.user?.userId;
        if (!userId)
            throw new common_1.UnauthorizedException('No autenticado');
        return this.comunidadService.addReaction(userId, targetType, targetId, tipo);
    }
    async getRetos() {
        return this.comunidadService.getRetos();
    }
    async joinReto(req, retoId) {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token)
            throw new common_1.UnauthorizedException('Token no encontrado');
        return this.comunidadService.joinReto(token, retoId);
    }
    async getEspecialistas() {
        return this.comunidadService.getEspecialistas();
    }
    async getArticulos() {
        return this.comunidadService.getArticulos();
    }
    async getCommunityHabits() {
        return this.comunidadService.getCommunityHabits();
    }
    async cloneHabit(req, idhabito) {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token)
            throw new common_1.UnauthorizedException('Token no encontrado');
        return this.comunidadService.cloneHabit(token, idhabito);
    }
    async shareHabit(req, idhabito) {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token)
            throw new common_1.UnauthorizedException('Token no encontrado');
        return this.comunidadService.shareHabit(token, idhabito);
    }
    async deleteSharedHabit(req, idhabito) {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token)
            throw new common_1.UnauthorizedException('Token no encontrado');
        return this.comunidadService.deleteSharedHabit(token, idhabito);
    }
};
exports.ComunidadController = ComunidadController;
__decorate([
    (0, common_1.Get)('foros'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener todos los foros/temas' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ComunidadController.prototype, "getForums", null);
__decorate([
    (0, common_1.Get)('foros/:id/comentarios'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener comentarios de un foro' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ComunidadController.prototype, "getComments", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('foros'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Crear un nuevo foro' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('titulo')),
    __param(2, (0, common_1.Body)('descripcion')),
    __param(3, (0, common_1.Body)('categoria')),
    __param(4, (0, common_1.Body)('imagenUrl')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ComunidadController.prototype, "createForum", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('upload-image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiOperation)({ summary: 'Subir una imagen para un foro o comentario' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ComunidadController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Put)('foros/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar un foro existente' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('titulo')),
    __param(3, (0, common_1.Body)('descripcion')),
    __param(4, (0, common_1.Body)('categoria')),
    __param(5, (0, common_1.Body)('imagenUrl')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ComunidadController.prototype, "updateForum", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Delete)('foros/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar un foro' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ComunidadController.prototype, "deleteForum", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('foros/:id/comentarios'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Añadir un comentario a un foro' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('contenido')),
    __param(3, (0, common_1.Body)('parentId')),
    __param(4, (0, common_1.Body)('imagenUrl')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ComunidadController.prototype, "addComment", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Put)('comentarios/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar un comentario' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('contenido')),
    __param(3, (0, common_1.Body)('imagenUrl')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], ComunidadController.prototype, "updateComment", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Delete)('comentarios/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar un comentario' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ComunidadController.prototype, "deleteComment", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)(':targetType/:id/reacciones'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Añadir reacción (targetType: comentario | articulo | foro)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('targetType')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)('tipo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], ComunidadController.prototype, "addReaction", null);
__decorate([
    (0, common_1.Get)('retos'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener retos disponibles' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ComunidadController.prototype, "getRetos", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('retos/:id/unirse'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Unirse a un reto' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ComunidadController.prototype, "joinReto", null);
__decorate([
    (0, common_1.Get)('especialistas'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener directorio de especialistas (Entrenadores)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ComunidadController.prototype, "getEspecialistas", null);
__decorate([
    (0, common_1.Get)('articulos'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener artículos publicados' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ComunidadController.prototype, "getArticulos", null);
__decorate([
    (0, common_1.Get)('habitos'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener hábitos compartidos en la comunidad' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ComunidadController.prototype, "getCommunityHabits", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('habitos/:id/clonar'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Clonar un hábito a tu cuenta' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ComunidadController.prototype, "cloneHabit", null);
__decorate([
    (0, common_1.Post)('habitos/:id/compartir'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Compartir tu hábito con la comunidad' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ComunidadController.prototype, "shareHabit", null);
__decorate([
    (0, common_1.Delete)('habitos/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar un hábito compartido de la comunidad' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ComunidadController.prototype, "deleteSharedHabit", null);
exports.ComunidadController = ComunidadController = __decorate([
    (0, swagger_1.ApiTags)('Comunidad'),
    (0, common_1.Controller)('users/community'),
    __metadata("design:paramtypes", [community_service_1.CommunityService])
], ComunidadController);
//# sourceMappingURL=community.controller.js.map
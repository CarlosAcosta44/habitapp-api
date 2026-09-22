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
exports.RecordsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const records_service_1 = require("../services/records.service");
const create_record_dto_1 = require("../dto/create-record.dto");
let RecordsController = class RecordsController {
    recordsService;
    constructor(recordsService) {
        this.recordsService = recordsService;
    }
    getHistorial(req) {
        return this.recordsService.getHistorial(req.user.userId);
    }
    getByHabito(habitoId, req) {
        return this.recordsService.getByHabito(habitoId, req.user.userId);
    }
    getRacha(habitoId, req) {
        const tzOffset = parseInt(req.headers['x-timezone-offset']) || 0;
        return this.recordsService.getRacha(habitoId, req.user.userId, tzOffset);
    }
    marcarCompletado(dto, req) {
        const tzOffset = parseInt(req.headers['x-timezone-offset']) || 0;
        return this.recordsService.marcarCompletado(dto, req.user.userId, tzOffset);
    }
    desmarcarCompletado(habitoId, req) {
        const tzOffset = parseInt(req.headers['x-timezone-offset']) || 0;
        return this.recordsService.desmarcarCompletado(habitoId, req.user.userId, tzOffset);
    }
    avanzarProgreso(dto, req) {
        const tzOffset = parseInt(req.headers['x-timezone-offset']) || 0;
        return this.recordsService.avanzarProgreso(dto, req.user.userId, tzOffset);
    }
};
exports.RecordsController = RecordsController;
__decorate([
    (0, common_1.Get)('historial'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener historial completo de registros del usuario',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RecordsController.prototype, "getHistorial", null);
__decorate([
    (0, common_1.Get)('habito/:habitoId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener registros de un hábito específico' }),
    __param(0, (0, common_1.Param)('habitoId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RecordsController.prototype, "getByHabito", null);
__decorate([
    (0, common_1.Get)('racha/:habitoId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener racha actual de un hábito' }),
    __param(0, (0, common_1.Param)('habitoId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RecordsController.prototype, "getRacha", null);
__decorate([
    (0, common_1.Post)('completar'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Marcar un hábito como completado hoy' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_record_dto_1.CreateRecordDto, Object]),
    __metadata("design:returntype", void 0)
], RecordsController.prototype, "marcarCompletado", null);
__decorate([
    (0, common_1.Delete)('desmarcar/:habitoId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Desmarcar un hábito completado hoy' }),
    __param(0, (0, common_1.Param)('habitoId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RecordsController.prototype, "desmarcarCompletado", null);
__decorate([
    (0, common_1.Patch)('progreso'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Avanzar progreso de un hábito hoy' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_record_dto_1.AvanzarProgresoDto, Object]),
    __metadata("design:returntype", void 0)
], RecordsController.prototype, "avanzarProgreso", null);
exports.RecordsController = RecordsController = __decorate([
    (0, swagger_1.ApiTags)('records'),
    (0, swagger_1.ApiCookieAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('users/records'),
    __metadata("design:paramtypes", [records_service_1.RecordsService])
], RecordsController);
//# sourceMappingURL=records.controller.js.map
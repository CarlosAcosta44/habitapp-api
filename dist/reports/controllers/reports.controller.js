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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const reports_service_1 = require("../services/reports.service");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
let ReportsController = class ReportsController {
    reportsService;
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    async getRanking() {
        return this.reportsService.getRanking();
    }
    async getUserSummary(userId) {
        return this.reportsService.getUserSummary(userId);
    }
    async getUserHabits(userId) {
        return this.reportsService.getHabitsReport(userId);
    }
    async getUserComparative() {
        return this.reportsService.getComparativeReport();
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('ranking'),
    (0, cache_manager_1.CacheKey)('ranking_usuarios'),
    (0, cache_manager_1.CacheTTL)(60000),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener el ranking de usuarios activos (Top 100)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ranking obtenido exitosamente.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getRanking", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, cache_manager_1.CacheTTL)(30000),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener el resumen consolidado de un usuario' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Resumen obtenido exitosamente.' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getUserSummary", null);
__decorate([
    (0, common_1.Get)('user/:userId/habits'),
    (0, cache_manager_1.CacheTTL)(30000),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener reporte de hábitos de un usuario' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Reporte de hábitos obtenido exitosamente.',
    }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getUserHabits", null);
__decorate([
    (0, common_1.Get)('user/:userId/comparative'),
    (0, cache_manager_1.CacheTTL)(30000),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener reporte comparativo de un usuario' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Reporte comparativo obtenido exitosamente.',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getUserComparative", null);
exports.ReportsController = ReportsController = __decorate([
    (0, swagger_1.ApiTags)('reports'),
    (0, swagger_1.ApiBearerAuth)('supabase-jwt'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('reports'),
    (0, common_1.UseInterceptors)(cache_manager_1.CacheInterceptor),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map
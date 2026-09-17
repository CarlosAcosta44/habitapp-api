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
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
let HealthController = class HealthController {
    checkHealth() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
    }
    debugSentry() {
        throw new Error('Sentry Backend Integration Test Error');
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Verificar estado de la API',
        description: 'Endpoint público que confirma que el servidor está en línea.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'La API está operativa.',
        schema: {
            example: { status: 'ok', timestamp: '2026-06-16T12:00:00.000Z' },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Error interno del servidor.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "checkHealth", null);
__decorate([
    (0, common_1.Get)('debug-sentry'),
    (0, swagger_1.ApiOperation)({
        summary: 'Probar integración de Sentry',
        description: 'Lanza un error intencional para verificar la captura en Sentry.',
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Error intencional lanzado.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "debugSentry", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('health'),
    (0, common_1.Controller)('health')
], HealthController);
//# sourceMappingURL=health.controller.js.map
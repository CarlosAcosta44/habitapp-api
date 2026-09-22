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
exports.UserSummaryDto = exports.HabitProgressDto = exports.RankingEntryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class RankingEntryDto {
    idusuario;
    nombre;
    apellido;
    puntostotales;
    posicion;
}
exports.RankingEntryDto = RankingEntryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID del usuario' }),
    __metadata("design:type", String)
], RankingEntryDto.prototype, "idusuario", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nombre del usuario' }),
    __metadata("design:type", String)
], RankingEntryDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Apellido del usuario' }),
    __metadata("design:type", String)
], RankingEntryDto.prototype, "apellido", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Puntos totales acumulados' }),
    __metadata("design:type", Number)
], RankingEntryDto.prototype, "puntostotales", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Posición en el ranking' }),
    __metadata("design:type", Number)
], RankingEntryDto.prototype, "posicion", void 0);
class HabitProgressDto {
    idHabito;
    nombre;
    porcentajeCambio;
    descripcion;
    progreso;
    color;
}
exports.HabitProgressDto = HabitProgressDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID del hábito' }),
    __metadata("design:type", String)
], HabitProgressDto.prototype, "idHabito", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nombre del hábito' }),
    __metadata("design:type", String)
], HabitProgressDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Porcentaje de cambio (ej: +5%)' }),
    __metadata("design:type", String)
], HabitProgressDto.prototype, "porcentajeCambio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Descripción del hábito' }),
    __metadata("design:type", String)
], HabitProgressDto.prototype, "descripcion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Progreso actual (0-100)' }),
    __metadata("design:type", Number)
], HabitProgressDto.prototype, "progreso", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Color del hábito (clases CSS o hex)' }),
    __metadata("design:type", String)
], HabitProgressDto.prototype, "color", void 0);
class UserSummaryDto {
    userId;
    nombre;
    puntos_totales;
    cumplimiento_global;
    total_esperado;
    total_cumplido;
    racha_actual;
    racha_maxima;
    mas_constante;
    oportunidad_mejora;
    volumen_semanal;
    consistencia_mes;
    insight;
}
exports.UserSummaryDto = UserSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID del usuario' }),
    __metadata("design:type", String)
], UserSummaryDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nombre del usuario' }),
    __metadata("design:type", String)
], UserSummaryDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Puntos totales acumulados' }),
    __metadata("design:type", Number)
], UserSummaryDto.prototype, "puntos_totales", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Porcentaje de cumplimiento global en el período' }),
    __metadata("design:type", Number)
], UserSummaryDto.prototype, "cumplimiento_global", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total de ocurrencias esperadas en el período' }),
    __metadata("design:type", Number)
], UserSummaryDto.prototype, "total_esperado", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total de ocurrencias completadas en el período' }),
    __metadata("design:type", Number)
], UserSummaryDto.prototype, "total_cumplido", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Racha actual (días consecutivos completos)' }),
    __metadata("design:type", Number)
], UserSummaryDto.prototype, "racha_actual", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Racha máxima histórica' }),
    __metadata("design:type", Number)
], UserSummaryDto.prototype, "racha_maxima", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Hábito con mejor cumplimiento', nullable: true }),
    __metadata("design:type", Object)
], UserSummaryDto.prototype, "mas_constante", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Hábito con menor cumplimiento (oportunidad de mejora)', nullable: true }),
    __metadata("design:type", Object)
], UserSummaryDto.prototype, "oportunidad_mejora", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Volumen semanal [Lun, Mar, Mié, Jue, Vie, Sáb, Dom]', type: [Number] }),
    __metadata("design:type", Array)
], UserSummaryDto.prototype, "volumen_semanal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Consistencia de los últimos 30 días', type: [Object] }),
    __metadata("design:type", Array)
], UserSummaryDto.prototype, "consistencia_mes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Mensaje de insight personalizado' }),
    __metadata("design:type", String)
], UserSummaryDto.prototype, "insight", void 0);
//# sourceMappingURL=reports.dto.js.map
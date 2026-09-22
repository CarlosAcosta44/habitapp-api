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
exports.UpdateHabitDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class UpdateHabitDto {
    nombre;
    descripcion;
    fechaFin;
    estado;
    puntos;
    idCategoria;
    diasSemana;
    metaDiaria;
    unidadMedida;
}
exports.UpdateHabitDto = UpdateHabitDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Nombre del hábito' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateHabitDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Descripción del hábito' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdateHabitDto.prototype, "descripcion", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fecha de fin (YYYY-MM-DD)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateHabitDto.prototype, "fechaFin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Estado del hábito',
        enum: ['Activo', 'Completado', 'Cancelado', 'Archivado', 'Pausado'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['Activo', 'Completado', 'Cancelado', 'Archivado', 'Pausado']),
    __metadata("design:type", String)
], UpdateHabitDto.prototype, "estado", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Puntos que otorga el hábito (1-100)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UpdateHabitDto.prototype, "puntos", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'UUID de la categoría' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateHabitDto.prototype, "idCategoria", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Días de la semana en los que aplica el hábito (1=Lunes, 7=Domingo)',
        example: [1, 2, 3, 4, 5, 6, 7],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    __metadata("design:type", Array)
], UpdateHabitDto.prototype, "diasSemana", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Meta diaria numérica', example: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateHabitDto.prototype, "metaDiaria", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Unidad de medida', example: 'veces' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateHabitDto.prototype, "unidadMedida", void 0);
//# sourceMappingURL=update-habit.dto.js.map
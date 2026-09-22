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
exports.CreateHabitDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateHabitDto {
    nombre;
    descripcion;
    fechaInicio;
    fechaFin;
    puntos;
    metaDiaria;
    unidadMedida;
    idCategoria;
    diasSemana;
}
exports.CreateHabitDto = CreateHabitDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nombre del hábito', example: 'Correr 5km' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateHabitDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Descripción del hábito' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateHabitDto.prototype, "descripcion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Fecha de inicio (YYYY-MM-DD)',
        example: '2026-08-20',
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateHabitDto.prototype, "fechaInicio", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Fecha de fin (YYYY-MM-DD)',
        example: '2026-12-31',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateHabitDto.prototype, "fechaFin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Puntos que otorga el hábito (1-100)',
        example: 10,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateHabitDto.prototype, "puntos", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Meta diaria numérica', example: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateHabitDto.prototype, "metaDiaria", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Unidad de medida', example: 'veces' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateHabitDto.prototype, "unidadMedida", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'UUID de la categoría del hábito' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateHabitDto.prototype, "idCategoria", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Días de la semana en los que aplica el hábito (1=Lunes, 7=Domingo)',
        example: [1, 2, 3, 4, 5, 6, 7],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    __metadata("design:type", Array)
], CreateHabitDto.prototype, "diasSemana", void 0);
//# sourceMappingURL=create-habit.dto.js.map
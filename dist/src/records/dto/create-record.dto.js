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
exports.AvanzarProgresoDto = exports.CreateRecordDto = exports.AddFriendDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class AddFriendDto {
    targetUserId;
}
exports.AddFriendDto = AddFriendDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'UUID del usuario a agregar como amigo' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AddFriendDto.prototype, "targetUserId", void 0);
class CreateRecordDto {
    idHabito;
    observacion;
}
exports.CreateRecordDto = CreateRecordDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'UUID del hábito' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateRecordDto.prototype, "idHabito", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Observación del registro' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateRecordDto.prototype, "observacion", void 0);
class AvanzarProgresoDto {
    idHabito;
    cantidadASumar;
    observacion;
}
exports.AvanzarProgresoDto = AvanzarProgresoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'UUID del hábito' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AvanzarProgresoDto.prototype, "idHabito", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Cantidad a sumar al progreso actual' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AvanzarProgresoDto.prototype, "cantidadASumar", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Observación' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], AvanzarProgresoDto.prototype, "observacion", void 0);
//# sourceMappingURL=create-record.dto.js.map
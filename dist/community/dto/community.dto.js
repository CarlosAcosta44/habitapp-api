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
exports.ToggleReactionDto = exports.CreateCommentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateCommentDto {
    contenido;
    idForo;
    idComentarioPadre;
}
exports.CreateCommentDto = CreateCommentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Contenido del comentario' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCommentDto.prototype, "contenido", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID del foro' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCommentDto.prototype, "idForo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID del comentario padre (si es una respuesta)',
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCommentDto.prototype, "idComentarioPadre", void 0);
class ToggleReactionDto {
    tipo;
    idComentario;
    idArticulo;
}
exports.ToggleReactionDto = ToggleReactionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tipo de reacción',
        enum: ['Me gusta', 'Me motiva', 'Util'],
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['Me gusta', 'Me motiva', 'Util']),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ToggleReactionDto.prototype, "tipo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID del comentario a reaccionar' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ToggleReactionDto.prototype, "idComentario", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID del artículo a reaccionar' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ToggleReactionDto.prototype, "idArticulo", void 0);
//# sourceMappingURL=community.dto.js.map
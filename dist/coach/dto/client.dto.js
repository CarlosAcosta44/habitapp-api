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
exports.ClientDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const user_profile_dto_1 = require("../../users/dto/user-profile.dto");
class ClientDto {
    assigned_at;
    client;
}
exports.ClientDto = ClientDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2026-06-01T10:00:00.000Z',
        description: 'Fecha y hora en que el cliente fue asignado al entrenador.',
    }),
    __metadata("design:type", Date)
], ClientDto.prototype, "assigned_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: user_profile_dto_1.UserProfileDto,
        description: 'Perfil completo del usuario asignado como cliente.',
    }),
    __metadata("design:type", user_profile_dto_1.UserProfileDto)
], ClientDto.prototype, "client", void 0);
//# sourceMappingURL=client.dto.js.map
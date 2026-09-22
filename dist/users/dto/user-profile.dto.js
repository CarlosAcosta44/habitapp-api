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
exports.UserProfileDto = exports.UpdateUserProfileDto = exports.RoleName = exports.UserRole = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "usuario";
    UserRole["TRAINER"] = "entrenador";
    UserRole["ADMIN"] = "administrador";
})(UserRole || (exports.UserRole = UserRole = {}));
var RoleName;
(function (RoleName) {
    RoleName["USER"] = "Usuario";
    RoleName["TRAINER"] = "Entrenador";
    RoleName["ADMIN"] = "Administrador";
})(RoleName || (exports.RoleName = RoleName = {}));
class UpdateUserProfileDto {
    nombre;
    apellido;
    fotoperfil;
    telefono;
    genero;
    fechanacimiento;
}
exports.UpdateUserProfileDto = UpdateUserProfileDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Carlos',
        description: 'Primer nombre del usuario (máx. 45 caracteres).',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(45),
    __metadata("design:type", String)
], UpdateUserProfileDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Acosta',
        description: 'Apellido del usuario (máx. 45 caracteres).',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(45),
    __metadata("design:type", String)
], UpdateUserProfileDto.prototype, "apellido", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'https://example.com/avatar.png',
        description: 'URL pública de la foto de perfil (máx. 200 caracteres).',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], UpdateUserProfileDto.prototype, "fotoperfil", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '+573001234567',
        description: 'Teléfono del usuario',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], UpdateUserProfileDto.prototype, "telefono", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Masculino',
        description: 'Género del usuario',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(30),
    __metadata("design:type", String)
], UpdateUserProfileDto.prototype, "genero", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '1990-01-01',
        description: 'Fecha de nacimiento',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateUserProfileDto.prototype, "fechanacimiento", void 0);
class UserProfileDto {
    idusuario;
    nombre;
    apellido;
    fotoperfil;
    telefono;
    genero;
    fechanacimiento;
    puntostotales;
    idrol;
    nombrerol;
}
exports.UserProfileDto = UserProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'UUID del usuario generado por Supabase Auth.',
    }),
    __metadata("design:type", String)
], UserProfileDto.prototype, "idusuario", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Carlos', description: 'Nombre del usuario.' }),
    __metadata("design:type", String)
], UserProfileDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Acosta', description: 'Apellido del usuario.' }),
    __metadata("design:type", String)
], UserProfileDto.prototype, "apellido", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'https://example.com/avatar.png',
        description: 'URL de la foto de perfil. Puede ser null si no se configuró.',
    }),
    __metadata("design:type", Object)
], UserProfileDto.prototype, "fotoperfil", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+573001234567', description: 'Teléfono' }),
    __metadata("design:type", Object)
], UserProfileDto.prototype, "telefono", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Masculino', description: 'Género' }),
    __metadata("design:type", Object)
], UserProfileDto.prototype, "genero", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '1990-01-01',
        description: 'Fecha de nacimiento',
    }),
    __metadata("design:type", Object)
], UserProfileDto.prototype, "fechanacimiento", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 120,
        description: 'Puntos totales acumulados por el usuario en la aplicación.',
    }),
    __metadata("design:type", Number)
], UserProfileDto.prototype, "puntostotales", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '550e8400-e29b-41d4-a716-446655440001',
        description: 'UUID del rol asignado al usuario en la tabla gestion.roles.',
    }),
    __metadata("design:type", String)
], UserProfileDto.prototype, "idrol", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: RoleName,
        example: RoleName.USER,
        description: 'Nombre legible del rol: Usuario, Entrenador o Administrador.',
    }),
    __metadata("design:type", String)
], UserProfileDto.prototype, "nombrerol", void 0);
//# sourceMappingURL=user-profile.dto.js.map
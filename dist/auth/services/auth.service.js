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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const auth_repository_1 = require("../repositories/auth.repository");
let AuthService = class AuthService {
    authRepository;
    constructor(authRepository) {
        this.authRepository = authRepository;
    }
    async register(dto) {
        const user = await this.authRepository.createUser(dto.email, dto.password, {
            nombre: dto.nombre,
            apellido: dto.apellido,
            genero: dto.genero,
            fechanacimiento: dto.fechanacimiento,
        });
        return {
            message: 'Usuario registrado exitosamente.',
            user,
        };
    }
    async login(dto) {
        const data = await this.authRepository.signInWithPassword(dto.email, dto.password);
        return {
            message: 'Inicio de sesión exitoso',
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            user: data.user,
        };
    }
    async loginWithGoogle(idToken) {
        const data = await this.authRepository.signInWithIdToken('google', idToken);
        return {
            message: 'Inicio de sesión con Google exitoso',
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            user: data.user,
        };
    }
    async loginWithFacebook(accessToken) {
        const data = await this.authRepository.signInWithIdToken('facebook', accessToken);
        return {
            message: 'Inicio de sesión con Facebook exitoso',
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            user: data.user,
        };
    }
    async linkWithGoogle(accessToken, idToken) {
        const userClient = this.authRepository.createUserClient(accessToken);
        const { data, error } = await userClient.auth.linkIdentity({ provider: 'google', token: idToken });
        if (error)
            throw new common_1.BadRequestException(error.message || 'Error al vincular con Google');
        return { message: 'Cuenta de Google vinculada exitosamente.', user: data.user };
    }
    async linkWithFacebook(accessToken, token) {
        const userClient = this.authRepository.createUserClient(accessToken);
        const { data, error } = await userClient.auth.linkIdentity({ provider: 'facebook', token });
        if (error)
            throw new common_1.BadRequestException(error.message || 'Error al vincular con Facebook');
        return { message: 'Cuenta de Facebook vinculada exitosamente.', user: data.user };
    }
    async refreshToken(refreshToken) {
        if (!refreshToken)
            throw new common_1.BadRequestException('El refresh_token es requerido');
        const data = await this.authRepository.refreshSession(refreshToken);
        return {
            message: 'Token refrescado exitosamente',
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            user: data.user,
        };
    }
    async logout(accessToken) {
        if (!accessToken)
            return;
        await this.authRepository.signOut(accessToken);
    }
    async resetPassword(email) {
        await this.authRepository.resetPasswordForEmail(email, process.env.FRONTEND_URL + '/reset-password');
        return { message: 'Correo de recuperación enviado exitosamente.' };
    }
    async updatePassword(password) {
        await this.authRepository.updatePassword(password);
        return { message: 'Contraseña actualizada exitosamente.' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_repository_1.AuthRepository])
], AuthService);
//# sourceMappingURL=auth.service.js.map
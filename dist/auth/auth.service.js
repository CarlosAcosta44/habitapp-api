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
const supabase_service_1 = require("../supabase/supabase.service");
let AuthService = class AuthService {
    supabaseService;
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async register(dto) {
        const { data, error } = await this.supabaseService.getClient().auth.admin.createUser({
            email: dto.email,
            password: dto.password,
            email_confirm: true,
            user_metadata: {
                nombre: dto.nombre,
                apellido: dto.apellido,
            },
        });
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
        return {
            message: 'Usuario registrado exitosamente.',
            user: data.user,
        };
    }
    async login(dto) {
        const { data, error } = await this.supabaseService.getClient().auth.signInWithPassword({
            email: dto.email,
            password: dto.password,
        });
        if (error || !data.session) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        return {
            message: 'Inicio de sesión exitoso',
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            user: data.user,
        };
    }
    async refreshToken(refreshToken) {
        if (!refreshToken) {
            throw new common_1.BadRequestException('El refresh_token es requerido');
        }
        const { data, error } = await this.supabaseService.getClient().auth.refreshSession({ refresh_token: refreshToken });
        if (error || !data.session) {
            throw new common_1.UnauthorizedException('Refresh token inválido o expirado');
        }
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
        const { error } = await this.supabaseService.getClient().auth.admin.signOut(accessToken, 'global');
        if (error) {
            console.error('Logout error:', error.message);
        }
    }
    async resetPassword(email) {
        const { error } = await this.supabaseService.getClient().auth.resetPasswordForEmail(email, {
            redirectTo: process.env.FRONTEND_URL + '/reset-password',
        });
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
        return { message: 'Correo de recuperación enviado exitosamente.' };
    }
    async updatePassword(password) {
        const { error } = await this.supabaseService.getClient().auth.updateUser({ password });
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
        return { message: 'Contraseña actualizada exitosamente.' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
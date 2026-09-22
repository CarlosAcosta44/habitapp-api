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
exports.AuthRepository = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/services/supabase.service");
let AuthRepository = class AuthRepository {
    supabaseService;
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async createUser(email, password, metadata) {
        const { data, error } = await this.supabaseService.getClient().auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: metadata,
        });
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data.user;
    }
    async signInWithPassword(email, password) {
        const { data, error } = await this.supabaseService.getClient().auth.signInWithPassword({ email, password });
        if (error || !data.session)
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        return data;
    }
    async signInWithIdToken(provider, token) {
        const { data, error } = await this.supabaseService.getClient().auth.signInWithIdToken({ provider, token });
        if (error || !data.session)
            throw new common_1.UnauthorizedException(error?.message || `Error con ${provider} Auth`);
        return data;
    }
    async refreshSession(refreshToken) {
        const { data, error } = await this.supabaseService.getClient().auth.refreshSession({ refresh_token: refreshToken });
        if (error || !data.session)
            throw new common_1.UnauthorizedException('Refresh token inválido o expirado');
        return data;
    }
    async signOut(accessToken) {
        const { error } = await this.supabaseService.getClient().auth.admin.signOut(accessToken, 'global');
        if (error)
            console.error('Logout error:', error.message);
    }
    async resetPasswordForEmail(email, redirectTo) {
        const { error } = await this.supabaseService.getClient().auth.resetPasswordForEmail(email, { redirectTo });
        if (error)
            throw new common_1.BadRequestException(error.message);
    }
    async updatePassword(password) {
        const { error } = await this.supabaseService.getClient().auth.updateUser({ password });
        if (error)
            throw new common_1.BadRequestException(error.message);
    }
    createUserClient(accessToken) {
        const { createClient } = require('@supabase/supabase-js');
        return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
            global: {
                headers: { Authorization: `Bearer ${accessToken}` },
                fetch: require('node-fetch'),
            },
        });
    }
};
exports.AuthRepository = AuthRepository;
exports.AuthRepository = AuthRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], AuthRepository);
//# sourceMappingURL=auth.repository.js.map
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
var JwtAuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const config_1 = require("@nestjs/config");
let JwtAuthGuard = class JwtAuthGuard {
    static { JwtAuthGuard_1 = this; }
    configService;
    supabase;
    static userCache = new Map();
    static pendingPromises = new Map();
    constructor(configService) {
        this.configService = configService;
        const supabaseUrl = this.configService.get('SUPABASE_URL');
        const supabaseKey = this.configService.get('SUPABASE_SERVICE_ROLE_KEY');
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Las variables SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son obligatorias');
        }
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        let token = null;
        if (request.cookies && request.cookies['access_token']) {
            token = request.cookies['access_token'];
        }
        else if (request.headers.authorization) {
            const authHeader = request.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
            }
        }
        if (!token) {
            throw new common_1.UnauthorizedException('Token no encontrado');
        }
        const now = Date.now();
        const cached = JwtAuthGuard_1.userCache.get(token);
        if (cached && cached.expires > now) {
            request.user = {
                userId: cached.user.id,
                email: cached.user.email,
                role: cached.role,
            };
            return true;
        }
        if (JwtAuthGuard_1.pendingPromises.has(token)) {
            try {
                const result = await JwtAuthGuard_1.pendingPromises.get(token);
                request.user = {
                    userId: result.user.id,
                    email: result.user.email,
                    role: result.role,
                };
                return true;
            }
            catch (err) {
                throw new common_1.UnauthorizedException('Token de Supabase inválido');
            }
        }
        const fetchPromise = (async () => {
            const { data: { user }, error } = await this.supabase.auth.getUser(token);
            if (error || !user) {
                throw new Error('Invalid token');
            }
            const { data: profile } = await this.supabase
                .schema('gestion')
                .from('usuarios')
                .select('roles(nombrerol)')
                .eq('idusuario', user.id)
                .single();
            const roleName = profile?.roles?.nombrerol?.toLowerCase() || user.app_metadata?.rol?.toLowerCase() || user.user_metadata?.role?.toLowerCase() || 'usuario';
            return { user, role: roleName };
        })();
        JwtAuthGuard_1.pendingPromises.set(token, fetchPromise);
        try {
            const result = await fetchPromise;
            request.user = {
                userId: result.user.id,
                email: result.user.email,
                role: result.role,
            };
            JwtAuthGuard_1.userCache.set(token, { user: result.user, role: result.role, expires: Date.now() + 60000 });
            return true;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Token de Supabase inválido');
        }
        finally {
            JwtAuthGuard_1.pendingPromises.delete(token);
        }
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = JwtAuthGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map
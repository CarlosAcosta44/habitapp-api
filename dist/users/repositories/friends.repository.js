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
exports.FriendsRepository = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/services/supabase.service");
let FriendsRepository = class FriendsRepository {
    supabaseService;
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    get client() {
        return this.supabaseService.getClient();
    }
    async existsRelation(userId, targetUserId) {
        const { data, error } = await this.client
            .schema('gestion')
            .from('amigos')
            .select('idamistad')
            .or(`and(idusuario_solicitante.eq.${userId},idusuario_receptor.eq.${targetUserId}),` +
            `and(idusuario_solicitante.eq.${targetUserId},idusuario_receptor.eq.${userId})`)
            .limit(1);
        if (error) {
            throw new common_1.InternalServerErrorException(`Error al validar amistad existente: ${error.message}`);
        }
        return (data ?? []).length > 0;
    }
    async createAcceptedRelation(userId, targetUserId) {
        const { error } = await this.client
            .schema('gestion')
            .from('amigos')
            .insert({
            idusuario_solicitante: userId,
            idusuario_receptor: targetUserId,
            estado: 'Aceptado',
        });
        if (error) {
            if (error.code === '23505') {
                throw new common_1.InternalServerErrorException('Ya tienes una relación de amistad con este usuario');
            }
            throw new common_1.InternalServerErrorException(`Error al agregar amigo: ${error.message}`);
        }
    }
    async getAcceptedFriends(userId) {
        const { data: misAmistades, error: amistadError } = await this.client
            .from('api_amigos')
            .select('*')
            .eq('estado', 'Aceptado')
            .or(`idusuario_solicitante.eq.${userId},idusuario_receptor.eq.${userId}`);
        if (amistadError) {
            throw new common_1.InternalServerErrorException(`Error al obtener amistades: ${amistadError.message}`);
        }
        const amigosIds = (misAmistades ?? []).map((a) => a.idusuario_solicitante === userId
            ? a.idusuario_receptor
            : a.idusuario_solicitante);
        if (amigosIds.length === 0)
            return [];
        const { data: perfilesAmigos, error: perfilesError } = await this.client
            .from('perfiles_usuarios_api')
            .select('idusuario, nombre, apellido, puntostotales')
            .in('idusuario', amigosIds)
            .order('puntostotales', { ascending: false });
        if (perfilesError) {
            throw new common_1.InternalServerErrorException(`Error al obtener perfiles de amigos: ${perfilesError.message}`);
        }
        return (perfilesAmigos ?? []).map((pa, idx) => ({
            id: pa.idusuario,
            nombre: pa.nombre,
            apellido: pa.apellido,
            puntos: pa.puntostotales,
            top: idx === 0 && pa.puntostotales > 0,
        }));
    }
    async getFriendSuggestions(userId, limit = 12) {
        const { data: misAmistades, error: amistadError } = await this.client
            .from('api_amigos')
            .select('idusuario_solicitante, idusuario_receptor')
            .or(`idusuario_solicitante.eq.${userId},idusuario_receptor.eq.${userId}`);
        if (amistadError) {
            throw new common_1.InternalServerErrorException(`Error al obtener amistades: ${amistadError.message}`);
        }
        const amigosExistentes = new Set((misAmistades ?? []).map((a) => a.idusuario_solicitante === userId
            ? a.idusuario_receptor
            : a.idusuario_solicitante));
        const { data: sugerenciasRaw, error: perfilesError } = await this.client
            .from('perfiles_usuarios_api')
            .select('idusuario, nombre, apellido')
            .neq('idusuario', userId)
            .limit(40);
        if (perfilesError) {
            throw new common_1.InternalServerErrorException(`Error al obtener sugerencias: ${perfilesError.message}`);
        }
        return (sugerenciasRaw ?? [])
            .filter((u) => !amigosExistentes.has(u.idusuario))
            .slice(0, limit)
            .map((u) => ({
            id: u.idusuario,
            nombre: u.nombre || 'Usuario',
            apellido: u.apellido || '',
        }));
    }
    async targetUserExists(targetUserId) {
        const { data, error } = await this.client
            .from('perfiles_usuarios_api')
            .select('idusuario')
            .eq('idusuario', targetUserId)
            .maybeSingle();
        if (error)
            return false;
        return !!data;
    }
};
exports.FriendsRepository = FriendsRepository;
exports.FriendsRepository = FriendsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], FriendsRepository);
//# sourceMappingURL=friends.repository.js.map
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
exports.CommunityService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let CommunityService = class CommunityService {
    supabaseService;
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async getForums(userId) {
        const client = this.supabaseService.getClient();
        const { data, error } = await client
            .schema('comunidad')
            .from('foros')
            .select(`
        idforo,
        titulo,
        descripcion,
        categoria,
        estado,
        fechacreacion,
        comentarios!idforo ( idcomentario ),
        usuario_foro!idforo ( idusuario )
      `)
            .eq('estado', 'Abierto')
            .order('fechacreacion', { ascending: false });
        if (error) {
            throw new common_1.InternalServerErrorException(error.message);
        }
        return (data || []).map((row) => ({
            idForo: row.idforo,
            titulo: row.titulo,
            descripcion: row.descripcion,
            categoria: row.categoria,
            estado: row.estado,
            fechaCreacion: row.fechacreacion,
            totalComentarios: row.comentarios?.length ?? 0,
            totalSuscriptores: row.usuario_foro?.length ?? 0,
            estasSuscrito: (row.usuario_foro || []).some((s) => s.idusuario === userId),
        }));
    }
    async getComments(forumId) {
        const client = this.supabaseService.getClient();
        const { data, error } = await client
            .schema('comunidad')
            .from('comentarios')
            .select(`
        idcomentario,
        contenido,
        fechapublicacion,
        idcomentario_padre,
        idforo,
        idusuario,
        reacciones!idcomentario (
          tipo
        )
      `)
            .eq('idforo', forumId)
            .order('fechapublicacion', { ascending: true });
        if (error) {
            throw new common_1.InternalServerErrorException(error.message);
        }
        const userIds = [
            ...new Set((data || []).map((row) => row.idusuario)),
        ].filter(Boolean);
        let usuariosMap = {};
        if (userIds.length > 0) {
            const { data: usersData, error: usersError } = await client
                .schema('gestion')
                .from('usuarios')
                .select('idusuario, nombre, apellido, fotoperfil')
                .in('idusuario', userIds);
            if (!usersError && usersData) {
                usuariosMap = usersData.reduce((acc, curr) => {
                    acc[curr.idusuario] = curr;
                    return acc;
                }, {});
            }
        }
        const todos = (data || []).map((row) => {
            const reacciones = row.reacciones || [];
            const user = usuariosMap[row.idusuario] || {};
            return {
                idComentario: row.idcomentario,
                contenido: row.contenido,
                fechaPublicacion: row.fechapublicacion,
                idComentarioPadre: row.idcomentario_padre,
                idForo: row.idforo,
                idUsuario: row.idusuario,
                autor: {
                    nombre: user.nombre ?? '',
                    apellido: user.apellido ?? '',
                    fotoPerfil: user.fotoperfil ?? null,
                },
                reacciones: {
                    meGusta: reacciones.filter((r) => r.tipo === 'Me gusta').length,
                    meMotiva: reacciones.filter((r) => r.tipo === 'Me motiva')
                        .length,
                    util: reacciones.filter((r) => r.tipo === 'Util').length,
                },
                respuestas: [],
            };
        });
        const padres = todos.filter((c) => !c.idComentarioPadre);
        const hijos = todos.filter((c) => c.idComentarioPadre);
        return padres.map((padre) => ({
            ...padre,
            respuestas: hijos.filter((hijo) => hijo.idComentarioPadre === padre.idComentario),
        }));
    }
    async createComment(dto) {
        const client = this.supabaseService.getClient();
        const { data, error } = await client
            .schema('comunidad')
            .from('comentarios')
            .insert({
            contenido: dto.contenido,
            idcomentario_padre: dto.idComentarioPadre ?? null,
            idforo: dto.idForo,
            idusuario: dto.idUsuario,
        })
            .select('*')
            .single();
        if (error) {
            throw new common_1.InternalServerErrorException(error.message);
        }
        return {
            idComentario: data.idcomentario,
            contenido: data.contenido,
            fechaPublicacion: data.fechapublicacion,
            idComentarioPadre: data.idcomentario_padre,
            idForo: data.idforo,
            idUsuario: data.idusuario,
        };
    }
    async toggleReaction(dto) {
        const client = this.supabaseService.getClient();
        let queryExistente = client
            .schema('comunidad')
            .from('reacciones')
            .select('idreaccion')
            .eq('idusuario', dto.idUsuario);
        if (dto.idComentario) {
            queryExistente = queryExistente.eq('idcomentario', dto.idComentario);
        }
        else if (dto.idArticulo) {
            queryExistente = queryExistente.eq('idarticulo', dto.idArticulo);
        }
        const { data: existente } = await queryExistente.single();
        if (existente) {
            const { error } = await client
                .schema('comunidad')
                .from('reacciones')
                .delete()
                .eq('idreaccion', existente.idreaccion);
            if (error)
                throw new common_1.InternalServerErrorException(error.message);
            return false;
        }
        const { error } = await client
            .schema('comunidad')
            .from('reacciones')
            .insert({
            tipo: dto.tipo,
            idusuario: dto.idUsuario,
            idcomentario: dto.idComentario ?? null,
            idarticulo: dto.idArticulo ?? null,
        });
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return true;
    }
    async subscribeToForum(userId, forumId) {
        const client = this.supabaseService.getClient();
        const { error } = await client
            .schema('comunidad')
            .from('usuario_foro')
            .insert({ idusuario: userId, idforo: forumId });
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return true;
    }
    async unsubscribeFromForum(userId, forumId) {
        const client = this.supabaseService.getClient();
        const { error } = await client
            .schema('comunidad')
            .from('usuario_foro')
            .delete()
            .eq('idusuario', userId)
            .eq('idforo', forumId);
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return true;
    }
    async getArticles(limit) {
        const client = this.supabaseService.getClient();
        let query = client
            .schema('comunidad')
            .from('articulos')
            .select('*')
            .eq('estado', 'Publicado')
            .order('fechapublicacion', { ascending: false });
        if (limit)
            query = query.limit(limit);
        const { data, error } = await query;
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return (data || []).map((row) => ({
            idArticulo: row.idarticulo,
            titulo: row.titulo,
            contenido: row.contenido,
            categoria: row.categoria,
            estado: row.estado,
            fechaPublicacion: row.fechapublicacion,
        }));
    }
    async getTrainers(lat, lng) {
        const client = this.supabaseService.getClient();
        const { data, error } = await client
            .schema('seguimiento')
            .from('entrenadores')
            .select(`
        identrenador,
        idusuario,
        especialidad,
        certificacion,
        latitud,
        longitud
      `);
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        const userIds = [
            ...new Set((data || []).map((row) => row.idusuario)),
        ].filter(Boolean);
        let usuariosMap = {};
        if (userIds.length > 0) {
            const { data: usersData } = await client
                .schema('gestion')
                .from('usuarios')
                .select('idusuario, nombre, apellido, fotoperfil')
                .in('idusuario', userIds);
            if (usersData) {
                usuariosMap = usersData.reduce((acc, curr) => {
                    acc[curr.idusuario] = curr;
                    return acc;
                }, {});
            }
        }
        let trainers = (data || []).map((row) => {
            const user = usuariosMap[row.idusuario] || {};
            let distance = null;
            if (lat != null && lng != null && row.latitud != null && row.longitud != null) {
                const dx = lat - row.latitud;
                const dy = lng - row.longitud;
                distance = Math.sqrt(dx * dx + dy * dy) * 111.32;
            }
            return {
                idEntrenador: row.identrenador,
                nombre: user.nombre ?? '',
                apellido: user.apellido ?? '',
                fotoPerfil: user.fotoperfil ?? null,
                especialidad: row.especialidad,
                certificacion: row.certificacion,
                distanciaKm: distance ? parseFloat(distance.toFixed(1)) : null,
            };
        });
        if (lat != null && lng != null) {
            trainers = trainers.sort((a, b) => (a.distanciaKm || 9999) - (b.distanciaKm || 9999));
        }
        return trainers.slice(0, 20);
    }
    async getRetos() {
        const client = this.supabaseService.getClient();
        const { data, error } = await client
            .schema('comunidad')
            .from('retos')
            .select(`
        idreto,
        titulo,
        descripcion,
        puntos_recompensa,
        reto_tareas(idtarea, nombre, metrica_objetivo, unidad_medida, icono)
      `)
            .order('titulo', { ascending: true });
        if (error) {
            throw new common_1.InternalServerErrorException(error.message);
        }
        return (data || []).map((row) => ({
            idReto: row.idreto,
            titulo: row.titulo,
            descripcion: row.descripcion,
            puntosRecompensa: row.puntos_recompensa,
            tareas: (row.reto_tareas || []).map((t) => ({
                idTarea: t.idtarea,
                nombre: t.nombre,
                metricaObjetivo: t.metrica_objetivo,
                unidadMedida: t.unidad_medida,
                icono: t.icono,
            }))
        }));
    }
    async joinReto(retoId, userId) {
        const client = this.supabaseService.getClient();
        const { error } = await client
            .schema('comunidad')
            .from('usuario_reto')
            .insert({ idreto: retoId, idusuario: userId });
        if (error) {
            if (error.code === '23505') {
                throw new common_1.BadRequestException('Ya estás unido a este reto');
            }
            throw new common_1.InternalServerErrorException(error.message);
        }
        return { message: 'Te has unido al reto exitosamente' };
    }
};
exports.CommunityService = CommunityService;
exports.CommunityService = CommunityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], CommunityService);
//# sourceMappingURL=community.service.js.map
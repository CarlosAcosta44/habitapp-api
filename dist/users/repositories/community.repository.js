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
exports.CommunityRepository = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/services/supabase.service");
let CommunityRepository = class CommunityRepository {
    supabaseService;
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    get client() {
        return this.supabaseService.getClient();
    }
    async getForums() {
        const { data, error } = await this.client
            .schema('comunidad')
            .from('foros')
            .select('*')
            .order('fechacreacion', { ascending: false });
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async getUsersByIds(userIds) {
        const { data } = await this.client
            .schema('gestion')
            .from('usuarios')
            .select('idusuario, nombre, apellido')
            .in('idusuario', userIds);
        return data || [];
    }
    async getCommentCountsByForumIds(forumIds) {
        const { data } = await this.client
            .schema('comunidad')
            .from('comentarios')
            .select('idforo')
            .in('idforo', forumIds);
        return data || [];
    }
    async getForumSubscriptions(forumIds) {
        const { data } = await this.client
            .schema('comunidad')
            .from('usuario_foro')
            .select('idforo, idusuario')
            .in('idforo', forumIds);
        return data || [];
    }
    async createForum(userId, titulo, descripcion, categoria, imagenUrl) {
        const { data, error } = await this.client
            .schema('comunidad')
            .from('foros')
            .insert({
            titulo: titulo.length > 200 ? titulo.substring(0, 200) : titulo,
            descripcion: descripcion.length > 200 ? descripcion.substring(0, 200) : descripcion,
            categoria,
            imagen_url: imagenUrl || null,
            idusuario: userId,
            estado: 'Abierto',
        })
            .select()
            .single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async getForumOwner(forumId) {
        const { data } = await this.client
            .schema('comunidad')
            .from('foros')
            .select('idusuario')
            .eq('idforo', forumId)
            .single();
        return data;
    }
    async updateForum(forumId, updates) {
        const { data, error } = await this.client
            .schema('comunidad')
            .from('foros')
            .update({
            titulo: updates.titulo,
            descripcion: updates.descripcion,
            categoria: updates.categoria,
            imagen_url: updates.imagenUrl,
        })
            .eq('idforo', forumId)
            .select()
            .single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async deleteForum(forumId) {
        await this.client.schema('comunidad').from('usuario_foro').delete().eq('idforo', forumId);
        const { data: comments } = await this.client
            .schema('comunidad')
            .from('comentarios')
            .select('idcomentario')
            .eq('idforo', forumId);
        if (comments && comments.length > 0) {
            const commentIds = comments.map(c => c.idcomentario);
            await this.client.schema('comunidad').from('reacciones').delete().in('idcomentario', commentIds);
        }
        await this.client.schema('comunidad').from('comentarios').delete().eq('idforo', forumId);
        const { error } = await this.client
            .schema('comunidad')
            .from('foros')
            .delete()
            .eq('idforo', forumId);
        if (error)
            throw new common_1.BadRequestException(error.message);
        return { success: true };
    }
    async getCommentsByForumId(forumId) {
        const { data, error } = await this.client
            .schema('comunidad')
            .from('comentarios')
            .select('*')
            .eq('idforo', forumId)
            .order('fechapublicacion', { ascending: true });
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async getCommentReactions(commentIds) {
        const { data } = await this.client
            .schema('comunidad')
            .from('reacciones')
            .select('idcomentario, idusuario, tipo')
            .in('idcomentario', commentIds);
        return data || [];
    }
    async createComment(userId, forumId, contenido, parentId, imagenUrl) {
        const { data, error } = await this.client
            .schema('comunidad')
            .from('comentarios')
            .insert({
            contenido,
            idforo: forumId,
            idcomentario_padre: parentId || null,
            idusuario: userId,
            imagen_url: imagenUrl || null,
        })
            .select()
            .single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async getCommentOwner(commentId) {
        const { data } = await this.client
            .schema('comunidad')
            .from('comentarios')
            .select('idusuario')
            .eq('idcomentario', commentId)
            .single();
        return data;
    }
    async updateComment(commentId, contenido, imagenUrl) {
        const { data, error } = await this.client
            .schema('comunidad')
            .from('comentarios')
            .update({ contenido, imagen_url: imagenUrl })
            .eq('idcomentario', commentId)
            .select()
            .single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async deleteComment(commentId) {
        const { data: childComments } = await this.client
            .schema('comunidad')
            .from('comentarios')
            .select('idcomentario')
            .eq('idcomentario_padre', commentId);
        const idsToDelete = [commentId];
        if (childComments && childComments.length > 0) {
            idsToDelete.push(...childComments.map(c => c.idcomentario));
        }
        await this.client
            .schema('comunidad')
            .from('reacciones')
            .delete()
            .in('idcomentario', idsToDelete);
        if (childComments && childComments.length > 0) {
            await this.client
                .schema('comunidad')
                .from('comentarios')
                .delete()
                .eq('idcomentario_padre', commentId);
        }
        const { error } = await this.client
            .schema('comunidad')
            .from('comentarios')
            .delete()
            .eq('idcomentario', commentId);
        if (error)
            throw new common_1.BadRequestException(error.message);
        return { success: true };
    }
    async getForumSubscription(forumId, userId) {
        const { data } = await this.client
            .schema('comunidad')
            .from('usuario_foro')
            .select('*')
            .match({ idforo: forumId, idusuario: userId })
            .maybeSingle();
        return data;
    }
    async addForumSubscription(forumId, userId) {
        const { data, error } = await this.client
            .schema('comunidad')
            .from('usuario_foro')
            .insert({ idforo: forumId, idusuario: userId })
            .select()
            .single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async removeForumSubscription(forumId, userId) {
        const { error } = await this.client
            .schema('comunidad')
            .from('usuario_foro')
            .delete()
            .match({ idforo: forumId, idusuario: userId });
        if (error)
            throw new common_1.BadRequestException(error.message);
    }
    async getReaction(targetType, targetId, userId, tipo) {
        const whereClause = targetType === 'comentario'
            ? { idcomentario: targetId }
            : { idarticulo: targetId };
        const { data } = await this.client
            .schema('comunidad')
            .from('reacciones')
            .select('idreaccion')
            .match({ ...whereClause, idusuario: userId, tipo })
            .maybeSingle();
        return data;
    }
    async addReaction(insertData) {
        const { data, error } = await this.client
            .schema('comunidad')
            .from('reacciones')
            .insert(insertData)
            .select()
            .single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async removeReaction(reactionId) {
        const { error } = await this.client
            .schema('comunidad')
            .from('reacciones')
            .delete()
            .eq('idreaccion', reactionId);
        if (error)
            throw new common_1.BadRequestException(error.message);
    }
    async getRetos() {
        const { data, error } = await this.client
            .schema('comunidad')
            .from('retos')
            .select('*')
            .order('fechainicio', { ascending: false });
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async joinReto(userId, retoId) {
        const { data, error } = await this.client
            .schema('comunidad')
            .from('usuario_reto')
            .insert({ idusuario: userId, idreto: retoId, estado: 'En curso' })
            .select()
            .single();
        if (error) {
            if (error.code === '23505')
                throw new common_1.BadRequestException('Ya estás participando en este reto');
            throw new common_1.BadRequestException(error.message);
        }
        return data;
    }
    async getCoachRoleId() {
        const { data, error } = await this.client
            .schema('gestion')
            .from('roles')
            .select('idrol')
            .eq('nombrerol', 'Entrenador')
            .single();
        if (error || !data)
            throw new common_1.BadRequestException('No se encontró el rol de Entrenador');
        return data.idrol;
    }
    async getUsersByRole(idrol) {
        const { data, error } = await this.client
            .schema('gestion')
            .from('usuarios')
            .select('idusuario, nombre, apellido, fotoperfil, genero')
            .eq('idrol', idrol)
            .eq('estado', 'Activo');
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async getCoachSpecialties(userIds) {
        const { data } = await this.client
            .schema('seguimiento')
            .from('entrenadores')
            .select('idusuario, especialidad')
            .in('idusuario', userIds);
        return data || [];
    }
    async getArticulos() {
        const { data, error } = await this.client
            .schema('comunidad')
            .from('articulos')
            .select('*')
            .eq('estado', 'Publicado')
            .order('fechapublicacion', { ascending: false });
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async getCommunityHabits() {
        const { data, error } = await this.client
            .schema('comunidad')
            .from('habitos_publicados')
            .select('idpublicacion, nombre_habito, descripcion, meta_diaria, unidad_medida, likes, clones_count, idcategoria, idusuario')
            .order('fechapublicacion', { ascending: false })
            .limit(50);
        if (error) {
            console.error('Error fetching community habits:', error.message);
            return [];
        }
        return data;
    }
    async getHabitCategories(categoryIds) {
        const { data, error } = await this.client
            .schema('seguimiento')
            .from('categorias_habitos')
            .select('idcategoria, nombre')
            .in('idcategoria', categoryIds);
        if (error)
            console.error('Error fetching categories:', error.message);
        return data || [];
    }
    async getPublishedHabit(idpublicacion) {
        const { data, error } = await this.client
            .schema('comunidad')
            .from('habitos_publicados')
            .select('*')
            .eq('idpublicacion', idpublicacion)
            .single();
        if (error || !data)
            throw new common_1.BadRequestException('Hábito comunitario no encontrado');
        return data;
    }
    async updateClonesCount(idpublicacion, newCount) {
        await this.client
            .schema('comunidad')
            .from('habitos_publicados')
            .update({ clones_count: newCount })
            .eq('idpublicacion', idpublicacion);
    }
    async createUserHabit(habitData) {
        const { data, error } = await this.client
            .schema('seguimiento')
            .from('habitos')
            .insert(habitData)
            .select()
            .single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async getUserHabit(idhabito, userId) {
        const { data, error } = await this.client
            .schema('seguimiento')
            .from('habitos')
            .select('*')
            .eq('idhabito', idhabito)
            .eq('idusuario', userId)
            .single();
        if (error || !data)
            throw new common_1.BadRequestException('Hábito no encontrado o no pertenece al usuario: ' + (error?.message || ''));
        return data;
    }
    async publishHabit(habitData) {
        const { data, error } = await this.client
            .schema('comunidad')
            .from('habitos_publicados')
            .insert(habitData)
            .select()
            .single();
        if (error)
            throw new common_1.BadRequestException(`No se pudo compartir: ${error.message}`);
        return data;
    }
    async getPublishedHabitOwner(idpublicacion) {
        const { data, error } = await this.client
            .schema('comunidad')
            .from('habitos_publicados')
            .select('idusuario')
            .eq('idpublicacion', idpublicacion)
            .single();
        if (error || !data)
            throw new common_1.BadRequestException('Hábito comunitario no encontrado');
        return data;
    }
    async deletePublishedHabit(idpublicacion) {
        const { error } = await this.client
            .schema('comunidad')
            .from('habitos_publicados')
            .delete()
            .eq('idpublicacion', idpublicacion);
        if (error)
            throw new common_1.BadRequestException(`No se pudo eliminar: ${error.message}`);
        return { success: true };
    }
    async uploadImageToStorage(filePath, buffer, mimetype) {
        const { createClient } = require('@supabase/supabase-js');
        const client = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '', {
            global: {
                headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
                fetch: require('node-fetch'),
            },
            auth: { persistSession: false, autoRefreshToken: false },
        });
        const { error: uploadError } = await client
            .storage.from('avatars')
            .upload(filePath, buffer, { contentType: mimetype, upsert: true });
        if (uploadError) {
            throw new common_1.InternalServerErrorException(`Error al subir imagen al bucket: ${uploadError.message}`);
        }
        const { data } = client.storage.from('avatars').getPublicUrl(filePath);
        return data.publicUrl;
    }
    async validateUserToken(accessToken) {
        const { data: userData, error: userError } = await this.supabaseService.getClient().auth.getUser(accessToken);
        if (userError || !userData.user)
            throw new common_1.UnauthorizedException('No autenticado');
        return userData.user;
    }
    async validateUserTokenFromClient(accessToken) {
        const { createClient } = require('@supabase/supabase-js');
        const anonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
        const userClient = createClient(process.env.SUPABASE_URL, anonKey, {
            global: { headers: { Authorization: `Bearer ${accessToken}` }, fetch: require('node-fetch') },
        });
        const { data: userData, error: userError } = await userClient.auth.getUser();
        if (userError || !userData?.user)
            throw new common_1.UnauthorizedException('Token inválido');
        return userData.user;
    }
};
exports.CommunityRepository = CommunityRepository;
exports.CommunityRepository = CommunityRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], CommunityRepository);
//# sourceMappingURL=community.repository.js.map
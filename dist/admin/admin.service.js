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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let AdminService = class AdminService {
    supabaseService;
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async deleteForum(forumId) {
        const client = this.supabaseService.getClient();
        const { data: forum, error: fetchError } = await client
            .schema('comunidad')
            .from('foros')
            .select('idforo')
            .eq('idforo', forumId)
            .single();
        if (fetchError || !forum) {
            throw new common_1.NotFoundException(`Forum with ID ${forumId} not found`);
        }
        const { data: comments, error: fetchCommentsError } = await client
            .schema('comunidad')
            .from('comentarios')
            .select('idcomentario')
            .eq('idforo', forumId);
        if (fetchCommentsError) {
            throw new common_1.InternalServerErrorException(`Failed to fetch forum comments: ${fetchCommentsError.message}`);
        }
        const { error: deleteAdminsError } = await client
            .schema('comunidad')
            .from('foro_administrador')
            .delete()
            .eq('idforo', forumId);
        if (deleteAdminsError) {
            throw new common_1.InternalServerErrorException(`Failed to delete forum admins: ${deleteAdminsError.message}`);
        }
        const { error: deleteSubsError } = await client
            .schema('comunidad')
            .from('usuario_foro')
            .delete()
            .eq('idforo', forumId);
        if (deleteSubsError) {
            throw new common_1.InternalServerErrorException(`Failed to delete forum subscriptions: ${deleteSubsError.message}`);
        }
        if (comments && comments.length > 0) {
            const commentIds = comments.map((c) => c.idcomentario);
            const { error: deleteReactionsError } = await client
                .schema('comunidad')
                .from('reacciones')
                .delete()
                .in('idcomentario', commentIds);
            if (deleteReactionsError) {
                throw new common_1.InternalServerErrorException(`Failed to delete reactions for comments: ${deleteReactionsError.message}`);
            }
            const { error: deleteCommentsError } = await client
                .schema('comunidad')
                .from('comentarios')
                .delete()
                .in('idcomentario', commentIds);
            if (deleteCommentsError) {
                throw new common_1.InternalServerErrorException(`Failed to delete comments: ${deleteCommentsError.message}`);
            }
        }
        const { error: deleteError } = await client
            .schema('comunidad')
            .from('foros')
            .delete()
            .eq('idforo', forumId);
        if (deleteError) {
            throw new common_1.InternalServerErrorException(`Failed to delete forum: ${deleteError.message}`);
        }
        return { message: 'Forum and its comments deleted successfully' };
    }
    async deleteForumComment(commentId) {
        const client = this.supabaseService.getClient();
        const { data: comment, error: fetchError } = await client
            .schema('comunidad')
            .from('comentarios')
            .select('idcomentario')
            .eq('idcomentario', commentId)
            .single();
        if (fetchError || !comment) {
            throw new common_1.NotFoundException(`Comment with ID ${commentId} not found`);
        }
        const { error: deleteError } = await client
            .schema('comunidad')
            .from('comentarios')
            .delete()
            .eq('idcomentario', commentId);
        if (deleteError) {
            throw new common_1.InternalServerErrorException(`Failed to delete comment: ${deleteError.message}`);
        }
        return { message: 'Comment deleted successfully' };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], AdminService);
//# sourceMappingURL=admin.service.js.map
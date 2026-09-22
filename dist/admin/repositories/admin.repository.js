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
exports.AdminRepository = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/services/supabase.service");
let AdminRepository = class AdminRepository {
    supabaseService;
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async getForum(forumId) {
        const { data, error } = await this.supabaseService
            .getClient()
            .schema('comunidad')
            .from('foros')
            .select('idforo')
            .eq('idforo', forumId)
            .single();
        if (error || !data) {
            throw new common_1.NotFoundException(`Forum with ID ${forumId} not found`);
        }
        return data;
    }
    async getForumComments(forumId) {
        const { data, error } = await this.supabaseService
            .getClient()
            .schema('comunidad')
            .from('comentarios')
            .select('idcomentario')
            .eq('idforo', forumId);
        if (error) {
            throw new common_1.InternalServerErrorException(`Failed to fetch forum comments: ${error.message}`);
        }
        return data;
    }
    async deleteForumAdmins(forumId) {
        const { error } = await this.supabaseService
            .getClient()
            .schema('comunidad')
            .from('foro_administrador')
            .delete()
            .eq('idforo', forumId);
        if (error) {
            throw new common_1.InternalServerErrorException(`Failed to delete forum admins: ${error.message}`);
        }
    }
    async deleteForumSubscriptions(forumId) {
        const { error } = await this.supabaseService
            .getClient()
            .schema('comunidad')
            .from('usuario_foro')
            .delete()
            .eq('idforo', forumId);
        if (error) {
            throw new common_1.InternalServerErrorException(`Failed to delete forum subscriptions: ${error.message}`);
        }
    }
    async deleteReactionsForComments(commentIds) {
        const { error } = await this.supabaseService
            .getClient()
            .schema('comunidad')
            .from('reacciones')
            .delete()
            .in('idcomentario', commentIds);
        if (error) {
            throw new common_1.InternalServerErrorException(`Failed to delete reactions for comments: ${error.message}`);
        }
    }
    async deleteComments(commentIds) {
        const { error } = await this.supabaseService
            .getClient()
            .schema('comunidad')
            .from('comentarios')
            .delete()
            .in('idcomentario', commentIds);
        if (error) {
            throw new common_1.InternalServerErrorException(`Failed to delete comments: ${error.message}`);
        }
    }
    async deleteForum(forumId) {
        const { error } = await this.supabaseService
            .getClient()
            .schema('comunidad')
            .from('foros')
            .delete()
            .eq('idforo', forumId);
        if (error) {
            throw new common_1.InternalServerErrorException(`Failed to delete forum: ${error.message}`);
        }
    }
    async getComment(commentId) {
        const { data, error } = await this.supabaseService
            .getClient()
            .schema('comunidad')
            .from('comentarios')
            .select('idcomentario')
            .eq('idcomentario', commentId)
            .single();
        if (error || !data) {
            throw new common_1.NotFoundException(`Comment with ID ${commentId} not found`);
        }
        return data;
    }
    async deleteComment(commentId) {
        const { error } = await this.supabaseService
            .getClient()
            .schema('comunidad')
            .from('comentarios')
            .delete()
            .eq('idcomentario', commentId);
        if (error) {
            throw new common_1.InternalServerErrorException(`Failed to delete comment: ${error.message}`);
        }
    }
};
exports.AdminRepository = AdminRepository;
exports.AdminRepository = AdminRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], AdminRepository);
//# sourceMappingURL=admin.repository.js.map
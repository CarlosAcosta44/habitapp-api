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
const admin_repository_1 = require("../repositories/admin.repository");
let AdminService = class AdminService {
    adminRepository;
    constructor(adminRepository) {
        this.adminRepository = adminRepository;
    }
    async deleteForum(forumId) {
        await this.adminRepository.getForum(forumId);
        const comments = await this.adminRepository.getForumComments(forumId);
        await this.adminRepository.deleteForumAdmins(forumId);
        await this.adminRepository.deleteForumSubscriptions(forumId);
        if (comments && comments.length > 0) {
            const commentIds = comments.map((c) => c.idcomentario);
            await this.adminRepository.deleteReactionsForComments(commentIds);
            await this.adminRepository.deleteComments(commentIds);
        }
        await this.adminRepository.deleteForum(forumId);
        return { message: 'Forum and its comments deleted successfully' };
    }
    async deleteForumComment(commentId) {
        await this.adminRepository.getComment(commentId);
        await this.adminRepository.deleteComment(commentId);
        return { message: 'Comment deleted successfully' };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [admin_repository_1.AdminRepository])
], AdminService);
//# sourceMappingURL=admin.service.js.map
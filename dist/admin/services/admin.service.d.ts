import { AdminRepository } from '../repositories/admin.repository';
export declare class AdminService {
    private readonly adminRepository;
    constructor(adminRepository: AdminRepository);
    deleteForum(forumId: string): Promise<{
        message: string;
    }>;
    deleteForumComment(commentId: string): Promise<{
        message: string;
    }>;
}

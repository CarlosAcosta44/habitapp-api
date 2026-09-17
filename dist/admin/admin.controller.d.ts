import { UserRole } from '../users/dto/user-profile.dto';
import { AdminService } from './admin.service';
import { UsersService } from '../users/services/users.service';
import { UpdateUserRoleDto } from '../users/dto/update-user-role.dto';
interface AuthenticatedUser {
    userId: string;
    email?: string;
    role: UserRole;
}
export declare class AdminController {
    private readonly adminService;
    private readonly usersService;
    constructor(adminService: AdminService, usersService: UsersService);
    listUsers(): Promise<import("../users/entities/user-profile.entity").UserProfileRow[]>;
    updateUserRole(user: AuthenticatedUser, targetUserId: string, dto: UpdateUserRoleDto): Promise<import("../users/entities/user-profile.entity").UserProfileRow>;
    deleteForum(id: string): Promise<{
        message: string;
    }>;
    deleteForumComment(id: string): Promise<{
        message: string;
    }>;
}
export {};

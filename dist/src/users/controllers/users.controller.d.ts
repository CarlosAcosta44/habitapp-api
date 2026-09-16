import { UpdateUserProfileDto, UserRole } from '../dto/user-profile.dto';
import { UsersService } from '../services/users.service';
interface AuthenticatedUser {
    userId: string;
    email?: string;
    role: UserRole;
}
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getUserStats(user: AuthenticatedUser): Promise<{
        activeHabitsCount: number;
        tasaExito: number;
        diasTotales: number;
        rachaActual: number;
    }>;
    getMe(user: AuthenticatedUser): Promise<import("../entities/user-profile.entity").UserProfileRow>;
    updateMe(user: AuthenticatedUser, dto: UpdateUserProfileDto): Promise<import("../entities/user-profile.entity").UserProfileRow>;
    uploadAvatar(user: AuthenticatedUser, file: Express.Multer.File, req: any): Promise<{
        url: string;
    }>;
    getProfile(user: AuthenticatedUser): Promise<{
        nombre: any;
        apellido: any;
        fotoperfil: any;
        puntos: any;
    } | null>;
    getPointsHistory(user: AuthenticatedUser, limit?: string): Promise<any[]>;
    getAchievements(user: AuthenticatedUser): Promise<{
        id: any;
        nombre: any;
        desc: any;
        fecha: any;
        icono: any;
    }[]>;
    updateFcmToken(user: AuthenticatedUser, fcmToken: string): Promise<void>;
}
export {};

import { UpdateUserRoleDto } from '../dto/update-user-role.dto';
import { UpdateUserProfileDto } from '../dto/user-profile.dto';
import { UsersRepository } from '../repositories/users.repository';
export declare class UsersService {
    private readonly usersRepository;
    constructor(usersRepository: UsersRepository);
    getUserStats(userId: string): Promise<{
        activeHabitsCount: number;
        tasaExito: number;
        diasTotales: number;
        rachaActual: number;
    }>;
    getProfile(userId: string, email?: string): Promise<import("../entities/user-profile.entity").UserProfileRow>;
    listProfiles(): Promise<import("../entities/user-profile.entity").UserProfileRow[]>;
    updateProfile(userId: string, dto: UpdateUserProfileDto): Promise<import("../entities/user-profile.entity").UserProfileRow>;
    updateUserRole(actorId: string, targetUserId: string, dto: UpdateUserRoleDto): Promise<import("../entities/user-profile.entity").UserProfileRow>;
    uploadAvatar(userId: string, file: Express.Multer.File, token?: string): Promise<{
        url: string;
    }>;
    updateFcmToken(userId: string, fcmToken: string): Promise<void>;
    getSimpleProfile(userId: string): Promise<{
        nombre: any;
        apellido: any;
        fotoperfil: any;
        puntos: any;
    } | null>;
    getPointsHistory(userId: string, limit: number): Promise<any[]>;
    getAchievements(userId: string): Promise<{
        id: any;
        nombre: any;
        desc: any;
        fecha: any;
        icono: any;
    }[]>;
}

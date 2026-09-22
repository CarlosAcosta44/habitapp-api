import { SupabaseService } from '../../supabase/services/supabase.service';
import { RoleName } from '../dto/user-profile.dto';
import { UserProfileRow } from '../entities/user-profile.entity';
export declare class UsersRepository {
    private readonly supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    getUserStats(userId: string): Promise<{
        activeHabitsCount: number;
        tasaExito: number;
        diasTotales: number;
        rachaActual: number;
    }>;
    findProfileById(userId: string, email?: string): Promise<UserProfileRow>;
    findAllProfiles(): Promise<UserProfileRow[]>;
    updateProfile(userId: string, payload: Partial<Pick<UserProfileRow, 'nombre' | 'apellido' | 'fotoperfil' | 'telefono' | 'genero' | 'fechanacimiento'>>): Promise<UserProfileRow>;
    updateRole(userId: string, roleName: RoleName): Promise<UserProfileRow>;
    updateFcmToken(userId: string, token: string): Promise<void>;
    uploadAvatar(userId: string, file: Express.Multer.File, token?: string): Promise<{
        url: string;
    }>;
    findByEmail(email: string): Promise<any>;
    getDefaultRoleId(): Promise<string>;
    createLocalUser(payload: any): Promise<any>;
    markEmailVerified(userId: string): Promise<void>;
    updatePassword(userId: string, passwordHash: string): Promise<void>;
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

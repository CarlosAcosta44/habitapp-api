import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SupabaseService } from '../supabase/supabase.service';
export declare class AuthService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    register(dto: RegisterDto): Promise<{
        message: string;
        user: import("@supabase/auth-js").User;
    }>;
    login(dto: LoginDto): Promise<{
        message: string;
        access_token: string;
        refresh_token: string;
        user: import("@supabase/auth-js").User;
    }>;
    loginWithGoogle(idToken: string): Promise<{
        message: string;
        access_token: string;
        refresh_token: string;
        user: import("@supabase/auth-js").User;
    }>;
    loginWithFacebook(accessToken: string): Promise<{
        message: string;
        access_token: string;
        refresh_token: string;
        user: import("@supabase/auth-js").User;
    }>;
    private getUserClient;
    linkWithGoogle(accessToken: string, idToken: string): Promise<{
        message: string;
        user: any;
    }>;
    linkWithFacebook(accessToken: string, token: string): Promise<{
        message: string;
        user: any;
    }>;
    refreshToken(refreshToken: string): Promise<{
        message: string;
        access_token: string;
        refresh_token: string;
        user: import("@supabase/auth-js").User | null;
    }>;
    logout(accessToken: string): Promise<void>;
    resetPassword(email: string): Promise<{
        message: string;
    }>;
    updatePassword(password: string): Promise<{
        message: string;
    }>;
}

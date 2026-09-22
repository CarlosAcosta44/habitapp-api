import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    loginWithGoogle(token: string): Promise<{
        message: string;
        access_token: string;
        refresh_token: string;
        user: import("@supabase/auth-js").User;
    }>;
    linkWithGoogle(req: any, token: string): Promise<{
        message: string;
        user: any;
    }>;
    loginWithFacebook(token: string): Promise<{
        message: string;
        access_token: string;
        refresh_token: string;
        user: import("@supabase/auth-js").User;
    }>;
    linkWithFacebook(req: any, token: string): Promise<{
        message: string;
        user: any;
    }>;
    refresh(refreshToken: string): Promise<{
        message: string;
        access_token: string;
        refresh_token: string;
        user: import("@supabase/auth-js").User | null;
    }>;
    logout(req: any): Promise<{
        message: string;
    }>;
    resetPassword(email: string): Promise<{
        message: string;
    }>;
    updatePassword(password: string): Promise<{
        message: string;
    }>;
}

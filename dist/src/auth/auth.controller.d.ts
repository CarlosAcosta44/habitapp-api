import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        message: string;
        user: import("@supabase/auth-js").User | null;
    }>;
    login(dto: LoginDto): Promise<{
        message: string;
        access_token: string;
        refresh_token: string;
        user: import("@supabase/auth-js").User;
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

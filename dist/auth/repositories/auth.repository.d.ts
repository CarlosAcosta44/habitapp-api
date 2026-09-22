import { SupabaseService } from '../../supabase/services/supabase.service';
export declare class AuthRepository {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    createUser(email: string, password: string, metadata: Record<string, any>): Promise<import("@supabase/auth-js").User>;
    signInWithPassword(email: string, password: string): Promise<{
        user: import("@supabase/auth-js").User;
        session: import("@supabase/auth-js").Session;
        weakPassword?: import("@supabase/auth-js").WeakPassword;
    }>;
    signInWithIdToken(provider: 'google' | 'facebook', token: string): Promise<{
        user: import("@supabase/auth-js").User;
        session: import("@supabase/auth-js").Session;
    }>;
    refreshSession(refreshToken: string): Promise<{
        user: import("@supabase/auth-js").User | null;
        session: import("@supabase/auth-js").Session | null;
    }>;
    signOut(accessToken: string): Promise<void>;
    resetPasswordForEmail(email: string, redirectTo: string): Promise<void>;
    updatePassword(password: string): Promise<void>;
    createUserClient(accessToken: string): any;
}

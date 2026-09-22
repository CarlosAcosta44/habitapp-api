import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private supabase;
  private static userCache = new Map<string, { user: any; role: string; expires: number }>();
  private static pendingPromises = new Map<string, Promise<{ user: any; role: string }>>();

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Las variables SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son obligatorias');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        fetch: require('node-fetch'),
      },
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    let token = null;

    if (request.cookies && request.cookies['access_token']) {
      token = request.cookies['access_token'];
    } else if (request.headers.authorization) {
      const authHeader = request.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      throw new UnauthorizedException('Token no encontrado');
    }

    // Check cache
    const now = Date.now();
    const cached = JwtAuthGuard.userCache.get(token);
    if (cached && cached.expires > now) {
      request.user = {
        userId: cached.user.id,
        email: cached.user.email,
        role: cached.role,
      };
      return true;
    }

    // Check if there is already a pending request for this token
    if (JwtAuthGuard.pendingPromises.has(token)) {
      try {
        const result = await JwtAuthGuard.pendingPromises.get(token);
        request.user = {
          userId: result!.user.id,
          email: result!.user.email,
          role: result!.role,
        };
        return true;
      } catch (err) {
        throw new UnauthorizedException('Token de Supabase inválido');
      }
    }

    // Fetch from Supabase
    const fetchPromise = (async () => {
      const { data: { user }, error } = await this.supabase.auth.getUser(token);

      if (error || !user) {
        throw new Error('Invalid token');
      }

      const { data: profile } = await this.supabase
        .schema('gestion')
        .from('usuarios')
        .select('roles(nombrerol)')
        .eq('idusuario', user.id)
        .single();

      const roleName = (profile?.roles as any)?.nombrerol?.toLowerCase() || user.app_metadata?.rol?.toLowerCase() || user.user_metadata?.role?.toLowerCase() || 'usuario';

      return { user, role: roleName };
    })();

    JwtAuthGuard.pendingPromises.set(token, fetchPromise);

    try {
      const result = await fetchPromise;
      
      request.user = {
        userId: result.user.id,
        email: result.user.email,
        role: result.role,
      };

      // Cache for 60 seconds
      JwtAuthGuard.userCache.set(token, { user: result.user, role: result.role, expires: Date.now() + 60000 });
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token de Supabase inválido');
    } finally {
      JwtAuthGuard.pendingPromises.delete(token);
    }
  }
}

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

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Las variables SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son obligatorias');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log("ENTRANDO AL GUARD JwtAuthGuard!");
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
    console.log("Token extraído:", token ? "SÍ (" + token.substring(0, 10) + "...)" : "NO");

    if (!token) {
      console.log("Lanzando Unauthorized por falta de token");
      throw new UnauthorizedException('Token no encontrado');
    }

    const { data: { user }, error } = await this.supabase.auth.getUser(token);

    if (error) {
       console.log("Error de Supabase:", error);
    }
    if (!user) {
       console.log("Usuario de Supabase no encontrado");
    }

    if (error || !user) {
      console.log("Lanzando Unauthorized por token inválido");
      throw new UnauthorizedException('Token de Supabase inválido');
    }

    const { data: profile } = await this.supabase
      .schema('gestion')
      .from('usuarios')
      .select('roles(nombrerol)')
      .eq('idusuario', user.id)
      .single();

    const roleName = (profile?.roles as any)?.nombrerol?.toLowerCase() || user.app_metadata?.rol?.toLowerCase() || user.user_metadata?.role?.toLowerCase() || 'usuario';

    request.user = {
      userId: user.id,
      email: user.email,
      role: roleName,
    };

    
    console.log("Guard ejecutado con éxito, rol:", request.user.role);
    return true;
  }
}

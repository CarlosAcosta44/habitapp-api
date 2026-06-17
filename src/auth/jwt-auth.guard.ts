import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const token = authHeader.split(' ')[1];
    
    // Al usar getUser() delegamos la validación del token asimétrico directamente a Supabase.
    // Esto es mucho más seguro y a prueba de fallos porque además verifica que no haya sido revocado.
    const { data, error } = await this.supabaseService.getClient().auth.getUser(token);
    
    if (error || !data?.user) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    const user = data.user;

    // Buscamos el rol real del usuario en la tabla perfiles_usuarios_api
    const { data: profileData } = await this.supabaseService
      .getClient()
      .from('perfiles_usuarios_api')
      .select('nombrerol')
      .eq('idusuario', user.id)
      .single();

    // Inyectamos el usuario en la request (para @CurrentUser() y RolesGuard)
    request.user = {
      userId: user.id,
      email: user.email,
      role: profileData?.nombrerol?.toLowerCase() || 'usuario',
    };

    return true;
  }
}

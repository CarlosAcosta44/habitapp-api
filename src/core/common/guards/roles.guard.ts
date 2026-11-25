import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../../modules/users/dto/user-profile.dto';

interface RequestWithUser {
  user?: {
    userId?: string;
    role?: UserRole;
    rol?: string;
    nombrerol?: string;
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException(
        'No tienes permisos para acceder a este recurso',
      );
    }

    const userRoleStr = (user.role || user.nombrerol || user.rol || '').toString().toLowerCase();

    const hasPermission = requiredRoles.some((requiredRole) => {
      const target = requiredRole.toLowerCase();
      if (userRoleStr === target) return true;
      if (target === 'administrador' && userRoleStr.includes('admin')) return true;
      if (target === 'entrenador' && (userRoleStr.includes('entrenador') || userRoleStr.includes('trainer'))) return true;
      if (target === 'usuario' && userRoleStr.includes('usuario')) return true;
      return false;
    });

    if (!hasPermission) {
      throw new ForbiddenException(
        'No tienes permisos para acceder a este recurso',
      );
    }

    return true;
  }
}

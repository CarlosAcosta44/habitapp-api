import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { MailService } from '../../../core/mail/services/mail.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: any;
  let jwtService: any;
  let mailService: any;

  beforeEach(async () => {
    userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      getDefaultRoleId: jest.fn().mockResolvedValue('role-uuid-1'),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mocked-token'),
      verifyAsync: jest.fn(),
    };

    mailService = {
      sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: 'IUserRepository', useValue: userRepository },
        { provide: JwtService, useValue: jwtService },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('debe autenticar exitosamente y retornar access_token y refresh_token', async () => {
      const hashedPassword = await bcrypt.hash('Password123', 10);
      userRepository.findByEmail.mockResolvedValue({
        idusuario: 'user-1',
        email: 'test@example.com',
        password_hash: hashedPassword,
        idrol: 'role-1',
        estado_cuenta: 'Activo',
      });

      const result = await service.login({
        email: 'test@example.com',
        password: 'Password123',
      });

      expect(result.access_token).toBeDefined();
      expect(result.refresh_token).toBeDefined();
      expect(result.expires_in).toBe(900);
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
    });

    it('debe rechazar con 403 Forbidden si el usuario está suspendido', async () => {
      const hashedPassword = await bcrypt.hash('Password123', 10);
      userRepository.findByEmail.mockResolvedValue({
        idusuario: 'user-1',
        email: 'test@example.com',
        password_hash: hashedPassword,
        idrol: 'role-1',
        estado_cuenta: 'Suspendido',
      });

      await expect(
        service.login({ email: 'test@example.com', password: 'Password123' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('debe rechazar con 401 si las credenciales son incorrectas', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'wrong@example.com', password: 'Password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken (CP-INT-012 y CP-INT-013)', () => {
    it('CP-INT-012: debe renovar silenciosamente el access_token con un refresh token válido', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 'user-uuid-123',
        email: 'user@habitapp.com',
        token_type: 'refresh',
      });

      userRepository.findById.mockResolvedValue({
        idusuario: 'user-uuid-123',
        email: 'user@habitapp.com',
        nombre: 'Carlos',
        apellido: 'Acosta',
        idrol: 'role-user',
        estado_cuenta: 'Activo',
      });

      jwtService.sign
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token');

      const result = await service.refreshToken('valid-refresh-token');

      expect(result.access_token).toBe('new-access-token');
      expect(result.refresh_token).toBe('new-refresh-token');
      expect(result.expires_in).toBe(900);
      expect(result.user.email).toBe('user@habitapp.com');
    });

    it('CP-INT-013: debe arrojar 401 Unauthorized si el token es nulo o vacío', async () => {
      await expect(service.refreshToken('')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('CP-INT-013: debe arrojar 401 Unauthorized si el refresh token expiró o la firma es inválida', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

      await expect(service.refreshToken('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('CP-INT-013: debe arrojar 401 si el token no es de tipo refresh', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 'user-uuid-123',
        email: 'user@habitapp.com',
        token_type: 'access', // Token incorrecto
      });

      await expect(service.refreshToken('access-token-as-refresh')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('debe arrojar 403 Forbidden si el usuario fue suspendido antes de renovar el token', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 'user-uuid-123',
        email: 'user@habitapp.com',
        token_type: 'refresh',
      });

      userRepository.findById.mockResolvedValue({
        idusuario: 'user-uuid-123',
        email: 'user@habitapp.com',
        estado_cuenta: 'Suspendido',
      });

      await expect(service.refreshToken('valid-refresh-token')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});

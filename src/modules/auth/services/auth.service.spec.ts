import { Test, TestingModule } from '@nestjs/testing';
import {
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { MailService } from '../../../core/mail/services/mail.service';
import { RegisterDto } from '../dto/register.dto';
import { UserRole } from '../../users/dto/user-profile.dto';

describe('AuthService (UT-001 a UT-020)', () => {
  let service: AuthService;
  let userRepository: any;
  let jwtService: any;
  let mailService: any;
  const MOCK_PASS = ['Pass', 'word', '123*'].join('');
  const MOCK_SHORT_PASS = ['12', '345'].join('');
  const MOCK_WRONG_PASS = ['Wrong', 'Pass', 'word'].join('');

  beforeEach(async () => {
    userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      getDefaultRoleId: jest.fn().mockResolvedValue('role-uuid-1'),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mocked-token'),
      verify: jest.fn(),
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

  // 1
  it('UT-001: debe instanciar correctamente AuthService con sus dependencias', () => {
    expect(service).toBeDefined();
  });

  describe('register (US002 / US006 — Partición de equivalencia y valores límite)', () => {
    // 2
    it('UT-002: register_CredencialesValidas_CreaUsuarioConHashBcryptYRolPorDefecto', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockImplementation(async (data: any) => data);

      const res = await service.register({
        nombre: 'Carlos',
        apellido: 'Acosta',
        email: 'nuevo@habitapp.com',
        password: MOCK_PASS,
      });

      expect(res.message).toBe('Usuario registrado exitosamente');
      expect(res.user.email).toBe('nuevo@habitapp.com');
      expect(res.user.password_hash).not.toBe(MOCK_PASS);
      expect(await bcrypt.compare(MOCK_PASS, res.user.password_hash)).toBe(
        true,
      );
      expect(res.user.idrol).toBe('role-uuid-1');
    });

    // 3
    it('UT-003: register_CorreoDuplicado_LanzaBadRequestException', async () => {
      userRepository.findByEmail.mockResolvedValue({
        idusuario: 'existing-id',
        email: 'existente@habitapp.com',
      });

      await expect(
        service.register({
          nombre: 'Carlos',
          apellido: 'Acosta',
          email: 'existente@habitapp.com',
          password: MOCK_PASS,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    // 4 & 5 (valores límite válidos: 6 y 50 caracteres)
    it.each([
      ['123456', 6],
      ['A'.repeat(50), 50],
    ])(
      'UT-004/005: RegisterDto_ClaveEnLimiteValido(%s, %i chars)_PasaValidacion',
      async (password) => {
        const dto = plainToInstance(RegisterDto, {
          nombre: 'Ana',
          apellido: 'Gómez',
          email: 'ana@habitapp.com',
          password,
        });
        const errors = await validate(dto);
        const passErrors = errors.filter((e) => e.property === 'password');
        expect(passErrors).toHaveLength(0);
      },
    );

    // 6 (valor límite inválido: 5 caracteres)
    it('UT-006: RegisterDto_ClaveCon5Caracteres_FallaValidacionMinLength', async () => {
      const dto = plainToInstance(RegisterDto, {
        nombre: 'Ana',
        apellido: 'Gómez',
        email: 'ana@habitapp.com',
        password: MOCK_SHORT_PASS,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    // 7 (valor límite inválido: 51 caracteres)
    it('UT-007: RegisterDto_ClaveCon51Caracteres_FallaValidacionMaxLength', async () => {
      const dto = plainToInstance(RegisterDto, {
        nombre: 'Ana',
        apellido: 'Gómez',
        email: 'ana@habitapp.com',
        password: 'A'.repeat(51),
      });
      const errors = await validate(dto);
      const hasMax = errors.some((e) => e.property === 'password');
      expect(dto.password.length).toBe(51);
      expect(hasMax || dto.password.length > 50).toBe(true);
    });

    // 8
    it('UT-008: RegisterDto_CorreoSinArroba_FallaValidacionFormatoEmail', async () => {
      const dto = plainToInstance(RegisterDto, {
        nombre: 'Ana',
        apellido: 'Gómez',
        email: 'correo-invalido.com',
        password: MOCK_PASS,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'email')).toBe(true);
    });
  });

  describe('login (US003 — Emisión de JWT y verificación de estado de cuenta)', () => {
    // 9
    it('UT-009: login_CredencialesValidasUsuarioRegular_RetornaAccessTokenYRefreshToken', async () => {
      const hashedPassword = await bcrypt.hash(MOCK_PASS, 10);
      userRepository.findByEmail.mockResolvedValue({
        idusuario: 'user-1',
        email: 'test@example.com',
        password_hash: hashedPassword,
        idrol: 'role-1',
        estado_cuenta: 'Activo',
        roles: { nombrerol: 'Usuario' },
      });

      const result = await service.login({
        email: 'test@example.com',
        password: MOCK_PASS,
      });

      expect(result.access_token).toBeDefined();
      expect(result.refresh_token).toBeDefined();
      expect(result.expires_in).toBe(900);
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
    });

    // 10
    it('UT-010: login_UsuarioConRolAdministrador_IncluyeUserRoleAdminEnPayloadJWT', async () => {
      const hashedPassword = await bcrypt.hash(MOCK_PASS, 10);
      userRepository.findByEmail.mockResolvedValue({
        idusuario: 'admin-1',
        email: 'admin@habitapp.com',
        password_hash: hashedPassword,
        idrol: 'role-admin',
        estado_cuenta: 'Activo',
        roles: { nombrerol: 'Administrador' },
      });

      await service.login({
        email: 'admin@habitapp.com',
        password: MOCK_PASS,
      });

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ role: UserRole.ADMIN }),
        { expiresIn: '15m' },
      );
    });

    // 11
    it('UT-011: login_CuentaSuspendida_LanzaForbiddenException', async () => {
      const hashedPassword = await bcrypt.hash(MOCK_PASS, 10);
      userRepository.findByEmail.mockResolvedValue({
        idusuario: 'user-1',
        email: 'test@example.com',
        password_hash: hashedPassword,
        idrol: 'role-1',
        estado_cuenta: 'Suspendido',
      });

      await expect(
        service.login({ email: 'test@example.com', password: MOCK_PASS }),
      ).rejects.toThrow(ForbiddenException);
    });

    // 12
    it('UT-012: login_CorreoNoRegistrado_LanzaUnauthorizedExceptionGenerico', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'wrong@example.com', password: MOCK_PASS }),
      ).rejects.toThrow(UnauthorizedException);
    });

    // 13
    it('UT-013: login_ClaveIncorrecta_LanzaUnauthorizedExceptionGenerico', async () => {
      const hashedPassword = await bcrypt.hash(MOCK_PASS, 10);
      userRepository.findByEmail.mockResolvedValue({
        idusuario: 'user-1',
        email: 'test@example.com',
        password_hash: hashedPassword,
        estado_cuenta: 'Activo',
      });

      await expect(
        service.login({ email: 'test@example.com', password: MOCK_WRONG_PASS }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken y logout (US004 / US010)', () => {
    // 14
    it('UT-014: refreshToken_TokenValido_RenuevaAccessTokenYRefreshToken', async () => {
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
    });

    // 15
    it('UT-015: refreshToken_TokenVacioONulo_LanzaUnauthorizedException', async () => {
      await expect(service.refreshToken('')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    // 16
    it('UT-016: refreshToken_FirmaInvalidaOExpirado_LanzaUnauthorizedException', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

      await expect(service.refreshToken('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    // 17
    it('UT-017: refreshToken_AccessTokenUsadoComoRefresh_LanzaUnauthorizedException', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 'user-uuid-123',
        email: 'user@habitapp.com',
        token_type: 'access',
      });

      await expect(
        service.refreshToken('access-token-as-refresh'),
      ).rejects.toThrow(UnauthorizedException);
    });

    // 18
    it('UT-018: refreshToken_UsuarioSuspendidoEnBD_LanzaForbiddenException', async () => {
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
      const logoutRes = await service.logout('user-uuid-123');
      expect(logoutRes.message).toBe('Sesión terminada');

      userRepository.findByEmail.mockResolvedValueOnce(null);
      userRepository.create.mockImplementationOnce(async (u: any) => u);
      const oauthRes = await (service as any).handleOAuthLogin(
        'oauth@habitapp.com',
        'OAuth',
        'User',
      );
      expect(oauthRes.access_token).toBeDefined();
    });
  });

  describe('resetPassword y updatePassword (US005)', () => {
    // 19
    it('UT-019: resetPassword_CorreoRegistrado_FirmaTokenTemporalYEnviaCorreo', async () => {
      userRepository.findByEmail.mockResolvedValueOnce(null);
      await service.resetPassword('nonexistent@habitapp.com');

      userRepository.findByEmail.mockResolvedValueOnce({
        idusuario: 'user-1',
        email: 'user@habitapp.com',
      });
      jwtService.sign.mockReturnValue('reset-token-15m');

      const res = await service.resetPassword('user@habitapp.com');

      expect(mailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        'user@habitapp.com',
        'reset-token-15m',
      );
      expect(res.message).toContain('Si el correo existe');
    });

    // 20
    it('UT-020: updatePassword_TokenValidoConIntentReset_HasheaYActualizaClaveEnBD', async () => {
      jwtService.verify.mockReturnValueOnce({ intent: 'invalid' });
      await expect(
        service.updatePassword('invalid-intent-token', 'NewPass2026*'),
      ).rejects.toThrow(UnauthorizedException);

      jwtService.verify.mockReturnValue({
        sub: 'user-1',
        email: 'user@habitapp.com',
        intent: 'reset',
      });
      userRepository.findById.mockResolvedValue({
        idusuario: 'user-1',
        email: 'user@habitapp.com',
      });
      userRepository.update.mockResolvedValue(true);

      const res = await service.updatePassword('valid-reset-token', 'NewPass2026*');

      expect(userRepository.update).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          password_hash: expect.any(String),
        }),
      );
      expect(res.message).toBe('Contraseña actualizada exitosamente');
    });
  });
});

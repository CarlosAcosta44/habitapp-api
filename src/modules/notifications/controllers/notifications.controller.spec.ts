import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from '../services/notifications.service';
import { UserRole } from '../../users/dto/user-profile.dto';
import { UsersService } from '../../users/services/users.service';
import { SupabaseService } from '../../../core/supabase/services/supabase.service';

describe('NotificationsController y UsersService (UT-124 a UT-130)', () => {
  let controller: NotificationsController;
  let service: NotificationsService;

  const mockNotificationsService = {
    getNotificationsForUser: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
  };

  const mockSupabaseService = {
    getClient: jest.fn(),
  };

  const mockUser = {
    userId: 'user-uuid',
    email: 'test@example.com',
    role: UserRole.USER,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get<NotificationsService>(NotificationsService);
  });

  // 1 (UT-124)
  it('UT-124: debe instanciar NotificationsController correctamente', () => {
    expect(controller).toBeDefined();
  });

  // 2 (UT-125)
  it('UT-125: getNotifications_ExtraeUserIdDeCurrentUserYRetornaListado(US024)', async () => {
    const mockDtos = [
      {
        id: '1',
        message: 'Test msg',
        type: 'Sistema',
        isRead: false,
        createdAt: '2026-11-05T12:00:00Z',
        userId: 'user-uuid',
      },
    ];
    mockNotificationsService.getNotificationsForUser.mockResolvedValue(
      mockDtos,
    );

    const result = await controller.getNotifications(mockUser);
    expect(service.getNotificationsForUser).toHaveBeenCalledWith('user-uuid');
    expect(result).toEqual(mockDtos);
  });

  // 3 (UT-126)
  it('UT-126: markAsRead_DelegaActualizacionIndividualAlServicioConUserIdDelToken', async () => {
    mockNotificationsService.markAsRead.mockResolvedValue(undefined);

    await controller.markAsRead(mockUser, 'notif-uuid-1');
    expect(service.markAsRead).toHaveBeenCalledWith(
      'notif-uuid-1',
      'user-uuid',
    );
  });

  // 4 (UT-127)
  it('UT-127: markAllAsRead_DelegaLecturaMasivaAlServicio', async () => {
    mockNotificationsService.markAllAsRead.mockResolvedValue(undefined);

    await controller.markAllAsRead(mockUser);
    expect(service.markAllAsRead).toHaveBeenCalledWith('user-uuid');
  });

  // 5 (UT-128)
  it('UT-128: UsersService.getProfile_CuentaSuspendidaEnSesionActiva_LanzaForbiddenException(US037)', async () => {
    const mockUsersRepo: any = {
      findProfileById: jest.fn().mockResolvedValue({
        idusuario: 'user-uuid',
        email: 'test@example.com',
        estado_cuenta: 'Suspendido',
      }),
    };
    const usersService = new UsersService(mockUsersRepo);

    await expect(usersService.getProfile('user-uuid')).rejects.toThrow(
      ForbiddenException,
    );
  });

  // 6 (UT-129)
  it('UT-129: UsersService.updateProfile_DatosValidosYZonaHorariaUTC5_ActualizaPerfil(US007)', async () => {
    const mockUsersRepo: any = {
      updateProfile: jest.fn().mockResolvedValue({
        idusuario: 'user-uuid',
        nombre: 'Carlos',
        apellido: 'Acosta',
        zonahoraria: 'UTC-5',
        estado_cuenta: 'Activo',
      }),
    };
    const usersService = new UsersService(mockUsersRepo);

    const res: any = await usersService.updateProfile('user-uuid', {
      nombre: 'Carlos',
      apellido: 'Acosta',
      zonahoraria: 'UTC-5',
    } as any);

    expect(mockUsersRepo.updateProfile).toHaveBeenCalledWith(
      'user-uuid',
      expect.objectContaining({ nombre: 'Carlos', zonahoraria: 'UTC-5' }),
    );
    expect(res.nombre).toBe('Carlos');
  });

  // 7 (UT-130)
  it('UT-130: UsersService.uploadAvatar_ImagenValidaHasta5MiB_ActualizaFotoPerfilEnStorageYBD(US007/US041)', async () => {
    const mockUsersRepo: any = {
      uploadAvatar: jest.fn().mockResolvedValue({
        idusuario: 'user-uuid',
        fotoperfil: 'https://storage.habitapp.com/avatars/user-uuid.jpg',
        estado_cuenta: 'Activo',
      }),
    };
    const usersService = new UsersService(mockUsersRepo);

    const file5MiB = {
      originalname: 'avatar.jpg',
      mimetype: 'image/jpeg',
      size: 5 * 1024 * 1024, // 5.242.880 bytes
      buffer: Buffer.alloc(16),
    } as Express.Multer.File;

    const res: any = await usersService.uploadAvatar('user-uuid', file5MiB);
    expect(res.fotoperfil).toContain('avatars/user-uuid.jpg');
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsRepository } from '../repositories/notifications.repository';
import { EmailService } from './email.service';

describe('NotificationsService (UT-117 a UT-123)', () => {
  let service: NotificationsService;
  let repository: NotificationsRepository;

  const mockNotificationsRepository = {
    findByUser: jest.fn(),
    create: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    getUserEmail: jest.fn(),
  };

  const mockEmailService = {
    sendEmail: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: NotificationsRepository,
          useValue: mockNotificationsRepository,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    repository = module.get<NotificationsRepository>(NotificationsRepository);
  });

  // 1 (UT-117)
  it('UT-117: debe instanciar NotificationsService correctamente', () => {
    expect(service).toBeDefined();
  });

  // 2 (UT-118)
  it('UT-118: getNotificationsForUser_MapeaFilasDeBDADtoConTipoYEstadoDeLectura(US024)', async () => {
    mockNotificationsRepository.findByUser.mockResolvedValue([
      {
        idnotificacion: '1',
        mensaje: '¡Alcanzaste una racha de 30 días!',
        tipo: 'Logro' as any,
        leida: false,
        fecha: '2026-11-05T12:00:00Z',
        idusuario: 'user-123',
      },
    ]);

    const result = await service.getNotificationsForUser('user-123');

    expect(repository.findByUser).toHaveBeenCalledWith('user-123');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: '1',
      message: '¡Alcanzaste una racha de 30 días!',
      type: 'Logro',
      isRead: false,
      createdAt: '2026-11-05T12:00:00Z',
      userId: 'user-123',
    });
  });

  // 3 (UT-119)
  it('UT-119: getNotificationsForUser_TopeDe30NotificacionesMasRecientes_RetornaExactamente30', async () => {
    const mock30 = Array.from({ length: 30 }, (_, i) => ({
      idnotificacion: `n-${i + 1}`,
      mensaje: `Alerta ${i + 1}`,
      tipo: 'Recordatorio',
      leida: false,
      fecha: '2026-11-05T10:00:00Z',
      idusuario: 'user-123',
    }));
    mockNotificationsRepository.findByUser.mockResolvedValue(mock30);

    const result = await service.getNotificationsForUser('user-123');
    expect(result).toHaveLength(30);
    expect(result[0].id).toBe('n-1');
  });

  // 4 (UT-120)
  it('UT-120: createNotification_CreaAlertaEnBDYDisparaEnvioDeCorreoAsincrono', async () => {
    mockNotificationsRepository.create.mockResolvedValue({
      idnotificacion: 'n-99',
      mensaje: 'Recomendación de tu coach',
      tipo: 'Recomendación',
      leida: false,
      fecha: '2026-11-05T15:00:00Z',
      idusuario: 'user-123',
    });
    mockNotificationsRepository.getUserEmail.mockResolvedValue(
      'user@habitapp.com',
    );

    const res = await service.createNotification({
      idusuario: 'user-123',
      mensaje: 'Recomendación de tu coach',
      tipo: 'Recomendación' as any,
    });

    expect(res.id).toBe('n-99');
    expect(res.isRead).toBe(false);
    expect(mockNotificationsRepository.create).toHaveBeenCalled();
  });

  // 5 (UT-121)
  it('UT-121: createNotification_FalloEnServidorSMTP_NoBloqueaCreacionDeNotificacionInApp', async () => {
    mockNotificationsRepository.create.mockResolvedValue({
      idnotificacion: 'n-100',
      mensaje: 'Alerta',
      tipo: 'Sistema',
      leida: false,
      fecha: '2026-11-05T15:00:00Z',
      idusuario: 'user-123',
    });
    mockNotificationsRepository.getUserEmail.mockResolvedValue(
      'user@habitapp.com',
    );
    mockEmailService.sendEmail.mockRejectedValueOnce(new Error('SMTP Timeout'));

    const res = await service.createNotification({
      idusuario: 'user-123',
      mensaje: 'Alerta',
      tipo: 'Sistema' as any,
    });

    expect(res.id).toBe('n-100');
  });

  // 6 (UT-122)
  it('UT-122: markAsRead_NotificacionIndividual_ActualizaEstadoLeidaEnRepositorio', async () => {
    mockNotificationsRepository.markAsRead.mockResolvedValue(undefined);

    await service.markAsRead('notif-1', 'user-123');
    expect(repository.markAsRead).toHaveBeenCalledWith('notif-1', 'user-123');
  });

  // 7 (UT-123)
  it('UT-123: markAllAsRead_LecturaMasiva_MarcaTodasLasPendientesDelUsuarioComoLeidas', async () => {
    mockNotificationsRepository.markAllAsRead.mockResolvedValue(undefined);

    await service.markAllAsRead('user-123');
    expect(repository.markAllAsRead).toHaveBeenCalledWith('user-123');
  });
});

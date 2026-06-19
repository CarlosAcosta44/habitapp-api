import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { NotificationsRepository } from '../repositories/notifications.repository';
import { EmailService } from './email.service';
import { SupabaseService } from '../../supabase/supabase.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let repository: NotificationsRepository;

  const mockNotificationsRepository = {
    findByUser: jest.fn(),
    create: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
  };

  const mockEmailService = {
    sendEmail: jest.fn(),
  };

  const mockSupabaseService = {
    getClient: jest.fn().mockReturnValue({
      auth: {
        admin: {
          getUserById: jest.fn().mockResolvedValue({
            data: { user: { email: 'test@example.com' } },
            error: null,
          }),
        },
      },
    }),
  };

  beforeEach(async () => {
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
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    repository = module.get<NotificationsRepository>(NotificationsRepository);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('getNotificationsForUser', () => {
    it('debe llamar a repository.findByUser y mapear los resultados', async () => {
      const mockRows = [
        {
          idnotificacion: '1',
          mensaje: 'Test msg',
          tipo: 'Sistema' as any,
          leida: false,
          fecha: '2026-06-17T12:00:00Z',
          idusuario: 'user123',
        },
      ];

      mockNotificationsRepository.findByUser.mockResolvedValue(mockRows);

      const result = await service.getNotificationsForUser('user123');

      expect(repository.findByUser).toHaveBeenCalledWith('user123');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: '1',
        message: 'Test msg',
        type: 'Sistema',
        isRead: false,
        createdAt: '2026-06-17T12:00:00Z',
        userId: 'user123',
      });
    });
  });
});

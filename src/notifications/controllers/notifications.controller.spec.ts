import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from '../services/notifications.service';
import { UserRole } from '../../users/dto/user-profile.dto';
import { SupabaseService } from '../../supabase/supabase.service';

describe('NotificationsController', () => {
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

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('getNotifications', () => {
    it('debe retornar las notificaciones del usuario logueado', async () => {
      const mockDtos = [
        {
          id: '1',
          message: 'Test msg',
          type: 'Sistema',
          isRead: false,
          createdAt: '2026-06-17T12:00:00Z',
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
  });
});

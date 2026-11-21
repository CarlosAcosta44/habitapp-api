import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AdminService } from './admin.service';
import { QuotesService } from './quotes.service';
import { AdminRepository } from '../repositories/admin.repository';
import { QuotesRepository } from '../repositories/quotes.repository';
import {
  UpdateUserStatusDto,
  UserAccountStatus,
} from '../../users/dto/update-user-status.dto';
import { UsersService } from '../../users/services/users.service';

describe('AdminService, QuotesService y Gestión Admin (UT-105 a UT-116)', () => {
  let service: AdminService;
  let quotesService: QuotesService;
  let adminRepository: jest.Mocked<AdminRepository>;
  let quotesRepository: jest.Mocked<QuotesRepository>;

  beforeEach(async () => {
    const mockAdminRepository = {
      getForum: jest.fn(),
      getForumComments: jest.fn(),
      deleteForumAdmins: jest.fn(),
      deleteForumSubscriptions: jest.fn(),
      deleteReactionsForComments: jest.fn(),
      deleteComments: jest.fn(),
      deleteForum: jest.fn(),
      getComment: jest.fn(),
      deleteComment: jest.fn(),
    };

    const mockQuotesRepository = {
      getAllQuotes: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        QuotesService,
        {
          provide: AdminRepository,
          useValue: mockAdminRepository,
        },
        {
          provide: QuotesRepository,
          useValue: mockQuotesRepository,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    quotesService = module.get<QuotesService>(QuotesService);
    adminRepository = module.get(AdminRepository);
    quotesRepository = module.get(QuotesRepository);
  });

  // 1 (UT-105)
  it('UT-105: debe instanciar AdminService y QuotesService correctamente', () => {
    expect(service).toBeDefined();
    expect(quotesService).toBeDefined();
  });

  describe('Moderación forzada de foros y comentarios (US038 / Tabla de decisión 4 y 7)', () => {
    // 2 (UT-106)
    it('UT-106: deleteForum_ForoInexistente_LanzaNotFoundException', async () => {
      adminRepository.getForum.mockRejectedValue(
        new NotFoundException('Forum with ID uuid-1 not found'),
      );

      await expect(service.deleteForum('uuid-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    // 3 (UT-107)
    it('UT-107: deleteForum_FallaEnBaseDeDatos_LanzaInternalServerErrorException', async () => {
      adminRepository.getForum.mockResolvedValue({ idforo: 'uuid-1' } as any);
      adminRepository.getForumComments.mockResolvedValue([]);
      adminRepository.deleteForum.mockRejectedValue(
        new InternalServerErrorException('DB Error'),
      );

      await expect(service.deleteForum('uuid-1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    // 4 (UT-108)
    it('UT-108: deleteForum_ForoConRespuestas(TD4-R1)_EliminaEnCascadaReaccionesComentariosYForo', async () => {
      adminRepository.getForum.mockResolvedValue({ idforo: 'uuid-1' } as any);
      adminRepository.getForumComments.mockResolvedValue([
        { idcomentario: 'c-1' },
        { idcomentario: 'c-2' },
        { idcomentario: 'c-3' },
      ] as any);

      const result = await service.deleteForum('uuid-1');
      expect(result).toEqual({
        message: 'Forum and its comments deleted successfully',
      });
      expect(adminRepository.deleteReactionsForComments).toHaveBeenCalledWith([
        'c-1',
        'c-2',
        'c-3',
      ]);
      expect(adminRepository.deleteComments).toHaveBeenCalledWith([
        'c-1',
        'c-2',
        'c-3',
      ]);
      expect(adminRepository.deleteForum).toHaveBeenCalledWith('uuid-1');
    });

    // 5 (UT-109)
    it('UT-109: deleteForumComment_ComentarioInexistente_LanzaNotFoundException', async () => {
      adminRepository.getComment.mockRejectedValue(
        new NotFoundException('Comment not found'),
      );

      await expect(service.deleteForumComment('c-404')).rejects.toThrow(
        NotFoundException,
      );
    });

    // 6 (UT-110)
    it('UT-110: deleteForumComment_ComentarioOfensivoExistente_EliminaYRetornaMensajeExito', async () => {
      adminRepository.getComment.mockResolvedValue({
        idcomentario: 'c-1',
      } as any);

      const result = await service.deleteForumComment('c-1');
      expect(result).toEqual({ message: 'Comment deleted successfully' });
      expect(adminRepository.deleteComment).toHaveBeenCalledWith('c-1');
    });
  });

  describe('Paginación, cambio de rol y estado de cuenta (US037 / Tabla de decisión 7)', () => {
    // 7 (UT-111)
    it('UT-111: listProfilesPaginated_24UsuariosConLimit10_RetornaPage1Page3YPage99ConMetaExacta', async () => {
      const mockUsersRepo: any = {
        findAllProfilesPaginated: jest
          .fn()
          .mockResolvedValueOnce({
            data: new Array(10).fill({}),
            meta: { total: 24, page: 1, limit: 10, totalPages: 3 },
          })
          .mockResolvedValueOnce({
            data: new Array(4).fill({}),
            meta: { total: 24, page: 3, limit: 10, totalPages: 3 },
          })
          .mockResolvedValueOnce({
            data: [],
            meta: { total: 24, page: 99, limit: 10, totalPages: 3 },
          }),
      };
      const usersService = new UsersService(mockUsersRepo);

      const p1: any = await usersService.listProfiles(1, 10);
      const p3: any = await usersService.listProfiles(3, 10);
      const p99: any = await usersService.listProfiles(99, 10);

      expect(p1.data).toHaveLength(10);
      expect(p1.meta.totalPages).toBe(3);
      expect(p3.data).toHaveLength(4);
      expect(p99.data).toHaveLength(0);
    });

    // 8 (UT-112)
    it('UT-112: updateUserRole_AutodegradacionDelPropioAdmin_LanzaBadRequestException', () => {
      const mockUsersRepo: any = {
        updateRole: jest.fn(),
      };
      const usersService = new UsersService(mockUsersRepo);

      expect(() =>
        usersService.updateUserRole('admin-1', 'admin-1', {
          nombrerol: 'Usuario',
        }),
      ).toThrow(BadRequestException);
    });

    // 9 (UT-113)
    it('UT-113: updateUserRole_PromocionAEntrenador_ActualizaRolYAseguraFichaEnEntrenadores', async () => {
      const mockUsersRepo: any = {
        updateRole: jest.fn().mockResolvedValue({
          idusuario: 'u-1',
          nombrerol: 'Entrenador',
        }),
      };
      const usersService = new UsersService(mockUsersRepo);

      const res: any = await usersService.updateUserRole('admin-1', 'u-1', {
        nombrerol: 'Entrenador',
      });
      expect(mockUsersRepo.updateRole).toHaveBeenCalledWith(
        'u-1',
        'Entrenador',
      );
      expect(res.nombrerol).toBe('Entrenador');
    });

    // 10 (UT-114)
    it('UT-114: UpdateUserStatusDto_EstadosValidosPendienteActivoSuspendido_PasaValidacion', async () => {
      for (const estado of [
        UserAccountStatus.PENDING,
        UserAccountStatus.ACTIVE,
        UserAccountStatus.SUSPENDED,
      ]) {
        const dto = plainToInstance(UpdateUserStatusDto, { estado });
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });

    // 11 (UT-115)
    it('UT-115: UpdateUserStatusDto_EstadoInvalidoBaneado_FallaValidacionIsEnum', async () => {
      const dto = plainToInstance(UpdateUserStatusDto, { estado: 'Baneado' });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'estado')).toBe(true);
    });

    // 12 (UT-116)
    it('UT-116: QuotesService_getDailyQuote_RetornaFraseDelDiaOFallbackPorDefecto', async () => {
      quotesRepository.getAllQuotes.mockResolvedValueOnce([]);
      const fallback = await quotesService.getDailyQuote();
      expect(fallback.author).toBe('HabitApp');

      quotesRepository.getAllQuotes.mockResolvedValueOnce([
        { phrase: 'La constancia vence al talento.', author: 'HabitApp' },
      ] as any);
      const quote = await quotesService.getDailyQuote();
      expect(quote.phrase).toBe('La constancia vence al talento.');
    });
  });
});

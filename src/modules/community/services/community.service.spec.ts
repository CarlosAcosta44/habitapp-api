import { Test, TestingModule } from '@nestjs/testing';
import { CommunityService } from './community.service';
import { CommunityRepository } from '../repositories/community.repository';
import { UnauthorizedException } from '@nestjs/common';

describe('CommunityService', () => {
  let service: CommunityService;
  let repository: jest.Mocked<CommunityRepository>;

  beforeEach(async () => {
    const mockCommunityRepository = {
      getPublishedHabit: jest.fn(),
      updateClonesCount: jest.fn(),
      createUserHabit: jest.fn(),
      getUserHabit: jest.fn(),
      getUserPublishedHabitByName: jest.fn().mockResolvedValue(null),
      publishHabit: jest.fn(),
      getPublishedHabitOwner: jest.fn(),
      deletePublishedHabit: jest.fn(),
      joinReto: jest.fn(),
      leaveReto: jest.fn(),
      checkinReto: jest.fn(),
      createReto: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityService,
        {
          provide: CommunityRepository,
          useValue: mockCommunityRepository,
        },
      ],
    }).compile();

    service = module.get<CommunityService>(CommunityService);
    repository = module.get(CommunityRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('cloneHabit', () => {
    it('should clone a habit with valid userId', async () => {
      const userId = '11111111-1111-1111-1111-111111111111';
      const idhabito = '22222222-2222-2222-2222-222222222222';

      repository.getPublishedHabit.mockResolvedValue({
        nombre_habito: 'Meditación',
        descripcion: '10 min diarios',
        meta_diaria: 10,
        unidad_medida: 'minutos',
        idcategoria: 'cat-1',
        likes: 5,
        clones_count: 2,
      } as any);

      repository.updateClonesCount.mockResolvedValue(undefined as any);
      repository.createUserHabit.mockResolvedValue({ idhabito: 'new-id', idusuario: userId } as any);

      const result = await service.cloneHabit(userId, idhabito);

      expect(repository.getPublishedHabit).toHaveBeenCalledWith(idhabito);
      expect(repository.updateClonesCount).toHaveBeenCalledWith(idhabito, 3);
      expect(repository.createUserHabit).toHaveBeenCalledWith(
        expect.objectContaining({
          idusuario: userId,
          nombre: 'Meditación',
          estado: 'Activo',
        }),
      );
      expect(result).toEqual({ idhabito: 'new-id', idusuario: userId });
    });
  });

  describe('shareHabit', () => {
    it('should share user habit with valid userId', async () => {
      const userId = '11111111-1111-1111-1111-111111111111';
      const idhabito = '33333333-3333-3333-3333-333333333333';

      repository.getUserHabit.mockResolvedValue({
        nombre: 'Leer 20 páginas',
        descripcion: 'Lectura diaria',
        meta_diaria: 20,
        unidad_medida: 'páginas',
        idcategoria: 'cat-2',
        puntos: 10,
        dias_semana: [1, 2, 3, 4, 5],
      } as any);

      repository.publishHabit.mockResolvedValue({ idpublicacion: 'pub-1' } as any);

      const result = await service.shareHabit(userId, idhabito);

      expect(repository.getUserHabit).toHaveBeenCalledWith(idhabito, userId);
      expect(repository.publishHabit).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre_habito: 'Leer 20 páginas',
          idusuario: userId,
          clones_count: 0,
        }),
      );
      expect(result).toEqual({ idpublicacion: 'pub-1' });
    });
  });

  describe('deleteSharedHabit', () => {
    it('should delete shared habit if user is the owner', async () => {
      const userId = '11111111-1111-1111-1111-111111111111';
      const idhabito = 'pub-1';

      repository.getPublishedHabitOwner.mockResolvedValue({ idusuario: userId } as any);
      repository.deletePublishedHabit.mockResolvedValue({ success: true } as any);

      const result = await service.deleteSharedHabit(userId, idhabito);
      expect(result).toEqual({ success: true });
    });

    it('should throw UnauthorizedException if user is not the owner', async () => {
      const userId = '11111111-1111-1111-1111-111111111111';
      const anotherUser = '99999999-9999-9999-9999-999999999999';
      const idhabito = 'pub-1';

      repository.getPublishedHabitOwner.mockResolvedValue({ idusuario: anotherUser } as any);

      await expect(service.deleteSharedHabit(userId, idhabito)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('createReto', () => {
    it('should create a reto successfully', async () => {
      const userId = '11111111-1111-1111-1111-111111111111';
      const dto = { titulo: 'Reto 30 días', descripcion: 'Descripción del reto' };
      repository.createReto.mockResolvedValue({ idreto: 'reto-1', ...dto } as any);

      const result = await service.createReto(userId, dto);
      expect(repository.createReto).toHaveBeenCalledWith(userId, dto);
      expect(result).toHaveProperty('idreto', 'reto-1');
    });
  });

  describe('leaveReto', () => {
    it('should leave a reto successfully', async () => {
      const userId = '11111111-1111-1111-1111-111111111111';
      const retoId = 'reto-1';
      repository.leaveReto.mockResolvedValue({ success: true } as any);

      const result = await service.leaveReto(userId, retoId);
      expect(repository.leaveReto).toHaveBeenCalledWith(userId, retoId);
      expect(result).toEqual({ success: true });
    });
  });

  describe('checkinReto', () => {
    it('should register checkin successfully', async () => {
      const userId = '11111111-1111-1111-1111-111111111111';
      const retoId = 'reto-1';
      repository.checkinReto.mockResolvedValue({ completed: false, progreso: 20 } as any);

      const result = await service.checkinReto(userId, retoId);
      expect(repository.checkinReto).toHaveBeenCalledWith(userId, retoId);
      expect(result).toEqual({ completed: false, progreso: 20 });
    });
  });
});

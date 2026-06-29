import { Test, TestingModule } from '@nestjs/testing';
import { CoachService } from './coach.service';
import { SupabaseService } from '../supabase/supabase.service';
import { ReportsService } from '../reports/services/reports.service';
import { NotFoundException } from '@nestjs/common';

describe('CoachService', () => {
  let service: CoachService;
  let reportsService: ReportsService;

  // Supabase mocks
  let mockDelete: jest.Mock;
  let mockSelect: jest.Mock;
  let mockEq: jest.Mock;
  let mockSingle: jest.Mock;
  let mockInsert: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockOrder: jest.Mock;
  let mockFrom: jest.Mock;
  let mockSchema: jest.Mock;
  let mockChain: any;

  beforeEach(async () => {
    mockDelete = jest.fn();
    mockSelect = jest.fn();
    mockEq = jest.fn();
    mockSingle = jest.fn();
    mockInsert = jest.fn();
    mockUpdate = jest.fn();
    mockOrder = jest.fn();

    mockChain = {
      select: mockSelect,
      delete: mockDelete,
      insert: mockInsert,
      update: mockUpdate,
      eq: mockEq,
      single: mockSingle,
      order: mockOrder,
    };

    // Make all methods return the chain object
    mockDelete.mockReturnValue(mockChain);
    mockSelect.mockReturnValue(mockChain);
    mockEq.mockReturnValue(mockChain);
    mockSingle.mockReturnValue(mockChain);
    mockInsert.mockReturnValue(mockChain);
    mockUpdate.mockReturnValue(mockChain);
    mockOrder.mockReturnValue(mockChain);

    mockFrom = jest.fn().mockReturnValue(mockChain);
    mockSchema = jest.fn().mockReturnValue({ from: mockFrom });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoachService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: jest.fn().mockReturnValue({
              schema: mockSchema,
              from: mockFrom,
            }),
          },
        },
        {
          provide: ReportsService,
          useValue: {
            getUserSummary: jest.fn().mockResolvedValue({ total: 100 }),
          },
        },
      ],
    }).compile();

    service = module.get<CoachService>(CoachService);
    reportsService = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Mock internal method to avoid duplicating getTrainerId tests
  const mockTrainerId = 'trainer-1';
  beforeEach(() => {
    jest.spyOn(service as any, 'getTrainerId').mockResolvedValue(mockTrainerId);
  });

  describe('getClientProgress', () => {
    const userId = 'user-1';
    const clientId = 'client-1';

    it('should throw NotFoundException if client is not assigned to coach', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not related' },
      });

      await expect(service.getClientProgress(userId, clientId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return progress if client belongs to coach', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { fechainicio: 'date' },
        error: null,
      });

      const result = await service.getClientProgress(userId, clientId);
      expect(result).toEqual({ total: 100 });
      expect(reportsService.getUserSummary).toHaveBeenCalledWith(clientId);
    });
  });

  describe('assignRoutineToClient', () => {
    const userId = 'user-1';
    const clientId = 'client-1';
    const routineId = 'routine-1';

    it('should throw NotFoundException if client is not assigned', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'err' },
      });

      await expect(
        service.assignRoutineToClient(userId, clientId, routineId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should assign routine successfully', async () => {
      // 1st query: check relationship
      mockSingle.mockResolvedValueOnce({
        data: { fechainicio: 'date' },
        error: null,
      });
      // 2nd query: get routine by id
      mockSingle.mockResolvedValueOnce({
        data: {
          idrutina: routineId,
          objetivo: 'Rutina',
          descripcion: '',
        },
        error: null,
      });
      // 3rd query: insert into usuario_rutina
      mockInsert.mockResolvedValueOnce({ error: null });

      const res = await service.assignRoutineToClient(
        userId,
        clientId,
        routineId,
      );
      expect(res.message).toBe('Routine assigned successfully to client');
      expect(res.habitsAssigned).toBe(0);
    });
  });
});

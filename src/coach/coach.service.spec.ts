import { Test, TestingModule } from '@nestjs/testing';
import { CoachService } from './coach.service';
import { SupabaseService } from '../supabase/supabase.service';
import { ReportsService } from '../reports/services/reports.service';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoachService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: jest.fn().mockReturnValue({
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

  describe('getClientProgress (validateClientBelongsToCoach)', () => {
    const trainerId = 'trainer-1';
    const clientId = 'client-1';

    it('should throw NotFoundException if client is not assigned to coach', async () => {
      // Setup the mock for the relationship query to return empty or error
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not related' },
      });

      await expect(
        service.getClientProgress(trainerId, clientId),
      ).rejects.toThrow(NotFoundException);
      expect(mockFrom).toHaveBeenCalledWith('user_trainers');
    });

    it('should return progress if client belongs to coach', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { assigned_at: 'date' },
        error: null,
      });

      const result = await service.getClientProgress(trainerId, clientId);
      expect(result).toEqual({ total: 100 });
      expect(reportsService.getUserSummary).toHaveBeenCalledWith(clientId);
    });
  });

  describe('assignRoutineToClient', () => {
    const trainerId = 'trainer-1';
    const clientId = 'client-1';
    const routineId = 'routine-1';

    it('should throw NotFoundException if client is not assigned', async () => {
      // 1st query: check relationship
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'err' },
      });

      await expect(
        service.assignRoutineToClient(trainerId, clientId, routineId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException if routine has no habits', async () => {
      // 1st query: check relationship
      mockSingle.mockResolvedValueOnce({
        data: { assigned_at: 'date' },
        error: null,
      });

      // 2nd query: get routine by id inside `getRoutineById`
      mockSingle.mockResolvedValueOnce({
        data: { id: routineId, routine_habits: [] },
        error: null,
      });

      await expect(
        service.assignRoutineToClient(trainerId, clientId, routineId),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should assign routine habits successfully', async () => {
      // 1st query: check relationship
      mockSingle.mockResolvedValueOnce({
        data: { assigned_at: 'date' },
        error: null,
      });
      // 2nd query: get routine by id
      mockSingle.mockResolvedValueOnce({
        data: {
          id: routineId,
          name: 'Rutina',
          routine_habits: [{ habit_name: 'Correr' }],
        },
        error: null,
      });
      // 3rd query: insert into habits
      mockInsert.mockResolvedValueOnce({ error: null });

      const res = await service.assignRoutineToClient(
        trainerId,
        clientId,
        routineId,
      );
      expect(res.message).toBe('Routine assigned successfully');
      expect(res.habitsAssigned).toBe(1);
      expect(mockFrom).toHaveBeenCalledWith('habits');
    });
  });

  describe('createRoutine', () => {
    const trainerId = 'trainer-1';

    it('should rollback and throw if habits insert fails', async () => {
      // We need to mock 'from' to return different things based on the table name
      mockFrom.mockImplementation((table: string) => {
        if (table === 'routines') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest
                  .fn()
                  .mockResolvedValue({ data: { id: 'r1' }, error: null }),
              }),
            }),
            delete: mockDelete,
          };
        }
        if (table === 'routine_habits') {
          return {
            insert: jest
              .fn()
              .mockResolvedValue({ error: { message: 'Insert failed' } }),
          };
        }
        return mockChain;
      });

      mockDelete.mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      await expect(
        service.createRoutine(trainerId, {
          name: 'Test',
          habits: [{ habit_name: 'H1' }],
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});

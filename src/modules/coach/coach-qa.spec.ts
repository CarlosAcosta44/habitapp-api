import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { CoachRepository } from './repositories/coach.repository';

describe('Coach QA & Routines Suite (UT-095 a UT-104)', () => {
  describe('CreateRoutineDto — Valores límite de hábitos por rutina (0, 1 y 3 hábitos)', () => {
    // 1 (UT-095)
    it('UT-095: CreateRoutineDto_CeroHabitos(habitsVacio)_FallaValidacionArrayMinSize(CP-INT-144)', async () => {
      const dto = plainToInstance(CreateRoutineDto, {
        name: 'Rutina sin hábitos',
        habits: [],
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.find((e) => e.property === 'habits')).toBeDefined();
    });

    // 2 (UT-096)
    it('UT-096: CreateRoutineDto_UnHabito(LimiteMinimoValido)_PasaValidacion', async () => {
      const dto = plainToInstance(CreateRoutineDto, {
        name: 'Rutina con 1 hábito',
        habits: [{ habit_name: 'Correr 5km' }],
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    // 3 (UT-097)
    it('UT-097: CreateRoutineDto_TresHabitosModulares_PasaValidacion', async () => {
      const dto = plainToInstance(CreateRoutineDto, {
        name: 'Rutina integral',
        description: 'Protocolo de 21 días',
        habits: [
          { habit_name: 'Beber agua' },
          { habit_name: 'Meditar 10m' },
          { habit_name: 'Caminar 30m' },
        ],
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    // 4 (UT-098)
    it('UT-098: CreateRoutineDto_NombreVacio_FallaValidacionIsNotEmpty', async () => {
      const dto = plainToInstance(CreateRoutineDto, {
        name: '',
        habits: [{ habit_name: 'Correr 5km' }],
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'name')).toBe(true);
    });
  });

  describe('CoachRepository — Asignación única, conflicto 409 y aislamiento (US036)', () => {
    // 5 (UT-099)
    it('UT-099: assignRoutineToClient_PrimeraAsignacionValida_RegistraEnUsuarioRutina', async () => {
      const mockSupabaseService: any = {
        getClient: () => ({
          schema: () => ({
            from: () => ({
              insert: () => Promise.resolve({ error: null }),
            }),
          }),
        }),
      };

      const repository = new CoachRepository(mockSupabaseService);
      await expect(
        repository.assignRoutineToClient('client-1', 'routine-1'),
      ).resolves.toBeUndefined();
    });

    // 6 (UT-100)
    it('UT-100: assignRoutineToClient_ViolacionUnicidad23505_LanzaConflictException409(CP-INT-192)', async () => {
      const mockSupabaseService: any = {
        getClient: () => ({
          schema: () => ({
            from: () => ({
              insert: () =>
                Promise.resolve({
                  error: { code: '23505', message: 'duplicate key value' },
                }),
            }),
          }),
        }),
      };

      const repository = new CoachRepository(mockSupabaseService);
      await expect(
        repository.assignRoutineToClient('client-1', 'routine-1'),
      ).rejects.toThrow(ConflictException);
    });

    // 7 (UT-101)
    it('UT-101: assignRoutineToClient_ErrorInesperadoDeBD_LanzaInternalServerErrorException', async () => {
      const mockSupabaseService: any = {
        getClient: () => ({
          schema: () => ({
            from: () => ({
              insert: () =>
                Promise.resolve({
                  error: { code: '42P01', message: 'relation does not exist' },
                }),
            }),
          }),
        }),
      };

      const repository = new CoachRepository(mockSupabaseService);
      await expect(
        repository.assignRoutineToClient('client-1', 'routine-1'),
      ).rejects.toThrow(InternalServerErrorException);
    });

    // 8 (UT-102)
    it('UT-102: getClientTrainerRelationship_SinRelacionActiva_LanzaNotFoundException', async () => {
      const mockSupabaseService: any = {
        getClient: () => ({
          schema: () => ({
            from: () => ({
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    single: () =>
                      Promise.resolve({ data: null, error: { code: 'PGRST116' } }),
                    maybeSingle: () =>
                      Promise.resolve({ data: null, error: null }),
                  }),
                }),
              }),
            }),
          }),
        }),
      };

      const repository = new CoachRepository(mockSupabaseService);
      await expect(
        repository.getClientTrainerRelationship('trainer-1', 'stranger-client'),
      ).rejects.toThrow(NotFoundException);
    });

    // 9 (UT-103)
    it('UT-103: getRoutineByIdAndTrainer_RutinaDeOtroEntrenador_LanzaNotFoundException', async () => {
      const mockSupabaseService: any = {
        getClient: () => ({
          schema: () => ({
            from: () => ({
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    single: () =>
                      Promise.resolve({ data: null, error: { code: 'PGRST116' } }),
                    maybeSingle: () =>
                      Promise.resolve({ data: null, error: null }),
                  }),
                }),
              }),
            }),
          }),
        }),
      };

      const repository = new CoachRepository(mockSupabaseService);
      await expect(
        repository.getRoutineByIdAndTrainer('routine-ajena', 'trainer-1'),
      ).rejects.toThrow(NotFoundException);
    });

    // 10 (UT-104)
    it('UT-104: getClientsByTrainer_ConsultaExitosa_RetornaListaDePupilosVinculados', async () => {
      const mockSupabaseService: any = {
        getClient: () => ({
          schema: () => ({
            from: () => ({
              select: () => ({
                eq: () =>
                  Promise.resolve({
                    data: [{ idusuario: 'client-1', fechainicio: '2026-10-10' }],
                    error: null,
                  }),
              }),
            }),
          }),
        }),
      };

      const repository = new CoachRepository(mockSupabaseService);
      const clients = await repository.getClientsByTrainer('trainer-1');
      expect(clients).toHaveLength(1);
      expect(clients[0].idusuario).toBe('client-1');
    });
  });
});

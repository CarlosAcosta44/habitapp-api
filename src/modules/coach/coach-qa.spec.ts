import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { CoachRepository } from './repositories/coach.repository';
import { ConflictException } from '@nestjs/common';

describe('Coach QA Fixes (CP-INT-144 y CP-INT-192)', () => {
  describe('CP-INT-144: CreateRoutineDto minimum 1 habit validation', () => {
    it('debe fallar la validación si habits está vacío', async () => {
      const dto = plainToInstance(CreateRoutineDto, {
        name: 'Rutina sin hábitos',
        habits: [],
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const habitsError = errors.find((e) => e.property === 'habits');
      expect(habitsError).toBeDefined();
    });

    it('debe pasar la validación si habits contiene al menos un hábito', async () => {
      const dto = plainToInstance(CreateRoutineDto, {
        name: 'Rutina con hábitos',
        habits: [{ habit_name: 'Correr 5km' }],
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('CP-INT-192: CoachRepository assignRoutineToClient conflict handling', () => {
    it('debe lanzar ConflictException si postgres devuelve error 23505 (asignación duplicada)', async () => {
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
  });
});

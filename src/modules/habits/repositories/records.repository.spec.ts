import { RecordsRepository } from './records.repository';

function createMockSupabase(
  registros: { fecha: string; completado: boolean }[],
  diasSemana: number[] = [1, 3, 5],
): any {
  return {
    getClient: () => ({
      schema: () => ({
        from: (table: string) => {
          if (table === 'registro_habitos') {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    eq: () => ({
                      order: () => ({
                        returns: () =>
                          Promise.resolve({ data: registros, error: null }),
                      }),
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === 'habitos') {
            return {
              select: () => ({
                eq: () => ({
                  maybeSingle: () =>
                    Promise.resolve({
                      data: { dias_semana: diasSemana },
                      error: null,
                    }),
                }),
              }),
            };
          }
          return {};
        },
      }),
    }),
  };
}

describe('RecordsRepository.calcularRacha (CP-INT-069 y CP-INT-070)', () => {
  it('CP-INT-069: debe mantener la racha viva en días de descanso para hábitos L-M-V', async () => {
    const repository = new RecordsRepository(
      createMockSupabase([{ fecha: '2026-11-02', completado: true }]),
    );
    jest.spyOn(repository as any, 'getLocalHoy').mockReturnValue('2026-11-03');

    const result = await repository.calcularRacha('habito-lmv', 'user-1');

    expect(result.rachaActual).toBe(1);
    expect(result.totalCompletados).toBe(1);
  });

  it('CP-INT-070: debe calcular correctamente la racha máxima a través de días de descanso', async () => {
    const repository = new RecordsRepository(
      createMockSupabase([
        { fecha: '2026-10-30', completado: true },
        { fecha: '2026-10-28', completado: true },
        { fecha: '2026-10-26', completado: true },
      ]),
    );
    jest.spyOn(repository as any, 'getLocalHoy').mockReturnValue('2026-10-31');

    const result = await repository.calcularRacha('habito-lmv', 'user-1');

    expect(result.rachaActual).toBe(3);
    expect(result.rachaMaxima).toBe(3);
    expect(result.totalCompletados).toBe(3);
  });
});

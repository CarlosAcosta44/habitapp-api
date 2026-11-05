import { RecordsRepository } from './records.repository';

describe('RecordsRepository.calcularRacha (CP-INT-069 y CP-INT-070)', () => {
  it('CP-INT-069: debe mantener la racha viva en días de descanso para hábitos L-M-V', async () => {
    // Simulamos un hábito programado solo para Lunes(1), Miércoles(3) y Viernes(5)
    // Supongamos que hoy es 2026-11-03 (Martes, jsDay=2). Último día programado fue 2026-11-02 (Lunes, completado).
    const mockSupabaseService: any = {
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
                            Promise.resolve({
                              data: [{ fecha: '2026-11-02', completado: true }],
                              error: null,
                            }),
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
                        data: { dias_semana: [1, 3, 5] },
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

    const repository = new RecordsRepository(mockSupabaseService);
    // Forzamos getLocalHoy para que devuelva un Martes (2026-11-03)
    jest.spyOn(repository as any, 'getLocalHoy').mockReturnValue('2026-11-03');

    const result = await repository.calcularRacha('habito-lmv', 'user-1');

    // Dado que el martes es día de descanso y el lunes fue completado, la racha debe ser 1 (no 0)
    expect(result.rachaActual).toBe(1);
    expect(result.totalCompletados).toBe(1);
  });

  it('CP-INT-070: debe calcular correctamente la racha máxima a través de días de descanso', async () => {
    // 3 registros completados en días programados: Lun 2026-10-26, Mié 2026-10-28, Vie 2026-10-30
    const mockSupabaseService: any = {
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
                            Promise.resolve({
                              data: [
                                { fecha: '2026-10-30', completado: true },
                                { fecha: '2026-10-28', completado: true },
                                { fecha: '2026-10-26', completado: true },
                              ],
                              error: null,
                            }),
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
                        data: { dias_semana: [1, 3, 5] },
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

    const repository = new RecordsRepository(mockSupabaseService);
    jest.spyOn(repository as any, 'getLocalHoy').mockReturnValue('2026-10-31'); // Sábado de descanso

    const result = await repository.calcularRacha('habito-lmv', 'user-1');

    expect(result.rachaActual).toBe(3);
    expect(result.rachaMaxima).toBe(3);
    expect(result.totalCompletados).toBe(3);
  });
});

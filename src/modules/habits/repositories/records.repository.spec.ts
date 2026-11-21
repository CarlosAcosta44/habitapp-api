import { InternalServerErrorException } from '@nestjs/common';
import { RecordsRepository } from './records.repository';
import { RecordsService } from '../services/records.service';

function createMockSupabase(
  registros: { fecha: string; completado: boolean }[],
  diasSemana: number[] = [1, 2, 3, 4, 5, 6, 7],
  dbError: any = null,
): any {
  const tableMock = (table: string) => {
    if (table === 'registro_habitos') {
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              eq: () => ({
                order: () => ({
                  returns: () =>
                    Promise.resolve({ data: registros, error: dbError }),
                }),
                returns: () => ({
                  limit: () =>
                    Promise.resolve({
                      data: registros.map((r, i) => ({
                        idregistro: `reg-${i}`,
                        fecha: r.fecha,
                        completado: r.completado,
                        progreso_actual: 1,
                        puntos_ganados: 10,
                        observacion: null,
                        idhabito: 'hab-1',
                        idusuario: 'user-1',
                      })),
                      error: dbError,
                    }),
                }),
              }),
            }),
            order: () => ({
              returns: () =>
                Promise.resolve({
                  data: registros.map((r, i) => ({
                    idregistro: `reg-${i}`,
                    fecha: r.fecha,
                    completado: r.completado,
                    progreso_actual: 1,
                    puntos_ganados: 10,
                    observacion: null,
                    idhabito: 'hab-1',
                    idusuario: 'user-1',
                  })),
                  error: dbError,
                }),
            }),
          }),
        }),
        upsert: (payload: any) => ({
          select: () => ({
            returns: () =>
              Promise.resolve({
                data: [
                  {
                    idregistro: 'reg-upsert-1',
                    fecha: payload.fecha,
                    completado: payload.completado,
                    progreso_actual: payload.progreso_actual,
                    puntos_ganados: 10,
                    observacion: payload.observacion,
                    idhabito: payload.idhabito,
                    idusuario: payload.idusuario,
                  },
                ],
                error: dbError,
              }),
          }),
        }),
        update: (payload: any) => ({
          eq: () => ({
            eq: () => ({
              eq: () => ({
                select: () => ({
                  returns: () =>
                    Promise.resolve({
                      data: [
                        {
                          idregistro: 'reg-upd-1',
                          fecha: '2026-11-05',
                          completado: payload.completado,
                          progreso_actual: payload.progreso_actual,
                          puntos_ganados: 0,
                          observacion: null,
                          idhabito: 'hab-1',
                          idusuario: 'user-1',
                        },
                      ],
                      error: dbError,
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
                data: { dias_semana: diasSemana },
                error: null,
              }),
          }),
        }),
      };
    }
    return {};
  };

  const schemaObj: any = {
    from: tableMock,
    schema: () => schemaObj,
  };

  return {
    getClient: () => ({
      schema: () => schemaObj,
    }),
  };
}

describe('RecordsRepository y RecordsService (UT-021 a UT-044)', () => {
  describe('Cálculo de rachas en días consecutivos y Tablas de decisión 2 y 3 (US020)', () => {
    // 1 (UT-021)
    it('UT-021: calcularRacha_SinRegistrosPrevios_RetornaRachaCeroYMaximaCero', async () => {
      const repo = new RecordsRepository(createMockSupabase([]));
      const res = await repo.calcularRacha('hab-1', 'user-1');
      expect(res).toEqual({
        idHabito: 'hab-1',
        rachaActual: 0,
        rachaMaxima: 0,
        totalCompletados: 0,
      });
    });

    // 2 (UT-022)
    it('UT-022: calcularRacha_CumplidoAyerYHoy(TD3-R1)_IncrementaRachaEnMasUno', async () => {
      const repo = new RecordsRepository(
        createMockSupabase([
          { fecha: '2026-11-05', completado: true },
          { fecha: '2026-11-04', completado: true },
          { fecha: '2026-11-03', completado: true },
        ]),
      );
      jest.spyOn(repo as any, 'getLocalHoy').mockReturnValue('2026-11-05');

      const res = await repo.calcularRacha('hab-1', 'user-1');
      expect(res.rachaActual).toBe(3);
      expect(res.rachaMaxima).toBe(3);
    });

    // 3 (UT-023)
    it('UT-023: calcularRacha_CumplidoAyerConsultadoHoySinCheck(TD3-R2)_ConservaValorDeRacha', async () => {
      const repo = new RecordsRepository(
        createMockSupabase([
          { fecha: '2026-11-04', completado: true },
          { fecha: '2026-11-03', completado: true },
          { fecha: '2026-11-02', completado: true },
        ]),
      );
      jest.spyOn(repo as any, 'getLocalHoy').mockReturnValue('2026-11-05');

      const res = await repo.calcularRacha('hab-1', 'user-1');
      expect(res.rachaActual).toBe(3);
    });

    // 4 (UT-024)
    it('UT-024: calcularRacha_OmitioAyerYSinCheckHoy(TD3-R3)_ReiniciaRachaActualACero', async () => {
      const repo = new RecordsRepository(
        createMockSupabase([
          { fecha: '2026-11-02', completado: true },
          { fecha: '2026-11-01', completado: true },
        ]),
      );
      jest.spyOn(repo as any, 'getLocalHoy').mockReturnValue('2026-11-05');

      const res = await repo.calcularRacha('hab-1', 'user-1');
      expect(res.rachaActual).toBe(0);
      expect(res.rachaMaxima).toBe(2);
    });

    // 5 (UT-025)
    it('UT-025: calcularRacha_CheckHoyTrasInterrupcionPrevia(TD3-R4)_ReiniciaRachaAUno', async () => {
      const repo = new RecordsRepository(
        createMockSupabase([
          { fecha: '2026-11-05', completado: true },
          { fecha: '2026-11-01', completado: true },
          { fecha: '2026-10-31', completado: true },
        ]),
      );
      jest.spyOn(repo as any, 'getLocalHoy').mockReturnValue('2026-11-05');

      const res = await repo.calcularRacha('hab-1', 'user-1');
      expect(res.rachaActual).toBe(1);
      expect(res.rachaMaxima).toBe(2);
    });

    // 6 (UT-026)
    it('UT-026: calcularRacha_HabitoLMVEnDiaDescansoMartes_MantieneRachaViva(CP-INT-069)', async () => {
      const repo = new RecordsRepository(
        createMockSupabase(
          [{ fecha: '2026-11-02', completado: true }],
          [1, 3, 5],
        ),
      );
      jest.spyOn(repo as any, 'getLocalHoy').mockReturnValue('2026-11-03');

      const res = await repo.calcularRacha('habito-lmv', 'user-1');
      expect(res.rachaActual).toBe(1);
    });

    // 7 (UT-027)
    it('UT-027: calcularRacha_HabitoLMVCumplidoLunesMiercolesViernes_SumaRachaMaximaTres(CP-INT-070)', async () => {
      const repo = new RecordsRepository(
        createMockSupabase(
          [
            { fecha: '2026-10-30', completado: true },
            { fecha: '2026-10-28', completado: true },
            { fecha: '2026-10-26', completado: true },
          ],
          [1, 3, 5],
        ),
      );
      jest.spyOn(repo as any, 'getLocalHoy').mockReturnValue('2026-10-31');

      const res = await repo.calcularRacha('habito-lmv', 'user-1');
      expect(res.rachaActual).toBe(3);
      expect(res.rachaMaxima).toBe(3);
    });

    // 8 (UT-028)
    it('UT-028: calcularRacha_HabitoLMVOmitioMiercolesYCumplioViernes_ReiniciaRachaAUno', async () => {
      const repo = new RecordsRepository(
        createMockSupabase(
          [
            { fecha: '2026-10-30', completado: true },
            { fecha: '2026-10-26', completado: true },
          ],
          [1, 3, 5],
        ),
      );
      jest.spyOn(repo as any, 'getLocalHoy').mockReturnValue('2026-10-30');

      const res = await repo.calcularRacha('habito-lmv', 'user-1');
      expect(res.rachaActual).toBe(1);
      expect(res.rachaMaxima).toBe(1);
    });

    // 9 (UT-029)
    it('UT-029: calcularRacha_HistorialConDosRachasPrevias5Y12_ReportaRachaMaxima12', async () => {
      const fechas12 = Array.from({ length: 12 }, (_, idx) => {
        const d = new Date('2026-10-01T12:00:00Z');
        d.setUTCDate(d.getUTCDate() + idx);
        return { fecha: d.toISOString().split('T')[0], completado: true };
      });
      const fechas5 = Array.from({ length: 5 }, (_, idx) => {
        const d = new Date('2026-11-01T12:00:00Z');
        d.setUTCDate(d.getUTCDate() + idx);
        return { fecha: d.toISOString().split('T')[0], completado: true };
      });
      const todos = [...fechas5.reverse(), ...fechas12.reverse()];
      const repo = new RecordsRepository(createMockSupabase(todos));
      jest.spyOn(repo as any, 'getLocalHoy').mockReturnValue('2026-11-05');

      const res = await repo.calcularRacha('hab-1', 'user-1');
      expect(res.rachaActual).toBe(5);
      expect(res.rachaMaxima).toBe(12);
      expect(res.totalCompletados).toBe(17);
    });

    // 10 (UT-030)
    it('UT-030: calcularRacha_FrecuenciaSoloDomingos_MantieneContinuidadSemanal', async () => {
      const repo = new RecordsRepository(
        createMockSupabase(
          [
            { fecha: '2026-11-01', completado: true }, // Domingo
            { fecha: '2026-10-25', completado: true }, // Domingo anterior
          ],
          [7],
        ),
      );
      jest.spyOn(repo as any, 'getLocalHoy').mockReturnValue('2026-11-04');

      const res = await repo.calcularRacha('hab-dom', 'user-1');
      expect(res.rachaActual).toBe(2);
      expect(res.rachaMaxima).toBe(2);
    });

    // 11 (UT-031)
    it('UT-031: calcularRacha_ErrorDeBaseDeDatos_LanzaInternalServerErrorException', async () => {
      const repo = new RecordsRepository(
        createMockSupabase([], [1, 2, 3, 4, 5, 6, 7], {
          message: 'Connection timeout',
        }),
      );
      await expect(repo.calcularRacha('hab-1', 'user-1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('Mitigación de desfase UTC-5, puntos y logros frontera (UT-032 a UT-044)', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    // 12 (UT-032 — DEF-001)
    it('UT-032: calcularRacha_CheckEnMedianocheLocalUTC5_NoDesfasaDia (DEF-001)', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-11-06T04:59:00.000Z')); // 23:59 del 2026-11-05 en UTC-5 (offset 300)
      const repo = new RecordsRepository(
        createMockSupabase([
          { fecha: '2026-11-05', completado: true },
          { fecha: '2026-11-04', completado: true },
        ]),
      );

      const res = await repo.calcularRacha('hab-1', 'user-1', 300);
      expect(res.rachaActual).toBe(2);
    });

    // 13 (UT-033 — DEF-002)
    it('UT-033: completarHabito_DoblePeticionSimultanea_SumaDiezPuntosUnaSolaVez (DEF-002)', async () => {
      let upsertCalls = 0;
      const mockRecordsRepo: any = {
        marcarCompletado: jest.fn().mockImplementation(async (payload: any) => {
          upsertCalls++;
          return {
            idRegistro: 'reg-1',
            completado: true,
            fecha: '2026-11-05',
            puntosGanados: upsertCalls === 1 ? 10 : 0,
            progresoActual: payload.metaDiaria,
          };
        }),
      };
      const mockHabitsRepo: any = {
        findById: jest.fn().mockResolvedValue({
          idHabito: 'hab-1',
          idUsuario: 'user-1',
          nombre: 'Meditar',
          puntos: 10,
          metaDiaria: 1,
        }),
      };

      const service = new RecordsService(mockRecordsRepo, mockHabitsRepo);

      const r1 = await service.marcarCompletado(
        { idHabito: 'hab-1' },
        'user-1',
        300,
      );
      const r2 = await service.marcarCompletado(
        { idHabito: 'hab-1' },
        'user-1',
        300,
      );

      expect(r1?.puntosGanados).toBe(10);
      expect(r2?.puntosGanados).toBe(0);
      expect((r1?.puntosGanados ?? 0) + (r2?.puntosGanados ?? 0)).toBe(10);
    });

    // 14 (UT-034)
    it('UT-034: desmarcarCompletado_HabitoCompletadoHoy(TD2-R4)_RevierteDiezPuntosYActualizaHistorial', async () => {
      const mockRecordsRepo: any = {
        findHoy: jest.fn().mockResolvedValue({
          idRegistro: 'reg-1',
          completado: true,
          puntosGanados: 10,
        }),
        desmarcarCompletado: jest.fn().mockResolvedValue({
          idRegistro: 'reg-1',
          completado: false,
          progresoActual: 0,
          puntosGanados: 0,
        }),
      };
      const mockHabitsRepo: any = {
        findById: jest.fn().mockResolvedValue({
          idHabito: 'hab-1',
          idUsuario: 'user-1',
          nombre: 'Meditar',
          puntos: 10,
        }),
      };

      const service = new RecordsService(mockRecordsRepo, mockHabitsRepo);

      const res = await service.desmarcarCompletado('hab-1', 'user-1', 300);

      expect(mockRecordsRepo.desmarcarCompletado).toHaveBeenCalledWith(
        'hab-1',
        'user-1',
        300,
      );
      expect(res?.completado).toBe(false);
      expect(res?.puntosGanados).toBe(0);
    });

    // 15 (UT-035)
    it('UT-035: marcarCompletado_FronteraRacha29A30Dias(US026)_EvaluaDesbloqueoDeLogro30Dias', async () => {
      const fechas30 = Array.from({ length: 30 }, (_, idx) => {
        const d = new Date('2026-10-07T12:00:00Z');
        d.setUTCDate(d.getUTCDate() + idx);
        return { fecha: d.toISOString().split('T')[0], completado: true };
      }).reverse();

      const repo = new RecordsRepository(createMockSupabase(fechas30));
      jest.spyOn(repo as any, 'getLocalHoy').mockReturnValue('2026-11-05');

      const racha = await repo.calcularRacha('hab-1', 'user-1');
      expect(racha.rachaActual).toBe(30);
      expect(racha.rachaActual >= 30).toBe(true);
    });

    // 16 (UT-036)
    it('UT-036: marcarCompletado_FronteraRacha28A29Dias_ActualizaPuntosConRacha29', async () => {
      const fechas29 = Array.from({ length: 29 }, (_, idx) => {
        const d = new Date('2026-10-08T12:00:00Z');
        d.setUTCDate(d.getUTCDate() + idx);
        return { fecha: d.toISOString().split('T')[0], completado: true };
      }).reverse();

      const repo = new RecordsRepository(createMockSupabase(fechas29));
      jest.spyOn(repo as any, 'getLocalHoy').mockReturnValue('2026-11-05');

      const racha = await repo.calcularRacha('hab-1', 'user-1');
      expect(racha.rachaActual).toBe(29);
      expect(racha.rachaActual >= 30).toBe(false);
    });

    // 17 (UT-037)
    it('UT-037: marcarCompletado_CruceMedianoche0000LocalUTC5_GuardaDiaLocalNuevo', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-11-06T05:00:00.000Z')); // 00:00 del 2026-11-06 en UTC-5
      const repo = new RecordsRepository(createMockSupabase([]));

      const res = await repo.marcarCompletado(
        { idhabito: 'hab-1', idusuario: 'user-1', metaDiaria: 1 },
        300,
      );
      expect(res?.fecha).toBe('2026-11-06');
    });

    // 18 (UT-038)
    it('UT-038: marcarCompletado_ConFechaExplicitaYYYYMMDD_RespetaFechaDelPayload', async () => {
      const repo = new RecordsRepository(createMockSupabase([]));
      const res = await repo.marcarCompletado(
        {
          idhabito: 'hab-1',
          idusuario: 'user-1',
          fecha: '2026-11-04',
          metaDiaria: 2000,
        },
        300,
      );
      expect(res?.fecha).toBe('2026-11-04');
      expect(res?.progresoActual).toBe(2000);
    });

    // 19 (UT-039)
    it('UT-039: desmarcarCompletado_EnRepositorio_ActualizaCompletadoFalseYProgresoCero', async () => {
      const repo = new RecordsRepository(createMockSupabase([]));
      const res = await repo.desmarcarCompletado('hab-1', 'user-1', 300);
      expect(res?.completado).toBe(false);
      expect(res?.progresoActual).toBe(0);
    });

    // 20 (UT-040)
    it('UT-040: findByHabitoId_ConRegistrosValidos_MapeaCamposADominio', async () => {
      const repo = new RecordsRepository(
        createMockSupabase([{ fecha: '2026-11-05', completado: true }]),
      );
      const res = await repo.findByHabitoId('hab-1');
      expect(res).toHaveLength(1);
      expect(res[0].idHabito).toBe('hab-1');
      expect(res[0].completado).toBe(true);

      const userRegs = await repo.findByUsuarioId('user-1');
      expect(userRegs).toHaveLength(1);
    });

    // 21 (UT-041)
    it('UT-041: findHoy_ConRegistroExistenteEnFechaLocal_RetornaRegistroDeHoy', async () => {
      const repo = new RecordsRepository(
        createMockSupabase([{ fecha: '2026-11-05', completado: true }]),
      );
      const res = await repo.findHoy('hab-1', 'user-1', 300);
      expect(res).not.toBeNull();
      expect(res?.completado).toBe(true);
    });

    // 22 (UT-042)
    it('UT-042: marcarCompletado_HabitoDeOtroUsuario_LanzaForbiddenException', async () => {
      const service = new RecordsService(
        {} as any,
        {
          findById: jest.fn().mockResolvedValue({
            idHabito: 'hab-1',
            idUsuario: 'owner-user',
          }),
        } as any,
      );

      await expect(
        service.marcarCompletado({ idHabito: 'hab-1' }, 'intruder-user'),
      ).rejects.toThrow('Acceso denegado');
    });

    // 23 (UT-043)
    it('UT-043: getRacha_HabitoInexistente_LanzaNotFoundException', async () => {
      const service = new RecordsService(
        {} as any,
        { findById: jest.fn().mockResolvedValue(null) } as any,
      );

      await expect(service.getRacha('hab-404', 'user-1')).rejects.toThrow(
        'Hábito hab-404 no encontrado',
      );
    });

    // 24 (UT-044)
    it('UT-044: avanzarProgreso_AlcanzaMetaDiaria_MarcaCompletadoYSumaDiezPuntos', async () => {
      const mockRecordsRepo: any = {
        avanzarProgreso: jest.fn().mockResolvedValue({
          idRegistro: 'reg-1',
          completado: true,
          progresoActual: 2000,
          puntosGanados: 10,
        }),
      };
      const mockHabitsRepo: any = {
        findById: jest.fn().mockResolvedValue({
          idHabito: 'hab-agua',
          idUsuario: 'user-1',
          nombre: 'Beber agua',
          puntos: 10,
          metaDiaria: 2000,
        }),
      };

      const service = new RecordsService(mockRecordsRepo, mockHabitsRepo);

      const res = await service.avanzarProgreso(
        { idHabito: 'hab-agua', cantidadASumar: 500 },
        'user-1',
        300,
      );

      expect(res?.completado).toBe(true);
      expect(res?.progresoActual).toBe(2000);
      expect(res?.puntosGanados).toBe(10);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { HabitsService } from './habits.service';
import { HabitsRepository } from '../repositories/habits.repository';

describe('HabitsService (UT-045 a UT-062)', () => {
  let service: HabitsService;
  let habitsRepo: jest.Mocked<HabitsRepository>;

  beforeEach(async () => {
    const mockHabitsRepository = {
      findByUserIdWithRecordToday: jest.fn(),
      findByUserId: jest.fn(),
      findById: jest.fn(),
      getHabitStats: jest.fn(),
      findCategorias: jest.fn(),
      create: jest.fn(),
      syncRecordatorios: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HabitsService,
        {
          provide: HabitsRepository,
          useValue: mockHabitsRepository,
        },
      ],
    }).compile();

    service = module.get<HabitsService>(HabitsService);
    habitsRepo = module.get(HabitsRepository);
  });

  // 1 (UT-045)
  it('UT-045: create_DatosValidosConCategoriaYMeta_AsociaAlUsuarioDelTokenJWT(US011)', async () => {
    habitsRepo.create.mockResolvedValue({
      idHabito: 'hab-101',
      nombre: 'Beber 2L de agua',
      idUsuario: 'user-jwt-123',
      metaDiaria: 2000,
      unidadMedida: 'ml',
      estado: 'Activo',
    } as any);

    const res = await service.create(
      {
        nombre: 'Beber 2L de agua',
        idCategoria: 'cat-salud',
        metaDiaria: 2000,
        unidadMedida: 'ml',
        puntos: 10,
      } as any,
      'user-jwt-123',
    );

    expect(habitsRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: 'Beber 2L de agua',
        idusuario: 'user-jwt-123',
        meta_diaria: 2000,
        estado: 'Activo',
      }),
    );
    expect(res.idUsuario).toBe('user-jwt-123');
  });

  // 2, 3, 4 (UT-046, UT-047, UT-048 — Preajustes de frecuencia 7, 5 y 1 día)
  it.each([
    ['Todos los días', [1, 2, 3, 4, 5, 6, 7]],
    ['Días laborales L-V', [1, 2, 3, 4, 5]],
    ['Personalizado solo lunes', [1]],
  ])(
    'UT-046..048: create_PreajusteFrecuencia(%s)_GuardaDiasExactos(US012)',
    async (_label, diasSemana) => {
      habitsRepo.create.mockResolvedValue({
        idHabito: 'hab-freq',
        diasSemana,
      } as any);

      await service.create(
        {
          nombre: 'Ejercicio',
          idCategoria: 'cat-deporte',
          puntos: 10,
          diasSemana,
        } as any,
        'user-1',
      );

      expect(habitsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ dias_semana: diasSemana }),
      );
    },
  );

  // 5 (UT-049)
  it('UT-049: create_ConRecordatoriosHorarios_SincronizaHorasEnBaseDeDatos(US013)', async () => {
    habitsRepo.create.mockResolvedValue({ idHabito: 'hab-rem-1' } as any);

    await service.create(
      {
        nombre: 'Meditar',
        idCategoria: 'cat-mente',
        puntos: 10,
        recordatorios: ['07:00', '19:30'],
      } as any,
      'user-1',
    );

    expect(habitsRepo.syncRecordatorios).toHaveBeenCalledWith('hab-rem-1', [
      '07:00',
      '19:30',
    ]);
  });

  // 6 (UT-050)
  it('UT-050: create_FechaFinAnteriorOIgualAFechaInicio_LanzaBadRequestException', async () => {
    await expect(
      service.create(
        {
          nombre: 'Hábito inválido',
          idCategoria: 'cat-1',
          puntos: 10,
          fechaInicio: '2026-11-10',
          fechaFin: '2026-11-09',
        } as any,
        'user-1',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  // 7 (UT-051)
  it('UT-051: getDashboard_HabitoActivoProgramadoHoySinRegistro(TD1-R1)_RetornaPendiente(US014)', async () => {
    habitsRepo.findByUserIdWithRecordToday.mockResolvedValue([
      {
        idHabito: 'hab-1',
        nombre: 'Leer',
        estado: 'Activo',
        registroHoy: null,
      },
    ] as any);

    const res = await service.getDashboard('user-1', 300);
    expect(res).toHaveLength(1);
    expect(res[0].registroHoy).toBeNull();
  });

  // 8 (UT-052)
  it('UT-052: getDashboard_HabitoActivoConRegistroCompletadoHoy(TD1-R2)_RetornaCompletado', async () => {
    habitsRepo.findByUserIdWithRecordToday.mockResolvedValue([
      {
        idHabito: 'hab-1',
        nombre: 'Leer',
        estado: 'Activo',
        registroHoy: { completado: true, progresoActual: 1 },
      },
    ] as any);

    const res = await service.getDashboard('user-1', 300);
    expect(res[0].registroHoy?.completado).toBe(true);
  });

  // 9 (UT-053)
  it('UT-053: findAll_FiltroEstadoArchivado(TD1-R4)_TraduceAEstadoInactivoEnRepositorio', async () => {
    habitsRepo.findByUserId.mockResolvedValue([]);

    await service.findAll('user-1', 'Archivado');
    expect(habitsRepo.findByUserId).toHaveBeenCalledWith('user-1', 'Inactivo');
  });

  // 10 (UT-054)
  it('UT-054: findById_UsuarioNoPropietario_LanzaForbiddenException', async () => {
    habitsRepo.findById.mockResolvedValue({
      idHabito: 'hab-101',
      nombre: 'Beber 2L de agua',
      idUsuario: 'user-autorizado-123',
    } as any);

    await expect(
      service.findById('hab-101', 'user-intruso-999'),
    ).rejects.toThrow(ForbiddenException);
  });

  // 11 (UT-055)
  it('UT-055: findById_HabitoNoExiste_LanzaNotFoundException', async () => {
    habitsRepo.findById.mockResolvedValue(null);

    await expect(service.findById('hab-404', 'user-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  // 12 (UT-056)
  it('UT-056: update_CambiarNombreMetaYRecordatorios_ActualizaYReemplazaHoras(US013/US017)', async () => {
    habitsRepo.findById.mockResolvedValue({
      idHabito: 'hab-1',
      idUsuario: 'user-1',
      estado: 'Activo',
      fechaInicio: '2026-10-01',
    } as any);
    habitsRepo.update.mockResolvedValue({
      idHabito: 'hab-1',
      nombre: 'Correr 10km',
      metaDiaria: 10,
    } as any);

    const res = await service.update(
      'hab-1',
      {
        nombre: 'Correr 10km',
        metaDiaria: 10,
        recordatorios: ['23:59'],
      } as any,
      'user-1',
    );

    expect(habitsRepo.syncRecordatorios).toHaveBeenCalledWith('hab-1', [
      '23:59',
    ]);
    expect(res.nombre).toBe('Correr 10km');
  });

  // 13 (UT-057)
  it('UT-057: update_ArchivarHabito_CambiaEstadoAInactivoConservandoHistorial(US017)', async () => {
    habitsRepo.findById.mockResolvedValue({
      idHabito: 'hab-1',
      idUsuario: 'user-1',
      estado: 'Activo',
      fechaInicio: '2026-10-01',
    } as any);
    habitsRepo.update.mockResolvedValue({
      idHabito: 'hab-1',
      estado: 'Inactivo',
    } as any);

    await service.update('hab-1', { estado: 'Archivado' } as any, 'user-1');

    expect(habitsRepo.update).toHaveBeenCalledWith('hab-1', {
      estado: 'Inactivo',
    });
  });

  // 14 (UT-058)
  it('UT-058: update_ReactivarHabitoCompletado_LanzaBadRequestException', async () => {
    habitsRepo.findById.mockResolvedValue({
      idHabito: 'hab-1',
      idUsuario: 'user-1',
      estado: 'Completado',
      fechaInicio: '2026-10-01',
    } as any);

    await expect(
      service.update('hab-1', { estado: 'Activo' } as any, 'user-1'),
    ).rejects.toThrow(BadRequestException);
  });

  // 15 (UT-059)
  it('UT-059: delete_HabitoPropioConCeroRegistros_EliminaFisicamente(US018)', async () => {
    habitsRepo.findById.mockResolvedValue({
      idHabito: 'hab-clean',
      idUsuario: 'user-1',
    } as any);
    habitsRepo.delete.mockResolvedValue(undefined);

    const res = await service.delete('hab-clean', 'user-1');
    expect(habitsRepo.delete).toHaveBeenCalledWith('hab-clean');
    expect(res).toEqual({ success: true });
  });

  // 16 (UT-060)
  it('UT-060: delete_HabitoConRegistrosHistoricosPrevios_LanzaBadRequestExceptionOrientandoAArchivar(US018)', async () => {
    habitsRepo.findById.mockResolvedValue({
      idHabito: 'hab-with-history',
      idUsuario: 'user-1',
    } as any);
    habitsRepo.delete.mockRejectedValue(
      new BadRequestException(
        'No se puede eliminar un hábito con registros históricos. Por favor archívelo.',
      ),
    );

    await expect(
      service.delete('hab-with-history', 'user-1'),
    ).rejects.toThrow(BadRequestException);
  });

  // 17 (UT-061)
  it('UT-061: delete_HabitoDeOtroUsuario_LanzaForbiddenException', async () => {
    habitsRepo.findById.mockResolvedValue({
      idHabito: 'hab-1',
      idUsuario: 'owner-1',
    } as any);

    await expect(service.delete('hab-1', 'intruder-2')).rejects.toThrow(
      ForbiddenException,
    );
  });

  // 18 (UT-062)
  it('UT-062: getHabitStats_CalculaTasaExitoAcotadaAl100PorCiento', async () => {
    habitsRepo.findById.mockResolvedValue({
      idHabito: 'hab-1',
      idUsuario: 'user-1',
      fechaInicio: '2026-11-01',
      diasSemana: [1, 2, 3, 4, 5, 6, 7],
    } as any);
    habitsRepo.getHabitStats.mockResolvedValue({
      rachaActual: 5,
      mejorRacha: 10,
      totalCumplido: 5,
      historialReciente: [],
    } as any);

    const res = await service.getHabitStats('hab-1', 'user-1');
    expect(res.rachaActual).toBe(5);
    expect(res.mejorRacha).toBe(10);
    expect(res.tasaExito).toBeLessThanOrEqual(100);
  });
});


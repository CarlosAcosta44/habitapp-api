import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CoachService } from './coach.service';
import { CoachRepository } from '../repositories/coach.repository';
import { ReportsService } from '../../reports/services/reports.service';

describe('CoachService (UT-083 a UT-094)', () => {
  let service: CoachService;
  let coachRepository: jest.Mocked<CoachRepository>;
  let reportsService: ReportsService;

  beforeEach(async () => {
    const mockCoachRepository = {
      getTrainerId: jest.fn().mockResolvedValue('trainer-1'),
      getClientsByTrainer: jest.fn(),
      getUserProfile: jest.fn(),
      createRoutine: jest.fn(),
      getRoutinesByTrainer: jest.fn(),
      getRoutineByIdAndTrainer: jest.fn(),
      updateRoutine: jest.fn(),
      deleteRoutineAssignments: jest.fn(),
      deleteRoutine: jest.fn(),
      getClientTrainerRelationship: jest.fn(),
      assignRoutineToClient: jest.fn(),
      materializeRoutineHabitsForClient: jest.fn().mockResolvedValue(3),
      createRecommendation: jest.fn().mockResolvedValue({ idnotificacion: 'n-1' }),
      getAvailableClients: jest.fn(),
      linkClient: jest.fn(),
      unlinkClient: jest.fn(),
      getClientRecommendations: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoachService,
        {
          provide: CoachRepository,
          useValue: mockCoachRepository,
        },
        {
          provide: ReportsService,
          useValue: {
            getUserSummary: jest.fn().mockResolvedValue({
              racha_actual: 3,
              racha_maxima: 7,
              cumplimiento_global: 50,
              activeHabits: [
                { idHabito: 'h-1', completadoHoy: true },
                { idHabito: 'h-2', completadoHoy: false },
              ],
            }),
          },
        },
      ],
    }).compile();

    service = module.get<CoachService>(CoachService);
    coachRepository = module.get(CoachRepository);
    reportsService = module.get<ReportsService>(ReportsService);
  });

  // 1 (UT-083)
  it('UT-083: debe instanciar CoachService correctamente', () => {
    expect(service).toBeDefined();
  });

  // 2 (UT-084)
  it('UT-084: getClients_EntrenadorConPupilosAsignados_RetornaMetricasExactasDeCumplimientoYRacha(US035)', async () => {
    coachRepository.getClientsByTrainer.mockResolvedValue([
      { idusuario: 'client-1', fechainicio: '2026-10-01' },
    ] as any);
    coachRepository.getUserProfile.mockResolvedValue({
      idusuario: 'client-1',
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@habitapp.com',
      puntostotales: 120,
      roles: { nombrerol: 'Usuario' },
    } as any);

    const res = await service.getClients('coach-user-1');
    expect(res).toHaveLength(1);
    expect(res[0].client?.full_name).toBe('Juan Pérez');
    expect(res[0].client?.cumplimiento).toBe(50);
    expect(res[0].client?.racha_actual).toBe(3);
    expect(res[0].client?.completados_hoy).toBe(1);
    expect(res[0].client?.total_habitos).toBe(2);
  });

  // 3 (UT-085)
  it('UT-085: getClients_EntrenadorSinPupilos_RetornaListaVaciaSinMocks(ZeroMockPolicy)', async () => {
    coachRepository.getClientsByTrainer.mockResolvedValue([]);

    const res = await service.getClients('coach-user-1');
    expect(res).toEqual([]);
  });

  // 4 (UT-086)
  it('UT-086: getClientProgress_PupiloAsignadoAlEntrenador(TD6-R3)_PermiteLecturaDeResumen', async () => {
    coachRepository.getClientTrainerRelationship.mockResolvedValue({
      fechainicio: '2026-10-01',
    } as any);

    const result = await service.getClientProgress('coach-user-1', 'client-1');
    expect(result.cumplimiento_global).toBe(50);
    expect(reportsService.getUserSummary).toHaveBeenCalledWith('client-1');
  });

  // 5 (UT-087)
  it('UT-087: getClientProgress_ClienteNoAsignadoAlEntrenador(TD6-R4)_LanzaNotFoundException', async () => {
    coachRepository.getClientTrainerRelationship.mockRejectedValue(
      new NotFoundException('El cliente no está asignado a este entrenador'),
    );

    await expect(
      service.getClientProgress('coach-user-1', 'unassigned-client'),
    ).rejects.toThrow(NotFoundException);
  });

  // 6 (UT-088)
  it('UT-088: createRoutine_ConTresHabitos_CodificaHabitosYRetornaDetalle(US036)', async () => {
    coachRepository.createRoutine.mockResolvedValue({
      idrutina: 'r-101',
    } as any);
    coachRepository.getRoutineByIdAndTrainer.mockResolvedValue({
      idrutina: 'r-101',
      objetivo: 'Vitalidad Matutina',
      descripcion: 'Protocolo base ||HABITS:Beber agua;Meditar;Estirar',
      tipo: 'Salud',
      nivel: 'Principiante',
      duracion: 21,
    } as any);

    const res = await service.createRoutine('coach-user-1', {
      name: 'Vitalidad Matutina',
      description: 'Protocolo base',
      tipo: 'Salud',
      nivel: 'Principiante',
      duracion: 21,
      habits: [
        { habit_name: 'Beber agua' },
        { habit_name: 'Meditar' },
        { habit_name: 'Estirar' },
      ],
    } as any);

    expect(res.id).toBe('r-101');
    expect(res.routine_habits).toHaveLength(3);
  });

  // 7 (UT-089)
  it('UT-089: getRoutines_ListaSoloRutinasPropiasDelEntrenador', async () => {
    coachRepository.getRoutinesByTrainer.mockResolvedValue([
      {
        idrutina: 'r-1',
        objetivo: 'Rutina 1',
        descripcion: 'Desc ||HABITS:Correr 5km',
      },
    ] as any);

    const res = await service.getRoutines('coach-user-1');
    expect(res).toHaveLength(1);
    expect(res[0].name).toBe('Rutina 1');
    expect(res[0].routine_habits[0].habit_name).toBe('Correr 5km');
  });

  // 8 (UT-090)
  it('UT-090: updateRoutine_RutinaPropia_ActualizaCamposYHabitos', async () => {
    coachRepository.getRoutineByIdAndTrainer.mockResolvedValue({
      idrutina: 'r-1',
      objetivo: 'Rutina Editada',
      descripcion: 'Nueva desc ||HABITS:Caminar',
    } as any);

    const res = await service.updateRoutine('coach-user-1', 'r-1', {
      name: 'Rutina Editada',
      habits: [{ habit_name: 'Caminar' }],
    } as any);

    expect(coachRepository.updateRoutine).toHaveBeenCalled();
    expect(res.name).toBe('Rutina Editada');
  });

  // 9 (UT-091)
  it('UT-091: deleteRoutine_EliminaAsignacionesEnCascadaYLaPlantilla', async () => {
    coachRepository.getRoutineByIdAndTrainer.mockResolvedValue({
      idrutina: 'r-1',
    } as any);

    await service.deleteRoutine('coach-user-1', 'r-1');
    expect(coachRepository.deleteRoutineAssignments).toHaveBeenCalledWith('r-1');
    expect(coachRepository.deleteRoutine).toHaveBeenCalledWith(
      'r-1',
      'trainer-1',
    );
  });

  // 10 (UT-092)
  it('UT-092: assignRoutineToClient_PupiloValido_MaterializaHabitosConPrefijoCoachYNotifica(US036)', async () => {
    coachRepository.getClientTrainerRelationship.mockResolvedValue({
      fechainicio: '2026-10-01',
    } as any);
    coachRepository.getRoutineByIdAndTrainer.mockResolvedValue({
      idrutina: 'r-1',
      objetivo: 'Fuerza Base',
      descripcion: 'Desc ||HABITS:Flexiones;Sentadillas;Plancha',
      tipo: 'Ejercicio',
      nivel: 'Intermedio',
    } as any);

    const res = await service.assignRoutineToClient(
      'coach-user-1',
      'client-1',
      'r-1',
    );
    expect(res.message).toBe('Routine assigned successfully to client');
    expect(res.habitsAssigned).toBe(3);
    expect(coachRepository.createRecommendation).toHaveBeenCalled();
  });

  // 11 (UT-093)
  it('UT-093: assignRoutineToClient_PupiloNoAsignado_LanzaNotFoundException', async () => {
    coachRepository.getClientTrainerRelationship.mockRejectedValue(
      new NotFoundException('No vinculado'),
    );

    await expect(
      service.assignRoutineToClient('coach-user-1', 'other-client', 'r-1'),
    ).rejects.toThrow(NotFoundException);
  });

  // 12 (UT-094)
  it('UT-094: linkClientYUnlinkClient_GestionaVinculoBidireccionalDePupilos', async () => {
    coachRepository.linkClient.mockResolvedValue({ linked: true } as any);
    coachRepository.unlinkClient.mockResolvedValue({ unlinked: true } as any);
    coachRepository.getAvailableClients.mockResolvedValue([]);
    coachRepository.getClientTrainerRelationship.mockResolvedValue({} as any);
    coachRepository.getClientRecommendations.mockResolvedValue([]);

    expect(await service.linkClient('coach-user-1', 'client-2')).toEqual({
      linked: true,
    });
    expect(await service.unlinkClient('coach-user-1', 'client-2')).toEqual({
      unlinked: true,
    });
    expect(await service.getAvailableClients('coach-user-1')).toEqual([]);
    expect(
      await service.sendRecommendation('coach-user-1', 'client-2', {
        message: 'Sigue así',
      }),
    ).toBeDefined();
    expect(
      await service.getClientRecommendations('coach-user-1', 'client-2'),
    ).toEqual([]);
  });
});

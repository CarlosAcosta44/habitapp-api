import { Test, TestingModule } from "@nestjs/testing";
import { CoachService } from "./coach.service";
import { CoachRepository } from "../repositories/coach.repository";
import { ReportsService } from "../../reports/services/reports.service";
import { NotFoundException } from "@nestjs/common";

describe("CoachService", () => {
  let service: CoachService;
  let coachRepository: jest.Mocked<CoachRepository>;
  let reportsService: ReportsService;

  beforeEach(async () => {
    const mockCoachRepository = {
      getTrainerId: jest.fn(),
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
            getUserSummary: jest.fn().mockResolvedValue({ total: 100 }),
          },
        },
      ],
    }).compile();

    service = module.get<CoachService>(CoachService);
    coachRepository = module.get(CoachRepository);
    reportsService = module.get<ReportsService>(ReportsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  const mockTrainerId = "trainer-1";
  beforeEach(() => {
    coachRepository.getTrainerId.mockResolvedValue(mockTrainerId);
  });

  describe("getClientProgress", () => {
    const userId = "user-1";
    const clientId = "client-1";

    it("should throw NotFoundException if client is not assigned to coach", async () => {
      coachRepository.getClientTrainerRelationship.mockRejectedValue(
        new NotFoundException("Not related"),
      );

      await expect(service.getClientProgress(userId, clientId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should return progress if client belongs to coach", async () => {
      coachRepository.getClientTrainerRelationship.mockResolvedValue({
        fechainicio: "date",
      } as any);

      const result = await service.getClientProgress(userId, clientId);
      expect(result).toEqual({ total: 100 });
      expect(reportsService.getUserSummary).toHaveBeenCalledWith(clientId);
    });
  });

  describe("assignRoutineToClient", () => {
    const userId = "user-1";
    const clientId = "client-1";
    const routineId = "routine-1";

    it("should throw NotFoundException if client is not assigned", async () => {
      coachRepository.getClientTrainerRelationship.mockRejectedValue(
        new NotFoundException("err"),
      );

      await expect(
        service.assignRoutineToClient(userId, clientId, routineId),
      ).rejects.toThrow(NotFoundException);
    });

    it("should assign routine successfully", async () => {
      coachRepository.getClientTrainerRelationship.mockResolvedValue({
        fechainicio: "date",
      } as any);
      coachRepository.getRoutineByIdAndTrainer.mockResolvedValue({
        idrutina: routineId,
        objetivo: "Rutina",
        descripcion: "",
      } as any);
      coachRepository.assignRoutineToClient.mockResolvedValue(undefined as any);

      const res = await service.assignRoutineToClient(
        userId,
        clientId,
        routineId,
      );
      expect(res.message).toBe("Routine assigned successfully to client");
      expect(res.habitsAssigned).toBe(0);
      expect(coachRepository.assignRoutineToClient).toHaveBeenCalledWith(
        clientId,
        routineId,
      );
    });
  });
});

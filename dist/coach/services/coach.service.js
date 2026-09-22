"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoachService = void 0;
const common_1 = require("@nestjs/common");
const coach_repository_1 = require("../repositories/coach.repository");
const reports_service_1 = require("../../reports/services/reports.service");
let CoachService = class CoachService {
    coachRepository;
    reportsService;
    constructor(coachRepository, reportsService) {
        this.coachRepository = coachRepository;
        this.reportsService = reportsService;
    }
    async getTrainerId(userId) {
        return this.coachRepository.getTrainerId(userId);
    }
    async getClients(userId) {
        const trainerId = await this.getTrainerId(userId);
        const data = await this.coachRepository.getClientsByTrainer(trainerId);
        const clientsWithProfiles = await Promise.all(data.map(async (item) => {
            const profile = await this.coachRepository.getUserProfile(item.idusuario);
            return {
                assigned_at: item.fechainicio,
                client: profile
                    ? {
                        idusuario: profile.idusuario,
                        nombre: profile.nombre,
                        apellido: profile.apellido,
                        fotoperfil: profile.fotoperfil,
                        puntostotales: profile.puntostotales,
                        idrol: profile.idrol,
                        nombrerol: profile?.roles?.nombrerol || 'Usuario',
                    }
                    : null,
            };
        }));
        return clientsWithProfiles;
    }
    async createRoutine(userId, dto) {
        const trainerId = await this.getTrainerId(userId);
        const routine = await this.coachRepository.createRoutine(trainerId, dto.description || '', dto.name);
        if (dto.habits && dto.habits.length > 0) {
            console.warn('Asignación detallada de hábitos pausada por falta de tabla rutina_habitos');
        }
        return this.getRoutineById(userId, routine.idrutina);
    }
    async getRoutines(userId) {
        const trainerId = await this.getTrainerId(userId);
        const data = await this.coachRepository.getRoutinesByTrainer(trainerId);
        return data.map((r) => ({
            ...r,
            name: r.objetivo,
            description: r.descripcion,
            id: r.idrutina,
            routine_habits: [],
        }));
    }
    async getRoutineById(userId, routineId) {
        const trainerId = await this.getTrainerId(userId);
        const data = await this.coachRepository.getRoutineByIdAndTrainer(routineId, trainerId);
        return {
            ...data,
            name: data.objetivo,
            description: data.descripcion,
            id: data.idrutina,
            routine_habits: [],
        };
    }
    async updateRoutine(userId, routineId, dto) {
        const trainerId = await this.getTrainerId(userId);
        await this.getRoutineById(userId, routineId);
        const updateData = {};
        if (dto.name !== undefined)
            updateData.objetivo = dto.name;
        if (dto.description !== undefined)
            updateData.descripcion = dto.description;
        if (Object.keys(updateData).length > 0) {
            await this.coachRepository.updateRoutine(routineId, trainerId, updateData);
        }
        if (dto.habits) {
            console.warn('Actualización de hábitos pausada por falta de tabla rutina_habitos');
        }
        return this.getRoutineById(userId, routineId);
    }
    async deleteRoutine(userId, routineId) {
        const trainerId = await this.getTrainerId(userId);
        await this.getRoutineById(userId, routineId);
        await this.coachRepository.deleteRoutineAssignments(routineId);
        await this.coachRepository.deleteRoutine(routineId, trainerId);
    }
    async assignRoutineToClient(userId, clientId, routineId) {
        const trainerId = await this.getTrainerId(userId);
        await this.coachRepository.getClientTrainerRelationship(trainerId, clientId);
        await this.getRoutineById(userId, routineId);
        await this.coachRepository.assignRoutineToClient(clientId, routineId);
        return {
            message: 'Routine assigned successfully to client',
            habitsAssigned: 0,
        };
    }
    async getClientProgress(userId, clientId) {
        const trainerId = await this.getTrainerId(userId);
        await this.coachRepository.getClientTrainerRelationship(trainerId, clientId);
        return this.reportsService.getUserSummary(clientId);
    }
};
exports.CoachService = CoachService;
exports.CoachService = CoachService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [coach_repository_1.CoachRepository,
        reports_service_1.ReportsService])
], CoachService);
//# sourceMappingURL=coach.service.js.map
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
exports.RecordsService = void 0;
const common_1 = require("@nestjs/common");
const records_repository_1 = require("../repositories/records.repository");
const habits_repository_1 = require("../repositories/habits.repository");
let RecordsService = class RecordsService {
    recordsRepo;
    habitsRepo;
    constructor(recordsRepo, habitsRepo) {
        this.recordsRepo = recordsRepo;
        this.habitsRepo = habitsRepo;
    }
    async getByHabito(habitoId, userId) {
        const habito = await this.habitsRepo.findById(habitoId);
        if (!habito)
            throw new common_1.NotFoundException(`Hábito ${habitoId} no encontrado`);
        if (habito.idUsuario !== userId)
            throw new common_1.ForbiddenException('Acceso denegado');
        return this.recordsRepo.findByHabitoId(habitoId);
    }
    async getHistorial(userId) {
        return this.recordsRepo.findByUsuarioId(userId);
    }
    async marcarCompletado(dto, userId, tzOffset = 0) {
        const habito = await this.habitsRepo.findById(dto.idHabito);
        if (!habito)
            throw new common_1.NotFoundException(`Hábito ${dto.idHabito} no encontrado`);
        if (habito.idUsuario !== userId)
            throw new common_1.ForbiddenException('Acceso denegado');
        return this.recordsRepo.marcarCompletado({
            idhabito: dto.idHabito,
            idusuario: userId,
            fecha: '',
            observacion: dto.observacion,
            metaDiaria: habito.metaDiaria,
        }, tzOffset);
    }
    async desmarcarCompletado(habitoId, userId, tzOffset = 0) {
        const habito = await this.habitsRepo.findById(habitoId);
        if (!habito)
            throw new common_1.NotFoundException(`Hábito ${habitoId} no encontrado`);
        if (habito.idUsuario !== userId)
            throw new common_1.ForbiddenException('Acceso denegado');
        const registroHoy = await this.recordsRepo.findHoy(habitoId, userId, tzOffset);
        if (!registroHoy) {
            throw new common_1.BadRequestException('No hay registro de hoy para desmarcar');
        }
        if (!registroHoy.completado) {
            throw new common_1.BadRequestException('Este hábito no está marcado como completado hoy');
        }
        return this.recordsRepo.desmarcarCompletado(habitoId, userId, tzOffset);
    }
    async avanzarProgreso(dto, userId, tzOffset = 0) {
        const habito = await this.habitsRepo.findById(dto.idHabito);
        if (!habito)
            throw new common_1.NotFoundException(`Hábito ${dto.idHabito} no encontrado`);
        if (habito.idUsuario !== userId)
            throw new common_1.ForbiddenException('Acceso denegado');
        if (dto.cantidadASumar === 0) {
            throw new common_1.BadRequestException('La cantidad a sumar/restar no puede ser cero');
        }
        return this.recordsRepo.avanzarProgreso({
            idhabito: dto.idHabito,
            idusuario: userId,
            fecha: '',
            cantidadASumar: dto.cantidadASumar,
            metaDiaria: habito.metaDiaria,
            observacion: dto.observacion,
        }, tzOffset);
    }
    async getRacha(habitoId, userId, tzOffset = 0) {
        const habito = await this.habitsRepo.findById(habitoId);
        if (!habito)
            throw new common_1.NotFoundException(`Hábito ${habitoId} no encontrado`);
        if (habito.idUsuario !== userId)
            throw new common_1.ForbiddenException('Acceso denegado');
        return this.recordsRepo.calcularRacha(habitoId, userId, tzOffset);
    }
};
exports.RecordsService = RecordsService;
exports.RecordsService = RecordsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [records_repository_1.RecordsRepository,
        habits_repository_1.HabitsRepository])
], RecordsService);
//# sourceMappingURL=records.service.js.map
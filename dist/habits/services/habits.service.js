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
exports.HabitsService = void 0;
const common_1 = require("@nestjs/common");
const habits_repository_1 = require("../repositories/habits.repository");
let HabitsService = class HabitsService {
    habitsRepo;
    constructor(habitsRepo) {
        this.habitsRepo = habitsRepo;
    }
    async getDashboard(userId) {
        return this.habitsRepo.findByUserIdWithRecordToday(userId);
    }
    async findAll(userId, estado) {
        return this.habitsRepo.findByUserId(userId, estado);
    }
    async findById(idHabito, userId) {
        const habito = await this.habitsRepo.findById(idHabito);
        if (!habito)
            throw new common_1.NotFoundException(`Hábito ${idHabito} no encontrado`);
        if (habito.idUsuario !== userId)
            throw new common_1.ForbiddenException('Acceso denegado');
        return habito;
    }
    async getHabitStats(idHabito, userId) {
        const habito = await this.findById(idHabito, userId);
        const stats = await this.habitsRepo.getHabitStats(idHabito);
        const fechaInicio = new Date(habito.fechaInicio);
        const hoy = new Date();
        let diasEsperados = 0;
        const current = new Date(fechaInicio);
        while (current <= hoy) {
            let jsDay = current.getDay();
            let habitDay = jsDay === 0 ? 7 : jsDay;
            if (habito.diasSemana.includes(habitDay)) {
                diasEsperados++;
            }
            current.setDate(current.getDate() + 1);
        }
        const tasaExito = diasEsperados > 0
            ? Math.round((stats.totalCumplido / diasEsperados) * 100)
            : 100;
        return {
            ...habito,
            rachaActual: stats.rachaActual,
            mejorRacha: stats.mejorRacha,
            totalCumplido: stats.totalCumplido,
            tasaExito: tasaExito > 100 ? 100 : tasaExito,
            historialReciente: stats.historialReciente,
        };
    }
    async getCategorias() {
        return this.habitsRepo.findCategorias();
    }
    async create(dto, userId) {
        const today = new Date().toISOString().split('T')[0];
        const fechaInicio = dto.fechaInicio || today;
        if (dto.fechaFin && dto.fechaFin <= fechaInicio) {
            throw new common_1.BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
        }
        return this.habitsRepo.create({
            nombre: dto.nombre,
            descripcion: dto.descripcion,
            fechainicio: fechaInicio,
            fechafin: dto.fechaFin,
            estado: 'Activo',
            puntos: dto.puntos,
            meta_diaria: dto.metaDiaria ?? 1,
            unidad_medida: dto.unidadMedida ?? 'veces',
            idusuario: userId,
            idcategoria: dto.idCategoria,
            dias_semana: dto.diasSemana ?? [1, 2, 3, 4, 5, 6, 7],
        });
    }
    async update(idHabito, dto, userId) {
        const habito = await this.habitsRepo.findById(idHabito);
        if (!habito)
            throw new common_1.NotFoundException(`Hábito ${idHabito} no encontrado`);
        if (habito.idUsuario !== userId)
            throw new common_1.ForbiddenException('Acceso denegado');
        if (habito.estado === 'Completado' && dto.estado === 'Activo') {
            throw new common_1.BadRequestException('No se puede reactivar un hábito ya completado');
        }
        if (dto.fechaFin && dto.fechaFin <= habito.fechaInicio) {
            throw new common_1.BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
        }
        const dbUpdates = {};
        if (dto.nombre !== undefined)
            dbUpdates.nombre = dto.nombre;
        if (dto.descripcion !== undefined)
            dbUpdates.descripcion = dto.descripcion;
        if (dto.fechaFin !== undefined)
            dbUpdates.fechafin = dto.fechaFin;
        if (dto.estado !== undefined) {
            if (dto.estado === 'Archivado' || dto.estado === 'Pausado') {
                dbUpdates.estado = 'Inactivo';
            }
            else {
                dbUpdates.estado = dto.estado;
            }
        }
        if (dto.puntos !== undefined)
            dbUpdates.puntos = dto.puntos;
        if (dto.idCategoria !== undefined)
            dbUpdates.idcategoria = dto.idCategoria;
        if (dto.diasSemana !== undefined)
            dbUpdates.dias_semana = dto.diasSemana;
        if (dto.metaDiaria !== undefined)
            dbUpdates.meta_diaria = dto.metaDiaria;
        if (dto.unidadMedida !== undefined)
            dbUpdates.unidad_medida = dto.unidadMedida;
        return this.habitsRepo.update(idHabito, dbUpdates);
    }
    async completar(idHabito, userId) {
        return this.update(idHabito, { estado: 'Completado' }, userId);
    }
    async delete(idHabito, userId) {
        const habito = await this.habitsRepo.findById(idHabito);
        if (!habito)
            throw new common_1.NotFoundException(`Hábito ${idHabito} no encontrado`);
        if (habito.idUsuario !== userId)
            throw new common_1.ForbiddenException('Acceso denegado');
        await this.habitsRepo.delete(idHabito);
        return { success: true };
    }
};
exports.HabitsService = HabitsService;
exports.HabitsService = HabitsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [habits_repository_1.HabitsRepository])
], HabitsService);
//# sourceMappingURL=habits.service.js.map
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
const supabase_service_1 = require("../supabase/supabase.service");
const reports_service_1 = require("../reports/services/reports.service");
let CoachService = class CoachService {
    supabaseService;
    reportsService;
    constructor(supabaseService, reportsService) {
        this.supabaseService = supabaseService;
        this.reportsService = reportsService;
    }
    async getTrainerId(userId) {
        const { data, error } = await this.supabaseService
            .getClient()
            .schema('seguimiento')
            .from('entrenadores')
            .select('identrenador')
            .eq('idusuario', userId)
            .single();
        if (error || !data) {
            throw new common_1.NotFoundException('Perfil de entrenador no encontrado para este usuario');
        }
        return data.identrenador;
    }
    async getClients(userId) {
        const trainerId = await this.getTrainerId(userId);
        const { data, error } = await this.supabaseService
            .getClient()
            .schema('seguimiento')
            .from('usuario_entrenador')
            .select('fechainicio, idusuario')
            .eq('identrenador', trainerId);
        if (error) {
            throw new common_1.InternalServerErrorException(`Failed to fetch clients: ${error.message}`);
        }
        const clientsWithProfiles = await Promise.all(data.map(async (item) => {
            const { data: profile } = await this.supabaseService
                .getClient()
                .schema('gestion')
                .from('usuarios')
                .select('*, roles(nombrerol)')
                .eq('idusuario', item.idusuario)
                .single();
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
        const client = this.supabaseService.getClient();
        const { data: routine, error: routineError } = await client
            .schema('seguimiento')
            .from('rutinas')
            .insert({
            identrenador: trainerId,
            tipo: 'General',
            descripcion: dto.description || '',
            nivel: 'Principiante',
            objetivo: dto.name,
        })
            .select()
            .single();
        if (routineError) {
            throw new common_1.InternalServerErrorException(`Failed to create routine: ${routineError.message}`);
        }
        if (dto.habits && dto.habits.length > 0) {
            console.warn('Asignación detallada de hábitos pausada por falta de tabla rutina_habitos');
        }
        return this.getRoutineById(userId, routine.idrutina);
    }
    async getRoutines(userId) {
        const trainerId = await this.getTrainerId(userId);
        const { data, error } = await this.supabaseService
            .getClient()
            .schema('seguimiento')
            .from('rutinas')
            .select('*')
            .eq('identrenador', trainerId);
        if (error) {
            throw new common_1.InternalServerErrorException(`Failed to fetch routines: ${error.message}`);
        }
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
        const { data, error } = await this.supabaseService
            .getClient()
            .schema('seguimiento')
            .from('rutinas')
            .select('*')
            .eq('idrutina', routineId)
            .eq('identrenador', trainerId)
            .single();
        if (error) {
            throw new common_1.NotFoundException(`Routine not found or not owned by trainer`);
        }
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
        const client = this.supabaseService.getClient();
        const updateData = {};
        if (dto.name !== undefined)
            updateData.objetivo = dto.name;
        if (dto.description !== undefined)
            updateData.descripcion = dto.description;
        if (Object.keys(updateData).length > 0) {
            const { error } = await client
                .schema('seguimiento')
                .from('rutinas')
                .update(updateData)
                .eq('idrutina', routineId)
                .eq('identrenador', trainerId);
            if (error) {
                throw new common_1.InternalServerErrorException(`Failed to update routine: ${error.message}`);
            }
        }
        if (dto.habits) {
            console.warn('Actualización de hábitos pausada por falta de tabla rutina_habitos');
        }
        return this.getRoutineById(userId, routineId);
    }
    async deleteRoutine(userId, routineId) {
        const trainerId = await this.getTrainerId(userId);
        await this.getRoutineById(userId, routineId);
        const client = this.supabaseService.getClient();
        const { error: deleteAssignsError } = await client
            .schema('seguimiento')
            .from('usuario_rutina')
            .delete()
            .eq('idrutina', routineId);
        if (deleteAssignsError) {
            throw new common_1.InternalServerErrorException(`Failed to delete routine assignments: ${deleteAssignsError.message}`);
        }
        const { error } = await client
            .schema('seguimiento')
            .from('rutinas')
            .delete()
            .eq('idrutina', routineId)
            .eq('identrenador', trainerId);
        if (error) {
            throw new common_1.InternalServerErrorException(`Failed to delete routine: ${error.message}`);
        }
    }
    async assignRoutineToClient(userId, clientId, routineId) {
        const trainerId = await this.getTrainerId(userId);
        const client = this.supabaseService.getClient();
        const { data: relationship, error: relError } = await client
            .schema('seguimiento')
            .from('usuario_entrenador')
            .select('fechainicio')
            .eq('identrenador', trainerId)
            .eq('idusuario', clientId)
            .single();
        if (relError || !relationship) {
            throw new common_1.NotFoundException(`Client ${clientId} is not assigned to trainer ${trainerId}`);
        }
        await this.getRoutineById(userId, routineId);
        const { error: assignError } = await client
            .schema('seguimiento')
            .from('usuario_rutina')
            .insert({
            idusuario: clientId,
            idrutina: routineId,
            estado: 'Activo',
        });
        if (assignError) {
            throw new common_1.InternalServerErrorException(`Failed to assign routine to client: ${assignError.message}`);
        }
        return {
            message: 'Routine assigned successfully to client',
            habitsAssigned: 0,
        };
    }
    async getClientProgress(userId, clientId) {
        const trainerId = await this.getTrainerId(userId);
        const client = this.supabaseService.getClient();
        const { data: relationship, error: relError } = await client
            .schema('seguimiento')
            .from('usuario_entrenador')
            .select('fechainicio')
            .eq('identrenador', trainerId)
            .eq('idusuario', clientId)
            .single();
        if (relError || !relationship) {
            throw new common_1.NotFoundException(`Client ${clientId} is not assigned to trainer ${trainerId}`);
        }
        return this.reportsService.getUserSummary(clientId);
    }
};
exports.CoachService = CoachService;
exports.CoachService = CoachService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        reports_service_1.ReportsService])
], CoachService);
//# sourceMappingURL=coach.service.js.map
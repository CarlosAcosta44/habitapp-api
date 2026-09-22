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
exports.CoachRepository = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/services/supabase.service");
let CoachRepository = class CoachRepository {
    supabaseService;
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
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
    async getClientsByTrainer(trainerId) {
        const { data, error } = await this.supabaseService
            .getClient()
            .schema('seguimiento')
            .from('usuario_entrenador')
            .select('fechainicio, idusuario')
            .eq('identrenador', trainerId);
        if (error) {
            throw new common_1.InternalServerErrorException(`Failed to fetch clients: ${error.message}`);
        }
        return data;
    }
    async getUserProfile(userId) {
        const { data } = await this.supabaseService
            .getClient()
            .schema('gestion')
            .from('usuarios')
            .select('*, roles(nombrerol)')
            .eq('idusuario', userId)
            .single();
        return data;
    }
    async createRoutine(trainerId, description, name) {
        const { data, error } = await this.supabaseService
            .getClient()
            .schema('seguimiento')
            .from('rutinas')
            .insert({
            identrenador: trainerId,
            tipo: 'General',
            descripcion: description,
            nivel: 'Principiante',
            objetivo: name,
        })
            .select()
            .single();
        if (error) {
            throw new common_1.InternalServerErrorException(`Failed to create routine: ${error.message}`);
        }
        return data;
    }
    async getRoutinesByTrainer(trainerId) {
        const { data, error } = await this.supabaseService
            .getClient()
            .schema('seguimiento')
            .from('rutinas')
            .select('*')
            .eq('identrenador', trainerId);
        if (error) {
            throw new common_1.InternalServerErrorException(`Failed to fetch routines: ${error.message}`);
        }
        return data;
    }
    async getRoutineByIdAndTrainer(routineId, trainerId) {
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
        return data;
    }
    async updateRoutine(routineId, trainerId, updateData) {
        const { error } = await this.supabaseService
            .getClient()
            .schema('seguimiento')
            .from('rutinas')
            .update(updateData)
            .eq('idrutina', routineId)
            .eq('identrenador', trainerId);
        if (error) {
            throw new common_1.InternalServerErrorException(`Failed to update routine: ${error.message}`);
        }
    }
    async deleteRoutineAssignments(routineId) {
        const { error } = await this.supabaseService
            .getClient()
            .schema('seguimiento')
            .from('usuario_rutina')
            .delete()
            .eq('idrutina', routineId);
        if (error) {
            throw new common_1.InternalServerErrorException(`Failed to delete routine assignments: ${error.message}`);
        }
    }
    async deleteRoutine(routineId, trainerId) {
        const { error } = await this.supabaseService
            .getClient()
            .schema('seguimiento')
            .from('rutinas')
            .delete()
            .eq('idrutina', routineId)
            .eq('identrenador', trainerId);
        if (error) {
            throw new common_1.InternalServerErrorException(`Failed to delete routine: ${error.message}`);
        }
    }
    async getClientTrainerRelationship(trainerId, clientId) {
        const { data, error } = await this.supabaseService
            .getClient()
            .schema('seguimiento')
            .from('usuario_entrenador')
            .select('fechainicio')
            .eq('identrenador', trainerId)
            .eq('idusuario', clientId)
            .single();
        if (error || !data) {
            throw new common_1.NotFoundException(`Client ${clientId} is not assigned to trainer ${trainerId}`);
        }
        return data;
    }
    async assignRoutineToClient(clientId, routineId) {
        const { error } = await this.supabaseService
            .getClient()
            .schema('seguimiento')
            .from('usuario_rutina')
            .insert({
            idusuario: clientId,
            idrutina: routineId,
            estado: 'Activo',
        });
        if (error) {
            throw new common_1.InternalServerErrorException(`Failed to assign routine to client: ${error.message}`);
        }
    }
};
exports.CoachRepository = CoachRepository;
exports.CoachRepository = CoachRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], CoachRepository);
//# sourceMappingURL=coach.repository.js.map
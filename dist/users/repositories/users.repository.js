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
var UsersRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersRepository = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
const user_profile_dto_1 = require("../dto/user-profile.dto");
let UsersRepository = UsersRepository_1 = class UsersRepository {
    supabaseService;
    logger = new common_1.Logger(UsersRepository_1.name);
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async getUserStats(userId) {
        const client = this.supabaseService.getClient().schema('seguimiento');
        const { data: allHabits, error: err1 } = await client
            .from('habitos')
            .select('idhabito, fechainicio, dias_semana, estado')
            .eq('idusuario', userId);
        if (err1)
            throw new common_1.InternalServerErrorException('Error fetch habits');
        const activeHabits = allHabits ? allHabits.filter(h => h.estado === 'Activo') : [];
        const { data: records, error: err2 } = await client
            .schema('seguimiento').from('registro_habitos')
            .select('idhabito, fecha')
            .eq('idusuario', userId)
            .eq('completado', true);
        if (err2)
            throw new common_1.InternalServerErrorException('Error fetch records');
        const activeHabitsCount = activeHabits ? activeHabits.length : 0;
        const totalCumplido = records?.length || 0;
        let totalEsperado = 0;
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        if (activeHabits) {
            for (const h of activeHabits) {
                let hStart = new Date(h.fechainicio);
                hStart.setHours(0, 0, 0, 0);
                let current = new Date(hStart);
                while (current <= hoy) {
                    let jsDay = current.getDay();
                    let habDay = jsDay === 0 ? 7 : jsDay;
                    if (h.dias_semana.includes(habDay))
                        totalEsperado++;
                    current.setDate(current.getDate() + 1);
                }
            }
        }
        const tasaExito = totalEsperado > 0 ? Math.min(100, Math.round((totalCumplido / totalEsperado) * 100)) : 100;
        let rachaActual = 0;
        const recordsByDate = {};
        if (records) {
            for (const r of records) {
                if (!recordsByDate[r.fecha])
                    recordsByDate[r.fecha] = [];
                recordsByDate[r.fecha].push(r.idhabito);
            }
        }
        let checkDate = new Date();
        let firstCheck = true;
        while (true) {
            const dStr = checkDate.toISOString().split('T')[0];
            let jsDay = checkDate.getDay();
            let habDay = jsDay === 0 ? 7 : jsDay;
            const scheduledForDay = allHabits?.filter(h => {
                const startDate = new Date(h.fechainicio);
                startDate.setHours(0, 0, 0, 0);
                return checkDate >= startDate && h.dias_semana && h.dias_semana.includes(habDay);
            }) || [];
            if (scheduledForDay.length > 0) {
                const completedIds = recordsByDate[dStr] || [];
                let allCompleted = true;
                for (const h of scheduledForDay) {
                    if (!completedIds.includes(h.idhabito)) {
                        allCompleted = false;
                        break;
                    }
                }
                if (allCompleted) {
                    rachaActual++;
                }
                else {
                    if (!firstCheck)
                        break;
                }
            }
            checkDate.setDate(checkDate.getDate() - 1);
            firstCheck = false;
            if (allHabits && allHabits.length > 0) {
                const oldestHabitDate = new Date(Math.min(...allHabits.map(h => new Date(h.fechainicio).getTime())));
                if (checkDate < oldestHabitDate)
                    break;
            }
            else {
                break;
            }
        }
        return {
            activeHabitsCount,
            tasaExito,
            diasTotales: totalCumplido,
            rachaActual,
        };
    }
    async findProfileById(userId, email) {
        const { data, error } = await this.supabaseService
            .getClient()
            .schema('gestion')
            .from('usuarios')
            .select('*, roles(nombrerol)')
            .eq('idusuario', userId)
            .single();
        if (error || !data) {
            throw new common_1.NotFoundException('Perfil de usuario no encontrado');
        }
        const { data: topUser } = await this.supabaseService
            .getClient()
            .schema('gestion')
            .from('usuarios')
            .select('puntostotales')
            .order('puntostotales', { ascending: false })
            .limit(1)
            .single();
        const maxPuntos = topUser?.puntostotales || 0;
        const puntosFaltantesTop1 = maxPuntos > data.puntostotales ? maxPuntos - data.puntostotales : 0;
        return {
            idusuario: data.idusuario,
            nombre: data.nombre,
            apellido: data.apellido,
            correo: email || '',
            fotoperfil: data.fotoperfil,
            telefono: data.telefono,
            genero: data.genero,
            fechanacimiento: data.fechanacimiento,
            puntostotales: data.puntostotales,
            idrol: data.idrol,
            nombrerol: data.roles?.nombrerol || 'Usuario',
            puntosFaltantesTop1,
        };
    }
    async findAllProfiles() {
        const { data, error } = await this.supabaseService
            .getClient()
            .schema('gestion')
            .from('usuarios')
            .select('*, roles(nombrerol)')
            .order('nombre', { ascending: true })
            .returns();
        if (error) {
            throw new common_1.InternalServerErrorException(`No se pudo listar usuarios: ${error.message}`);
        }
        return (data ?? []).map((u) => ({
            idusuario: u.idusuario,
            nombre: u.nombre,
            apellido: u.apellido,
            fotoperfil: u.fotoperfil,
            telefono: u.telefono,
            genero: u.genero,
            fechanacimiento: u.fechanacimiento,
            puntostotales: u.puntostotales,
            idrol: u.idrol,
            nombrerol: u.roles?.nombrerol || 'Usuario',
        }));
    }
    async updateProfile(userId, payload) {
        const { error: updateError } = await this.supabaseService
            .getClient()
            .schema('gestion')
            .from('usuarios')
            .update(payload)
            .eq('idusuario', userId);
        if (updateError) {
            throw new common_1.InternalServerErrorException(`No se pudo actualizar el perfil: ${updateError.message}`);
        }
        return this.findProfileById(userId);
    }
    async updateRole(userId, roleName) {
        const { data: role, error: roleError } = await this.supabaseService
            .getClient()
            .schema('gestion')
            .from('roles')
            .select('idrol')
            .eq('nombrerol', roleName)
            .single();
        if (roleError || !role) {
            throw new common_1.NotFoundException(`Rol ${roleName} no encontrado`);
        }
        const { error: updateError } = await this.supabaseService
            .getClient()
            .schema('gestion')
            .from('usuarios')
            .update({ idrol: role.idrol })
            .eq('idusuario', userId);
        if (updateError) {
            throw new common_1.InternalServerErrorException(`No se pudo actualizar el rol: ${updateError.message}`);
        }
        return this.findProfileById(userId);
    }
    async updateFcmToken(userId, token) {
        const { error } = await this.supabaseService
            .getClient()
            .schema('gestion')
            .from('usuarios')
            .update({ fcm_token: token })
            .eq('idusuario', userId);
        if (error) {
            this.logger.error(`Error updating fcm_token for user ${userId}:`, error.message);
            throw new common_1.InternalServerErrorException('Error al actualizar el token FCM');
        }
    }
    async uploadAvatar(userId, file, token) {
        const fileExt = file.originalname.split('.').pop() || 'png';
        const fileName = `${userId}_${Date.now()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;
        const { createClient } = require('@supabase/supabase-js');
        const client = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '', {
            global: {
                headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
                fetch: require('node-fetch'),
            },
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
        });
        const { error: uploadError } = await client
            .storage.from('avatars')
            .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: true,
        });
        if (uploadError) {
            throw new common_1.InternalServerErrorException(`Error al subir imagen al bucket: ${uploadError.message}`);
        }
        const { data } = client
            .storage.from('avatars')
            .getPublicUrl(filePath);
        await this.updateProfile(userId, { fotoperfil: data.publicUrl });
        return { url: data.publicUrl };
    }
    async findByEmail(email) {
        const { data, error } = await this.supabaseService
            .getClient()
            .schema('gestion')
            .from('usuarios')
            .select('*, roles(nombrerol)')
            .eq('email', email)
            .single();
        if (error && error.code !== 'PGRST116') {
            throw new common_1.InternalServerErrorException(`Error al buscar usuario por email: ${error.message}`);
        }
        return data || null;
    }
    async getDefaultRoleId() {
        const { data, error } = await this.supabaseService
            .getClient()
            .schema('gestion')
            .from('roles')
            .select('idrol')
            .eq('nombrerol', user_profile_dto_1.RoleName.USER)
            .single();
        if (error || !data) {
            throw new common_1.InternalServerErrorException('No se pudo encontrar el rol por defecto (Usuario)');
        }
        return data.idrol;
    }
    async createLocalUser(payload) {
        const { data, error } = await this.supabaseService
            .getClient()
            .schema('gestion')
            .from('usuarios')
            .insert(payload)
            .select()
            .single();
        if (error) {
            throw new common_1.InternalServerErrorException(`Error al crear usuario: ${error.message}`);
        }
        return data;
    }
    async markEmailVerified(userId) {
        const { error } = await this.supabaseService
            .getClient()
            .schema('gestion')
            .from('usuarios')
            .update({ email_verified: true })
            .eq('idusuario', userId);
        if (error) {
            throw new common_1.InternalServerErrorException(`Error al verificar email: ${error.message}`);
        }
    }
    async updatePassword(userId, passwordHash) {
        const { error } = await this.supabaseService
            .getClient()
            .schema('gestion')
            .from('usuarios')
            .update({ password_hash: passwordHash })
            .eq('idusuario', userId);
        if (error) {
            throw new common_1.InternalServerErrorException(`Error al actualizar contraseña: ${error.message}`);
        }
    }
    async getSimpleProfile(userId) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('perfiles_usuarios_api')
            .select('nombre, apellido, fotoperfil, puntostotales')
            .eq('idusuario', userId)
            .maybeSingle();
        if (error) {
            throw new common_1.InternalServerErrorException(`Error al obtener perfil simplificado: ${error.message}`);
        }
        if (!data)
            return null;
        return {
            nombre: data.nombre ?? 'Usuario',
            apellido: data.apellido ?? '',
            fotoperfil: data.fotoperfil ?? null,
            puntos: data.puntostotales ?? 0,
        };
    }
    async getPointsHistory(userId, limit) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('api_historial_puntos')
            .select('*')
            .eq('idusuario', userId)
            .order('fecha', { ascending: false })
            .limit(limit)
            .returns();
        if (error) {
            throw new common_1.InternalServerErrorException(`Error al obtener historial de puntos: ${error.message}`);
        }
        return data ?? [];
    }
    async getAchievements(userId) {
        const { data: logrosGanados, error: ganadosError } = await this.supabaseService
            .getClient()
            .from('api_usuario_logro')
            .select('*')
            .eq('idusuario', userId)
            .returns();
        if (ganadosError) {
            throw new common_1.InternalServerErrorException(`Error al obtener logros: ${ganadosError.message}`);
        }
        const idsGanados = (logrosGanados ?? []).map((l) => l.idlogro);
        if (idsGanados.length === 0)
            return [];
        const { data: catalogoLogros, error: catalogoError } = await this.supabaseService
            .getClient()
            .from('api_logros')
            .select('*')
            .in('idlogro', idsGanados)
            .returns();
        if (catalogoError) {
            throw new common_1.InternalServerErrorException(`Error al obtener catálogo de logros: ${catalogoError.message}`);
        }
        return (catalogoLogros ?? []).map((lg) => {
            const meta = (logrosGanados ?? []).find((ul) => ul.idlogro === lg.idlogro);
            return {
                id: lg.idlogro,
                nombre: lg.nombre,
                desc: lg.descripcion,
                fecha: meta?.fechaobtenido || 'Recientemente',
                icono: lg.icono,
            };
        });
    }
};
exports.UsersRepository = UsersRepository;
exports.UsersRepository = UsersRepository = UsersRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], UsersRepository);
//# sourceMappingURL=users.repository.js.map
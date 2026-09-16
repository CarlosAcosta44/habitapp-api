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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const users_repository_1 = require("../repositories/users.repository");
let UsersService = class UsersService {
    usersRepository;
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async getUserStats(userId) {
        return this.usersRepository.getUserStats(userId);
    }
    getProfile(userId, email) {
        return this.usersRepository.findProfileById(userId, email);
    }
    listProfiles() {
        return this.usersRepository.findAllProfiles();
    }
    updateProfile(userId, dto) {
        return this.usersRepository.updateProfile(userId, dto);
    }
    updateUserRole(actorId, targetUserId, dto) {
        if (actorId === targetUserId) {
            throw new common_1.BadRequestException('No puedes cambiar tu propio rol desde este endpoint');
        }
        return this.usersRepository.updateRole(targetUserId, dto.nombrerol);
    }
    uploadAvatar(userId, file, token) {
        return this.usersRepository.uploadAvatar(userId, file, token);
    }
    updateFcmToken(userId, fcmToken) {
        return this.usersRepository.updateFcmToken(userId, fcmToken);
    }
    getSimpleProfile(userId) {
        return this.usersRepository.getSimpleProfile(userId);
    }
    getPointsHistory(userId, limit) {
        return this.usersRepository.getPointsHistory(userId, limit);
    }
    getAchievements(userId) {
        return this.usersRepository.getAchievements(userId);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_repository_1.UsersRepository])
], UsersService);
//# sourceMappingURL=users.service.js.map
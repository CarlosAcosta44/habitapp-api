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
exports.FriendsService = void 0;
const common_1 = require("@nestjs/common");
const friends_repository_1 = require("../repositories/friends.repository");
let FriendsService = class FriendsService {
    friendsRepo;
    constructor(friendsRepo) {
        this.friendsRepo = friendsRepo;
    }
    async addFriend(userId, targetUserId) {
        if (userId === targetUserId) {
            throw new common_1.BadRequestException('No puedes agregarte a ti mismo como amigo');
        }
        const targetExists = await this.friendsRepo.targetUserExists(targetUserId);
        if (!targetExists) {
            throw new common_1.NotFoundException('El usuario que intentas agregar no existe');
        }
        const alreadyFriends = await this.friendsRepo.existsRelation(userId, targetUserId);
        if (alreadyFriends) {
            throw new common_1.BadRequestException('Este usuario ya está en tu red de amigos');
        }
        await this.friendsRepo.createAcceptedRelation(userId, targetUserId);
        return { success: true };
    }
    async getFriends(userId) {
        return this.friendsRepo.getAcceptedFriends(userId);
    }
    async getSuggestions(userId, limit = 12) {
        return this.friendsRepo.getFriendSuggestions(userId, limit);
    }
};
exports.FriendsService = FriendsService;
exports.FriendsService = FriendsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [friends_repository_1.FriendsRepository])
], FriendsService);
//# sourceMappingURL=friends.service.js.map
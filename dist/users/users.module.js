"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const supabase_module_1 = require("../supabase/supabase.module");
const users_controller_1 = require("./controllers/users.controller");
const community_controller_1 = require("./controllers/community.controller");
const habits_controller_1 = require("./controllers/habits.controller");
const records_controller_1 = require("./controllers/records.controller");
const friends_controller_1 = require("./controllers/friends.controller");
const users_service_1 = require("./services/users.service");
const community_service_1 = require("./services/community.service");
const habits_service_1 = require("./services/habits.service");
const records_service_1 = require("./services/records.service");
const friends_service_1 = require("./services/friends.service");
const users_repository_1 = require("./repositories/users.repository");
const community_repository_1 = require("./repositories/community.repository");
const habits_repository_1 = require("./repositories/habits.repository");
const records_repository_1 = require("./repositories/records.repository");
const friends_repository_1 = require("./repositories/friends.repository");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [supabase_module_1.SupabaseModule],
        controllers: [
            users_controller_1.UsersController,
            community_controller_1.ComunidadController,
            habits_controller_1.HabitsController,
            records_controller_1.RecordsController,
            friends_controller_1.FriendsController,
        ],
        providers: [
            users_service_1.UsersService,
            users_repository_1.UsersRepository,
            community_service_1.CommunityService,
            community_repository_1.CommunityRepository,
            habits_service_1.HabitsService,
            habits_repository_1.HabitsRepository,
            records_service_1.RecordsService,
            records_repository_1.RecordsRepository,
            friends_service_1.FriendsService,
            friends_repository_1.FriendsRepository,
        ],
        exports: [users_service_1.UsersService, users_repository_1.UsersRepository, community_service_1.CommunityService],
    })
], UsersModule);
//# sourceMappingURL=users.module.js.map
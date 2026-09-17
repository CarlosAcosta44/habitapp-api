"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendsModule = void 0;
const common_1 = require("@nestjs/common");
const supabase_module_1 = require("../supabase/supabase.module");
const friends_repository_1 = require("./repositories/friends.repository");
const friends_service_1 = require("./services/friends.service");
const friends_controller_1 = require("./friends.controller");
let FriendsModule = class FriendsModule {
};
exports.FriendsModule = FriendsModule;
exports.FriendsModule = FriendsModule = __decorate([
    (0, common_1.Module)({
        imports: [supabase_module_1.SupabaseModule],
        controllers: [friends_controller_1.FriendsController],
        providers: [friends_service_1.FriendsService, friends_repository_1.FriendsRepository],
    })
], FriendsModule);
//# sourceMappingURL=friends.module.js.map
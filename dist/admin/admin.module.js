"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const admin_controller_1 = require("./controllers/admin.controller");
const admin_service_1 = require("./services/admin.service");
const admin_repository_1 = require("./repositories/admin.repository");
const quotes_service_1 = require("./services/quotes.service");
const quotes_repository_1 = require("./repositories/quotes.repository");
const users_module_1 = require("../users/users.module");
const supabase_module_1 = require("../supabase/supabase.module");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [supabase_module_1.SupabaseModule, users_module_1.UsersModule],
        controllers: [admin_controller_1.AdminController],
        providers: [admin_service_1.AdminService, admin_repository_1.AdminRepository, quotes_service_1.QuotesService, quotes_repository_1.QuotesRepository],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map
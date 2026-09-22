"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoachModule = void 0;
const common_1 = require("@nestjs/common");
const supabase_module_1 = require("../supabase/supabase.module");
const coach_controller_1 = require("./controllers/coach.controller");
const coach_service_1 = require("./services/coach.service");
const reports_module_1 = require("../reports/reports.module");
const coach_repository_1 = require("./repositories/coach.repository");
let CoachModule = class CoachModule {
};
exports.CoachModule = CoachModule;
exports.CoachModule = CoachModule = __decorate([
    (0, common_1.Module)({
        imports: [supabase_module_1.SupabaseModule, reports_module_1.ReportsModule],
        controllers: [coach_controller_1.CoachController],
        providers: [coach_service_1.CoachService, coach_repository_1.CoachRepository],
    })
], CoachModule);
//# sourceMappingURL=coach.module.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordsModule = void 0;
const common_1 = require("@nestjs/common");
const supabase_module_1 = require("../supabase/supabase.module");
const habits_module_1 = require("../habits/habits.module");
const records_repository_1 = require("./repositories/records.repository");
const records_service_1 = require("./services/records.service");
const records_controller_1 = require("./records.controller");
let RecordsModule = class RecordsModule {
};
exports.RecordsModule = RecordsModule;
exports.RecordsModule = RecordsModule = __decorate([
    (0, common_1.Module)({
        imports: [supabase_module_1.SupabaseModule, habits_module_1.HabitsModule],
        controllers: [records_controller_1.RecordsController],
        providers: [records_service_1.RecordsService, records_repository_1.RecordsRepository],
    })
], RecordsModule);
//# sourceMappingURL=records.module.js.map
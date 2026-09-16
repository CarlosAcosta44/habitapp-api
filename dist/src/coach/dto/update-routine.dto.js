"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRoutineDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_routine_dto_1 = require("./create-routine.dto");
class UpdateRoutineDto extends (0, swagger_1.PartialType)(create_routine_dto_1.CreateRoutineDto) {
}
exports.UpdateRoutineDto = UpdateRoutineDto;
//# sourceMappingURL=update-routine.dto.js.map
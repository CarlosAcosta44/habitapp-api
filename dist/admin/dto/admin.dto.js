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
exports.DailyQuoteDto = exports.DeleteCommentResponseDto = exports.DeleteForumResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class DeleteForumResponseDto {
    message;
}
exports.DeleteForumResponseDto = DeleteForumResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Forum and its comments deleted successfully',
        description: 'Mensaje de confirmación del borrado',
    }),
    __metadata("design:type", String)
], DeleteForumResponseDto.prototype, "message", void 0);
class DeleteCommentResponseDto {
    message;
}
exports.DeleteCommentResponseDto = DeleteCommentResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Comment deleted successfully',
        description: 'Mensaje de confirmación del borrado',
    }),
    __metadata("design:type", String)
], DeleteCommentResponseDto.prototype, "message", void 0);
class DailyQuoteDto {
    phrase;
    author;
}
exports.DailyQuoteDto = DailyQuoteDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'El éxito es la suma de pequeños esfuerzos repetidos día tras día.',
        description: 'Frase motivacional del día',
    }),
    __metadata("design:type", String)
], DailyQuoteDto.prototype, "phrase", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Robert Collier',
        description: 'Autor de la frase',
    }),
    __metadata("design:type", String)
], DailyQuoteDto.prototype, "author", void 0);
//# sourceMappingURL=admin.dto.js.map
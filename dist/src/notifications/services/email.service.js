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
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let EmailService = EmailService_1 = class EmailService {
    configService;
    logger = new common_1.Logger(EmailService_1.name);
    apiKey;
    fromEmail;
    constructor(configService) {
        this.configService = configService;
        this.apiKey = this.configService.get('RESEND_API_KEY') || '';
        this.fromEmail =
            this.configService.get('EMAIL_FROM') ||
                'HabitApp <onboarding@resend.dev>';
    }
    async sendEmail(to, subject, html) {
        if (!this.apiKey) {
            this.logger.warn('RESEND_API_KEY no configurada en las variables de entorno. Saltando envío de correo.');
            return false;
        }
        try {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: this.fromEmail,
                    to: [to],
                    subject,
                    html,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                this.logger.error(`Error al enviar correo vía Resend: ${JSON.stringify(data)}`);
                return false;
            }
            this.logger.log(`Correo enviado exitosamente a ${to}. ID: ${data.id}`);
            return true;
        }
        catch (error) {
            const err = error;
            this.logger.error(`Excepción al enviar correo a ${to}: ${err.message}`);
            return false;
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map
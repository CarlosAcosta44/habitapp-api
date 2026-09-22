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
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const resend_1 = require("resend");
let MailService = class MailService {
    configService;
    resend;
    fromEmail;
    frontendUrl;
    constructor(configService) {
        this.configService = configService;
        const apiKey = this.configService.get('RESEND_API_KEY') ||
            're_dummy_key_for_dev';
        this.resend = new resend_1.Resend(apiKey);
        this.fromEmail =
            this.configService.get('MAIL_FROM') || 'noreply@habitapp.io';
        this.frontendUrl =
            this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    }
    async sendVerificationEmail(email, token) {
        const verificationUrl = `${this.frontendUrl}/auth/verify-email?token=${token}`;
        try {
            await this.resend.emails.send({
                from: `HabitApp <${this.fromEmail}>`,
                to: email,
                subject: 'Verifica tu cuenta en HabitApp',
                html: `
          <h1>¡Bienvenido a HabitApp!</h1>
          <p>Por favor, haz clic en el siguiente enlace para verificar tu correo electrónico:</p>
          <a href="${verificationUrl}">${verificationUrl}</a>
          <p>Si no creaste esta cuenta, puedes ignorar este correo.</p>
        `,
            });
        }
        catch (error) {
            console.error('Failed to send verification email', error);
        }
    }
    async sendPasswordResetEmail(email, token) {
        const resetUrl = `${this.frontendUrl}/auth/reset-password?token=${token}`;
        try {
            await this.resend.emails.send({
                from: `HabitApp <${this.fromEmail}>`,
                to: email,
                subject: 'Recuperación de contraseña',
                html: `
          <h1>Recuperación de Contraseña</h1>
          <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>Si no solicitaste esto, puedes ignorar este correo de forma segura.</p>
        `,
            });
        }
        catch (error) {
            console.error('Failed to send reset email', error);
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map
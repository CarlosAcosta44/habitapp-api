import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private configService;
    private resend;
    private fromEmail;
    private frontendUrl;
    constructor(configService: ConfigService);
    sendVerificationEmail(email: string, token: string): Promise<void>;
    sendPasswordResetEmail(email: string, token: string): Promise<void>;
}

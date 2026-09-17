import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private readonly configService;
    private readonly logger;
    private readonly apiKey;
    private readonly fromEmail;
    constructor(configService: ConfigService);
    sendEmail(to: string, subject: string, html: string): Promise<boolean>;
}

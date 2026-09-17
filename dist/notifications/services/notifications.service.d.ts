import { NotificationsRepository } from '../repositories/notifications.repository';
import { EmailService } from './email.service';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateNotificationDto, NotificationDto } from '../dto/notification.dto';
export declare class NotificationsService {
    private readonly notificationsRepository;
    private readonly emailService;
    private readonly supabaseService;
    private readonly logger;
    constructor(notificationsRepository: NotificationsRepository, emailService: EmailService, supabaseService: SupabaseService);
    getNotificationsForUser(userId: string): Promise<NotificationDto[]>;
    createNotification(dto: CreateNotificationDto): Promise<NotificationDto>;
    markAsRead(notificationId: string, userId: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
    private sendNotificationEmailAsync;
    private mapRowToDto;
}

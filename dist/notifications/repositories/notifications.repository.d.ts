import { SupabaseService } from '../../supabase/supabase.service';
import { NotificationRow } from '../entities/notification.entity';
import { CreateNotificationDto } from '../dto/notification.dto';
export declare class NotificationsRepository {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    findByUser(userId: string): Promise<NotificationRow[]>;
    findById(notificationId: string): Promise<NotificationRow>;
    create(dto: CreateNotificationDto): Promise<NotificationRow>;
    markAsRead(notificationId: string, userId: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
}

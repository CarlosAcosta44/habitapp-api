import { UserRole } from '../../users/dto/user-profile.dto';
import { NotificationDto } from '../dto/notification.dto';
import { NotificationsService } from '../services/notifications.service';
interface AuthenticatedUser {
    userId: string;
    email?: string;
    role: UserRole;
}
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(user: AuthenticatedUser): Promise<NotificationDto[]>;
    markAsRead(user: AuthenticatedUser, notificationId: string): Promise<void>;
    markAllAsRead(user: AuthenticatedUser): Promise<void>;
}
export {};

export declare enum NotificationType {
    HABITO = "Habito",
    COMUNIDAD = "Comunidad",
    ENTRENADOR = "Entrenador",
    SISTEMA = "Sistema"
}
export declare class CreateNotificationDto {
    mensaje: string;
    tipo: NotificationType;
    idusuario: string;
}
export declare class NotificationDto {
    id: string;
    message: string;
    type: NotificationType;
    isRead: boolean;
    createdAt: string;
    userId: string;
}

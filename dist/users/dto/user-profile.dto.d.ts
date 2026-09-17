export declare enum UserRole {
    USER = "usuario",
    TRAINER = "entrenador",
    ADMIN = "administrador"
}
export declare enum RoleName {
    USER = "Usuario",
    TRAINER = "Entrenador",
    ADMIN = "Administrador"
}
export declare class UpdateUserProfileDto {
    nombre?: string;
    apellido?: string;
    fotoperfil?: string;
    telefono?: string;
    genero?: string;
    fechanacimiento?: string;
    zona_horaria?: string;
}
export declare class UserProfileDto {
    idusuario: string;
    nombre: string;
    apellido: string;
    fotoperfil: string | null;
    telefono?: string | null;
    genero?: string | null;
    fechanacimiento?: string | null;
    puntostotales: number;
    idrol: string;
    nombrerol: string;
}

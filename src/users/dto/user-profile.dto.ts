export class UserProfileDto {
  idusuario: string;
  nombre: string;
  apellido: string;
  telefono: string | null;
  genero: string | null;
  fechanacimiento: string | null;
  fotoperfil: string | null;
  estado: string;
  puntostotales: number;
  idrol: string;
}

export class UserPointsDto {
  idusuario: string;
  puntostotales: number;
}

export interface UserProfileRow {
  idusuario: string;
  nombre: string;
  apellido: string;
  correo?: string;
  fotoperfil: string | null;
  telefono?: string | null;
  genero?: string | null;
  fechanacimiento?: string | null;
  puntostotales: number;
  idrol: string;
  nombrerol: string;
  puntosFaltantesTop1?: number;
}

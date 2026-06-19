export interface NotificationRow {
  idnotificacion: string;
  mensaje: string;
  tipo: 'Habito' | 'Comunidad' | 'Entrenador' | 'Sistema';
  leida: boolean;
  fecha: string;
  idusuario: string;
}

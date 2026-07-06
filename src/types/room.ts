export type EstadoHabitacion =
  | 'DISPONIBLE'
  | 'RESERVADA'
  | 'OCUPADA'
  | 'LIMPIEZA'
  | 'FUERA_DE_SERVICIO';

export type Room = {
  id: string;
  numero: string;
  tipo: string;
  capacidad: number;
  estado: EstadoHabitacion;
  creadoEn: string;
  actualizadoEn: string;
};
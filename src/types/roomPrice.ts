export type RoomPrice = {
  id: string;
  precio: number;
  vigenteDesde: string;
  vigenteHasta?: string | null;
  activo: boolean;
  tipoHabitacion?: string | null;
  habitacion?: {
    id: string;
    numero: string;
    tipo: string;
  } | null;
  creadoEn: string;
  actualizadoEn: string;
};
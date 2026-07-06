export type SpecialRate = {
  id: string;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  vigenteDesde: string;
  vigenteHasta: string;
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
export type EstadoReserva =
  | 'PENDIENTE'
  | 'CONFIRMADA'
  | 'CANCELADA'
  | 'CONVERTIDA';

export type Reservation = {
  id: string;
  fechaIngreso: string;
  fechaSalida: string;
  estado: EstadoReserva;
  cliente: {
    id: string;
    nombreCompleto: string;
    documento: string;
  };
  habitacion: {
    id: string;
    numero: string;
    tipo: string;
  };
  creadoEn: string;
  actualizadoEn: string;
};
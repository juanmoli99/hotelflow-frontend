export type EstadoReserva =
  | 'PENDIENTE'
  | 'CONFIRMADA'
  | 'CANCELADA'
  | 'CONVERTIDA';

export type MetodoSena =
  | 'EFECTIVO'
  | 'TARJETA'
  | 'TRANSFERENCIA'
  | 'MERCADO_PAGO'
  | 'OTRO';

export type Reservation = {
  id: string;
  fechaIngreso: string;
  fechaSalida: string;

  subtotal: number;
  total: number;
  sena: number;
  saldoPendiente: number;
  metodoSena?: MetodoSena | null;

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
    capacidad: number;
    estado: string;
  };

  tarifaEspecial?: {
    id: string;
    nombre: string;
    precio: number;
  } | null;

  movimientoCajaSena?: {
    id: string;
    monto: number;
    descripcion?: string | null;
  } | null;

  creadoEn: string;
  actualizadoEn: string;
};
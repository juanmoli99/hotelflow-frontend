export type MetodoPago =
  | 'EFECTIVO'
  | 'TARJETA'
  | 'TRANSFERENCIA'
  | 'MERCADO_PAGO'
  | 'OTRO';

export type Payment = {
  id: string;
  monto: number;
  metodo: MetodoPago;
  descripcion?: string | null;
  creadoEn: string;
  actualizadoEn: string;
  alojamiento: {
    id: string;
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
  };
  usuario: {
    id: string;
    usuario: string;
    nombreCompleto: string;
  };
};
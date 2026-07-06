export type EstadoGastoFijo = 'PENDIENTE' | 'PAGADO' | 'CANCELADO';

export type FixedExpense = {
  id: string;
  nombre: string;
  descripcion?: string | null;
  monto: number;
  fechaVencimiento: string;
  fechaPago?: string | null;
  estado: EstadoGastoFijo;
  creadoEn: string;
  actualizadoEn: string;
  usuario: {
    id: string;
    usuario: string;
    nombreCompleto: string;
  };
  movimientoCaja?: {
    id: string;
    tipo: string;
    monto: number;
    descripcion?: string | null;
    creadoEn: string;
  } | null;
};
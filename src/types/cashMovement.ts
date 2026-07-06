export type TipoMovimientoCaja = 'INGRESO' | 'EGRESO';

export type CashMovement = {
  id: string;
  tipo: TipoMovimientoCaja;
  monto: number;
  descripcion?: string | null;
  creadoEn: string;
  actualizadoEn: string;
  usuario: {
    id: string;
    usuario: string;
    nombreCompleto: string;
  };
  pago?: {
    id: string;
    monto: number;
    metodo: string;
    descripcion?: string | null;
  } | null;
  gastoFijo?: {
    id: string;
    nombre: string;
    monto: number;
    estado: string;
  } | null;
};

export type CashSummary = {
  ingresos: number;
  egresos: number;
  saldo: number;
};
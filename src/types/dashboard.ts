export type DashboardSummary = {
  habitaciones: {
    total: number;
    disponibles: number;
    reservadas: number;
    ocupadas: number;
    limpieza: number;
    fueraDeServicio: number;
  };
  caja: {
    ingresos: number;
    egresos: number;
    saldo: number;
  };
};
export type CashReport = {
  ingresos: number;
  egresos: number;
  saldo: number;
};

export type PaymentByMethodReport = {
  metodo: string;
  cantidad: number;
  total: number;
};

export type ReservationReport = {
  id: string;
  estado: string;
  fechaIngreso: string;
  fechaSalida: string;
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

export type RoomOccupancyReport = {
  totalHabitaciones: number;
  diasPeriodo: number;
  nochesDisponibles: number;
  nochesOcupadas: number;
  porcentajeOcupacion: number;
};
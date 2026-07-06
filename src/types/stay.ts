export type EstadoAlojamiento = 'ACTIVO' | 'FINALIZADO';

export type Stay = {
  id: string;
  fechaIngreso: string;
  fechaSalida: string;
  estado: EstadoAlojamiento;
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
  reserva?: {
    id: string;
    estado: string;
  } | null;
  creadoEn: string;
  actualizadoEn: string;
};
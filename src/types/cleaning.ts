export type CleaningLog = {
  id: string;
  observaciones?: string | null;
  creadoEn: string;
  actualizadoEn: string;
  habitacion: {
    id: string;
    numero: string;
    tipo: string;
    estado: string;
  };
  usuario: {
    id: string;
    usuario: string;
    nombreCompleto: string;
  };
};
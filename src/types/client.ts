export type Client = {
  id: string;
  nombreCompleto: string;
  documento: string;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  observaciones?: string | null;
  creadoEn: string;
  actualizadoEn: string;
};
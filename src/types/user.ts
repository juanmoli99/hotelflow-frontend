import type { Rol } from './auth';

export type UsuarioSistema = {
  id: string;
  usuario: string;
  nombreCompleto: string;
  activo: boolean;
  rol: Rol | null;
  creadoEn: string;
  actualizadoEn: string;
};
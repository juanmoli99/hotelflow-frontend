export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: unknown;
};

export type Rol = {
  id: string;
  nombre: string;
  descripcion?: string | null;
};

export type UsuarioAutenticado = {
  id: string;
  usuario: string;
  nombreCompleto: string;
  activo: boolean;
  rol: Rol;
};

export type LoginDto = {
  usuario: string;
  contrasena: string;
};

export type LoginResponse = {
  token: string;
  usuario: UsuarioAutenticado;
};
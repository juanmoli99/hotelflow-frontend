import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import type { ReactNode } from 'react';

import { api } from '../api/api';

import type {
  ApiResponse,
  LoginDto,
  LoginResponse,
  UsuarioAutenticado,
} from '../types/auth';

type AuthContextType = {
  usuario: UsuarioAutenticado | null;
  token: string | null;
  estaAutenticado: boolean;
  login: (data: LoginDto) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenGuardado = localStorage.getItem('hotelflow_token');
    const usuarioGuardado = localStorage.getItem('hotelflow_user');

    if (tokenGuardado && usuarioGuardado) {
      setToken(tokenGuardado);
      setUsuario(JSON.parse(usuarioGuardado));
    }
  }, []);

  async function login(data: LoginDto) {
    const response = await api.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      data,
    );

    const tokenRecibido = response.data.data.token;
    const usuarioRecibido = response.data.data.usuario;

    localStorage.setItem('hotelflow_token', tokenRecibido);
    localStorage.setItem(
      'hotelflow_user',
      JSON.stringify(usuarioRecibido),
    );

    setToken(tokenRecibido);
    setUsuario(usuarioRecibido);
  }

  function logout() {
    localStorage.removeItem('hotelflow_token');
    localStorage.removeItem('hotelflow_user');

    setToken(null);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        estaAutenticado: Boolean(token && usuario),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }

  return context;
}
import { useState } from 'react';

import type { FormEvent } from 'react';

import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const { login } = useAuth();

  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');
    setCargando(true);

    try {
      await login({
        usuario,
        contrasena,
      });
    } catch {
      setError('Usuario o contraseña incorrectos.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <main>
      <h1>HotelFlow</h1>
      <h2>Iniciar sesión</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="usuario">Usuario</label>
          <input
            id="usuario"
            type="text"
            value={usuario}
            onChange={(event) => setUsuario(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="contrasena">Contraseña</label>
          <input
            id="contrasena"
            type="password"
            value={contrasena}
            onChange={(event) => setContrasena(event.target.value)}
          />
        </div>

        {error && <p>{error}</p>}

        <button type="submit" disabled={cargando}>
          {cargando ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </main>
  );
}
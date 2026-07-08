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

    const usuarioLimpio = usuario.trim().toLowerCase();
    const contrasenaLimpia = contrasena.trim();

    if (!usuarioLimpio || !contrasenaLimpia) {
      setError('Completá usuario y contraseña.');
      return;
    }

    setError('');
    setCargando(true);

    try {
      await login({
        usuario: usuarioLimpio,
        contrasena: contrasenaLimpia,
      });
    } catch {
      setError('Usuario o contraseña incorrectos.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <h1>HotelFlow</h1>
          <p>Gestión hotelera simple y ordenada</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Iniciar sesión</h2>

          <div>
            <label htmlFor="usuario">Usuario</label>
            <input
              id="usuario"
              type="text"
              value={usuario}
              onChange={(event) => setUsuario(event.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              autoComplete="username"
              disabled={cargando}
            />
          </div>

          <div>
            <label htmlFor="contrasena">Contraseña</label>
            <input
              id="contrasena"
              type="password"
              value={contrasena}
              onChange={(event) => setContrasena(event.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              autoComplete="current-password"
              disabled={cargando}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </section>
    </main>
  );
}
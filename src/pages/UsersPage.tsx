import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';

import type { FormEvent } from 'react';

import { api } from '../api/api';
import { Alert } from '../components/Alert';
import { CollapsibleForm } from '../components/CollapsibleForm';

import type { ApiResponse, Rol } from '../types/auth';
import type { UsuarioSistema } from '../types/user';

function obtenerMensajeError(error: unknown, mensajeDefault: string) {
  if (error instanceof AxiosError) {
    const mensaje = error.response?.data?.message;

    if (Array.isArray(mensaje)) {
      return mensaje.join(' ');
    }

    if (typeof mensaje === 'string') {
      return mensaje;
    }
  }

  return mensajeDefault;
}

export function UsersPage() {
  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);

  const [usuario, setUsuario] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [rolId, setRolId] = useState('');

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setError('');

    try {
      const [usuariosResponse, rolesResponse] = await Promise.all([
        api.get<ApiResponse<UsuarioSistema[]>>('/users'),
        api.get<ApiResponse<Rol[]>>('/roles'),
      ]);

      setUsuarios(usuariosResponse.data.data);
      setRoles(rolesResponse.data.data);
    } catch {
      setError('No se pudieron cargar los usuarios.');
    } finally {
      setCargando(false);
    }
  }

  async function crearUsuario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');
    setExito('');

    if (!usuario.trim()) {
      setError('El usuario es obligatorio.');
      return;
    }

    if (!nombreCompleto.trim()) {
      setError('El nombre completo es obligatorio.');
      return;
    }

    if (!contrasena.trim()) {
      setError('La contraseña es obligatoria.');
      return;
    }

    if (contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (!rolId) {
      setError('El rol es obligatorio.');
      return;
    }

    setGuardando(true);

    try {
      await api.post('/users', {
        usuario,
        nombreCompleto,
        contrasena,
        rolId,
      });

      setUsuario('');
      setNombreCompleto('');
      setContrasena('');
      setRolId('');

      await cargarDatos();

      setExito('Usuario creado correctamente.');
    } catch (error) {
      setError(obtenerMensajeError(error, 'No se pudo crear el usuario.'));
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <section>
        <h2>Usuarios</h2>
        <p>Cargando...</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Usuarios</h2>

      <CollapsibleForm title="Nuevo usuario">
        <form onSubmit={crearUsuario} noValidate>
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
            <label htmlFor="nombreCompleto">Nombre completo</label>
            <input
              id="nombreCompleto"
              type="text"
              value={nombreCompleto}
              onChange={(event) => setNombreCompleto(event.target.value)}
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

          <div>
            <label htmlFor="rolId">Rol</label>
            <select
              id="rolId"
              value={rolId}
              onChange={(event) => setRolId(event.target.value)}
            >
              <option value="">Seleccionar rol</option>

              {roles.map((rol) => (
                <option key={rol.id} value={rol.id}>
                  {rol.nombre}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Crear usuario'}
          </button>
        </form>
      </CollapsibleForm>

      {error && <Alert type="error">{error}</Alert>}
      {exito && <Alert type="success">{exito}</Alert>}

      <h3>Listado</h3>

      {usuarios.length === 0 ? (
        <p>No hay usuarios cargados.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre completo</th>
                <th>Rol</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {usuarios.map((usuarioSistema) => (
                <tr key={usuarioSistema.id}>
                  <td>{usuarioSistema.usuario}</td>
                  <td>{usuarioSistema.nombreCompleto}</td>
                  <td>{usuarioSistema.rol?.nombre ?? 'Sin rol'}</td>
                  <td>
                    <span
                      className={
                        usuarioSistema.activo
                          ? 'badge badge-success'
                          : 'badge badge-danger'
                      }
                    >
                      {usuarioSistema.activo ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
import { useEffect, useState } from 'react';
import { CollapsibleForm } from '../components/CollapsibleForm';
import type { FormEvent } from 'react';
import { Alert } from '../components/Alert';

import { api } from '../api/api';
import { useAuth } from '../contexts/AuthContext';

import type { ApiResponse } from '../types/auth';
import type { CleaningLog } from '../types/cleaning';
import type { Room } from '../types/room';

export function CleaningPage() {
  const { usuario } = useAuth();

  const [habitacionesPendientes, setHabitacionesPendientes] = useState<
    Room[]
  >([]);
  const [historial, setHistorial] = useState<CleaningLog[]>([]);

  const [habitacionId, setHabitacionId] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const [pendientesResponse, historialResponse] = await Promise.all([
        api.get<ApiResponse<Room[]>>('/cleaning/pending'),
        api.get<ApiResponse<CleaningLog[]>>('/cleaning'),
      ]);

      setHabitacionesPendientes(pendientesResponse.data.data);
      setHistorial(historialResponse.data.data);
    } catch {
      setError('No se pudo cargar la limpieza.');
    } finally {
      setCargando(false);
    }
  }

  async function registrarLimpieza(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');

    if (!habitacionId) {
      setError('La habitación es obligatoria.');
      return;
    }

    if (!usuario?.id) {
      setError('No se pudo identificar el usuario.');
      return;
    }

    setGuardando(true);

    try {
      await api.post('/cleaning', {
        habitacionId,
        usuarioId: usuario.id,
        observaciones: observaciones || undefined,
      });

      setHabitacionId('');
      setObservaciones('');

      await cargarDatos();
    } catch {
      setError('No se pudo registrar la limpieza.');
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <section>
        <h2>Limpieza</h2>
        <p>Cargando...</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Limpieza</h2>

      <CollapsibleForm title="Registrar limpieza">
        <form onSubmit={registrarLimpieza}>
          <h3>Registrar limpieza</h3>

        <div>
          <label htmlFor="habitacionId">Habitación pendiente</label>
          <select
            id="habitacionId"
            value={habitacionId}
            onChange={(event) => setHabitacionId(event.target.value)}
          >
            <option value="">Seleccionar habitación</option>

            {habitacionesPendientes.map((habitacion) => (
              <option key={habitacion.id} value={habitacion.id}>
                {habitacion.numero} - {habitacion.tipo}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="observaciones">Observaciones</label>
          <input
            id="observaciones"
            type="text"
            value={observaciones}
            onChange={(event) => setObservaciones(event.target.value)}
          />
        </div>

        <button type="submit" className="button-success" disabled={guardando}>
        {guardando ? 'Guardando...' : 'Registrar limpieza'}
        </button>
      </form>
    </CollapsibleForm>
      {error && <Alert type="error">{error}</Alert>}

      <h3>Habitaciones pendientes</h3>

      {habitacionesPendientes.length === 0 ? (
        <p>No hay habitaciones pendientes de limpieza.</p>
      ) : (
       <div className="table-wrapper">
        <table>
            <thead>
            <tr>
              <th>Número</th>
              <th>Tipo</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
            {habitacionesPendientes.map((habitacion) => (
              <tr key={habitacion.id}>
                <td>{habitacion.numero}</td>
                <td>{habitacion.tipo}</td>
                <td>{habitacion.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      <h3>Historial</h3>

      {historial.length === 0 ? (
        <p>No hay limpiezas registradas.</p>
      ) : (
       <div className="table-wrapper">
        <table>
            <thead>
            <tr>
              <th>Habitación</th>
              <th>Usuario</th>
              <th>Observaciones</th>
              <th>Fecha</th>
            </tr>
          </thead>

          <tbody>
            {historial.map((limpieza) => (
              <tr key={limpieza.id}>
                <td>
                  {limpieza.habitacion.numero} -{' '}
                  {limpieza.habitacion.tipo}
                </td>
                <td>{limpieza.usuario.nombreCompleto}</td>
                <td>{limpieza.observaciones ?? '-'}</td>
                <td>{limpieza.creadoEn.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
       </div>
      )}
    </section>
  );
}
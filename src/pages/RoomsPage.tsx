import { useEffect, useState } from 'react';

import { api } from '../api/api';

import type { ApiResponse } from '../types/auth';
import type { Room } from '../types/room';

export function RoomsPage() {
  const [habitaciones, setHabitaciones] = useState<Room[]>([]);
  const [numero, setNumero] = useState('');
  const [tipo, setTipo] = useState('');
  const [capacidad, setCapacidad] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerHabitaciones();
  }, []);

  async function obtenerHabitaciones() {
    try {
      const response = await api.get<ApiResponse<Room[]>>('/rooms');

      setHabitaciones(response.data.data);
    } catch {
      setError('No se pudieron cargar las habitaciones.');
    } finally {
      setCargando(false);
    }
  }

  async function crearHabitacion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');
    setGuardando(true);

    try {
      await api.post('/rooms', {
        numero,
        tipo,
        capacidad: Number(capacidad),
      });

      setNumero('');
      setTipo('');
      setCapacidad('');

      await obtenerHabitaciones();
    } catch {
      setError('No se pudo crear la habitación.');
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <section>
        <h2>Habitaciones</h2>
        <p>Cargando...</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Habitaciones</h2>

      <form onSubmit={crearHabitacion}>
        <h3>Nueva habitación</h3>

        <div>
          <label htmlFor="numero">Número</label>
          <input
            id="numero"
            type="text"
            value={numero}
            onChange={(event) => setNumero(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="tipo">Tipo</label>
          <input
            id="tipo"
            type="text"
            value={tipo}
            onChange={(event) => setTipo(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="capacidad">Capacidad</label>
          <input
            id="capacidad"
            type="number"
            value={capacidad}
            onChange={(event) => setCapacidad(event.target.value)}
          />
        </div>

        <button type="submit" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Crear habitación'}
        </button>
      </form>

      {error && <p>{error}</p>}

      <h3>Listado</h3>

      {habitaciones.length === 0 ? (
        <p>No hay habitaciones cargadas.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Número</th>
              <th>Tipo</th>
              <th>Capacidad</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
            {habitaciones.map((habitacion) => (
              <tr key={habitacion.id}>
                <td>{habitacion.numero}</td>
                <td>{habitacion.tipo}</td>
                <td>{habitacion.capacidad}</td>
                <td>{habitacion.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
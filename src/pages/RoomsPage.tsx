import { useEffect, useState } from 'react';
import { CollapsibleForm } from '../components/CollapsibleForm';
import type { FormEvent } from 'react';

import { api } from '../api/api';

import type { ApiResponse } from '../types/auth';
import type { Room } from '../types/room';

const tiposHabitacion = [
  'Individual',
  'Doble',
  'Triple',
  'Suite',
];

function obtenerClaseBadgeEstadoHabitacion(estado: string) {
  if (estado === 'DISPONIBLE') {
    return 'badge badge-success';
  }

  if (estado === 'RESERVADA') {
    return 'badge badge-warning';
  }

  if (estado === 'OCUPADA') {
    return 'badge badge-danger';
  }

  if (estado === 'LIMPIEZA') {
    return 'badge badge-info';
  }

  return 'badge badge-muted';
}

export function RoomsPage() {
  const [habitaciones, setHabitaciones] = useState<Room[]>([]);

  const [numero, setNumero] = useState('');
  const [tipo, setTipo] = useState('');
  const [capacidad, setCapacidad] = useState('');

  const [habitacionEditandoId, setHabitacionEditandoId] =
    useState<string | null>(null);
  const [numeroEditando, setNumeroEditando] = useState('');
  const [tipoEditando, setTipoEditando] = useState('');
  const [capacidadEditando, setCapacidadEditando] = useState('');

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

  async function crearHabitacion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');

    if (!numero.trim()) {
      setError('El número de habitación es obligatorio.');
      return;
    }

    if (!tipo) {
      setError('El tipo de habitación es obligatorio.');
      return;
    }

    if (!capacidad || Number(capacidad) < 1) {
      setError('La capacidad debe ser mayor a 0.');
      return;
    }

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

  function iniciarEdicion(habitacion: Room) {
    setHabitacionEditandoId(habitacion.id);
    setNumeroEditando(habitacion.numero);
    setTipoEditando(habitacion.tipo);
    setCapacidadEditando(String(habitacion.capacidad));
    setError('');
  }

  function cancelarEdicion() {
    setHabitacionEditandoId(null);
    setNumeroEditando('');
    setTipoEditando('');
    setCapacidadEditando('');
  }

  async function guardarEdicion(id: string) {
    setError('');

    if (!numeroEditando.trim()) {
      setError('El número de habitación es obligatorio.');
      return;
    }

    if (!tipoEditando) {
      setError('El tipo de habitación es obligatorio.');
      return;
    }

    if (!capacidadEditando || Number(capacidadEditando) < 1) {
      setError('La capacidad debe ser mayor a 0.');
      return;
    }

    try {
      await api.put(`/rooms/${id}`, {
        numero: numeroEditando,
        tipo: tipoEditando,
        capacidad: Number(capacidadEditando),
      });

      cancelarEdicion();

      await obtenerHabitaciones();
    } catch {
      setError('No se pudo actualizar la habitación.');
    }
  }

  async function eliminarHabitacion(id: string) {
    const confirmar = confirm('¿Eliminar esta habitación?');

    if (!confirmar) {
      return;
    }

    setError('');

    try {
      await api.delete(`/rooms/${id}`);

      await obtenerHabitaciones();
    } catch {
      setError('No se pudo eliminar la habitación.');
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

      <CollapsibleForm title="Nueva habitación">
      <form onSubmit={crearHabitacion}>

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
          <select
            id="tipo"
            value={tipo}
            onChange={(event) => setTipo(event.target.value)}
          >
            <option value="">Seleccionar tipo</option>

            {tiposHabitacion.map((tipoHabitacion) => (
              <option key={tipoHabitacion} value={tipoHabitacion}>
                {tipoHabitacion}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="capacidad">Capacidad</label>
          <input
            id="capacidad"
            type="number"
            min="1"
            value={capacidad}
            onChange={(event) => setCapacidad(event.target.value)}
          />
        </div>

        <button type="submit" className="button-success" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Crear habitación'}
        </button>
      </form>
    </CollapsibleForm>

      {error && <p>{error}</p>}

      <h3>Listado</h3>

      {habitaciones.length === 0 ? (
        <p>No hay habitaciones cargadas.</p>
      ) : (
       <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Número</th>
              <th>Tipo</th>
              <th>Capacidad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {habitaciones.map((habitacion) => (
              <tr key={habitacion.id}>
                <td>
                  {habitacionEditandoId === habitacion.id ? (
                    <input
                      type="text"
                      value={numeroEditando}
                      onChange={(event) =>
                        setNumeroEditando(event.target.value)
                      }
                    />
                  ) : (
                    habitacion.numero
                  )}
                </td>

                <td>
                  {habitacionEditandoId === habitacion.id ? (
                    <select
                      value={tipoEditando}
                      onChange={(event) =>
                        setTipoEditando(event.target.value)
                      }
                    >
                      <option value="">Seleccionar tipo</option>

                      {tiposHabitacion.map((tipoHabitacion) => (
                        <option
                          key={tipoHabitacion}
                          value={tipoHabitacion}
                        >
                          {tipoHabitacion}
                        </option>
                      ))}
                    </select>
                  ) : (
                    habitacion.tipo
                  )}
                </td>

                <td>
                  {habitacionEditandoId === habitacion.id ? (
                    <input
                      type="number"
                      min="1"
                      value={capacidadEditando}
                      onChange={(event) =>
                        setCapacidadEditando(event.target.value)
                      }
                    />
                  ) : (
                    habitacion.capacidad
                  )}
                </td>

                <td>
                  <span className={obtenerClaseBadgeEstadoHabitacion(habitacion.estado)}>
                    {habitacion.estado}
                  </span>
                </td>

                <td>
                  {habitacionEditandoId === habitacion.id ? (
                    <>
                     <button
                      type="button"
                      className="button-success"
                      onClick={() => guardarEdicion(habitacion.id)}
                    >
                      Guardar
                    </button>

                     <button
                      type="button"
                      className="button-warning"
                      onClick={cancelarEdicion}
                    >
                      Cancelar
                    </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => iniciarEdicion(habitacion)}
                      >
                        Editar
                      </button>

                     <button
                      type="button"
                      className="button-danger"
                      onClick={() => eliminarHabitacion(habitacion.id)}
                    >
                      Eliminar
                    </button>
                    </>
                  )}
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
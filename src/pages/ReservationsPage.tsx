import { useEffect, useState } from 'react';
import { CollapsibleForm } from '../components/CollapsibleForm';
import type { FormEvent } from 'react';

import { api } from '../api/api';

import type { ApiResponse } from '../types/auth';
import type { Client } from '../types/client';
import type { Reservation } from '../types/reservation';
import type { Room } from '../types/room';

function obtenerClaseBadgeEstadoReserva(estado: string) {
  if (estado === 'PENDIENTE') {
    return 'badge badge-warning';
  }

  if (estado === 'CONFIRMADA') {
    return 'badge badge-success';
  }

  if (estado === 'CANCELADA') {
    return 'badge badge-danger';
  }

  if (estado === 'CONVERTIDA') {
    return 'badge badge-info';
  }

  return 'badge badge-muted';
}

export function ReservationsPage() {
  const [reservas, setReservas] = useState<Reservation[]>([]);
  const [clientes, setClientes] = useState<Client[]>([]);
  const [habitaciones, setHabitaciones] = useState<Room[]>([]);

  const [clienteId, setClienteId] = useState('');
  const [habitacionId, setHabitacionId] = useState('');
  const [fechaIngreso, setFechaIngreso] = useState('');
  const [fechaSalida, setFechaSalida] = useState('');

  const [reservaEditandoId, setReservaEditandoId] =
    useState<string | null>(null);
  const [clienteIdEditando, setClienteIdEditando] = useState('');
  const [habitacionIdEditando, setHabitacionIdEditando] = useState('');
  const [fechaIngresoEditando, setFechaIngresoEditando] = useState('');
  const [fechaSalidaEditando, setFechaSalidaEditando] = useState('');

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const [reservasResponse, clientesResponse, habitacionesResponse] =
        await Promise.all([
          api.get<ApiResponse<Reservation[]>>('/reservations'),
          api.get<ApiResponse<Client[]>>('/clients'),
          api.get<ApiResponse<Room[]>>('/rooms'),
        ]);

      setReservas(reservasResponse.data.data);
      setClientes(clientesResponse.data.data);
      setHabitaciones(habitacionesResponse.data.data);
    } catch {
      setError('No se pudieron cargar las reservas.');
    } finally {
      setCargando(false);
    }
  }

  async function crearReserva(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');

    if (!clienteId) {
      setError('El cliente es obligatorio.');
      return;
    }

    if (!habitacionId) {
      setError('La habitación es obligatoria.');
      return;
    }

    if (!fechaIngreso) {
      setError('La fecha de ingreso es obligatoria.');
      return;
    }

    if (!fechaSalida) {
      setError('La fecha de salida es obligatoria.');
      return;
    }

    if (fechaIngreso >= fechaSalida) {
      setError('La fecha de ingreso debe ser anterior a la fecha de salida.');
      return;
    }

    setGuardando(true);

    try {
      await api.post('/reservations', {
        clienteId,
        habitacionId,
        fechaIngreso,
        fechaSalida,
      });

      setClienteId('');
      setHabitacionId('');
      setFechaIngreso('');
      setFechaSalida('');

      await cargarDatos();
    } catch {
      setError('No se pudo crear la reserva.');
    } finally {
      setGuardando(false);
    }
  }

  function iniciarEdicion(reserva: Reservation) {
    setReservaEditandoId(reserva.id);
    setClienteIdEditando(reserva.cliente.id);
    setHabitacionIdEditando(reserva.habitacion.id);
    setFechaIngresoEditando(reserva.fechaIngreso.slice(0, 10));
    setFechaSalidaEditando(reserva.fechaSalida.slice(0, 10));
    setError('');
  }

  function cancelarEdicion() {
    setReservaEditandoId(null);
    setClienteIdEditando('');
    setHabitacionIdEditando('');
    setFechaIngresoEditando('');
    setFechaSalidaEditando('');
  }

  async function guardarEdicion(id: string) {
    setError('');

    if (!clienteIdEditando) {
      setError('El cliente es obligatorio.');
      return;
    }

    if (!habitacionIdEditando) {
      setError('La habitación es obligatoria.');
      return;
    }

    if (!fechaIngresoEditando) {
      setError('La fecha de ingreso es obligatoria.');
      return;
    }

    if (!fechaSalidaEditando) {
      setError('La fecha de salida es obligatoria.');
      return;
    }

    if (fechaIngresoEditando >= fechaSalidaEditando) {
      setError('La fecha de ingreso debe ser anterior a la fecha de salida.');
      return;
    }

    try {
      await api.put(`/reservations/${id}`, {
        clienteId: clienteIdEditando,
        habitacionId: habitacionIdEditando,
        fechaIngreso: fechaIngresoEditando,
        fechaSalida: fechaSalidaEditando,
      });

      cancelarEdicion();

      await cargarDatos();
    } catch {
      setError('No se pudo actualizar la reserva.');
    }
  }

  async function eliminarReserva(id: string) {
    const confirmar = confirm('¿Eliminar esta reserva?');

    if (!confirmar) {
      return;
    }

    setError('');

    try {
      await api.delete(`/reservations/${id}`);

      await cargarDatos();
    } catch {
      setError('No se pudo eliminar la reserva.');
    }
  }

  if (cargando) {
    return (
      <section>
        <h2>Reservas</h2>
        <p>Cargando...</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Reservas</h2>

      <CollapsibleForm title="Nueva reserva">
        <form onSubmit={crearReserva}>
          <h3>Nueva reserva</h3>

        <div>
          <label htmlFor="clienteId">Cliente</label>
          <select
            id="clienteId"
            value={clienteId}
            onChange={(event) => setClienteId(event.target.value)}
          >
            <option value="">Seleccionar cliente</option>

            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombreCompleto} - {cliente.documento}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="habitacionId">Habitación</label>
          <select
            id="habitacionId"
            value={habitacionId}
            onChange={(event) => setHabitacionId(event.target.value)}
          >
            <option value="">Seleccionar habitación</option>

            {habitaciones.map((habitacion) => (
              <option key={habitacion.id} value={habitacion.id}>
                {habitacion.numero} - {habitacion.tipo} - {habitacion.estado}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="fechaIngreso">Fecha ingreso</label>
          <input
            id="fechaIngreso"
            type="date"
            value={fechaIngreso}
            onChange={(event) => setFechaIngreso(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="fechaSalida">Fecha salida</label>
          <input
            id="fechaSalida"
            type="date"
            value={fechaSalida}
            onChange={(event) => setFechaSalida(event.target.value)}
          />
        </div>

        <button type="submit" className="button-success" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Crear reserva'}
        </button>
      </form>
    </CollapsibleForm>

      {error && <p>{error}</p>}

      <h3>Listado</h3>

      {reservas.length === 0 ? (
        <p>No hay reservas cargadas.</p>
      ) : (
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Habitación</th>
              <th>Ingreso</th>
              <th>Salida</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {reservas.map((reserva) => (
              <tr key={reserva.id}>
                <td>
                  {reservaEditandoId === reserva.id ? (
                    <select
                      value={clienteIdEditando}
                      onChange={(event) =>
                        setClienteIdEditando(event.target.value)
                      }
                    >
                      <option value="">Seleccionar cliente</option>

                      {clientes.map((cliente) => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.nombreCompleto} - {cliente.documento}
                        </option>
                      ))}
                    </select>
                  ) : (
                    reserva.cliente.nombreCompleto
                  )}
                </td>

                <td>
                  {reservaEditandoId === reserva.id ? (
                    <select
                      value={habitacionIdEditando}
                      onChange={(event) =>
                        setHabitacionIdEditando(event.target.value)
                      }
                    >
                      <option value="">Seleccionar habitación</option>

                      {habitaciones.map((habitacion) => (
                        <option key={habitacion.id} value={habitacion.id}>
                          {habitacion.numero} - {habitacion.tipo} -{' '}
                          {habitacion.estado}
                        </option>
                      ))}
                    </select>
                  ) : (
                    `${reserva.habitacion.numero} - ${reserva.habitacion.tipo}`
                  )}
                </td>

                <td>
                  {reservaEditandoId === reserva.id ? (
                    <input
                      type="date"
                      value={fechaIngresoEditando}
                      onChange={(event) =>
                        setFechaIngresoEditando(event.target.value)
                      }
                    />
                  ) : (
                    reserva.fechaIngreso.slice(0, 10)
                  )}
                </td>

                <td>
                  {reservaEditandoId === reserva.id ? (
                    <input
                      type="date"
                      value={fechaSalidaEditando}
                      onChange={(event) =>
                        setFechaSalidaEditando(event.target.value)
                      }
                    />
                  ) : (
                    reserva.fechaSalida.slice(0, 10)
                  )}
                </td>

                <td>
                  <span className={obtenerClaseBadgeEstadoReserva(reserva.estado)}>
                    {reserva.estado}
                  </span>
                </td>

                <td>
                  {reservaEditandoId === reserva.id ? (
                    <>
                      <button
                        type="button"
                        className="button-success"
                        onClick={() => guardarEdicion(reserva.id)}
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
                        onClick={() => iniciarEdicion(reserva)}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="button-danger"
                        onClick={() => eliminarReserva(reserva.id)}
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
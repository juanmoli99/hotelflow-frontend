import { useEffect, useState } from 'react';

import type { FormEvent } from 'react';

import { Alert } from '../components/Alert';
import { CollapsibleForm } from '../components/CollapsibleForm';
import { api } from '../api/api';

import type { ApiResponse } from '../types/auth';
import type { Client } from '../types/client';
import type { Reservation } from '../types/reservation';
import type { Room } from '../types/room';
import type { Stay } from '../types/stay';

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

function fechasSeCruzan(
  ingresoA: string,
  salidaA: string,
  ingresoB: string,
  salidaB: string,
) {
  return ingresoA < salidaB && salidaA > ingresoB;
}

export function ReservationsPage() {
  const [reservas, setReservas] = useState<Reservation[]>([]);
  const [clientes, setClientes] = useState<Client[]>([]);
  const [habitaciones, setHabitaciones] = useState<Room[]>([]);
  const [alojamientos, setAlojamientos] = useState<Stay[]>([]);

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
  const [exito, setExito] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const [
        reservasResponse,
        clientesResponse,
        habitacionesResponse,
        alojamientosResponse,
      ] = await Promise.all([
        api.get<ApiResponse<Reservation[]>>('/reservations'),
        api.get<ApiResponse<Client[]>>('/clients'),
        api.get<ApiResponse<Room[]>>('/rooms'),
        api.get<ApiResponse<Stay[]>>('/stays'),
      ]);

      setReservas(reservasResponse.data.data);
      setClientes(clientesResponse.data.data);
      setHabitaciones(habitacionesResponse.data.data);
      setAlojamientos(alojamientosResponse.data.data);
    } catch {
      setError('No se pudieron cargar las reservas.');
    } finally {
      setCargando(false);
    }
  }

  function habitacionEstaDisponibleEnPeriodo(data: {
    habitacion: Room;
    fechaIngresoSeleccionada: string;
    fechaSalidaSeleccionada: string;
    reservaIgnoradaId?: string;
  }) {
    const {
      habitacion,
      fechaIngresoSeleccionada,
      fechaSalidaSeleccionada,
      reservaIgnoradaId,
    } = data;

    if (!fechaIngresoSeleccionada || !fechaSalidaSeleccionada) {
      return false;
    }

    if (fechaIngresoSeleccionada >= fechaSalidaSeleccionada) {
      return false;
    }

    if (habitacion.estado === 'FUERA_DE_SERVICIO') {
      return false;
    }

    const tieneReservaCruzada = reservas.some((reserva) => {
      if (reserva.id === reservaIgnoradaId) {
        return false;
      }

      if (reserva.habitacion.id !== habitacion.id) {
        return false;
      }

      if (
        reserva.estado === 'CANCELADA' ||
        reserva.estado === 'CONVERTIDA'
      ) {
        return false;
      }

      return fechasSeCruzan(
        fechaIngresoSeleccionada,
        fechaSalidaSeleccionada,
        reserva.fechaIngreso.slice(0, 10),
        reserva.fechaSalida.slice(0, 10),
      );
    });

    if (tieneReservaCruzada) {
      return false;
    }

    const tieneAlojamientoCruzado = alojamientos.some((alojamiento) => {
      if (alojamiento.habitacion.id !== habitacion.id) {
        return false;
      }

      if (alojamiento.estado !== 'ACTIVO') {
        return false;
      }

      return fechasSeCruzan(
        fechaIngresoSeleccionada,
        fechaSalidaSeleccionada,
        alojamiento.fechaIngreso.slice(0, 10),
        alojamiento.fechaSalida.slice(0, 10),
      );
    });

    return !tieneAlojamientoCruzado;
  }

  const habitacionesDisponiblesParaCrear = habitaciones.filter(
    (habitacion) =>
      habitacionEstaDisponibleEnPeriodo({
        habitacion,
        fechaIngresoSeleccionada: fechaIngreso,
        fechaSalidaSeleccionada: fechaSalida,
      }),
  );

  const habitacionesDisponiblesParaEditar = habitaciones.filter(
    (habitacion) =>
      habitacionEstaDisponibleEnPeriodo({
        habitacion,
        fechaIngresoSeleccionada: fechaIngresoEditando,
        fechaSalidaSeleccionada: fechaSalidaEditando,
        reservaIgnoradaId: reservaEditandoId ?? undefined,
      }),
  );

  async function crearReserva(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');
    setExito('');

    if (!clienteId) {
      setError('El cliente es obligatorio.');
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

    if (!habitacionId) {
      setError('La habitación es obligatoria.');
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

      setExito('Reserva creada correctamente.');
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
    setExito('');
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
    setExito('');

    if (!clienteIdEditando) {
      setError('El cliente es obligatorio.');
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

    if (!habitacionIdEditando) {
      setError('La habitación es obligatoria.');
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

      setExito('Reserva actualizada correctamente.');
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
    setExito('');

    try {
      await api.delete(`/reservations/${id}`);

      await cargarDatos();

      setExito('Reserva eliminada correctamente.');
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
            <label htmlFor="habitacionId">Habitación disponible</label>
            <select
              id="habitacionId"
              value={habitacionId}
              disabled={!fechaIngreso || !fechaSalida || fechaIngreso >= fechaSalida}
              onChange={(event) => setHabitacionId(event.target.value)}
            >
              {!fechaIngreso || !fechaSalida ? (
                <option value="">Cargá primero las fechas</option>
              ) : fechaIngreso >= fechaSalida ? (
                <option value="">Las fechas no son válidas</option>
              ) : habitacionesDisponiblesParaCrear.length === 0 ? (
                <option value="">No hay habitaciones disponibles</option>
              ) : (
                <>
                  <option value="">Seleccionar habitación</option>

                  {habitacionesDisponiblesParaCrear.map((habitacion) => (
                    <option key={habitacion.id} value={habitacion.id}>
                      {habitacion.numero} - {habitacion.tipo}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div>
            <label htmlFor="fechaIngreso">Fecha ingreso</label>
            <input
              id="fechaIngreso"
              type="date"
              value={fechaIngreso}
              onChange={(event) => {
                setFechaIngreso(event.target.value);
                setHabitacionId('');
              }}
            />
          </div>

          <div>
            <label htmlFor="fechaSalida">Fecha salida</label>
            <input
              id="fechaSalida"
              type="date"
              value={fechaSalida}
              onChange={(event) => {
                setFechaSalida(event.target.value);
                setHabitacionId('');
              }}
            />
          </div>


          <button type="submit" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Crear reserva'}
          </button>
        </form>
      </CollapsibleForm>

      {error && <Alert type="error">{error}</Alert>}
      {exito && <Alert type="success">{exito}</Alert>}

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
                        disabled={
                          !fechaIngresoEditando ||
                          !fechaSalidaEditando ||
                          fechaIngresoEditando >= fechaSalidaEditando
                        }
                        onChange={(event) =>
                          setHabitacionIdEditando(event.target.value)
                        }
                      >
                        {!fechaIngresoEditando || !fechaSalidaEditando ? (
                          <option value="">Cargá primero las fechas</option>
                        ) : fechaIngresoEditando >= fechaSalidaEditando ? (
                          <option value="">Las fechas no son válidas</option>
                        ) : habitacionesDisponiblesParaEditar.length === 0 ? (
                          <option value="">No hay habitaciones disponibles</option>
                        ) : (
                          <>
                            <option value="">Seleccionar habitación</option>

                            {habitacionesDisponiblesParaEditar.map(
                              (habitacion) => (
                                <option
                                  key={habitacion.id}
                                  value={habitacion.id}
                                >
                                  {habitacion.numero} - {habitacion.tipo}
                                </option>
                              ),
                            )}
                          </>
                        )}
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
                        onChange={(event) => {
                          setFechaIngresoEditando(event.target.value);
                          setHabitacionIdEditando('');
                        }}
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
                        onChange={(event) => {
                          setFechaSalidaEditando(event.target.value);
                          setHabitacionIdEditando('');
                        }}
                      />
                    ) : (
                      reserva.fechaSalida.slice(0, 10)
                    )}
                  </td>

                  <td>
                    <span
                      className={obtenerClaseBadgeEstadoReserva(
                        reserva.estado,
                      )}
                    >
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
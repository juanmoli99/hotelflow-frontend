import { useEffect, useState } from 'react';

import type { FormEvent } from 'react';

import { api } from '../api/api';

import type { ApiResponse } from '../types/auth';
import type { Client } from '../types/client';
import type { Reservation } from '../types/reservation';
import type { Room } from '../types/room';
import type { Stay } from '../types/stay';


export function StaysPage() {
  const [alojamientos, setAlojamientos] = useState<Stay[]>([]);
  const [clientes, setClientes] = useState<Client[]>([]);
  const [habitaciones, setHabitaciones] = useState<Room[]>([]);
  const [reservas, setReservas] = useState<Reservation[]>([]);

  const [clienteId, setClienteId] = useState('');
  const [habitacionId, setHabitacionId] = useState('');
  const [reservaId, setReservaId] = useState('');
  const [fechaIngreso, setFechaIngreso] = useState('');
  const [fechaSalida, setFechaSalida] = useState('');

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const [
        alojamientosResponse,
        clientesResponse,
        habitacionesResponse,
        reservasResponse,
      ] = await Promise.all([
        api.get<ApiResponse<Stay[]>>('/stays'),
        api.get<ApiResponse<Client[]>>('/clients'),
        api.get<ApiResponse<Room[]>>('/rooms'),
        api.get<ApiResponse<Reservation[]>>('/reservations'),
      ]);

      setAlojamientos(alojamientosResponse.data.data);
      setClientes(clientesResponse.data.data);
      setHabitaciones(habitacionesResponse.data.data);
      setReservas(reservasResponse.data.data);
    } catch {
      setError('No se pudieron cargar los alojamientos.');
    } finally {
      setCargando(false);
    }
  }

  async function crearAlojamiento(event: FormEvent<HTMLFormElement>) {
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
      await api.post('/stays', {
        clienteId,
        habitacionId,
        reservaId: reservaId || undefined,
        fechaIngreso,
        fechaSalida,
      });

      setClienteId('');
      setHabitacionId('');
      setReservaId('');
      setFechaIngreso('');
      setFechaSalida('');

      await cargarDatos();
    } catch {
      setError('No se pudo crear el alojamiento.');
    } finally {
      setGuardando(false);
    }
  }

  async function finalizarAlojamiento(id: string) {
  const confirmar = confirm('¿Finalizar este alojamiento?');

  if (!confirmar) {
    return;
  }

  setError('');

  try {
    await api.put(`/stays/${id}`, {
      estado: 'FINALIZADO',
    });

    await cargarDatos();
  } catch {
    setError('No se pudo finalizar el alojamiento.');
  }
}

  async function eliminarAlojamiento(id: string) {
    const confirmar = confirm('¿Eliminar este alojamiento?');

    if (!confirmar) {
      return;
    }

    setError('');

    try {
      await api.delete(`/stays/${id}`);

      await cargarDatos();
    } catch {
      setError('No se pudo eliminar el alojamiento.');
    }
  }

  if (cargando) {
    return (
      <section>
        <h2>Alojamientos</h2>
        <p>Cargando...</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Alojamientos</h2>

      <form onSubmit={crearAlojamiento}>
        <h3>Nuevo alojamiento</h3>

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
          <label htmlFor="reservaId">Reserva vinculada opcional</label>
          <select
            id="reservaId"
            value={reservaId}
            onChange={(event) => setReservaId(event.target.value)}
          >
            <option value="">Sin reserva</option>

            {reservas.map((reserva) => (
              <option key={reserva.id} value={reserva.id}>
                {reserva.cliente.nombreCompleto} - Habitación{' '}
                {reserva.habitacion.numero} - {reserva.estado}
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

        <button type="submit" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Crear alojamiento'}
        </button>
      </form>

      {error && <p>{error}</p>}

      <h3>Listado</h3>

      {alojamientos.length === 0 ? (
        <p>No hay alojamientos cargados.</p>
      ) : (
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
            {alojamientos.map((alojamiento) => (
              <tr key={alojamiento.id}>
                <td>{alojamiento.cliente.nombreCompleto}</td>
                <td>
                  {alojamiento.habitacion.numero} -{' '}
                  {alojamiento.habitacion.tipo}
                </td>
                <td>{alojamiento.fechaIngreso.slice(0, 10)}</td>
                <td>{alojamiento.fechaSalida.slice(0, 10)}</td>
                <td>{alojamiento.estado}</td>
               <td>
                  {alojamiento.estado === 'ACTIVO' ? (
                    <button
                      type="button"
                      onClick={() => finalizarAlojamiento(alojamiento.id)}
                    >
                      Finalizar
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => eliminarAlojamiento(alojamiento.id)}
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
  
    </section>
  );
}


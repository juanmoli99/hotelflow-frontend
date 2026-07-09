import { AxiosError } from 'axios';
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

type MetodoPago =
  | 'EFECTIVO'
  | 'TARJETA'
  | 'TRANSFERENCIA'
  | 'MERCADO_PAGO'
  | 'OTRO';

type RoomPriceReserva = {
  id: string;
  habitacionId?: string | null;
  tipoHabitacion?: string | null;
  habitacion?: {
    id: string;
  } | null;
  precio: number;
  vigenteDesde: string;
  vigenteHasta?: string | null;
  activo: boolean;
};

type SpecialRateReserva = {
  id: string;
  habitacionId?: string | null;
  tipoHabitacion?: string | null;
  habitacion?: {
    id: string;
  } | null;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  vigenteDesde: string;
  vigenteHasta: string;
  activo: boolean;
};

const MILISEGUNDOS_POR_DIA = 1000 * 60 * 60 * 24;

const METODOS_PAGO: MetodoPago[] = [
  'EFECTIVO',
  'TARJETA',
  'TRANSFERENCIA',
  'MERCADO_PAGO',
  'OTRO',
];

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

function formatearDinero(valor: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(valor);
}

function calcularNoches(fechaIngreso: string, fechaSalida: string) {
  if (!fechaIngreso || !fechaSalida || fechaIngreso >= fechaSalida) {
    return 0;
  }

  const ingreso = new Date(`${fechaIngreso}T00:00:00`);
  const salida = new Date(`${fechaSalida}T00:00:00`);

  return Math.ceil(
    (salida.getTime() - ingreso.getTime()) / MILISEGUNDOS_POR_DIA,
  );
}

function obtenerFecha(fecha: string) {
  return fecha.slice(0, 10);
}

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

function obtenerHabitacionIdDePrecio(precio: RoomPriceReserva) {
  return precio.habitacionId ?? precio.habitacion?.id ?? null;
}

function obtenerHabitacionIdDeTarifa(tarifa: SpecialRateReserva) {
  return tarifa.habitacionId ?? tarifa.habitacion?.id ?? null;
}

export function ReservationsPage() {
  const [reservas, setReservas] = useState<Reservation[]>([]);
  const [clientes, setClientes] = useState<Client[]>([]);
  const [habitaciones, setHabitaciones] = useState<Room[]>([]);
  const [alojamientos, setAlojamientos] = useState<Stay[]>([]);
  const [precios, setPrecios] = useState<RoomPriceReserva[]>([]);
  const [tarifasEspeciales, setTarifasEspeciales] = useState<
    SpecialRateReserva[]
  >([]);

  const [clienteId, setClienteId] = useState('');
  const [habitacionId, setHabitacionId] = useState('');
  const [fechaIngreso, setFechaIngreso] = useState('');
  const [fechaSalida, setFechaSalida] = useState('');
  const [tarifaEspecialId, setTarifaEspecialId] = useState('');
  const [sena, setSena] = useState('');
  const [metodoSena, setMetodoSena] = useState<MetodoPago | ''>('');

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
        preciosResponse,
        tarifasEspecialesResponse,
      ] = await Promise.all([
        api.get<ApiResponse<Reservation[]>>('/reservations'),
        api.get<ApiResponse<Client[]>>('/clients'),
        api.get<ApiResponse<Room[]>>('/rooms'),
        api.get<ApiResponse<Stay[]>>('/stays'),
        api.get<ApiResponse<RoomPriceReserva[]>>('/room-prices'),
        api.get<ApiResponse<SpecialRateReserva[]>>('/special-rates'),
      ]);

      setReservas(reservasResponse.data.data);
      setClientes(clientesResponse.data.data);
      setHabitaciones(habitacionesResponse.data.data);
      setAlojamientos(alojamientosResponse.data.data);
      setPrecios(preciosResponse.data.data);
      setTarifasEspeciales(tarifasEspecialesResponse.data.data);
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

  const habitacionSeleccionada = habitaciones.find(
    (habitacion) => habitacion.id === habitacionId,
  );

  const cantidadNoches = calcularNoches(fechaIngreso, fechaSalida);

  const precioVigenteSeleccionado = (() => {
    if (!habitacionSeleccionada || !fechaIngreso) {
      return null;
    }

    const preciosVigentes = precios
      .filter((precio) => {
        if (!precio.activo) {
          return false;
        }

        const habitacionIdPrecio = obtenerHabitacionIdDePrecio(precio);

        const aplicaPorHabitacion =
          habitacionIdPrecio === habitacionSeleccionada.id;

        const aplicaPorTipo =
          precio.tipoHabitacion === habitacionSeleccionada.tipo;

        if (!aplicaPorHabitacion && !aplicaPorTipo) {
          return false;
        }

        const vigenteDesde = obtenerFecha(precio.vigenteDesde);
        const vigenteHasta = precio.vigenteHasta
          ? obtenerFecha(precio.vigenteHasta)
          : null;

        return (
          vigenteDesde <= fechaIngreso &&
          (!vigenteHasta || vigenteHasta >= fechaIngreso)
        );
      })
      .sort((a, b) =>
        obtenerFecha(b.vigenteDesde).localeCompare(
          obtenerFecha(a.vigenteDesde),
        ),
      );

    const precioPorHabitacion = preciosVigentes.find(
      (precio) =>
        obtenerHabitacionIdDePrecio(precio) === habitacionSeleccionada.id,
    );

    return precioPorHabitacion ?? preciosVigentes[0] ?? null;
  })();

  const tarifasEspecialesDisponibles = tarifasEspeciales.filter(
    (tarifa) => {
      if (
        !habitacionSeleccionada ||
        !fechaIngreso ||
        !fechaSalida ||
        fechaIngreso >= fechaSalida ||
        !tarifa.activo
      ) {
        return false;
      }

      const habitacionIdTarifa = obtenerHabitacionIdDeTarifa(tarifa);

      const aplicaPorHabitacion =
        habitacionIdTarifa === habitacionSeleccionada.id;

      const aplicaPorTipo =
        tarifa.tipoHabitacion === habitacionSeleccionada.tipo;

      if (!aplicaPorHabitacion && !aplicaPorTipo) {
        return false;
      }

      return (
        obtenerFecha(tarifa.vigenteDesde) <= fechaIngreso &&
        obtenerFecha(tarifa.vigenteHasta) >= fechaSalida
      );
    },
  );

  const tarifaEspecialSeleccionada =
    tarifasEspecialesDisponibles.find(
      (tarifa) => tarifa.id === tarifaEspecialId,
    ) ?? null;

  const subtotalEstimado =
    precioVigenteSeleccionado && cantidadNoches > 0
      ? precioVigenteSeleccionado.precio * cantidadNoches
      : 0;

  const totalEstimado =
    tarifaEspecialSeleccionada && cantidadNoches > 0
      ? tarifaEspecialSeleccionada.precio * cantidadNoches
      : subtotalEstimado;

  const senaNumerica = sena ? Number(sena) : 0;

  const saldoPendienteEstimado = Math.max(
    totalEstimado - senaNumerica,
    0,
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

    if (!precioVigenteSeleccionado) {
      setError('No hay un precio vigente para esta habitación.');
      return;
    }

    if (
      sena &&
      (!Number.isFinite(senaNumerica) || senaNumerica < 0)
    ) {
      setError('La seña debe ser un número válido mayor o igual a 0.');
      return;
    }

    if (senaNumerica > totalEstimado) {
      setError('La seña no puede ser mayor al total de la reserva.');
      return;
    }

    if (senaNumerica > 0 && !metodoSena) {
      setError('El método de pago de la seña es obligatorio.');
      return;
    }

    if (
      tarifaEspecialId &&
      !tarifasEspecialesDisponibles.some(
        (tarifa) => tarifa.id === tarifaEspecialId,
      )
    ) {
      setError('La tarifa especial seleccionada no es válida.');
      return;
    }

    setGuardando(true);

    try {
      await api.post('/reservations', {
        clienteId,
        habitacionId,
        fechaIngreso,
        fechaSalida,
        tarifaEspecialId: tarifaEspecialId || undefined,
        sena: senaNumerica,
        metodoSena: senaNumerica > 0 ? metodoSena : undefined,
      });

      setClienteId('');
      setHabitacionId('');
      setFechaIngreso('');
      setFechaSalida('');
      setTarifaEspecialId('');
      setSena('');
      setMetodoSena('');

      await cargarDatos();

      setExito('Reserva creada correctamente.');
    } catch (error) {
      setError(obtenerMensajeError(error, 'No se pudo crear la reserva.'));
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
    } catch (error) {
      setError(
        obtenerMensajeError(error, 'No se pudo actualizar la reserva.'),
      );
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
    } catch (error) {
      setError(
        obtenerMensajeError(error, 'No se pudo eliminar la reserva.'),
      );
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
        <form onSubmit={crearReserva} noValidate>
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
              disabled={
                !fechaIngreso ||
                !fechaSalida ||
                fechaIngreso >= fechaSalida
              }
              onChange={(event) => {
                setHabitacionId(event.target.value);
                setTarifaEspecialId('');
              }}
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
                setTarifaEspecialId('');
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
                setTarifaEspecialId('');
              }}
            />
          </div>

          <div>
            <label htmlFor="tarifaEspecialId">Tarifa especial</label>
            <select
              id="tarifaEspecialId"
              value={tarifaEspecialId}
              disabled={!habitacionId || tarifasEspecialesDisponibles.length === 0}
              onChange={(event) => setTarifaEspecialId(event.target.value)}
            >
              {!habitacionId ? (
                <option value="">Seleccioná una habitación</option>
              ) : tarifasEspecialesDisponibles.length === 0 ? (
                <option value="">No hay tarifas especiales disponibles</option>
              ) : (
                <>
                  <option value="">Sin tarifa especial</option>

                  {tarifasEspecialesDisponibles.map((tarifa) => (
                    <option key={tarifa.id} value={tarifa.id}>
                      {tarifa.nombre} - {formatearDinero(tarifa.precio)} por noche
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div>
            <label htmlFor="sena">Seña</label>
            <input
              id="sena"
              type="number"
              min="0"
              step="0.01"
              value={sena}
              onChange={(event) => setSena(event.target.value)}
            />
          </div>

          <div>
            <label htmlFor="metodoSena">Método de pago de la seña</label>
            <select
              id="metodoSena"
              value={metodoSena}
              disabled={!sena || senaNumerica <= 0}
              onChange={(event) =>
                setMetodoSena(event.target.value as MetodoPago | '')
              }
            >
              <option value="">Seleccionar método</option>

              {METODOS_PAGO.map((metodo) => (
                <option key={metodo} value={metodo}>
                  {metodo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="subtotal">Subtotal</label>
            <input
              id="subtotal"
              type="text"
              value={formatearDinero(subtotalEstimado)}
              readOnly
              disabled
            />
          </div>

          <div>
            <label htmlFor="total">Total</label>
            <input
              id="total"
              type="text"
              value={formatearDinero(totalEstimado)}
              readOnly
              disabled
            />
          </div>

          <div>
            <label htmlFor="saldoPendiente">Saldo pendiente</label>
            <input
              id="saldoPendiente"
              type="text"
              value={formatearDinero(saldoPendienteEstimado)}
              readOnly
              disabled
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
                <th>Tarifa</th>
                <th>Seña</th>
                <th>Total</th>
                <th>Saldo</th>
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

                  <td>{reserva.tarifaEspecial?.nombre ?? '-'}</td>
                  <td>{formatearDinero(reserva.sena ?? 0)}</td>
                  <td>{formatearDinero(reserva.total ?? 0)}</td>
                  <td>{formatearDinero(reserva.saldoPendiente ?? 0)}</td>

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
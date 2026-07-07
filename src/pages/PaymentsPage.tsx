import { useEffect, useState } from 'react';
import { CollapsibleForm } from '../components/CollapsibleForm';
import type { FormEvent } from 'react';

import { api } from '../api/api';
import { useAuth } from '../contexts/AuthContext';

import type { ApiResponse } from '../types/auth';
import type { Payment } from '../types/payment';
import type { Stay } from '../types/stay';

function obtenerClaseBadgeMetodoPago(metodo: string) {
  if (metodo === 'EFECTIVO') {
    return 'badge badge-success';
  }

  if (metodo === 'TARJETA') {
    return 'badge badge-info';
  }

  if (metodo === 'TRANSFERENCIA') {
    return 'badge badge-warning';
  }

  if (metodo === 'MERCADO_PAGO') {
    return 'badge badge-info';
  }

  return 'badge badge-muted';
}

const metodosPago = [
  'EFECTIVO',
  'TARJETA',
  'TRANSFERENCIA',
  'MERCADO_PAGO',
  'OTRO',
];

export function PaymentsPage() {
  const { usuario } = useAuth();

  const [pagos, setPagos] = useState<Payment[]>([]);
  const [alojamientos, setAlojamientos] = useState<Stay[]>([]);

  const [alojamientoId, setAlojamientoId] = useState('');
  const [monto, setMonto] = useState('');
  const [metodo, setMetodo] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const [pagosResponse, alojamientosResponse] = await Promise.all([
        api.get<ApiResponse<Payment[]>>('/payments'),
        api.get<ApiResponse<Stay[]>>('/stays'),
      ]);

      setPagos(pagosResponse.data.data);
      setAlojamientos(alojamientosResponse.data.data);
    } catch {
      setError('No se pudieron cargar los pagos.');
    } finally {
      setCargando(false);
    }
  }

  async function crearPago(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');

    if (!alojamientoId) {
      setError('El alojamiento es obligatorio.');
      return;
    }

    if (!usuario?.id) {
      setError('No se pudo identificar el usuario.');
      return;
    }

    if (!monto || Number(monto) <= 0) {
      setError('El monto debe ser mayor a 0.');
      return;
    }

    if (!metodo) {
      setError('El método de pago es obligatorio.');
      return;
    }

    setGuardando(true);

    try {
      await api.post('/payments', {
        alojamientoId,
        usuarioId: usuario.id,
        monto: Number(monto),
        metodo,
        descripcion: descripcion || undefined,
      });

      setAlojamientoId('');
      setMonto('');
      setMetodo('');
      setDescripcion('');

      await cargarDatos();
    } catch {
      setError('No se pudo registrar el pago.');
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarPago(id: string) {
    const confirmar = confirm('¿Eliminar este pago?');

    if (!confirmar) {
      return;
    }

    setError('');

    try {
      await api.delete(`/payments/${id}`);

      await cargarDatos();
    } catch {
      setError('No se pudo eliminar el pago.');
    }
  }

  if (cargando) {
    return (
      <section>
        <h2>Pagos</h2>
        <p>Cargando...</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Pagos</h2>

      <CollapsibleForm title="Nuevo pago">
        <form onSubmit={crearPago}>
          <h3>Nuevo pago</h3>

        <div>
          <label htmlFor="alojamientoId">Alojamiento</label>
          <select
            id="alojamientoId"
            value={alojamientoId}
            onChange={(event) => setAlojamientoId(event.target.value)}
          >
            <option value="">Seleccionar alojamiento</option>

            {alojamientos.map((alojamiento) => (
              <option key={alojamiento.id} value={alojamiento.id}>
                {alojamiento.cliente.nombreCompleto} - Habitación{' '}
                {alojamiento.habitacion.numero} - {alojamiento.estado}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="monto">Monto</label>
          <input
            id="monto"
            type="number"
            min="1"
            value={monto}
            onChange={(event) => setMonto(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="metodo">Método</label>
          <select
            id="metodo"
            value={metodo}
            onChange={(event) => setMetodo(event.target.value)}
          >
            <option value="">Seleccionar método</option>

            {metodosPago.map((metodoPago) => (
              <option key={metodoPago} value={metodoPago}>
                {metodoPago}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="descripcion">Descripción</label>
          <input
            id="descripcion"
            type="text"
            value={descripcion}
            onChange={(event) => setDescripcion(event.target.value)}
          />
        </div>

        <button type="submit" className="button-success" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Registrar pago'}
        </button>
      </form>
    </CollapsibleForm>

      {error && <p>{error}</p>}

      <h3>Listado</h3>

      {pagos.length === 0 ? (
        <p>No hay pagos registrados.</p>
      ) : (
    <div className="table-wrapper">
        <table>
            <thead>
            <tr>
              <th>Cliente</th>
              <th>Habitación</th>
              <th>Monto</th>
              <th>Método</th>
              <th>Usuario</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {pagos.map((pago) => (
              <tr key={pago.id}>
                <td>{pago.alojamiento.cliente.nombreCompleto}</td>
                <td>
                  {pago.alojamiento.habitacion.numero} -{' '}
                  {pago.alojamiento.habitacion.tipo}
                </td>
                <td>${pago.monto}</td>
                <td>
                    <span className={obtenerClaseBadgeMetodoPago(pago.metodo)}>
                        {pago.metodo}
                    </span>
                </td>
                <td>{pago.usuario.nombreCompleto}</td>
                <td>{pago.creadoEn.slice(0, 10)}</td>
                <td>
                  <button
                    type="button"
                    className="button-danger"
                    onClick={() => eliminarPago(pago.id)}
                    >
                    Eliminar
                  </button>
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
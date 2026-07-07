import { useEffect, useState } from 'react';
import { CollapsibleForm } from '../components/CollapsibleForm';
import type { FormEvent } from 'react';

import { api } from '../api/api';
import { useAuth } from '../contexts/AuthContext';

import type { ApiResponse } from '../types/auth';
import type { FixedExpense } from '../types/fixedExpense';

function obtenerClaseBadgeEstadoGastoFijo(estado: string) {
  if (estado === 'PENDIENTE') {
    return 'badge badge-warning';
  }

  if (estado === 'PAGADO') {
    return 'badge badge-success';
  }

  if (estado === 'CANCELADO') {
    return 'badge badge-danger';
  }

  return 'badge badge-muted';
}

export function FixedExpensesPage() {
  const { usuario } = useAuth();

  const [gastos, setGastos] = useState<FixedExpense[]>([]);

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarGastos();
  }, []);

  async function cargarGastos() {
    try {
      const response =
        await api.get<ApiResponse<FixedExpense[]>>('/fixed-expenses');

      setGastos(response.data.data);
    } catch {
      setError('No se pudieron cargar los gastos fijos.');
    } finally {
      setCargando(false);
    }
  }

  async function crearGasto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');

    if (!usuario?.id) {
      setError('No se pudo identificar el usuario.');
      return;
    }

    if (!nombre.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }

    if (!monto || Number(monto) <= 0) {
      setError('El monto debe ser mayor a 0.');
      return;
    }

    if (!fechaVencimiento) {
      setError('La fecha de vencimiento es obligatoria.');
      return;
    }

    setGuardando(true);

    try {
      await api.post('/fixed-expenses', {
        usuarioId: usuario.id,
        nombre,
        descripcion: descripcion || undefined,
        monto: Number(monto),
        fechaVencimiento,
      });

      setNombre('');
      setDescripcion('');
      setMonto('');
      setFechaVencimiento('');

      await cargarGastos();
    } catch {
      setError('No se pudo crear el gasto fijo.');
    } finally {
      setGuardando(false);
    }
  }

  async function pagarGasto(id: string) {
    const confirmar = confirm('¿Marcar este gasto fijo como pagado?');

    if (!confirmar) {
      return;
    }

    setError('');

    try {
      await api.put(`/fixed-expenses/${id}/pay`);

      await cargarGastos();
    } catch {
      setError('No se pudo pagar el gasto fijo.');
    }
  }

  async function cancelarGasto(id: string) {
    const confirmar = confirm('¿Cancelar este gasto fijo?');

    if (!confirmar) {
      return;
    }

    setError('');

    try {
      await api.put(`/fixed-expenses/${id}/cancel`);

      await cargarGastos();
    } catch {
      setError('No se pudo cancelar el gasto fijo.');
    }
  }

  async function eliminarGasto(id: string) {
    const confirmar = confirm('¿Eliminar este gasto fijo?');

    if (!confirmar) {
      return;
    }

    setError('');

    try {
      await api.delete(`/fixed-expenses/${id}`);

      await cargarGastos();
    } catch {
      setError('No se pudo eliminar el gasto fijo.');
    }
  }

  if (cargando) {
    return (
      <section>
        <h2>Gastos fijos</h2>
        <p>Cargando...</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Gastos fijos</h2>

      <CollapsibleForm title="Nuevo gasto fijo">
        <form onSubmit={crearGasto}>
          <h3>Nuevo gasto fijo</h3>

        <div>
          <label htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
          />
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
          <label htmlFor="fechaVencimiento">Fecha vencimiento</label>
          <input
            id="fechaVencimiento"
            type="date"
            value={fechaVencimiento}
            onChange={(event) => setFechaVencimiento(event.target.value)}
          />
        </div>

        <button type="submit" className="button-success" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Crear gasto fijo'}
        </button>
      </form>
    </CollapsibleForm>

      {error && <p>{error}</p>}

      <h3>Listado</h3>

      {gastos.length === 0 ? (
        <p>No hay gastos fijos cargados.</p>
      ) : (
    <div className="table-wrapper">
        <table>
            <thead>
            <tr>
              <th>Nombre</th>
              <th>Monto</th>
              <th>Vencimiento</th>
              <th>Pago</th>
              <th>Estado</th>
              <th>Usuario</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {gastos.map((gasto) => (
              <tr key={gasto.id}>
                <td>{gasto.nombre}</td>
                <td>${gasto.monto}</td>
                <td>{gasto.fechaVencimiento.slice(0, 10)}</td>
                <td>{gasto.fechaPago ? gasto.fechaPago.slice(0, 10) : '-'}</td>
                <td>
                    <span className={obtenerClaseBadgeEstadoGastoFijo(gasto.estado)}>
                        {gasto.estado}
                    </span>
                </td>
                <td>{gasto.usuario.nombreCompleto}</td>
                <td>
                  {gasto.estado === 'PENDIENTE' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => pagarGasto(gasto.id)}
                        >
                        Pagar
                        </button>

                        <button
                        type="button"
                        onClick={() => cancelarGasto(gasto.id)}
                        >
                        Cancelar
                        </button>
                    </>
                  ) : (
                    <button
                        type="button"
                        className="button-danger"
                        onClick={() => eliminarGasto(gasto.id)}
                        >
                        Eliminar
                    </button>
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
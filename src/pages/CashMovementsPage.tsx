import { useEffect, useState } from 'react';

import type { FormEvent } from 'react';

import { api } from '../api/api';
import { useAuth } from '../contexts/AuthContext';

import type { ApiResponse } from '../types/auth';
import type {
  CashMovement,
  CashSummary,
  TipoMovimientoCaja,
} from '../types/cashMovement';

const tiposMovimiento: TipoMovimientoCaja[] = ['INGRESO', 'EGRESO'];

export function CashMovementsPage() {
  const { usuario } = useAuth();

  const [movimientos, setMovimientos] = useState<CashMovement[]>([]);
  const [resumen, setResumen] = useState<CashSummary | null>(null);

  const [tipo, setTipo] = useState<TipoMovimientoCaja | ''>('');
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const [movimientosResponse, resumenResponse] = await Promise.all([
        api.get<ApiResponse<CashMovement[]>>('/cash-movements'),
        api.get<ApiResponse<CashSummary>>('/cash-movements/summary'),
      ]);

      setMovimientos(movimientosResponse.data.data);
      setResumen(resumenResponse.data.data);
    } catch {
      setError('No se pudo cargar la caja.');
    } finally {
      setCargando(false);
    }
  }

  async function crearMovimiento(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');

    if (!usuario?.id) {
      setError('No se pudo identificar el usuario.');
      return;
    }

    if (!tipo) {
      setError('El tipo de movimiento es obligatorio.');
      return;
    }

    if (!monto || Number(monto) <= 0) {
      setError('El monto debe ser mayor a 0.');
      return;
    }

    setGuardando(true);

    try {
      await api.post('/cash-movements', {
        usuarioId: usuario.id,
        tipo,
        monto: Number(monto),
        descripcion: descripcion || undefined,
      });

      setTipo('');
      setMonto('');
      setDescripcion('');

      await cargarDatos();
    } catch {
      setError('No se pudo registrar el movimiento.');
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarMovimiento(id: string) {
    const confirmar = confirm('¿Eliminar este movimiento de caja?');

    if (!confirmar) {
      return;
    }

    setError('');

    try {
      await api.delete(`/cash-movements/${id}`);

      await cargarDatos();
    } catch {
      setError(
        'No se pudo eliminar el movimiento. Si viene de un pago o gasto fijo, se elimina desde su módulo correspondiente.',
      );
    }
  }

  if (cargando) {
    return (
      <section>
        <h2>Caja</h2>
        <p>Cargando...</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Caja</h2>

      <h3>Resumen</h3>

      <div>
        <p>Ingresos: ${resumen?.ingresos}</p>
        <p>Egresos: ${resumen?.egresos}</p>
        <p>Saldo: ${resumen?.saldo}</p>
      </div>

      <form onSubmit={crearMovimiento}>
        <h3>Nuevo movimiento manual</h3>

        <div>
          <label htmlFor="tipo">Tipo</label>
          <select
            id="tipo"
            value={tipo}
            onChange={(event) =>
              setTipo(event.target.value as TipoMovimientoCaja)
            }
          >
            <option value="">Seleccionar tipo</option>

            {tiposMovimiento.map((tipoMovimiento) => (
              <option key={tipoMovimiento} value={tipoMovimiento}>
                {tipoMovimiento}
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
          <label htmlFor="descripcion">Descripción</label>
          <input
            id="descripcion"
            type="text"
            value={descripcion}
            onChange={(event) => setDescripcion(event.target.value)}
          />
        </div>

        <button type="submit" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Registrar movimiento'}
        </button>
      </form>

      {error && <p>{error}</p>}

      <h3>Movimientos</h3>

      {movimientos.length === 0 ? (
        <p>No hay movimientos registrados.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Monto</th>
              <th>Descripción</th>
              <th>Origen</th>
              <th>Usuario</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {movimientos.map((movimiento) => (
              <tr key={movimiento.id}>
                <td>{movimiento.tipo}</td>
                <td>${movimiento.monto}</td>
                <td>{movimiento.descripcion ?? '-'}</td>
                <td>
                  {movimiento.pago
                    ? 'Pago'
                    : movimiento.gastoFijo
                      ? 'Gasto fijo'
                      : 'Manual'}
                </td>
                <td>{movimiento.usuario.nombreCompleto}</td>
                <td>{movimiento.creadoEn.slice(0, 10)}</td>
                <td>
                  {!movimiento.pago && !movimiento.gastoFijo ? (
                    <button
                      type="button"
                      onClick={() => eliminarMovimiento(movimiento.id)}
                    >
                      Eliminar
                    </button>
                  ) : (
                    '-'
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
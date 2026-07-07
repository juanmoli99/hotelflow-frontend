import { useState } from 'react';
import { api } from '../api/api';
import { Alert } from '../components/Alert';
import type { ApiResponse } from '../types/auth';
import type {
  CashReport,
  PaymentByMethodReport,
  ReservationReport,
  RoomOccupancyReport,
} from '../types/report';

export function ReportsPage() {
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  const [reporteCaja, setReporteCaja] = useState<CashReport | null>(null);
  const [pagosPorMetodo, setPagosPorMetodo] = useState<
    PaymentByMethodReport[]
  >([]);
  const [reservas, setReservas] = useState<ReservationReport[]>([]);
  const [ocupacion, setOcupacion] =
    useState<RoomOccupancyReport | null>(null);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  async function cargarReportes() {
    setError('');

    if (!fechaDesde || !fechaHasta) {
      setError('Las fechas son obligatorias.');
      return;
    }

    if (fechaDesde > fechaHasta) {
      setError('La fecha desde no puede ser mayor que la fecha hasta.');
      return;
    }

    setCargando(true);

    try {
      const [
        cajaResponse,
        pagosResponse,
        reservasResponse,
        ocupacionResponse,
      ] = await Promise.all([
        api.get<ApiResponse<CashReport>>('/reports/cash-summary', {
          params: {
            fechaDesde,
            fechaHasta,
          },
        }),
        api.get<ApiResponse<PaymentByMethodReport[]>>(
          '/reports/payments-by-method',
          {
            params: {
              fechaDesde,
              fechaHasta,
            },
          },
        ),
        api.get<ApiResponse<ReservationReport[]>>('/reports/reservations', {
          params: {
            fechaDesde,
            fechaHasta,
          },
        }),
        api.get<ApiResponse<RoomOccupancyReport>>(
          '/reports/room-occupancy',
          {
            params: {
              fechaDesde,
              fechaHasta,
            },
          },
        ),
      ]);

      setReporteCaja(cajaResponse.data.data);
      setPagosPorMetodo(pagosResponse.data.data);
      setReservas(reservasResponse.data.data);
      setOcupacion(ocupacionResponse.data.data);
    } catch {
      setError('No se pudieron cargar los reportes.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <section>
      <h2>Reportes</h2>

      <div>
        <label htmlFor="fechaDesde">Fecha desde</label>
        <input
          id="fechaDesde"
          type="date"
          value={fechaDesde}
          onChange={(event) => setFechaDesde(event.target.value)}
        />
      </div>

      <div>
        <label htmlFor="fechaHasta">Fecha hasta</label>
        <input
          id="fechaHasta"
          type="date"
          value={fechaHasta}
          onChange={(event) => setFechaHasta(event.target.value)}
        />
      </div>

      <button type="button" className="button-success" onClick={cargarReportes} disabled={cargando}>
        {cargando ? 'Cargando...' : 'Generar reportes'}
      </button>

      {error && <Alert type="error">{error}</Alert>}

      {reporteCaja && (
        <>
          <h3>Caja</h3>

          <div>
            <p>Ingresos: ${reporteCaja.ingresos}</p>
            <p>Egresos: ${reporteCaja.egresos}</p>
            <p>Saldo: ${reporteCaja.saldo}</p>
          </div>
        </>
      )}

      {ocupacion && (
        <>
          <h3>Ocupación</h3>

          <div>
            <p>Total habitaciones: {ocupacion.totalHabitaciones}</p>
            <p>Días del período: {ocupacion.diasPeriodo}</p>
            <p>Noches disponibles: {ocupacion.nochesDisponibles}</p>
            <p>Noches ocupadas: {ocupacion.nochesOcupadas}</p>
            <p>Ocupación: {ocupacion.porcentajeOcupacion}%</p>
          </div>
        </>
      )}

      <h3>Pagos por método</h3>

      {pagosPorMetodo.length === 0 ? (
        <p>No hay pagos en el período seleccionado.</p>
      ) : (
    <div className="table-wrapper">
        <table>
            <thead>
            <tr>
              <th>Método</th>
              <th>Cantidad</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {pagosPorMetodo.map((pago) => (
              <tr key={pago.metodo}>
                <td>{pago.metodo}</td>
                <td>{pago.cantidad}</td>
                <td>${pago.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      <h3>Reservas</h3>

      {reservas.length === 0 ? (
        <p>No hay reservas en el período seleccionado.</p>
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
            </tr>
          </thead>

          <tbody>
            {reservas.map((reserva) => (
              <tr key={reserva.id}>
                <td>{reserva.cliente.nombreCompleto}</td>
                <td>
                  {reserva.habitacion.numero} - {reserva.habitacion.tipo}
                </td>
                <td>{reserva.fechaIngreso.slice(0, 10)}</td>
                <td>{reserva.fechaSalida.slice(0, 10)}</td>
                <td>{reserva.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </section>
  );
}
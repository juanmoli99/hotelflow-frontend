import { useEffect, useState } from 'react';

import { api } from '../api/api';

import type { ApiResponse } from '../types/auth';
import type { DashboardSummary } from '../types/dashboard';

export function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(
    null,
  );
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerDashboard();
  }, []);

  async function obtenerDashboard() {
    try {
      const response = await api.get<ApiResponse<DashboardSummary>>(
        '/dashboard/summary',
      );

      setDashboard(response.data.data);
    } catch {
      setError('No se pudo cargar el dashboard.');
    } finally {
      setCargando(false);
    }
  }

  if (cargando) {
    return (
      <section>
        <h2>Dashboard</h2>
        <p>Cargando...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h2>Dashboard</h2>
        <p>{error}</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Dashboard</h2>

      <h3>Habitaciones</h3>

      <div>
        <p>Total: {dashboard?.habitaciones.total}</p>
        <p>Disponibles: {dashboard?.habitaciones.disponibles}</p>
        <p>Reservadas: {dashboard?.habitaciones.reservadas}</p>
        <p>Ocupadas: {dashboard?.habitaciones.ocupadas}</p>
        <p>Limpieza: {dashboard?.habitaciones.limpieza}</p>
        <p>
          Fuera de servicio:{' '}
          {dashboard?.habitaciones.fueraDeServicio}
        </p>
      </div>

      <h3>Caja</h3>

      <div>
        <p>Ingresos: ${dashboard?.caja.ingresos}</p>
        <p>Egresos: ${dashboard?.caja.egresos}</p>
        <p>Saldo: ${dashboard?.caja.saldo}</p>
      </div>
    </section>
  );
}
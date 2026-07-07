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

      <div className="dashboard-grid">
        <article className="dashboard-card">
          <span>Total habitaciones</span>
          <strong>{dashboard?.habitaciones.total}</strong>
        </article>

        <article className="dashboard-card success">
          <span>Disponibles</span>
          <strong>{dashboard?.habitaciones.disponibles}</strong>
        </article>

        <article className="dashboard-card warning">
          <span>Reservadas</span>
          <strong>{dashboard?.habitaciones.reservadas}</strong>
        </article>

        <article className="dashboard-card danger">
          <span>Ocupadas</span>
          <strong>{dashboard?.habitaciones.ocupadas}</strong>
        </article>

        <article className="dashboard-card info">
          <span>Limpieza</span>
          <strong>{dashboard?.habitaciones.limpieza}</strong>
        </article>

        <article className="dashboard-card muted">
          <span>Fuera de servicio</span>
          <strong>{dashboard?.habitaciones.fueraDeServicio}</strong>
        </article>
      </div>

      <h3>Caja</h3>

      <div className="dashboard-grid">
        <article className="dashboard-card success">
          <span>Ingresos</span>
          <strong>${dashboard?.caja.ingresos}</strong>
        </article>

        <article className="dashboard-card danger">
          <span>Egresos</span>
          <strong>${dashboard?.caja.egresos}</strong>
        </article>

        <article className="dashboard-card">
          <span>Saldo</span>
          <strong>${dashboard?.caja.saldo}</strong>
        </article>
      </div>
    </section>
  );
}
import { NavLink, Outlet } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

export function AppLayout() {
  const { usuario, logout } = useAuth();

  return (
    <div>
      <aside>
        <h1>HotelFlow</h1>

        <nav>
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/rooms">Habitaciones</NavLink>
          <NavLink to="/clients">Clientes</NavLink>
          <NavLink to="/reservations">Reservas</NavLink>
          <NavLink to="/stays">Alojamientos</NavLink>
          <NavLink to="/cleaning">Limpieza</NavLink>
          <NavLink to="/payments">Pagos</NavLink>
          <NavLink to="/cash-movements">Caja</NavLink>
          <NavLink to="/fixed-expenses">Gastos fijos</NavLink>
          <NavLink to="/reports">Reportes</NavLink>
          <NavLink to="/room-prices">Precios</NavLink>
          <NavLink to="/special-rates">Tarifas especiales</NavLink>
        </nav>

        <section>
          <p>{usuario?.nombreCompleto}</p>
          <p>{usuario?.rol.nombre}</p>

          <button type="button" onClick={logout}>
            Cerrar sesión
          </button>
        </section>
      </aside>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
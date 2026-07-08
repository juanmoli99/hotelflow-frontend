import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

export function AppLayout() {
  const { usuario, logout } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);

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
          <NavLink to="/users">Usuarios</NavLink>
        </nav>
      </aside>

      <header className="topbar">
        <div className="topbar-user-menu">
          <button
            type="button"
            className="topbar-menu-button"
            onClick={() => setMenuAbierto(!menuAbierto)}
          >
            ☰
          </button>

          {menuAbierto && (
            <div className="topbar-dropdown">
              <p>{usuario?.nombreCompleto}</p>
              <span>{usuario?.rol.nombre}</span>

              <button type="button" onClick={logout}>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
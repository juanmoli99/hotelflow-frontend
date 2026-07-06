import { Link, Outlet } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

export function AppLayout() {
  const { usuario, logout } = useAuth();

  return (
    <div>
      <aside>
        <h1>HotelFlow</h1>

        <nav>
          <Link to="/">Dashboard</Link>
          <Link to="/rooms">Habitaciones</Link>
          <Link to="/clients">Clientes</Link>
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
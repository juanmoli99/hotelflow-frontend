import { Navigate, Route, Routes } from 'react-router-dom';

import { useAuth } from './contexts/AuthContext';
import { AppLayout } from './layouts/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RoomsPage } from './pages/RoomsPage';
import { ProtectedRoute } from './routes/ProtectedRoute';

function App() {
  const { estaAutenticado } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          estaAutenticado ? <Navigate to="/" replace /> : <LoginPage />
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
        </Route>
      </Route>

      <Route
        path="*"
        element={
          <Navigate to={estaAutenticado ? '/' : '/login'} replace />
        }
      />
    </Routes>
  );
}

export default App;
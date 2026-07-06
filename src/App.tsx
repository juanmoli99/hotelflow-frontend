import { Navigate, Route, Routes } from 'react-router-dom';

import { useAuth } from './contexts/AuthContext';
import { AppLayout } from './layouts/AppLayout';
import { CashMovementsPage } from './pages/CashMovementsPage';
import { CleaningPage } from './pages/CleaningPage';
import { ClientsPage } from './pages/ClientsPage';
import { DashboardPage } from './pages/DashboardPage';
import { FixedExpensesPage } from './pages/FixedExpensesPage';
import { LoginPage } from './pages/LoginPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ReportsPage } from './pages/ReportsPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { RoomPricesPage } from './pages/RoomPricesPage';
import { RoomsPage } from './pages/RoomsPage';
import { SpecialRatesPage } from './pages/SpecialRatesPage';
import { StaysPage } from './pages/StaysPage';
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
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/reservations" element={<ReservationsPage />} />
          <Route path="/stays" element={<StaysPage />} />
          <Route path="/cleaning" element={<CleaningPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/cash-movements" element={<CashMovementsPage />} />
          <Route path="/fixed-expenses" element={<FixedExpensesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/room-prices" element={<RoomPricesPage />} />
          <Route path="/special-rates" element={<SpecialRatesPage />} />
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
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';

import FarmerDashboard from './pages/farmer/Dashboard';
import Markets from './pages/farmer/Markets';
import Insights from './pages/farmer/Insights';
import CreateLot from './pages/farmer/CreateLot';
import Offers from './pages/farmer/Offers';
import Transactions from './pages/farmer/Transactions';
import Logistics from './pages/farmer/Logistics';
import Payments from './pages/farmer/Payments';
import Grievances from './pages/farmer/Grievances';

import BuyerDashboard from './pages/buyer/Dashboard';
import BuyerLots from './pages/buyer/Lots';

import FpoDashboard from './pages/fpo/Dashboard';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        <Route path="/farmer/dashboard" element={<ProtectedRoute role="farmer"><FarmerDashboard /></ProtectedRoute>} />
        <Route path="/farmer/markets" element={<ProtectedRoute role="farmer"><Markets /></ProtectedRoute>} />
        <Route path="/farmer/insights" element={<ProtectedRoute role="farmer"><Insights /></ProtectedRoute>} />
        <Route path="/farmer/create-lot" element={<ProtectedRoute role="farmer"><CreateLot /></ProtectedRoute>} />
        <Route path="/farmer/offers" element={<ProtectedRoute role="farmer"><Offers /></ProtectedRoute>} />
        <Route path="/farmer/transactions" element={<ProtectedRoute role="farmer"><Transactions /></ProtectedRoute>} />
        <Route path="/farmer/logistics" element={<ProtectedRoute role="farmer"><Logistics /></ProtectedRoute>} />
        <Route path="/farmer/payments" element={<ProtectedRoute role="farmer"><Payments /></ProtectedRoute>} />
        <Route path="/farmer/grievances" element={<ProtectedRoute role="farmer"><Grievances /></ProtectedRoute>} />

        <Route path="/buyer/dashboard" element={<ProtectedRoute role="buyer"><BuyerDashboard /></ProtectedRoute>} />
        <Route path="/buyer/lots" element={<ProtectedRoute role="buyer"><BuyerLots /></ProtectedRoute>} />

        <Route path="/fpo/dashboard" element={<ProtectedRoute role="fpo"><FpoDashboard /></ProtectedRoute>} />

        <Route path="*" element={<Landing />} />
      </Routes>
    </AuthProvider>
  );
}

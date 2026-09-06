import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../layouts/AppLayout';

export default function ProtectedRoute({ role, children }) {
  const { session } = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  if (role && session.role !== role) return <Navigate to={`/${session.role}/dashboard`} replace />;
  return <AppLayout>{children}</AppLayout>;
}

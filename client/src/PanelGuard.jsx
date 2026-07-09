import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const ADMIN_PANELS = new Set(['arrest-vector', 'officer-spine']);

const PanelGuard = ({ requiredRole, children }) => {
  const { user } = useAuth();
  if (!requiredRole || user?.role === requiredRole) return children;
  return <Navigate to=".." relative="route" replace />;
};

export default PanelGuard;

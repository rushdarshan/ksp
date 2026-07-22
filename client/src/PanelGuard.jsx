import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const ADMIN_PANELS = new Set(['arrest-vector', 'officer-spine']);

const PanelGuard = ({ requiredRole, children }) => {
  const { user } = useAuth();
  const role = String(user?.role || user?.rank || '').toLowerCase().replace(/[\s-]/g, '');
  const hasAccess = requiredRole === 'admin'
    ? ['admin', 'acp', 'dsp', 'dysp', 'superintendent'].includes(role)
    : role === requiredRole;

  if (!requiredRole || hasAccess) return children;
  return <Navigate to=".." relative="route" replace />;
};

export default PanelGuard;

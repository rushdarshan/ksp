import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getRoleHome, getUserRole, useAuth } from './AuthContext';

export const ADMIN_PANELS = new Set(['arrest-vector', 'officer-spine']);

const ADMIN_ROLES = new Set(['admin', 'acp', 'dsp', 'superintendent']);

const hasExplicitPermission = (user, permission) => {
  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
  return permissions.some((entry) => String(entry).toLowerCase() === permission.toLowerCase());
};

const PanelGuard = ({ requiredRole, permission, children }) => {
  const { user } = useAuth();
  const role = getUserRole(user);
  const hasRole = requiredRole === 'admin'
    ? ADMIN_ROLES.has(role)
    : role === requiredRole;
  const hasAccess = !requiredRole
    || hasRole
    || (permission && hasExplicitPermission(user, permission));

  if (hasAccess) return children;
  return <Navigate to={getRoleHome(user)} replace />;
};

PanelGuard.propTypes = {
  children: PropTypes.node.isRequired,
  permission: PropTypes.string,
  requiredRole: PropTypes.string,
};

export default PanelGuard;

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext(null);

const ROLE_ALIASES = Object.freeze({
  acp: 'acp',
  assistantcommissionerofpolice: 'acp',
  admin: 'admin',
  administrator: 'admin',
  dsp: 'dsp',
  dysp: 'dsp',
  deputysuperintendentofpolice: 'dsp',
  superintendent: 'superintendent',
  superintendentofpolice: 'superintendent',
  inspector: 'inspector',
  pi: 'inspector',
  policeinspector: 'inspector',
  subinspector: 'subinspector',
  si: 'subinspector',
  psi: 'subinspector',
  policesubinspector: 'subinspector',
  supervisor: 'supervisor',
  stationsupervisor: 'supervisor',
  stationhouseofficer: 'supervisor',
});

export const ROLE_AREAS = Object.freeze({
  command: Object.freeze(['acp', 'admin', 'dsp', 'superintendent']),
  inspector: Object.freeze(['inspector']),
  subinspector: Object.freeze(['subinspector']),
  supervisor: Object.freeze(['supervisor']),
});

const AREA_HOME = Object.freeze({
  command: '/dashboard/home',
  inspector: '/inspector/home',
  subinspector: '/subinspector/home',
  supervisor: '/supervisor/station-overview',
});

const compact = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]/g, '');

export const normalizeRole = (role) => ROLE_ALIASES[compact(role)] || compact(role);

export const getUserRole = (user) => normalizeRole(user?.role || user?.rank);

const getExplicitAreas = (user) => {
  const supplied = user?.authorizedAreas || user?.allowedAreas || [];
  if (!Array.isArray(supplied)) return [];

  return supplied
    .map((area) => compact(area).replace(/^area/, ''))
    .filter((area) => Object.hasOwn(ROLE_AREAS, area));
};

export const canAccessArea = (user, area) => {
  if (!Object.hasOwn(ROLE_AREAS, area)) return false;
  if (ROLE_AREAS[area].includes(getUserRole(user))) return true;
  return getExplicitAreas(user).includes(area);
};

export const getRoleHome = (user) => {
  const role = getUserRole(user);
  const assignedArea = Object.entries(ROLE_AREAS)
    .find(([, roles]) => roles.includes(role))?.[0];
  const explicitArea = getExplicitAreas(user)[0];
  return AREA_HOME[assignedArea || explicitArea] || '/';
};

const parseStoredUser = () => {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
};

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(parseStoredUser);

  const authenticate = useCallback((nextToken, nextUser) => {
    const hasWorkspace = Object.keys(ROLE_AREAS)
      .some((area) => canAccessArea(nextUser, area));
    if (!nextToken || !nextUser || !hasWorkspace) {
      throw new Error('The server returned an incomplete officer session.');
    }

    localStorage.setItem('token', nextToken);
    localStorage.setItem('user', JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    token,
    user,
    isAuthenticated: Boolean(token && user),
    authenticate,
    logout,
  }), [authenticate, logout, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;

import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import './App.scss';
import './styles/components.css';
import './styles/mobile.css';
import './styles/dashboard.css';
import RedactionSkeleton from './ui/Dropdown/RedactionSkeleton';
import {
  createHashRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import AuthProvider, {
  canAccessArea,
  getRoleHome,
  useAuth,
} from './AuthContext';
import { FilterProvider } from './FilterContext';
import PanelGuard from './PanelGuard';
import Loader from './ui/Dropdown/Loader';
import { installFetchInterceptor } from './utils/fetchInterceptor';
import { startWarmup, registerWarmupProgress } from './utils/apiWarmup';
import { toast } from 'react-hot-toast';
import { I18nProvider } from './utils/i18n';
import { setupOfflineDemo } from './utils/offlineDemo';

// Install global fetch hook to queue calls during function cold starts and auto-retry
installFetchInterceptor();

if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('offline') === 'true') {
  setupOfflineDemo();
}


const Body = React.lazy(() => import('./Components/Dashboard/Components/Body Section/Body'));
const InspectorBody = React.lazy(() => import('./Components/InspectorDash/Components/Body Section/Body'));
const SubinspectorBody = React.lazy(() => import('./Components/SubInspectorDash/Components/Body Section/Body'));
const Dashboard = React.lazy(() => import('./Components/Dashboard/Dashboard'));
const Login = React.lazy(() => import('./Components/Login/Login'));
const Register = React.lazy(() => import('./Components/Regsiter/Register'));
const Officers = React.lazy(() => import('./Components/Officers/Officers'));
const InspectorDash = React.lazy(() => import('./Components/InspectorDash/InspectorDash'));
const SubinspectorDash = React.lazy(() => import('./Components/SubInspectorDash/SubinspectorDash'));
const Map2 = React.lazy(() => import('./Components/Map/Map2'));
const LandingPage = React.lazy(() => import('./Pages/Homepage/Landingpage'));
const FirTable = React.lazy(() => import('./Components/FirDetails/Firdetails'));
const DetailedFir = React.lazy(() => import('./Components/FirDetails/DetailedFir'));
const Details = React.lazy(() => import('./Components/Details/Details'));
const SubordinateDetails = React.lazy(() => import('./Components/SubordinateDetails/Details/Details'));
const OfficersList = React.lazy(() => import('./Components/Officers/OfficersList'));
const FirList = React.lazy(() => import('./Components/FirDetails/FirList'));
const AddFir = React.lazy(() => import('./Components/FirDetails/AddFir'));

const NetworkGraph = React.lazy(() => import('./Components/NetworkGraph'));
const HotspotMap = React.lazy(() => import('./Components/HotspotMap'));
const VoiceQuery = React.lazy(() => import('./Components/VoiceQuery'));
const VeracityPanel = React.lazy(() => import('./Components/VeracityPanel'));
const TopologyPanel = React.lazy(() => import('./Components/TopologyPanel'));
const VictimRiskPanel = React.lazy(() => import('./Components/VictimRiskPanel'));
const GbvPanel = React.lazy(() => import('./Components/GbvPanel'));
const DarkFigurePanel = React.lazy(() => import('./Components/DarkFigurePanel'));
const BeatOptimizerPanel = React.lazy(() => import('./Components/BeatOptimizerPanel'));
const NotificationInbox = React.lazy(() => import('./Components/NotificationInbox'));
const DeterrenceDashboard = React.lazy(() => import('./Components/DeterrenceDashboard'))
const ChargesheetClockPanel = React.lazy(() => import('./Components/ChargesheetClockPanel'))
const AccusedAtLargePanel = React.lazy(() => import('./Components/AccusedAtLargePanel'))
const ArrestVectorPanel = React.lazy(() => import('./Components/ArrestVectorPanel'))
const RetractionRatePanel = React.lazy(() => import('./Components/RetractionRatePanel'))
const CoAccusedNetworkPanel = React.lazy(() => import('./Components/CoAccusedNetworkPanel'))
const PredictivePanel = React.lazy(() => import('./Components/PredictivePanel'))
const CounterCrimePanel = React.lazy(() => import('./Components/CounterCrimePanel'))
const FirQualityPanel = React.lazy(() => import('./Components/FirQualityPanel'))
const FairnessAuditPanel = React.lazy(() => import('./Components/FairnessAuditPanel'))
const AgentPanel = React.lazy(() => import('./Components/AgentPanel'))
const PersonPage = React.lazy(() => import('./Components/PersonPage'))
const CaseWorkspace = React.lazy(() => import('./Components/CaseWorkspace/CaseWorkspace'))
const StationOverview = React.lazy(() => import('./Components/Supervisor/StationOverview'))
const ChargesheetReview = React.lazy(() => import('./Components/Supervisor/ChargesheetReview'))
const ChatPanel = React.lazy(() => import('./Components/ChatPanel/ChatPanel'))
const TheoryBoard = React.lazy(() => import('./Components/TheoryBoard/TheoryBoard'))
const FaceAnalyticsPanel = React.lazy(() => import('./Components/FaceAnalyticsPanel'))


const Lazy = ({ children }) => <Suspense fallback={<RedactionSkeleton />}>{children}</Suspense>;

Lazy.propTypes = {
  children: PropTypes.node.isRequired,
};

const AppFrame = ({ children, showChat = true }) => (
  <>
    {children}
    {showChat && (
      <React.Suspense fallback={null}>
        <ChatPanel />
      </React.Suspense>
    )}
  </>
);

AppFrame.propTypes = {
  children: PropTypes.node.isRequired,
  showChat: PropTypes.bool,
};

const sharedChildren = [
  {
    path: "officers",
    element: <Lazy><OfficersList/></Lazy>,
    children: [
      { path: "officerdetails/:id", element: <Lazy><SubordinateDetails/></Lazy> },
      { element: <Lazy><Officers/></Lazy>, index: true }
    ]
  },
  { path: "location", element: <Lazy><Map2/></Lazy> },
  { path: "profile", element: <Lazy><Details/></Lazy> },
  {
    path: "firdetails",
    element: <Lazy><FirList/></Lazy>,
    children: [
      { element: <Lazy><FirTable/></Lazy>, index: true },
      { path: ":FirNo/:FirYear", element: <Lazy><DetailedFir/></Lazy> }
    ]
  },
  { path: "addfir", element: <Lazy><AddFir/></Lazy> },
  { path: "hotspots", element: <Lazy><HotspotMap/></Lazy> },
  { path: "voice", element: <Lazy><VoiceQuery/></Lazy> },
  { path: "veracity", element: <Lazy><VeracityPanel/></Lazy> },
  { path: "topology", element: <Lazy><TopologyPanel/></Lazy> },
  { path: "victim-risk", element: <Lazy><VictimRiskPanel/></Lazy> },
  { path: "gbv", element: <Lazy><GbvPanel/></Lazy> },
  { path: "dark-figure", element: <Lazy><DarkFigurePanel/></Lazy> },
  { path: "beat-optimizer", element: <Lazy><BeatOptimizerPanel/></Lazy> },
  { path: "notifications", element: <Lazy><NotificationInbox/></Lazy> },
  { path: "deterrence", element: <Lazy><DeterrenceDashboard/></Lazy> },
  { path: "chargesheet-clock", element: <Lazy><ChargesheetClockPanel/></Lazy> },
  { path: "accused-at-large", element: <Lazy><AccusedAtLargePanel/></Lazy> },
  { path: "retraction-rate", element: <Lazy><RetractionRatePanel/></Lazy> },
  { path: "co-accused", element: <Lazy><CoAccusedNetworkPanel/></Lazy> },
  { path: "predictive", element: <Lazy><PredictivePanel/></Lazy> },
  { path: "countercrime", element: <Lazy><CounterCrimePanel/></Lazy> },
  { path: "fir-quality", element: <Lazy><FirQualityPanel/></Lazy> },
  { path: "fairness-audit", element: <Lazy><FairnessAuditPanel/></Lazy> },
  { path: "agent", element: <Lazy><AgentPanel/></Lazy> },
  { path: "arrest-vector", element: <PanelGuard requiredRole="admin"><Lazy><ArrestVectorPanel/></Lazy></PanelGuard> },
  { path: "theory-board", element: <Lazy><TheoryBoard/></Lazy> },
  { path: "face-analytics", element: <Lazy><FaceAnalyticsPanel/></Lazy> },
  { path: "person/:personId", element: <Lazy><PersonPage/></Lazy> },
  { path: "case/:caseId", element: <Lazy><CaseWorkspace/></Lazy> },
  { index: true, path: "network", element: <Lazy><NetworkGraph/></Lazy> },
];

const ProtectedRoute = ({ element: Element, requiredArea }) => {
  const {
    authenticate,
    isAuthenticated,
    logout,
    token,
    user,
  } = useAuth();
  const isDevelopmentDemo = Boolean(token?.startsWith('mock-jwt-'));
  const hasUser = Boolean(user);
  const [verification, setVerification] = React.useState(
    isDevelopmentDemo ? 'valid' : 'checking',
  );

  React.useEffect(() => {
    if (!token) {
      setVerification('anonymous');
      return undefined;
    }

    if (isDevelopmentDemo) {
      setVerification(hasUser ? 'valid' : 'invalid');
      if (!hasUser) logout();
      return undefined;
    }

    const controller = new AbortController();
    setVerification('checking');
    fetch(`${import.meta.env.VITE_API_URL || '/server'}/verify`, {
      headers: { jwt_token: token },
      signal: controller.signal,
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error('Session verification failed');
      }

      const data = await response.json().catch(() => ({}));
      if (!data.user) {
        throw new Error('Session verification did not return an officer profile');
      }

      authenticate(token, data.user);
      setVerification('valid');
    }).catch((error) => {
      if (error.name !== 'AbortError') {
        logout();
        setVerification('invalid');
      }
    });

    return () => controller.abort();
  }, [authenticate, hasUser, isDevelopmentDemo, logout, token]);

  if (verification === 'checking') return <Loader />;

  if (verification !== 'valid' || !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredArea && !canAccessArea(user, requiredArea)) {
    return <Navigate to={getRoleHome(user)} replace />;
  }

  return Element;
};

ProtectedRoute.propTypes = {
  element: PropTypes.node.isRequired,
  requiredArea: PropTypes.oneOf(['command', 'inspector', 'subinspector', 'supervisor']).isRequired,
};

const GuestOnlyRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) return <Navigate to={getRoleHome(user)} replace />;
  return children;
};

GuestOnlyRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

const router = createHashRouter([
  { path: "/", element: <AppFrame showChat={false}><Lazy><LandingPage/></Lazy></AppFrame> },
  { path: "/login", element: <AppFrame showChat={false}><GuestOnlyRoute><Lazy><Login/></Lazy></GuestOnlyRoute></AppFrame> },
  { path: "/register", element: <AppFrame showChat={false}><GuestOnlyRoute><Lazy><Register/></Lazy></GuestOnlyRoute></AppFrame> },
  {
    path: "/dashboard",
    element: <AppFrame><ProtectedRoute requiredArea="command" element={<Lazy><Dashboard /></Lazy>} /></AppFrame>,
    children: [{ index: true, element: <Navigate to="home" replace /> }, { path: "home", element: <Lazy><Body /></Lazy> }, ...sharedChildren,
      { path: "details", element: <Lazy><Details/></Lazy> },
    ]
  },
  {
    path: "/inspector",
    element: <AppFrame><ProtectedRoute requiredArea="inspector" element={<Lazy><InspectorDash/></Lazy>} /></AppFrame>,
    children: [{ index: true, element: <Navigate to="home" replace /> }, { path: "home", element: <Lazy><InspectorBody/></Lazy> }, ...sharedChildren]
  },
  {
    path: "/subinspector",
    element: <AppFrame><ProtectedRoute requiredArea="subinspector" element={<Lazy><SubinspectorDash /></Lazy>} /></AppFrame>,
    children: [{ index: true, element: <Navigate to="home" replace /> }, { path: "home", element: <Lazy><SubinspectorBody/></Lazy> }, ...sharedChildren]
  },
  {
    path: "/supervisor",
    element: <AppFrame><ProtectedRoute requiredArea="supervisor" element={<Lazy><InspectorDash /></Lazy>} /></AppFrame>,
    children: [
      { index: true, element: <Navigate to="station-overview" replace /> },
      { path: "station-overview", element: <Lazy><StationOverview/></Lazy> },
      { path: "chargesheet-review", element: <Lazy><ChargesheetReview/></Lazy> },
      ...sharedChildren,
    ]
  },
  { path: "/public/deterrence", element: <AppFrame><Lazy><DeterrenceDashboard/></Lazy></AppFrame> },
  { path: "*", element: <Navigate to="/" replace /> },
], {
  future: {
    v7_relativeSplatPath: true,
    v7_startTransition: true,
  },
});

function App() {
  React.useEffect(() => {
    // Show a loading toast for the warmups
    const toastId = toast.loading('Powering on KSP Crime Genome engine...', {
      position: 'bottom-right',
    });

    registerWarmupProgress((pct) => {
      toast.loading(`Engine warming: ${pct}% ready...`, {
        id: toastId,
        position: 'bottom-right',
      });
    });

    startWarmup().then(() => {
      toast.success('KSP Engine fully powered up. 27 modules active.', {
        id: toastId,
        position: 'bottom-right',
      });
    });
  }, []);

  return (
    <AuthProvider>
      <I18nProvider>
        <FilterProvider>
          <RouterProvider router={router} />
        </FilterProvider>
      </I18nProvider>
    </AuthProvider>
  )
}

export default App

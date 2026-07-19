import React, { Suspense } from 'react';
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
import AuthProvider, { useAuth } from './AuthContext';
import { FilterProvider } from './FilterContext';
import PanelGuard from './PanelGuard';
import Loader from './ui/Dropdown/Loader';

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


const Lazy = ({ children }) => <Suspense fallback={<RedactionSkeleton />}>{children}</Suspense>;

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
  { path: "person/:personId", element: <Lazy><PersonPage/></Lazy> },
  { path: "case/:caseId", element: <Lazy><CaseWorkspace/></Lazy> },
  { index: true, path: "network", element: <Lazy><NetworkGraph/></Lazy> },
];

const ProtectedRoute = ({ element: Element }) => {
  const { isAuthenticated, setIsAuthenticated, setUser } = useAuth();
  const jwt_token = localStorage.getItem("token");

  if (isAuthenticated && jwt_token) {
    return Element;
  }

  if (!isAuthenticated && jwt_token) {
    const [valid, setValid] = React.useState(null);
    React.useEffect(() => {
      fetch(`${import.meta.env.VITE_API_URL || '/server'}/verify`, {
        headers: { jwt_token: localStorage.getItem('token') }
      }).then(async r => {
        if (r.ok) {
          try {
            const data = await r.json();
            if (data.user) {
              setUser(data.user);
              localStorage.setItem("user", JSON.stringify(data.user));
            }
          } catch(e) {}
          setValid(true);
          setIsAuthenticated(true);
        } else {
          setValid(false);
        }
      })
      .catch(() => setValid(false));
    }, []);
    if (valid === null) return <Loader />;
    if (valid === true) return Element;
  }

  return <Navigate to="/" />;
};

const router = createHashRouter([
  { path: "/", element: <AppFrame showChat={false}><Lazy><LandingPage/></Lazy></AppFrame> },
  { path: "/login", element: <AppFrame><Lazy><Login/></Lazy></AppFrame> },
  { path: "/register", element: <AppFrame><Lazy><Register/></Lazy></AppFrame> },
  {
    path: "/dashboard",
    element: <AppFrame><ProtectedRoute element={<Lazy><Dashboard /></Lazy>} /></AppFrame>,
    children: [{ index: true, element: <Navigate to="home" replace /> }, { path: "home", element: <Lazy><Body /></Lazy> }, ...sharedChildren,
      { path: "details", element: <Lazy><Details/></Lazy> },
    ]
  },
  {
    path: "/inspector",
    element: <AppFrame><ProtectedRoute element={<Lazy><InspectorDash/></Lazy>} /></AppFrame>,
    children: [{ path: "home", element: <Lazy><InspectorBody/></Lazy>, index: true }, ...sharedChildren]
  },
  {
    path: "/subinspector",
    element: <AppFrame><ProtectedRoute element={<Lazy><SubinspectorDash /></Lazy>} /></AppFrame>,
    children: [{ path: "home", element: <Lazy><SubinspectorBody/></Lazy> }, ...sharedChildren]
  },
  {
    path: "/supervisor",
    element: <AppFrame><ProtectedRoute element={<InspectorDash />} /></AppFrame>,
    children: [
      { path: "station-overview", element: <Lazy><StationOverview/></Lazy> },
      { path: "chargesheet-review", element: <Lazy><ChargesheetReview/></Lazy> },
      ...sharedChildren,
    ]
  },
  { path: "/public/deterrence", element: <AppFrame><Lazy><DeterrenceDashboard/></Lazy></AppFrame> }
]);

function App() {
  return (
    <AuthProvider>
      <FilterProvider>
        <RouterProvider router={router} />
      </FilterProvider>
    </AuthProvider>
  )
}

export default App

import React, { Suspense } from 'react';
import './styles/panel-tokens.css';
import './styles/mobile.css';
import RedactionSkeleton from './ui/Dropdown/RedactionSkeleton';
import Body from './Components/Dashboard/Components/Body Section/Body';
import InspectorBody from './Components/InspectorDash/Components/Body Section/Body';
import SubinspectorBody from './Components/SubInspectorDash/Components/Body Section/Body';
import Dashboard from './Components/Dashboard/Dashboard'
import Login from './Components/Login/Login'
import Register from './Components/Regsiter/Register'
import {
  createHashRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import AuthProvider, { useAuth } from './AuthContext';
import Officers from './Components/Officers/Officers';
import InspectorDash from './Components/InspectorDash/InspectorDash';
import SubinspectorDash from './Components/SubInspectorDash/SubinspectorDash';
import Map2 from './Components/Map/Map2';
import LandingPage from './Pages/Homepage/Landingpage';
import FirTable from './Components/FirDetails/Firdetails';
import DetailedFir from './Components/FirDetails/DetailedFir';
import Details from './Components/Details/Details';
import SubordinateDetails from './Components/SubordinateDetails/Details/Details';
import OfficersList from './Components/Officers/OfficersList';
import FirList from './Components/FirDetails/FirList';
import AddFir from './Components/FirDetails/AddFir';
import Loader from './ui/Dropdown/Loader';
import { FilterProvider } from './FilterContext';
import PanelGuard from './PanelGuard';

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

const Lazy = ({ children }) => <Suspense fallback={<RedactionSkeleton />}>{children}</Suspense>;

const sharedChildren = [
  {
    path: "officers",
    element: <OfficersList/>,
    children: [
      { path: "officerdetails/:id", element: <SubordinateDetails/> },
      { element: <Officers/>, index: true }
    ]
  },
  { path: "location", element: <Map2/> },
  { path: "profile", element: <Details/> },
  {
    path: "firdetails",
    element: <FirList/>,
    children: [
      { element: <FirTable/>, index: true },
      { path: ":FirNo/:FirYear", element: <DetailedFir/> }
    ]
  },
  { path: "addfir", element: <AddFir/> },
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
  { path: "arrest-vector", element: <PanelGuard requiredRole="admin"><Lazy><ArrestVectorPanel/></Lazy></PanelGuard> },
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
      fetch(`${import.meta.env.VITE_API_URL}/verify`, {
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
  { path: "/", element: <LandingPage/> },
  { path: "/login", element: <Login/> },
  { path: "/register", element: <Register/> },
  {
    path: "/dashboard",
    element: <ProtectedRoute element={<Dashboard />} />,
    children: [{ path: "home", element: <Body /> }, ...sharedChildren,
      { path: "checkout", element: <div>hi</div> },
      { path: "details", element: <Details/> },
    ]
  },
  {
    path: "/inspector",
    element: <ProtectedRoute element={<InspectorDash/>} />,
    children: [{ path: "home", element: <InspectorBody/>, index: true }, ...sharedChildren]
  },
  {
    path: "/subinspector",
    element: <ProtectedRoute element={<SubinspectorDash />} />,
    children: [{ path: "home", element: <SubinspectorBody/> }, ...sharedChildren]
  },
  { path: "/public/deterrence", element: <Lazy><DeterrenceDashboard/></Lazy> }
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

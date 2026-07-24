import { useState } from 'react'
import Sidebar from './Sidebar'
import Top from './Top'
import ErrorBoundary from './ErrorBoundary'
import { Outlet, useLocation } from 'react-router-dom'
import RightSidebar from './RightSidebar'
import { useAuth } from '../../AuthContext'
import CommandPalette from '../CommandPalette/CommandPalette'
import { useI18n } from '../../utils/i18n'
import { NavLink } from 'react-router-dom'
import { PiSquaresFour, PiFolderOpen, PiMapTrifold, PiBell } from 'react-icons/pi'

const Shell = ({ basePath = '/dashboard' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const showRightRail = /\/(dashboard|inspector|subinspector|supervisor)\/?(home)?$/.test(location.pathname);
  const { persona, t } = useI18n();

  return (
    <div className={`dashboard flex ${persona === 'phone' ? 'persona-phone' : ''}`}>
      <CommandPalette />
      <div className="dashboardContainer flex">
        <Sidebar
          basePath={basePath}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          userRole={user?.role || user?.rank}
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
        />
        <div className={`mainContent ${showRightRail ? '' : 'mainContent--focused'}`}>
          <Top setSidebarOpen={setSidebarOpen} />
          <div className="mainScroll">
            <div className="page-enter">
              <ErrorBoundary key={location.pathname}>
                <Outlet />
              </ErrorBoundary>
            </div>
            <footer className="dashboard-footer">
              KSP Crime Genome &middot; Powered by Zoho Catalyst
            </footer>
          </div>
          {showRightRail && <div className="mainRight"><RightSidebar /></div>}
        </div>
      </div>
      {persona === 'phone' && (
        <nav className="phone-nav-bar" aria-label="Mobile navigation">
          <NavLink to={`${basePath}/home`} className={({ isActive }) => `phone-nav-item${isActive ? ' active' : ''}`}>
            <PiSquaresFour />
            <span>{t('home')}</span>
          </NavLink>
          <NavLink to={`${basePath}/firdetails`} className={({ isActive }) => `phone-nav-item${isActive ? ' active' : ''}`}>
            <PiFolderOpen />
            <span>{t('cases')}</span>
          </NavLink>
          <NavLink to={`${basePath}/location`} className={({ isActive }) => `phone-nav-item${isActive ? ' active' : ''}`}>
            <PiMapTrifold />
            <span>{t('map')}</span>
          </NavLink>
          <NavLink to={`${basePath}/notifications`} className={({ isActive }) => `phone-nav-item${isActive ? ' active' : ''}`}>
            <PiBell />
            <span>{t('notifications')}</span>
          </NavLink>
        </nav>
      )}
    </div>
  )
}

export default Shell

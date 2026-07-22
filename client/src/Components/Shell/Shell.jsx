import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Top from './Top'
import ErrorBoundary from './ErrorBoundary'
import { Outlet, useLocation } from 'react-router-dom'
import RightSidebar from './RightSidebar'
import { useAuth } from '../../AuthContext'
import CommandPalette from '../CommandPalette/CommandPalette'

const Shell = ({ basePath = '/dashboard' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className='dashboard flex'>
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
        <div className='mainContent'>
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
          <div className="mainRight">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Shell

import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Top from './Top'
import ErrorBoundary from './ErrorBoundary'
import { Outlet } from 'react-router-dom'
import RightSidebar from './RightSidebar'
import { useAuth } from '../../AuthContext'

const Shell = ({ basePath = '/dashboard' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();

  return (
    <div className='dashboard flex'>
      <div className="dashboardContainer flex">
        <Sidebar
          basePath={basePath}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          userRole={user?.role}
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
        />
        <div className='mainContent' style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '24px 24px 0 24px' }}>
            <Top setSidebarOpen={setSidebarOpen} />
            <div className="alert-bar" style={{ margin: '16px 0 0 0' }}>
              <span>Karnataka State Police · Operations Dashboard</span>
              <span className="badge">LIVE</span>
            </div>
            <div style={{ marginTop: '12px', paddingBottom: '4px', borderTop: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>State Crime Records Bureau (SCRB) Network</span>
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>· Secure Node (KSP-INET)</span>
            </div>
          </div>
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden', padding: '16px 24px 24px' }}>
            <div className="scrollContainer" style={{ flex: 1, overflowY: 'auto', paddingRight: '16px', minWidth: 0 }}>
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
            </div>
            <div className="rightSidebar" style={{
              width: '300px',
              backgroundColor: 'var(--surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-soft)',
              padding: '20px',
              overflowY: 'auto',
              marginLeft: '20px',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <RightSidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Shell

import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Link } from 'react-router-dom';
import { FiClock, FiAlertCircle, FiUser, FiCheckCircle, FiFileText, FiMapPin } from 'react-icons/fi';

export default function MyDayDashboard() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [expiringCases, setExpiringCases] = useState([]);
  const [ledgerStats, setLedgerStats] = useState({ total: 0, abscondingCount: 0, bailableWarrantCount: 0, averageDaysAtLarge: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Alerts
        const alertsRes = await fetch('/server/fir_api/alerts');
        if (alertsRes.ok) {
          const alertsData = await alertsRes.json();
          setAlerts(alertsData || []);
        }

        // Fetch Expiring Cases
        const expiringRes = await fetch('/server/case_management/cases/expiring');
        if (expiringRes.ok) {
          const expiringData = await expiringRes.json();
          setExpiringCases(expiringData.cases || []);
        }

        // Fetch Accused-at-large stats for metrics
        const ledgerRes = await fetch('/server/accused-at-large/ledger');
        if (ledgerRes.ok) {
          const ledgerData = await ledgerRes.json();
          setLedgerStats(ledgerData);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getSeverityBadgeStyle = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
      case 'critical':
        return { bg: 'var(--pastel-red)', text: 'var(--pastel-red-text)' };
      case 'medium':
        return { bg: 'var(--pastel-amber)', text: 'var(--pastel-amber-text)' };
      default:
        return { bg: 'var(--pastel-blue)', text: 'var(--pastel-blue-text)' };
    }
  };

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good Morning';
    if (hrs < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formattedDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-lg)',
      width: '100%',
      padding: 'var(--space-md) 0'
    }}>
      {/* Welcome Widget */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-lg)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-soft)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'var(--space-md)'
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--size-h2)',
            color: 'var(--text)',
            marginBottom: '4px',
            fontWeight: 500
          }}>
            {getGreeting()}, {user?.name || 'Officer'}
          </h1>
          <p style={{
            fontSize: 'var(--size-sub)',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-body)'
          }}>
            Karnataka State Police Investigation Kernel · {formattedDate}
          </p>
        </div>
        <div style={{
          display: 'flex',
          gap: 'var(--space-xs)',
          alignItems: 'center',
          background: 'var(--surface-alt)',
          padding: '8px 16px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-strong)'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--pastel-green-text)',
            display: 'inline-block',
            marginRight: '6px'
          }} />
          <span style={{
            fontSize: 'var(--size-caption)',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            textTransform: 'uppercase',
            color: 'var(--text)'
          }}>
            Active Session · {user?.role || 'On Duty'}
          </span>
        </div>
      </div>

      {/* Workload Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 'var(--space-md)'
      }}>
        <StatCard 
          title="Active Cases" 
          value="14" 
          subtitle="Assigned to your unit"
          icon={<FiFileText size={20} color="var(--accent)" />}
          link="firdetails"
        />
        <StatCard 
          title="Golden Period Alerts" 
          value={expiringCases.length} 
          subtitle="Cases requiring immediate action"
          icon={<FiClock size={20} color="var(--pastel-red-text)" />}
          badgeColor={expiringCases.length > 0 ? 'var(--pastel-red)' : null}
          badgeTextColor="var(--pastel-red-text)"
          link="firdetails"
        />
        <StatCard 
          title="Absconders at Large" 
          value={ledgerStats.total || 8} 
          subtitle="Tracked in jurisdiction"
          icon={<FiUser size={20} color="var(--pastel-amber-text)" />}
          link="accused-at-large"
        />
        <StatCard 
          title="Average Clearance" 
          value="68%" 
          subtitle="Resolution within SLA"
          icon={<FiCheckCircle size={20} color="var(--pastel-green-text)" />}
          link="retraction-rate"
        />
      </div>

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: 'var(--space-lg)',
        alignItems: 'start'
      }}>
        {/* Alerts Feed Widget */}
        <div style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-lg)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-soft)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-md)',
          minHeight: '450px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--size-h3)',
              fontWeight: 500,
              color: 'var(--text)',
              margin: 0
            }}>
              Operational Activity Feed
            </h3>
            <span style={{
              fontSize: 'var(--size-caption)',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)'
            }}>
              {alerts.length} Real-Time Updates
            </span>
          </div>

          {loading ? (
            <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Loading operations feed...
            </div>
          ) : alerts.length === 0 ? (
            <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No recent notifications or alerts in the dispatch feed.
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-md)',
              maxHeight: '600px',
              overflowY: 'auto',
              paddingRight: '4px'
            }}>
              {alerts.map((alert) => {
                const colors = getSeverityBadgeStyle(alert.severity);
                return (
                  <div 
                    key={alert.id} 
                    style={{
                      padding: 'var(--space-md)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      background: 'var(--surface)',
                      display: 'flex',
                      gap: 'var(--space-md)',
                      alignItems: 'flex-start',
                      transition: 'transform 0.15s, box-shadow 0.15s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-soft)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      background: colors.bg,
                      color: colors.text,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FiAlertCircle size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap', gap: '6px' }}>
                        <h4 style={{ fontSize: 'var(--size-sub)', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
                          {alert.title}
                        </h4>
                        <span style={{
                          fontSize: 'var(--size-label)',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text-secondary)'
                        }}>
                          {alert.created_at ? new Date(alert.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                        </span>
                      </div>
                      <p style={{ fontSize: 'var(--size-caption)', color: 'var(--text-secondary)', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                        {alert.description}
                      </p>
                      {alert.recommendation && (
                        <div style={{
                          fontSize: 'var(--size-caption)',
                          color: 'var(--accent-text)',
                          background: 'var(--accent-dim)',
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          borderLeft: '3px solid var(--accent)',
                          fontWeight: 500
                        }}>
                          <strong>Action Plan:</strong> {alert.recommendation}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Deadlines Sidebar Widget */}
        <div style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-lg)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-soft)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-md)',
          minHeight: '450px'
        }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--size-h3)',
            fontWeight: 500,
            color: 'var(--text)',
            margin: 0
          }}>
            Critical Deadlines
          </h3>
          <p style={{ fontSize: 'var(--size-caption)', color: 'var(--text-secondary)', margin: 0 }}>
            Cases within the 72-hour "Golden Period" demanding priority forensics & evidence collection.
          </p>

          {loading ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--size-sub)', textAlign: 'center', padding: 'var(--space-md) 0' }}>
              Checking critical case timelines...
            </div>
          ) : expiringCases.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--space-xl) 0',
              textAlign: 'center',
              gap: 'var(--space-sm)'
            }}>
              <FiCheckCircle size={32} color="var(--pastel-green-text)" />
              <div style={{ fontSize: 'var(--size-sub)', fontWeight: 600, color: 'var(--text)' }}>All Timelines Clear</div>
              <div style={{ fontSize: 'var(--size-caption)', color: 'var(--text-secondary)' }}>No cases are currently near the golden hour boundary.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {expiringCases.map((c) => (
                <div 
                  key={c.caseId}
                  style={{
                    padding: 'var(--space-md)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 'var(--size-label)', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent)' }}>
                      {c.firNo}
                    </span>
                    <span style={{
                      fontSize: 'var(--size-label)',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: 'var(--pastel-red-text)',
                      background: 'var(--pastel-red)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)'
                    }}>
                      {c.goldenPeriodRemainingHours}h Left
                    </span>
                  </div>
                  
                  <div style={{ fontSize: 'var(--size-sub)', fontWeight: 500, color: 'var(--text)' }}>
                    {c.crimeType.charAt(0).toUpperCase() + c.crimeType.slice(1)} at {c.location}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center', fontSize: 'var(--size-caption)', color: 'var(--text-secondary)' }}>
                    <FiMapPin size={12} />
                    <span>Dist {c.districtId} · Officer: {c.officer}</span>
                  </div>

                  <div style={{
                    marginTop: '4px',
                    fontSize: 'var(--size-caption)',
                    color: 'var(--text-secondary)',
                    borderTop: '1px dashed var(--border-strong)',
                    paddingTop: '6px'
                  }}>
                    <strong>Immediate Action:</strong> Complete core evidence checklist (currently {c.checklistCompletion}% done)
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, badgeColor, badgeTextColor, link }) {
  return (
    <Link to={link || '#'} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div 
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-md) var(--space-lg)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-soft)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          cursor: 'pointer',
          transition: 'transform 0.15s, box-shadow 0.15s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 16px -4px rgba(26,58,92,0.06)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--shadow-soft)';
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            fontSize: 'var(--size-caption)',
            fontWeight: 600,
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
            letterSpacing: '0.5px'
          }}>
            {title}
          </span>
          <div style={{
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--surface-alt)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {icon}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{
            fontSize: '2rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text)',
            lineHeight: 1
          }}>
            {value}
          </span>
          {badgeColor && (
            <span style={{
              fontSize: 'var(--size-label)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              backgroundColor: badgeColor,
              color: badgeTextColor || 'var(--text)',
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)'
            }}>
              URGENT
            </span>
          )}
        </div>

        <span style={{
          fontSize: 'var(--size-caption)',
          color: 'var(--text-secondary)'
        }}>
          {subtitle}
        </span>
      </div>
    </Link>
  );
}

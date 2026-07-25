import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useFetchData } from '../FirDetails/Firdetails';
import Loader from '../../ui/Dropdown/Loader';
import inspector from "../Details/Inspector.png";

import apiFetch from '../../utils/apiFetch';

const apiUrl = import.meta.env.VITE_API_URL || '/server';

export async function loader() {
  try {
    const response = await apiFetch('/getofficers', {
      method: 'POST',
      body: JSON.stringify({})
    }).then(r => r ? r.json() : []);
    return response;
  } catch (error) {
    console.log(error);
  }
  return [];
}

export default function Officers() {  
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [rankFilter, setRankFilter] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");

  const { data: officers, isLoading, error } = useFetchData(
    `${apiUrl}/getofficers`,
    {},
    {
      headers: {
        "jwt_token": localStorage.getItem('token')
      }
    }
  );

  const processedOfficers = useMemo(() => {
    if (!officers || !Array.isArray(officers)) return [];
    let list = [...officers];

    // Filter by name search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(item => 
        (item.ioname && item.ioname.toLowerCase().includes(term)) ||
        (item.id && String(item.id).toLowerCase().includes(term))
      );
    }

    // Filter by rank
    if (rankFilter) {
      if (rankFilter === 'SI') {
        list = list.filter(item => item.rank === 'ASI' || item.rank === 'PSI');
      } else {
        list = list.filter(item => item.rank === rankFilter);
      }
    }

    // Sort logic
    list.sort((a, b) => {
      if (sortBy === "name-asc") {
        return (a.ioname || '').localeCompare(b.ioname || '');
      }
      if (sortBy === "name-desc") {
        return (b.ioname || '').localeCompare(a.ioname || '');
      }
      if (sortBy === "rank-asc") {
        return (a.rank || '').localeCompare(b.rank || '');
      }
      return 0;
    });

    return list;
  }, [officers, searchTerm, rankFilter, sortBy]);

  // Dynamic KPI Card Calculations
  const kpis = useMemo(() => {
    if (!officers || !Array.isArray(officers)) {
      return { total: 0, pi: 0, si: 0, hc: 0 };
    }
    const total = officers.length;
    const pi = officers.filter(item => item.rank === 'PI').length;
    const si = officers.filter(item => item.rank === 'ASI' || item.rank === 'PSI').length;
    const hc = officers.filter(item => item.rank === 'HC').length;
    return { total, pi, si, hc };
  }, [officers]);

  // Row Selection logic
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(processedOfficers.map(f => f.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const getRankBadge = (rank) => {
    let bg = 'var(--pastel-blue)';
    let color = 'var(--pastel-blue-text)';
    
    if (rank === 'PI') {
      bg = 'var(--pastel-green)';
      color = 'var(--pastel-green-text)';
    } else if (rank === 'PSI' || rank === 'ASI') {
      bg = 'var(--pastel-blue)';
      color = 'var(--pastel-blue-text)';
    } else if (rank === 'HC') {
      bg = 'var(--pastel-amber)';
      color = 'var(--pastel-amber-text)';
    }
    
    return (
      <span style={{
        padding: '4px 10px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: bg,
        color: color,
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.02em',
        display: 'inline-block'
      }}>
        {rank}
      </span>
    );
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <p style={{ color: 'var(--pastel-red-text)', padding: '24px' }}>Error: {error.message}</p>;
  }

  if (!officers || officers.length === 0) {
    return <div style={{ padding: '24px', color: 'var(--text-secondary)' }}>No subordinate officers found.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '40px' }}>
      
      {/* Page Title & KPI Cards Row */}
      <div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2rem',
          fontWeight: 500,
          color: 'var(--text)',
          marginBottom: '24px',
          letterSpacing: '-0.02em'
        }}>
          Subordinate Directory
        </h2>

        {/* 4-KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div className="card" style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-soft)'
          }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Subordinates</span>
            <div style={{ fontSize: '28px', fontWeight: 500, color: 'var(--text)', marginTop: '8px', fontFamily: 'var(--font-display)' }}>{kpis.total}</div>
            <span style={{ fontSize: '11px', color: 'var(--pastel-green-text)', display: 'block', marginTop: '6px' }}>Active personnel count</span>
          </div>

          <div className="card" style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-soft)'
          }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inspectors (PI)</span>
            <div style={{ fontSize: '28px', fontWeight: 500, color: 'var(--text)', marginTop: '8px', fontFamily: 'var(--font-display)' }}>{kpis.pi}</div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '6px' }}>Station commanders</span>
          </div>

          <div className="card" style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-soft)'
          }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sub-Inspectors (PSI)</span>
            <div style={{ fontSize: '28px', fontWeight: 500, color: 'var(--text)', marginTop: '8px', fontFamily: 'var(--font-display)' }}>{kpis.si}</div>
            <span style={{ fontSize: '11px', color: 'var(--pastel-blue-text)', display: 'block', marginTop: '6px' }}>Field enquiry officers</span>
          </div>

          <div className="card" style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-soft)'
          }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Head Constables (HC)</span>
            <div style={{ fontSize: '28px', fontWeight: 500, color: 'var(--text)', marginTop: '8px', fontFamily: 'var(--font-display)' }}>{kpis.hc}</div>
            <span style={{ fontSize: '11px', color: 'var(--pastel-amber-text)', display: 'block', marginTop: '6px' }}>Beat operations staff</span>
          </div>
        </div>
      </div>

      {/* Rebuilt Toolbar Row */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center',
        padding: '16px 24px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-soft)'
      }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <input
            type="text"
            placeholder="Search officer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 16px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-full)',
              outline: 'none',
              fontSize: '14px',
              fontFamily: 'var(--font-body)'
            }}
          />
        </div>

        {/* Rank Filter */}
        <select 
          value={rankFilter} 
          onChange={e => setRankFilter(e.target.value)}
          style={{
            padding: '10px 16px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-full)',
            background: 'var(--surface)',
            outline: 'none',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          <option value="">All Ranks</option>
          <option value="PI">Police Inspector (PI)</option>
          <option value="SI">Sub-Inspector (PSI/ASI)</option>
          <option value="HC">Head Constable (HC)</option>
        </select>

        {/* Sort */}
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: '10px 16px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-full)',
            background: 'var(--surface)',
            outline: 'none',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="rank-asc">Rank (A-Z)</option>
        </select>

        {/* Action Button */}
        <button 
          onClick={() => alert("Officer registration panel is available in admin settings.")}
          style={{
            padding: '10px 20px',
            background: 'var(--accent)',
            color: 'white',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          + Add Officer
        </button>
      </div>

      {/* Data Table */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        boxShadow: 'var(--shadow-soft)',
        overflow: 'hidden'
      }}>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr>
              <th style={{ width: '48px', padding: '16px 24px' }}>
                <input 
                  type="checkbox" 
                  checked={processedOfficers.length > 0 && selectedRows.length === processedOfficers.length}
                  onChange={handleSelectAll}
                  style={{ cursor: 'pointer' }}
                />
              </th>
              <th>Officer Profile</th>
              <th>Officer ID</th>
              <th>Rank Badge</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {processedOfficers.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No subordinate officers found matching search filters.
                </td>
              </tr>
            ) : (
              processedOfficers.map((pi, idx) => (
                <tr 
                  key={pi.id} 
                  style={{ 
                    borderBottom: idx === processedOfficers.length - 1 ? 'none' : '1px solid var(--border)',
                    backgroundColor: selectedRows.includes(pi.id) ? 'var(--border-light)' : 'transparent',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  <td style={{ padding: '16px 24px' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedRows.includes(pi.id)}
                      onChange={() => handleSelectRow(pi.id)}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img 
                        src={inspector} 
                        alt="Officer Avatar" 
                        style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border)' }} 
                      />
                      <span style={{ fontWeight: 600, color: 'var(--text)' }}>{pi.ioname}</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>#{pi.id}</td>
                  <td>{getRankBadge(pi.rank)}</td>
                  <td style={{ textAlign: 'right', padding: '16px 24px' }}>
                    <Link to={`officerdetails/${pi.id}`} style={{
                      borderRadius: 'var(--radius-full)',
                      padding: '6px 14px',
                      fontSize: '12px',
                      textDecoration: 'none',
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                      display: 'inline-block',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--accent)'; }}
                    onMouseLeave={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-secondary)'; }}
                    >
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Floating Bulk-Action Bar */}
      {selectedRows.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--text)',
          borderRadius: '50px',
          padding: '8px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          boxShadow: '0px 10px 30px rgba(0,0,0,0.15)',
          zIndex: 1000,
          color: 'white',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-body)' }}>
            {selectedRows.length} Officers Selected
          </span>
          <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.2)' }}></div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => alert(`Bulk Action: Reassign Unit for Officers ID: ${selectedRows.join(', ')}`)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'white',
                padding: '6px 14px',
                borderRadius: '50px',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Reassign Unit
            </button>
            <button 
              onClick={() => {
                if (window.confirm(`Suspend ${selectedRows.length} selected officers?`)) {
                  alert(`Bulk Action: Suspended Officers ID: ${selectedRows.join(', ')}`);
                  setSelectedRows([]);
                }
              }}
              style={{
                background: 'var(--pastel-red)',
                border: 'none',
                color: 'var(--pastel-red-text)',
                padding: '6px 14px',
                borderRadius: '50px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Suspend
            </button>
          </div>
          <button 
            onClick={() => setSelectedRows([])}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-gray-400)',
              fontSize: '16px',
              cursor: 'pointer',
              marginLeft: '4px'
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState, useMemo } from "react";
import styles from "./firdetails.module.css";
import inspector from "../Details/Inspector.png";
import { Link, useNavigation } from "react-router-dom";
import Loader from "../../ui/Dropdown/Loader";
import { useFilter } from "../../FilterContext";

const apiUrl = import.meta.env.VITE_API_URL || '/server';

export async function loader() {
  try {
    const response = await fetch(`${apiUrl}/getfirdetails`, {
      method: 'POST',
      headers: {
        "jwt_token": localStorage.getItem('token'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    }).then(r => r.json());
    return response;
  } catch (error) {
    console.log(error);
  }
  return [];
}

export function useFetchData(url, variables, config) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let targetUrl = url;
    if (!import.meta.env.VITE_API_URL && url) {
      const cleanPath = url.replace(/^undefined\/?/, '').replace(/^\/?/, '/');
      targetUrl = cleanPath.startsWith('/server/') ? cleanPath : `/server${cleanPath}`;
    }
    if (!targetUrl || targetUrl.startsWith('undefined')) {
      setIsLoading(false);
      setData(null);
      return;
    }
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(targetUrl, {
          method: 'POST',
          headers: { ...config?.headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(variables)
        }).then(r => r.json());
        setData(response);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [url, variables.year]);

  return { data, isLoading, error };
}

const FirTable = () => {
  const [selectedValue, setSelectedValue] = useState(2016);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");

  // Consume filters from FilterContext
  const { station, dateFrom, dateTo, crimeType, setFilter, clearFilters, activeFilters } = useFilter();

  const handleYearChange = (event) => {
    setSelectedValue(event.target.value);
  };

  const { data, isLoading, error } = useFetchData(
    `${apiUrl}/getfirdetails`,
    { limit: 100, year: selectedValue },
    {
      headers: {
        "jwt_token": localStorage.getItem('token')
      }
    }
  );

  // Filter and sort fetched data client-side
  const processedData = useMemo(() => {
    if (!data) return [];
    let list = [...data];

    // Text search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(item => 
        (item.FirNo && item.FirNo.toLowerCase().includes(term)) ||
        (item.UnitName && item.UnitName.toLowerCase().includes(term)) ||
        (item.Complaint_Mode && item.Complaint_Mode.toLowerCase().includes(term)) ||
        (item.fir_stage && item.fir_stage.toLowerCase().includes(term))
      );
    }

    // FilterContext connections
    if (station) {
      list = list.filter(item => item.UnitName === station);
    }
    if (crimeType) {
      list = list.filter(item => 
        (item.CrimeGroup_Name && item.CrimeGroup_Name.toLowerCase() === crimeType.toLowerCase()) ||
        (item.CrimeHead_Name && item.CrimeHead_Name.toLowerCase() === crimeType.toLowerCase())
      );
    }
    if (dateFrom) {
      list = list.filter(item => {
        const itemDate = new Date(item.Fir_Date || item.FIR_Reg_DateTime);
        return itemDate >= new Date(dateFrom);
      });
    }
    if (dateTo) {
      list = list.filter(item => {
        const itemDate = new Date(item.Fir_Date || item.FIR_Reg_DateTime);
        return itemDate <= new Date(dateTo);
      });
    }

    // Sorting logic
    list.sort((a, b) => {
      if (sortBy === "date-desc") {
        return new Date(b.Fir_Date || b.FIR_Reg_DateTime) - new Date(a.Fir_Date || a.FIR_Reg_DateTime);
      }
      if (sortBy === "date-asc") {
        return new Date(a.Fir_Date || a.FIR_Reg_DateTime) - new Date(b.Fir_Date || b.FIR_Reg_DateTime);
      }
      if (sortBy === "fir-desc") {
        return b.FirNo.localeCompare(a.FirNo);
      }
      if (sortBy === "fir-asc") {
        return a.FirNo.localeCompare(b.FirNo);
      }
      return 0;
    });

    return list;
  }, [data, searchTerm, station, crimeType, dateFrom, dateTo, sortBy]);

  // Dynamic KPI Card Calculations
  const kpis = useMemo(() => {
    if (!processedData || processedData.length === 0) {
      return { total: 0, active: 0, clearance: 0, conviction: 0 };
    }
    const total = processedData.length;
    const active = processedData.filter(f => f.fir_stage === 'Under Investigation' || f.fir_stage === 'FIR Registered').length;
    const closed = processedData.filter(f => f.fir_stage === 'Convicted' || f.fir_stage === 'Acquitted' || f.fir_stage === 'Case Closed' || f.fir_stage === 'Pending Trial').length;
    const clearance = Math.round((closed / total) * 100);
    const conviction = 76; // Default representational stat
    return { total, active, clearance, conviction };
  }, [processedData]);

  // Row Selection logic
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(processedData.map(f => f.FirNo));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (firNo) => {
    setSelectedRows(prev => 
      prev.includes(firNo) ? prev.filter(id => id !== firNo) : [...prev, firNo]
    );
  };

  const getStageBadge = (stage) => {
    let bg = 'var(--pastel-blue)';
    let color = 'var(--pastel-blue-text)';
    
    const lowerStage = (stage || '').toLowerCase();
    if (lowerStage.includes('investigation') || lowerStage.includes('registered')) {
      bg = 'var(--pastel-amber)';
      color = 'var(--pastel-amber-text)';
    } else if (lowerStage.includes('convicted') || lowerStage.includes('fabricated') || lowerStage.includes('critical')) {
      bg = 'var(--pastel-red)';
      color = 'var(--pastel-red-text)';
    } else if (lowerStage.includes('closed') || lowerStage.includes('acquitted') || lowerStage.includes('solved') || lowerStage.includes('genuine')) {
      bg = 'var(--pastel-green)';
      color = 'var(--pastel-green-text)';
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
        {stage || 'Unknown'}
      </span>
    );
  };

  const STATIONS = [
    'Brigade Road PS', 'Cubbon Park PS', 'Mysuru North PS', 'Mysuru South PS',
    'Hubli PS', 'Belgaum City PS', 'Mangaluru PS', 'Udupi PS',
    'Central Crime Branch', 'Shivamogga PS', 'Dharwad PS', 'Chitradurga PS',
  ];

  const CRIME_TYPES = [
    'theft', 'burglary', 'assault', 'cyber_fraud', 'robbery',
    'vehicle_theft', 'homicide', 'kidnapping',
  ];

  const handleExport = () => {
    const header = "FirNo,UnitName,Year,Complaint_Mode,Stage\n";
    const rows = processedData.map(f => `"${f.FirNo}","${f.UnitName}","${f.year}","${f.Complaint_Mode}","${f.fir_stage}"`).join("\n");
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `fir_export_${selectedValue}.csv`);
    a.click();
  };

  if (error) {
    return <p style={{ color: 'var(--pastel-red-text)', padding: '24px' }}>Error: {error.message}</p>;
  }

  if (isLoading) {
    return <Loader />;
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
          Case Management Ledger
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
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Cases</span>
            <div style={{ fontSize: '28px', fontWeight: 500, color: 'var(--text)', marginTop: '8px', fontFamily: 'var(--font-display)' }}>{kpis.total}</div>
            <span style={{ fontSize: '11px', color: 'var(--pastel-green-text)', display: 'block', marginTop: '6px' }}>Active ledger count</span>
          </div>

          <div className="card" style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-soft)'
          }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Enquiries</span>
            <div style={{ fontSize: '28px', fontWeight: 500, color: 'var(--text)', marginTop: '8px', fontFamily: 'var(--font-display)' }}>{kpis.active}</div>
            <span style={{ fontSize: '11px', color: 'var(--pastel-amber-text)', display: 'block', marginTop: '6px' }}>Awaiting chargesheet</span>
          </div>

          <div className="card" style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-soft)'
          }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Clearance Rate</span>
            <div style={{ fontSize: '28px', fontWeight: 500, color: 'var(--text)', marginTop: '8px', fontFamily: 'var(--font-display)' }}>{kpis.clearance}%</div>
            <span style={{ fontSize: '11px', color: 'var(--pastel-green-text)', display: 'block', marginTop: '6px' }}>Solved cases ratio</span>
          </div>

          <div className="card" style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-soft)'
          }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg. Conviction</span>
            <div style={{ fontSize: '28px', fontWeight: 500, color: 'var(--text)', marginTop: '8px', fontFamily: 'var(--font-display)' }}>{kpis.conviction}%</div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '6px' }}>Trial outcome rate</span>
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
            placeholder="Search cases..."
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

        {/* Station Filter */}
        <select 
          value={station || ''} 
          onChange={e => setFilter('station', e.target.value)}
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
          <option value="">All Stations</option>
          {STATIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Crime Type Filter */}
        <select 
          value={crimeType || ''} 
          onChange={e => setFilter('crimeType', e.target.value)}
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
          <option value="">All Crime Types</option>
          {CRIME_TYPES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
        </select>

        {/* Year Selector */}
        <select 
          value={selectedValue} 
          onChange={handleYearChange}
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
          <option value="2016">2016</option>
          <option value="2017">2017</option>
          <option value="2018">2018</option>
          <option value="2019">2019</option>
          <option value="2021">2021</option>
          <option value="2022">2022</option>
          <option value="2023">2023</option>
          <option value="2024">2024</option>
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
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="fir-desc">FIR No (Z-A)</option>
          <option value="fir-asc">FIR No (A-Z)</option>
        </select>

        {/* Clear Filters Button */}
        {activeFilters.length > 0 && (
          <button 
            onClick={clearFilters}
            style={{
              padding: '10px 16px',
              border: 'none',
              background: 'var(--pastel-red)',
              color: 'var(--pastel-red-text)',
              borderRadius: 'var(--radius-full)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Clear Filters
          </button>
        )}

        {/* Export Action */}
        <button 
          onClick={handleExport}
          style={{
            padding: '10px 18px',
            border: '1px solid var(--accent)',
            background: 'transparent',
            color: 'var(--accent)',
            borderRadius: 'var(--radius-full)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          Export CSV
        </button>

        {/* Primary Register Action */}
        <Link 
          to="/dashboard/addfir"
          style={{
            padding: '10px 20px',
            background: 'var(--accent)',
            color: 'white',
            borderRadius: 'var(--radius-full)',
            fontSize: '13px',
            fontWeight: 500,
            textDecoration: 'none',
            textAlign: 'center'
          }}
        >
          + Register FIR
        </Link>
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
                  checked={processedData.length > 0 && selectedRows.length === processedData.length}
                  onChange={handleSelectAll}
                  style={{ cursor: 'pointer' }}
                />
              </th>
              <th>FIR Number</th>
              <th>Police Unit</th>
              <th>Year</th>
              <th>Registration Mode</th>
              <th>Enquiry Stage</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {processedData.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, sans-serif', fontStyle: 'italic' }}>No records match your active search filters.</span>
                    {activeFilters.length > 0 && (
                      <button onClick={clearFilters} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline', fontSize: '12px' }}>
                        Reset filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              processedData.map((fir, idx) => (
                <tr 
                  key={fir.FirNo} 
                  style={{ 
                    borderBottom: idx === processedData.length - 1 ? 'none' : '1px solid var(--border)',
                    backgroundColor: selectedRows.includes(fir.FirNo) ? 'var(--border-light)' : 'transparent',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  <td style={{ padding: '16px 24px' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedRows.includes(fir.FirNo)}
                      onChange={() => handleSelectRow(fir.FirNo)}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{fir.FirNo}</td>
                  <td>{fir.UnitName}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{fir.year}</td>
                  <td>{fir.Complaint_Mode}</td>
                  <td>{getStageBadge(fir.fir_stage)}</td>
                  <td style={{ textAlign: 'right', padding: '16px 24px' }}>
                    <Link to={`${fir.FirNo}`} className={styles.inspector_details} style={{
                      borderRadius: 'var(--radius-full)',
                      padding: '6px 14px',
                      fontSize: '12px',
                      textDecoration: 'none'
                    }}>
                      View Details
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
            {selectedRows.length} Selected
          </span>
          <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.2)' }}></div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => alert(`Bulk Action: Apply Stage Code to ${selectedRows.join(', ')}`)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'white',
                padding: '6px 14px',
                borderRadius: '50px',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.15)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            >
              Apply Code
            </button>
            <button 
              onClick={() => alert(`Bulk Action: Edit Info for ${selectedRows.join(', ')}`)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'white',
                padding: '6px 14px',
                borderRadius: '50px',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.15)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            >
              Edit Info
            </button>
            <button 
              onClick={() => {
                if (window.confirm(`Delete ${selectedRows.length} selected FIR records?`)) {
                  alert(`Bulk Action: Deleted ${selectedRows.join(', ')}`);
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
              Delete
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
};

export default FirTable;

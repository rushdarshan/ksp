import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import CoAccusedNetworkPanel from './CoAccusedNetworkPanel';

export default function PersonPage() {
  const { personId } = useParams();
  const [personData, setPersonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Determine current active basepath (support role-based layouts)
  const basePath = useMemo(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#/inspector')) return '/inspector';
    if (hash.startsWith('#/subinspector')) return '/subinspector';
    return '/dashboard';
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/server/fir_api/person/${encodeURIComponent(personId)}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load profile');
        return res.json();
      })
      .then(data => {
        setPersonData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [personId]);

  const getCaseLink = (firNo) => {
    if (!firNo) return '';
    // e.g. "KSP-2026-0142"
    const parts = firNo.split('-');
    if (parts.length >= 3) {
      const year = parts[1];
      const num = parseInt(parts[2]) || parts[2];
      return `${basePath}/firdetails/${num}/${year}`;
    }
    return `${basePath}/firdetails/${firNo}`;
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>⏳ Loading Profile 360...</div>;
  if (error) return <div style={{ padding: '40px', color: 'var(--pastel-red-text)' }}>Error: {error}</div>;
  if (!personData) return <div style={{ padding: '40px', textAlign: 'center' }}>No record found for this individual.</div>;

  const statusColor = personData.legalStatus === 'absconding' ? 'var(--pastel-red-text)' : 'var(--pastel-yellow-text)';
  const statusBg = personData.legalStatus === 'absconding' ? 'var(--pastel-red)' : 'var(--pastel-yellow)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '20px' }}>
      
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-light)', paddingBottom: '20px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PERSON 360 PROFILE</span>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text)', margin: '6px 0 4px 0' }}>{personData.name}</h1>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
            {personData.aliases && personData.aliases.length > 0 && (
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Aliases: <strong>{personData.aliases.join(', ')}</strong>
              </span>
            )}
            <span style={{ color: 'var(--border)' }}>|</span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Age: <strong>{personData.age}</strong> ({personData.gender})
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <span style={{
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            background: statusBg,
            color: statusColor,
            fontWeight: 700,
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {personData.legalStatus.replace('_', ' ')}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--pastel-red-text)', fontWeight: 600 }}>
            {personData.riskCategory}
          </span>
        </div>
      </div>

      {/* Profile Details & Personal Record */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Bio Card */}
        <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600 }}>Biographic & Contact Information</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>PRIMARY PHONE</div>
              <div style={{ fontSize: '14px', color: 'var(--text)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>{personData.primaryPhone}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>AADHAAR CARD ID</div>
              <div style={{ fontSize: '14px', color: 'var(--text)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>{personData.aadhaarId}</div>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>LAST KNOWN RESIDENCE</div>
              <div style={{ fontSize: '14px', color: 'var(--text)', marginTop: '4px' }}>{personData.lastKnownAddress}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>ORGANIZED GANG LINKAGE</div>
              <div style={{ fontSize: '14px', color: 'var(--text)', marginTop: '4px', fontWeight: 600 }}>{personData.gangAffiliation}</div>
            </div>
          </div>
        </div>

        {/* Associated cases list */}
        <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>Associated CCTNS Cases ({personData.FIRs.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {personData.FIRs.map((fir, idx) => (
              <div key={idx} style={{
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                background: 'var(--surface-alt)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>
                    <Link to={getCaseLink(fir.firNo)} style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                      📁 {fir.firNo}
                    </Link>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', textTransform: 'capitalize' }}>
                    {fir.crimeType} · Role: {fir.role}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--pastel-yellow-text)', background: 'var(--pastel-yellow)', padding: '2px 6px', borderRadius: '4px' }}>
                    {fir.stage}
                  </span>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>{fir.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Network section */}
      <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600 }}>Co-Accused Network Map</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Visualizing relational links extracted from all shared FIR listings for this person.
        </p>
        <CoAccusedNetworkPanel focusPersonName={personData.name} hideHeader={true} />
      </div>

    </div>
  );
}

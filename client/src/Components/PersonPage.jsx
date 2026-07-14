import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CoAccusedNetworkPanel from './CoAccusedNetworkPanel';
import RiskScores from './Person360/RiskScores';
import CrossCaseTimeline from './Person360/CrossCaseTimeline';
import { maskAadhaar, maskPhone, revealPii } from '../utils/piiMask';
import apiFetch from '../utils/apiFetch';

export default function PersonPage() {
  const { personId } = useParams();
  const [personData, setPersonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revealPiiState, setRevealPiiState] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiFetch(`/fir_api/person/${encodeURIComponent(personId)}`)
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

  const getMaskedAadhaar = (val) => {
    if (!val) return 'XXXXXX0000';
    return revealPiiState ? revealPii(val, 'aadhaar') : maskAadhaar(val);
  };

  const getMaskedPhone = (val) => {
    if (!val) return '98XXXXXX00';
    return revealPiiState ? revealPii(val, 'phone') : maskPhone(val);
  };

  const handleReveal = () => {
    setRevealPiiState(!revealPiiState);
    if (!revealPiiState) {
      console.log(`[AUDIT LOG] PII Access - User requested full details for person ${personId} at ${new Date().toISOString()}`);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading Profile 360...</div>;
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
            padding: '6px 12px', borderRadius: 'var(--radius-full)',
            background: statusBg, color: statusColor,
            fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em'
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Biographic & Contact Information</h3>
            <button
              onClick={handleReveal}
              style={{
                padding: '4px 10px', fontSize: '11px', fontWeight: 700,
                background: revealPiiState ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                color: revealPiiState ? '#ef4444' : '#6366f1',
                border: 'none', borderRadius: '4px', cursor: 'pointer',
              }}
            >
              {revealPiiState ? '🔒 Mask PII' : '🔓 Reveal PII'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>PRIMARY PHONE</div>
              <div style={{ fontSize: '14px', color: 'var(--text)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>{getMaskedPhone(personData.primaryPhone)}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>AADHAAR CARD ID</div>
              <div style={{ fontSize: '14px', color: 'var(--text)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>{getMaskedAadhaar(personData.aadhaarId)}</div>
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
                padding: '12px 14px', borderRadius: '8px',
                border: '1px solid var(--border-light)', background: 'var(--surface-alt)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>
                    <Link to={`/dashboard/case/${fir.firNo}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                      {fir.firNo}
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

      {/* Timeline + Risk Scores */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
        <CrossCaseTimeline firList={personData.FIRs} />
        <RiskScores />
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

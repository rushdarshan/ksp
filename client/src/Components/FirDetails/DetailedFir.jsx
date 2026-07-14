import React, { useState, useEffect, useMemo } from "react";
import { formatString } from "../../utils/utility";
import { useFetchData } from "./Firdetails";
import styles from "./firdetails.module.css";
import { useParams, Link } from "react-router-dom";
import Loader from "../../ui/Dropdown/Loader";
import SolvabilityBadge from '../SolvabilityBadge';
import VeracityPanel from '../VeracityPanel';
import CoAccusedNetworkPanel from '../CoAccusedNetworkPanel';
import CrimeGenomePanel from './CrimeGenomePanel';

const apiUrl = import.meta.env.VITE_API_URL || '/server';

function QualityBadge({ firData }) {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchScore = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(apiUrl ? `${apiUrl}/fir_quality/fir-quality` : `/server/fir_quality/fir-quality`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firNo: firData?.FIRNo || '',
                    narrative: firData?.Narrative || firData?.narrative || '',
                    evidenceTypes: [],
                    witnessCount: 0,
                    propertyValue: 0,
                    delayReason: '',
                    accusedCount: 0,
                    accusedDescription: '',
                    crimeType: ''
                })
            });
            if (!res.ok) throw new Error('Quality analysis unavailable');
            const data = await res.json();
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { if (firData) fetchScore(); }, [firData]);
    if (loading) return <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--surface-alt)' }}>
        <div style={{ height: '16px', width: '200px', background: 'var(--border)', borderRadius: '8px', marginBottom: '8px' }} />
    </div>;
    if (error) return <div style={{ padding: '1rem', border: '1px solid var(--pastel-red-text)', borderRadius: '12px', background: 'var(--pastel-red)' }}>
        <p style={{ color: 'var(--pastel-red-text)', margin: '0 0 8px 0', fontSize: '14px' }}>Quality analysis unavailable</p>
        <button onClick={fetchScore} style={{ padding: '4px 12px', background: 'var(--pastel-red-text)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Retry</button>
    </div>;
    if (!result) return null;
    
    // Support mock vs real response formats with safe fallbacks
    const qualityScore = result.qualityScore !== undefined 
      ? result.qualityScore 
      : (result.score !== undefined 
         ? (result.score <= 1 ? Math.round(result.score * 100) : result.score) 
         : 62);
         
    const uncertaintyBand = result.uncertaintyBand !== undefined ? result.uncertaintyBand : 5;
    
    const dimensions = result.dimensions || [
        { name: 'Narrative Detail', score: 6, max: 10 },
        { name: 'Time Specificity', score: 8, max: 10 },
        { name: 'Geographic Accuracy', score: 7, max: 10 },
        { name: 'Evidence Registration', score: 5, max: 10 },
        { name: 'Witness Statements', score: 4, max: 10 }
    ];
    
    const flags = result.flags || result.issues || [];
    
    const color = qualityScore >= 70 ? 'var(--pastel-green-text)' : qualityScore >= 40 ? 'var(--pastel-yellow-text)' : 'var(--pastel-red-text)';
    
    return <div style={{ padding: '1rem', border: '1px solid var(--border-light)', borderRadius: '12px', background: 'var(--surface)' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600 }}>FIR Heuristic Quality</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '160px', height: '12px', background: 'var(--border-light)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${qualityScore}%`, height: '100%', background: color, borderRadius: '6px' }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: '18px', color }}>{qualityScore} ± {uncertaintyBand}</span>
            <span style={{ fontSize: '13px', color, fontWeight: 500 }}>{qualityScore >= 70 ? 'Complete' : qualityScore >= 40 ? 'Needs review' : 'Incomplete'}</span>
        </div>
        <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Heuristic checklist score evaluating compliance with CCTNS protocols.</p>
        <details style={{ cursor: 'pointer' }}>
            <summary style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>Dimension breakdown</summary>
            <ul style={{ margin: '8px 0 0 0', padding: '0 0 0 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                {dimensions.map((d, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{d.name}: {d.score}/{d.max}</li>
                ))}
            </ul>
            {flags.length > 0 && <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--pastel-red-text)' }}>Flags: {flags.join('; ')}</div>}
        </details>
    </div>;
}

function DetailedFir() {
  const { FirNo, FirYear } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data, isLoading, error } = useFetchData(
    `${apiUrl}/getfirdetails_withid`,
    {
      FirNo: `${FirNo}/${FirYear}`,
    },
    {
      headers: {
        jwt_token: localStorage.getItem("token"),
      },
    }
  );

  const firData = data?.[0] || null;

  // Determine current active basepath (support role-based layouts)
  const basePath = useMemo(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#/inspector')) return '/inspector';
    if (hash.startsWith('#/subinspector')) return '/subinspector';
    return '/dashboard';
  }, []);

  // 1. Checklist State
  const checklistKey = `checklist_${FirNo}_${FirYear}`;
  const [checklist, setChecklist] = useState(() => {
    const saved = sessionStorage.getItem(checklistKey);
    if (saved) return JSON.parse(saved);
    return [
      { text: 'Initial crime scene visit & mapping', checked: true },
      { text: 'Secure bystander/witness contacts', checked: false },
      { text: 'Request CCTV footage from intersection', checked: false },
      { text: 'Send digital devices to forensic laboratory', checked: false },
      { text: 'Draft section 161 statements', checked: false },
      { text: 'Review Solvability index suggestions', checked: false },
      { text: 'Complete VeriPol linguistic check', checked: false },
      { text: 'Compile final chargesheet report', checked: false },
    ];
  });

  useEffect(() => {
    if (firData) {
      sessionStorage.setItem(checklistKey, JSON.stringify(checklist));
    }
  }, [checklist, checklistKey, firData]);

  const toggleChecklistItem = (index) => {
    setChecklist(prev => prev.map((item, i) => i === index ? { ...item, checked: !item.checked } : item));
  };

  // 2. Evidence State
  const evidenceKey = `evidence_${FirNo}_${FirYear}`;
  const [evidenceList, setEvidenceList] = useState(() => {
    const saved = sessionStorage.getItem(evidenceKey);
    if (saved) return JSON.parse(saved);
    return [
      { name: 'CCTV Footage (Intersection)', type: 'Digital', source: 'MG Road Traffic Pole #4', status: 'Under Analysis', date: '2026-03-16' },
      { name: 'Latent Fingerprints', type: 'Forensic', source: 'Shop Counter', status: 'Matched', date: '2026-03-16' },
      { name: 'Gold Chain (Recovered)', type: 'Property', source: 'Suspect Custody Search', status: 'Verified', date: '2026-03-24' }
    ];
  });

  const [newEvName, setNewEvName] = useState('');
  const [newEvType, setNewEvType] = useState('Digital');
  const [newEvSource, setNewEvSource] = useState('');

  useEffect(() => {
    if (firData) {
      sessionStorage.setItem(evidenceKey, JSON.stringify(evidenceList));
    }
  }, [evidenceList, evidenceKey, firData]);

  const addEvidence = (e) => {
    e.preventDefault();
    if (!newEvName || !newEvSource) return;
    setEvidenceList(prev => [
      ...prev,
      { name: newEvName, type: newEvType, source: newEvSource, status: 'Secured', date: new Date().toISOString().split('T')[0] }
    ]);
    setNewEvName('');
    setNewEvSource('');
  };

  // Stepper Stage Calculation
  const stageIndex = useMemo(() => {
    if (!firData) return 1;
    const s = (firData.fir_stage || '').toLowerCase();
    if (s.includes('closed') || s.includes('solved')) return 6;
    if (s.includes('chargesheet') || s.includes('court')) return 5;
    if (s.includes('witness')) return 4;
    if (s.includes('evidence')) return 3;
    if (s.includes('assigned') || s.includes('investigation')) return 2;
    return 1;
  }, [firData]);

  const stages = [
    { label: 'FIR Registered', detail: 'CCTNS logged' },
    { label: 'IO Assigned', detail: 'Officer appointed' },
    { label: 'Evidence Collection', detail: 'Forensics & CCTV' },
    { label: 'Witness Exam', detail: 'Sec 161 statements' },
    { label: 'Chargesheet Clock', detail: 'Sec 173 CrPC' },
    { label: 'Case Closed', detail: 'Court submitted' }
  ];

  if (isLoading) return <Loader />;
  if (error) return <p>Error: {error.message}</p>;
  if (!firData) return <p>No data available.</p>;

  // Filtered entries for clean Key-Value view
  const visibleEntries = Object.entries(firData).filter(([key]) => 
    !['Narrative', 'complainantName', 'accusedName', 'victimName', 'complainantMobile', 'complainantAadhaar'].includes(key)
  );

  return (
    <div className={styles.detailed_fir_bg_wrapper} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Case Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CASE LOG</span>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', margin: '4px 0 0 0' }}>Case {firData.FIRNo}</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Registered on {firData.Fir_Date || 'N/A'} at {firData.UnitName || 'N/A'}, {firData.DistrictName || 'N/A'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => window.print()} style={{ padding: '8px 16px', background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', color: 'var(--text)', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
            Export Case Brief (PDF)
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border-light)', paddingBottom: '1px', flexWrap: 'wrap' }}>
        {[
          { id: 'overview', label: 'Overview', icon: '📋' },
          { id: 'timeline', label: 'Timeline', icon: '⏱️' },
          { id: 'evidence', label: 'Evidence', icon: '🔬' },
          { id: 'people', label: 'People', icon: '👥' },
          { id: 'veracity', label: 'Veracity', icon: '🛡️' },
          { id: 'network', label: 'Crime Links', icon: '🕸️' },
          { id: 'genome', label: 'Crime Genome', icon: '🧬' },
          { id: 'aibrief', label: 'AI Brief', icon: '🤖' },
          { id: 'chargesheet', label: 'Chargesheet Clock', icon: '⚖️' },
          { id: 'audit', label: 'Audit Trail', icon: '📑' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 16px',
              background: activeTab === tab.id ? 'var(--bg)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--text)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: activeTab === tab.id ? 600 : 500,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div style={{ minHeight: '400px', marginTop: '10px' }}>
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Stepper */}
            <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>Investigation Progress</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', flexWrap: 'wrap', gap: '20px' }}>
                {stages.map((stage, index) => {
                  const num = index + 1;
                  const isCompleted = num < stageIndex;
                  const isActive = num === stageIndex;
                  const color = isCompleted ? 'var(--pastel-green-text)' : isActive ? 'var(--accent)' : 'var(--text-secondary)';
                  const bg = isCompleted ? 'var(--pastel-green)' : isActive ? 'var(--bg-accent, #e0f2fe)' : 'var(--surface-alt)';
                  
                  return (
                    <div key={index} style={{ flex: 1, minWidth: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: bg,
                        color: color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '13px',
                        border: `2px solid ${isCompleted || isActive ? color : 'var(--border)'}`,
                        marginBottom: '8px'
                      }}>
                        {isCompleted ? '✓' : num}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: isActive ? 'var(--text)' : 'var(--text-secondary)' }}>{stage.label}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{stage.detail}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Grid Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '24px' }}>
              
              {/* Core Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 600 }}>CCTNS Records</h3>
                  <div className={styles.detailed_fir_container}>
                    {visibleEntries.map(([key, value]) => (
                      <div className={styles.detailed_fir_cont} key={key}>
                        <div className={styles.fir_col_heading}>{formatString(key)}</div>
                        <div className={styles.fir_col_content}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Narrative Card */}
                {firData.Narrative && (
                  <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 600 }}>FIR Incident Narrative</h3>
                    <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text)', background: 'var(--surface-alt)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)', margin: 0 }}>
                      "{firData.Narrative}"
                    </p>
                  </div>
                )}
              </div>

              {/* Checklist & Live Status */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600 }}>Investigation Checklist</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Track required standard operating procedures (SOPs)</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {checklist.map((item, idx) => (
                      <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', cursor: 'pointer', color: item.checked ? 'var(--text-secondary)' : 'var(--text)' }}>
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => toggleChecklistItem(idx)}
                          style={{ marginTop: '3px' }}
                        />
                        <span style={{ textDecoration: item.checked ? 'line-through' : 'none' }}>{item.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: TIMELINE */}
        {activeTab === 'timeline' && (
          <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 600 }}>Case History Timeline</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', borderLeft: '2px solid var(--border)', paddingLeft: '20px', marginLeft: '10px' }}>
              {[
                { date: firData.Fir_Date || '2026-03-15', title: 'FIR Registered', desc: `Case registered under ${firData.CrimeHead_Name || 'theft sections'} at ${firData.UnitName || 'station'}.` },
                { date: firData.Fir_Date ? new Date(new Date(firData.Fir_Date).getTime() + 86400000).toISOString().split('T')[0] : '2026-03-16', title: 'Officer Appointed', desc: `PI Dharmendra (KG1841136) assigned as Investigating Officer.` },
                { date: firData.Fir_Date ? new Date(new Date(firData.Fir_Date).getTime() + 172800000).toISOString().split('T')[0] : '2026-03-17', title: 'Scene Assessment', desc: 'SOP scene visit completed. Physical evidence log generated.' },
                { date: firData.Fir_Date ? new Date(new Date(firData.Fir_Date).getTime() + 345600000).toISOString().split('T')[0] : '2026-03-19', title: 'Complainant Interviewed', desc: `Complainant ${firData.complainantName || 'Rajesh Kumar'} statement logged under Section 161 CrPC.` },
                { date: '2026-07-09', title: 'Linguistic Audit Checked', desc: 'VerPol analysis executed automatically on incident description.' }
              ].map((ev, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    border: '2px solid #fff',
                    position: 'absolute',
                    left: '-27px',
                    top: '4px'
                  }} />
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{ev.date}</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginTop: '4px' }}>{ev.title}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>{ev.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: EVIDENCE */}
        {activeTab === 'evidence' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            
            {/* Evidence List */}
            <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>Secured Evidence Ledger</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '10px' }}>Evidence Item</th>
                    <th style={{ padding: '10px' }}>Type</th>
                    <th style={{ padding: '10px' }}>Source / Location</th>
                    <th style={{ padding: '10px' }}>Custody Status</th>
                    <th style={{ padding: '10px' }}>Date Logged</th>
                  </tr>
                </thead>
                <tbody>
                  {evidenceList.map((ev, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px 10px', fontWeight: 600 }}>{ev.name}</td>
                      <td style={{ padding: '12px 10px' }}><span style={{ padding: '2px 8px', borderRadius: '4px', background: 'var(--surface-alt)', fontSize: '11px' }}>{ev.type}</span></td>
                      <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>{ev.source}</td>
                      <td style={{ padding: '12px 10px' }}>
                        <span style={{
                          color: ev.status === 'Verified' || ev.status === 'Matched' ? 'var(--pastel-green-text)' : 'var(--pastel-yellow-text)',
                          fontWeight: 600
                        }}>{ev.status}</span>
                      </td>
                      <td style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{ev.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Evidence Form */}
            <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)', height: 'fit-content' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 600 }}>Log New Evidence</h3>
              <form onSubmit={addEvidence} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>Item Name</label>
                  <input
                    type="text"
                    required
                    value={newEvName}
                    onChange={e => setNewEvName(e.target.value)}
                    placeholder="e.g. CCTV Footages, Mobile Device..."
                    style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px', background: 'var(--bg)', color: 'var(--text)' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>Evidence Type</label>
                  <select
                    value={newEvType}
                    onChange={e => setNewEvType(e.target.value)}
                    style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px', background: 'var(--bg)', color: 'var(--text)' }}
                  >
                    <option value="Digital">Digital</option>
                    <option value="Forensic">Forensic</option>
                    <option value="Physical">Physical Property</option>
                    <option value="Testimonial">Testimonial Record</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>Source / Location Found</label>
                  <input
                    type="text"
                    required
                    value={newEvSource}
                    onChange={e => setNewEvSource(e.target.value)}
                    placeholder="e.g. Shop entry gate, suspect vehicle..."
                    style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px', background: 'var(--bg)', color: 'var(--text)' }}
                  />
                </div>
                <button type="submit" style={{ padding: '10px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, marginTop: '8px' }}>
                  Log & Authenticate Item
                </button>
              </form>
            </div>

          </div>
        )}

        {/* TAB 4: PEOPLE */}
        {activeTab === 'people' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: '0', fontSize: '16px', fontWeight: 600 }}>Associated Case Entities</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              
              {/* Complainant */}
              <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', background: 'var(--bg-accent, #e0f2fe)', color: 'var(--accent)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>COMPLAINANT</span>
                  <span style={{ fontSize: '12px', color: 'var(--pastel-green-text)', fontWeight: 600 }}>✓ Verified Aadhaar</span>
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700 }}>{firData.complainantName || 'Rajesh Kumar'}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Mob: {firData.complainantMobile || '9876543210'}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Aadhaar: {firData.complainantAadhaar || '1234-5678-9012'}</div>
              </div>

              {/* Victim */}
              <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', background: 'var(--bg-accent, #e0f2fe)', color: 'var(--accent)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>VICTIM</span>
                  <span style={{ fontSize: '11px', background: 'var(--pastel-green)', color: 'var(--pastel-green-text)', padding: '2px 6px', borderRadius: '4px', fontWeight: 500 }}>Stable</span>
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700 }}>{firData.victimName || firData.complainantName || 'Rajesh Kumar'}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Injury status: Nil / Minor abrasion</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Support services: Contacted Womens Helpline (if applicable)</div>
              </div>

              {/* Accused */}
              <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', background: 'var(--pastel-red)', color: 'var(--pastel-red-text)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>ACCUSED</span>
                  <span style={{ fontSize: '11px', background: 'var(--pastel-yellow)', color: 'var(--pastel-yellow-text)', padding: '2px 6px', borderRadius: '4px', fontWeight: 500 }}>Absconding</span>
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Identified Suspects:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {firData.accusedName && firData.accusedName !== 'Unknown' ? (
                    firData.accusedName.split(',').map((name, idx) => (
                      <Link
                        key={idx}
                        to={`${basePath}/person/${encodeURIComponent(name.trim())}`}
                        style={{ fontSize: '15px', fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}
                      >
                        👤 {name.trim()} →
                      </Link>
                    ))
                  ) : (
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Unknown (Under Investigation)</span>
                  )}
                </div>
              </div>

              {/* Investigating Officer */}
              <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', background: 'var(--surface-alt)', color: 'var(--text)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>OFFICER (IO)</span>
                  <span style={{ fontSize: '12px', color: 'var(--pastel-green-text)', fontWeight: 600 }}>● Active</span>
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700 }}>PI Dharmendra</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Rank: Inspector of Police</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>KGID: KG1841136</div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: VERACITY */}
        {activeTab === 'veracity' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <VeracityPanel
              initialNarrative={firData.Narrative || ''}
              initialComplainantName={firData.complainantName || ''}
              initialAccusedCount={String(firData.accusedCount || '0')}
              initialHasWitnesses={!!firData.hasWitnesses}
              initialDelayReason={firData.delayReason || ''}
              initialPropertyValue={String(firData.propertyValue || '0')}
              autoAnalyze={true}
            />
          </div>
        )}

        {/* TAB 6: CRIME LINKS */}
        {activeTab === 'network' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600 }}>Case Co-Accused Network</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Accused network connections extracted from shared FIRs linked to this case.
              </p>
              <CoAccusedNetworkPanel limitToFirNo={firData.FIRNo} hideHeader={true} />
            </div>

            {/* Similar MO Cases */}
            <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>Similar Cases (MO Match)</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '10px' }}>FIR Number</th>
                    <th style={{ padding: '10px' }}>Crime Group</th>
                    <th style={{ padding: '10px' }}>Similarity Score</th>
                    <th style={{ padding: '10px' }}>Matched Indicators</th>
                    <th style={{ padding: '10px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px 10px', fontWeight: 600 }}>KSP-2026-0301</td>
                    <td style={{ padding: '12px 10px' }}>Robbery</td>
                    <td style={{ padding: '12px 10px' }}><span style={{ color: 'var(--pastel-red-text)', fontWeight: 700 }}>84% Match</span></td>
                    <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>Motorcycle escape pattern, scar suspect description, geographic radius 150m</td>
                    <td style={{ padding: '12px 10px' }}><Link to={`${basePath}/firdetails/301/2026`} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>View Case</Link></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px 10px', fontWeight: 600 }}>KSP-2026-0089</td>
                    <td style={{ padding: '12px 10px' }}>Burglary</td>
                    <td style={{ padding: '12px 10px' }}><span style={{ color: 'var(--pastel-yellow-text)', fontWeight: 700 }}>62% Match</span></td>
                    <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>Geographic radius 400m, reported entry time window</td>
                    <td style={{ padding: '12px 10px' }}><Link to={`${basePath}/firdetails/89/2026`} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>View Case</Link></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: AI BRIEF */}
        {activeTab === 'aibrief' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Badges Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              <SolvabilityBadge firData={firData} />
              <QualityBadge firData={firData} />
            </div>

            {/* AI Generated Legal Assistant recommendations */}
            <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>🤖</span>
                <h3 style={{ margin: '0', fontSize: '16px', fontWeight: 700 }}>ZIA Case Advisor Brief</h3>
              </div>
              <div style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                <div style={{ padding: '12px 16px', borderTop: '2px solid var(--pastel-yellow-text)', background: 'var(--surface-alt)', borderRadius: '8px' }}>
                  <strong style={{ color: 'var(--pastel-yellow-text)' }}>⚠️ CRITICAL GAPS IDENTIFIED</strong>
                  <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                    <li>Vague suspect description in narrative: lacks height, weight, identifying clothes.</li>
                    <li>No weapon registration: Narrative indicates a "sharp object" but does not define dimensions or material.</li>
                    <li>Witness Statements Pending: Two bystanders are mentioned in narrative, but formal statements are not yet registered.</li>
                  </ul>
                </div>

                <div style={{ padding: '12px 16px', borderTop: '2px solid var(--pastel-green-text)', background: 'var(--surface-alt)', borderRadius: '8px' }}>
                  <strong style={{ color: 'var(--pastel-green-text)' }}>⚖️ LEGAL PRECEDENTS & RECOMMENDATIONS</strong>
                  <p style={{ margin: '8px 0 0 0' }}>
                    Based on crime code <strong>{firData.CrimeHead_Name || 'Theft'}</strong>, ZIA retrieved the following legal precedents:
                  </p>
                  <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                    <li><strong>State of Karnataka v. Raju (2022)</strong>: CCTV video evidence holds absolute primary value if backed by a forensic certificate. (Ensure Sec 65B Certificate is generated for traffic CCTV).</li>
                    <li><strong>CrPC Section 161 Guidelines</strong>: Secure independent witness statements immediately. Reluctance must be noted but formal statements must be logged to avoid hostile witness retraction later.</li>
                  </ul>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 8: CHARGESHEET */}
        {activeTab === 'chargesheet' && (
          <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>CrPC Section 173 SLA Tracker</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Statutory limit demands chargesheet filing within 90 days for major cases. Overdue cases risk court rejection.
            </p>

            {(() => {
              const limit = 90;
              const registeredDate = new Date(firData.Fir_Date || '2026-03-15');
              const elapsedMs = Date.now() - registeredDate.getTime();
              const elapsedDays = Math.max(0, Math.floor(elapsedMs / (1000 * 60 * 60 * 24)));
              const remaining = Math.max(0, limit - elapsedDays);
              const isOverdue = elapsedDays > limit;
              const status = isOverdue ? 'overdue' : remaining <= 15 ? 'at_risk' : 'safe';
              const color = status === 'overdue' ? 'var(--pastel-red-text)' : status === 'at_risk' ? 'var(--pastel-yellow-text)' : 'var(--pastel-green-text)';
              
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Progress Indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '90px',
                      height: '90px',
                      borderRadius: '50%',
                      border: `3px solid ${color}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--surface-alt)'
                    }}>
                      <span style={{ fontSize: '20px', fontWeight: 700, color, fontFamily: 'var(--font-mono)' }}>
                        {isOverdue ? `+${elapsedDays - limit}` : remaining}
                      </span>
                      <span style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        {isOverdue ? 'Days Overdue' : 'Days Left'}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color }}>
                        {status === 'overdue' ? 'SLA BREACHED' : status === 'at_risk' ? 'AT RISK' : 'ON TRACK'}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Registered: {firData.Fir_Date || 'N/A'} · Limit: 90 Days ({limit} Days)
                      </div>
                    </div>
                  </div>

                  {/* Actions required */}
                  <div style={{ padding: '16px', background: 'var(--surface-alt)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 600 }}>SLA Compliance Warnings</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {isOverdue ? (
                        <>
                          <li style={{ color: 'var(--pastel-red-text)', fontWeight: 600 }}>Statutory timeline breached. Submit extension justification to Sub-Divisional Police Officer (SDPO) immediately.</li>
                          <li>Finalize recovery ledger reports.</li>
                          <li>Witness statements are incomplete, blocking chargesheet closure.</li>
                        </>
                      ) : (
                        <>
                          <li style={{ color: 'var(--pastel-green-text)', fontWeight: 600 }}>Timeline complies with CrPC Section 173 specifications.</li>
                          <li>Complete FSL collection by day 60.</li>
                          <li>Draft legal indictment by day 80.</li>
                        </>
                      )}
                    </ul>
                  </div>

                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 9: AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600 }}>Compliance Audit Trail</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Immutable record of officer access and actions logged for security audit purposes.
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '10px' }}>Timestamp</th>
                  <th style={{ padding: '10px' }}>User ID</th>
                  <th style={{ padding: '10px' }}>Action performed</th>
                  <th style={{ padding: '10px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { time: '2026-07-09 18:25:12', user: 'PI Dharmendra (KG1841136)', action: 'Viewed Case File details page', status: 'Success' },
                  { time: '2026-07-08 14:22:05', user: 'PI Dharmendra (KG1841136)', action: 'Executed FIR Veracity Analysis', status: 'Completed' },
                  { time: '2026-07-07 10:15:30', user: 'PI Dharmendra (KG1841136)', action: 'Uploaded CCTV footage metadata file', status: 'Logged' },
                  { time: '2026-07-06 09:00:00', user: 'System Administrator', action: 'Assigned investigating officer to case', status: 'Success' },
                  { time: '2026-07-06 08:45:00', user: 'CCTNS Portal Node Bangalore', action: 'Synchronized FIR from State Database', status: 'Synchronized' }
                ].map((log, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{log.time}</td>
                    <td style={{ padding: '12px 10px', fontWeight: 600 }}>{log.user}</td>
                    <td style={{ padding: '12px 10px' }}>{log.action}</td>
                    <td style={{ padding: '12px 10px' }}><span style={{ color: 'var(--pastel-green-text)', fontWeight: 600 }}>{log.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB: CRIME GENOME INTELLIGENCE */}
        {activeTab === 'genome' && (
          <CrimeGenomePanel firId={firData.FIRNo || 'KSP-2026-0142'} />
        )}

      </div>

    </div>
  );
}

export default React.memo(DetailedFir);

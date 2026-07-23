import { useState } from 'react';
import { PiCheckCircle, PiScales, PiWarningCircle } from 'react-icons/pi';
import { useCaseContext } from './caseContext';
import { ACTIVE_CASE_FACTS } from './caseFacts';

export default function ChargesheetIntelligence() {
  const { firId } = useCaseContext();
  const [generated, setGenerated] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="panel-shell" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
        <span className="chargesheet-intel__icon"><PiScales weight="duotone" /></span>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, color: 'var(--text)', fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-heading)' }}>Chargesheet Intelligence</h3>
          <p style={{ margin: '6px 0 0 0', color: 'var(--text-secondary)', fontSize: 13 }}>
            Prepare an officer-reviewed filing brief for {firId}. Investigation readiness is {ACTIVE_CASE_FACTS.readiness}%; statutory filing is due in {ACTIVE_CASE_FACTS.filingDueDays} days.
          </p>
        </div>
        {!generated && (
          <button onClick={() => setGenerated(true)} className="btn btn-primary" style={{ padding: '12px 24px', whiteSpace: 'nowrap' }}>Prepare Chargesheet</button>
        )}
      </div>

      {generated && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 16, background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border-light)' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700 }}>Draft legal mapping</h4>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['BNS 309 - review applicability', 'Common-intention provision - legal review', 'Final section mapping - pending'].map(s => (
                <span key={s} className="badge badge--info">{s}</span>
              ))}
            </div>
            <p style={{ margin: '10px 0 0', color: 'var(--text-secondary)', fontSize: 12 }}>The investigating and legal officers must validate every section before filing.</p>
          </div>

          <div className="grid grid--2">
            <div className="panel-shell">
              <h4 style={{ margin: '0 0 10px 0', fontSize: 13, fontWeight: 700, color: 'var(--pastel-green-text)' }}>Available case records (4)</h4>
              {['FIR registered on 15 Mar 2026', 'Incident location recorded at Brigade Road / SH-9 junction', 'Mohan Kumar and Kiran Joseph listed as accused', 'PI Dharmendra assigned as investigating officer'].map((i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 13, borderBottom: '1px solid var(--border-light)' }}>
                  <PiCheckCircle color="var(--pastel-green-text)" aria-hidden="true" /> {i}
                </div>
              ))}
            </div>
            <div className="panel-shell">
              <h4 style={{ margin: '0 0 10px 0', fontSize: 13, fontWeight: 700, color: 'var(--pastel-red-text)' }}>Blocking gaps (4)</h4>
              {['Acquire the referenced CCTV footage', 'Generate and record the CCTV hash', 'Obtain the BSA Section 63 certificate', 'Kiran Joseph remains at large'].map((i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 13, borderBottom: '1px solid var(--border-light)', color: 'var(--pastel-red-text)' }}>
                  <PiWarningCircle aria-hidden="true" /> {i}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-primary" style={{ flex: 1, padding: 14 }}>Export to CCTNS</button>
            <button className="btn btn-secondary" style={{ flex: 1, padding: 14 }}>Print Draft</button>
          </div>
        </div>
      )}
    </div>
  );
}

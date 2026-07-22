import React, { useState } from 'react';
import { useCaseContext } from './CaseWorkspace';

export default function ChargesheetIntelligence() {
  const { firId } = useCaseContext();
  const [generated, setGenerated] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="panel-shell" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
        <span style={{ fontSize: 40 }}>⚖️</span>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, color: 'var(--text)', fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-heading)' }}>Chargesheet Intelligence</h3>
          <p style={{ margin: '6px 0 0 0', color: 'var(--text-secondary)', fontSize: 13 }}>
            ZIA will generate a draft chargesheet summary with evidence chain, witness matrix, applicable BNS sections, and case timeline.
          </p>
        </div>
        {!generated && (
          <button onClick={() => setGenerated(true)} className="btn btn-primary" style={{ padding: '12px 24px', whiteSpace: 'nowrap' }}>Prepare Chargesheet</button>
        )}
      </div>

      {generated && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 16, background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border-light)' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700 }}>Applicable Sections (BNS 2023)</h4>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['BNS § 303 (Theft)', 'BNS § 309 (Robbery)', 'BNS § 3(5) (Common Intention)', 'CrPC 173(8) (Supplementary)'].map(s => (
                <span key={s} className="badge badge--info">{s}</span>
              ))}
            </div>
          </div>

          <div className="grid grid--2">
            <div className="panel-shell">
              <h4 style={{ margin: '0 0 10px 0', fontSize: 13, fontWeight: 700, color: 'var(--pastel-green-text)' }}>Evidence Chain (4 items)</h4>
              {['CCTV footage confirming suspect vehicle', 'Victim statement with corroboration', 'Bystander witness statement', 'Mobile CDR linking accused to area'].map((i, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 13, borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ color: 'var(--pastel-green-text)' }}>✓</span> {i}
                </div>
              ))}
            </div>
            <div className="panel-shell">
              <h4 style={{ margin: '0 0 10px 0', fontSize: 13, fontWeight: 700, color: 'var(--pastel-red-text)' }}>Gaps Flagged (2 items)</h4>
              {['Section 65B certificate not filed for CCTV', 'Second accused Arun Nair not arrested'].map((i, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 13, borderBottom: '1px solid var(--border-light)', color: 'var(--pastel-red-text)' }}>
                  <span>⚠️</span> {i}
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

import { useState } from 'react';
import { PiCaretDown, PiCaretUp, PiCheckCircle, PiCircle, PiSpinner } from 'react-icons/pi';
import { useCaseContext } from './caseContext';
import { ACTIVE_CASE_EVIDENCE, ACTIVE_CASE_BRIEF, ACTIVE_CASE_FACTS } from './caseFacts';

const STAGES = [
  { id: 'fir', label: 'FIR Filed', icon: PiCheckCircle, linkTab: 'overview' },
  { id: 'entities', label: 'Entities Extracted', icon: PiSpinner, linkTab: 'network' },
  { id: 'matched', label: 'Evidence Cross-Matched', icon: PiCircle, linkTab: 'evidence' },
  { id: 'chargesheet', label: 'Chargesheet Ready', icon: PiCircle, linkTab: 'chargesheet' },
];

function stageStatus(stageId, hasEvidence, chargesheetReady) {
  if (stageId === 'fir') return 'complete';
  if (stageId === 'entities') return 'complete';
  if (stageId === 'matched') return hasEvidence ? 'complete' : 'active';
  if (stageId === 'chargesheet') return chargesheetReady ? 'complete' : 'pending';
  return 'pending';
}

export default function EvidencePipeline() {
  const { switchTab } = useCaseContext();
  const [collapsed, setCollapsed] = useState(false);

  const hasEvidence = ACTIVE_CASE_EVIDENCE.length > 0;
  const chargesheetReady = !!ACTIVE_CASE_BRIEF?.solvability;

  const currentStages = STAGES.map(s => ({
    ...s,
    status: stageStatus(s.id, hasEvidence, chargesheetReady),
  }));

  const statusIcon = (status) => {
    if (status === 'complete') return <PiCheckCircle color="var(--pastel-green-text)" />;
    if (status === 'active') return <PiSpinner className="evp-spinner" />;
    return <PiCircle color="var(--text-secondary)" />;
  };

  return (
    <div className="evp-root">
      <button type="button" className="evp-toggle" onClick={() => setCollapsed(v => !v)} aria-expanded={!collapsed}>
        <span className="evp-toggle-label">Evidence Pipeline</span>
        <span className="evp-toggle-icon">{collapsed ? <PiCaretDown /> : <PiCaretUp />}</span>
      </button>

      {!collapsed && (
        <div className="evp-stages">
          {currentStages.map((stage, idx) => (
            <div key={stage.id} className="evp-stage">
              <button
                type="button"
                className={`evp-stage-status evp-stage-status--${stage.status}`}
                onClick={() => switchTab(stage.linkTab)}
                title={`Go to ${stage.label}`}
              >
                {statusIcon(stage.status)}
              </button>
              <div className="evp-stage-body">
                <div className="evp-stage-label">{stage.label}</div>
                <div className={`evp-stage-badge evp-stage-badge--${stage.status}`}>
                  {stage.status === 'complete' && 'Complete'}
                  {stage.status === 'active' && 'In Progress'}
                  {stage.status === 'pending' && 'Pending'}
                </div>
              </div>
              {idx < currentStages.length - 1 && <div className="evp-connector" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

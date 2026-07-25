import { useState, useEffect } from 'react';
import { PiClipboardText, PiFlask, PiGavel, PiArrowRight, PiCircleNotch, PiCheckCircle, PiClock } from 'react-icons/pi';
import apiFetch from '../../utils/apiFetch';
import './FirWorkflowStepper.scss';

const STEP_META = {
  fir_received:     { icon: PiClipboardText, label: 'FIR Registered',    color: '#10b981' },
  forensic_pending: { icon: PiFlask,         label: 'Forensic Assigned', color: '#f59e0b' },
  court_ready:      { icon: PiGavel,         label: 'Court Ready',       color: '#6366f1' },
};

const STATUS_ICON = {
  done:    { icon: PiCheckCircle, color: '#10b981' },
  active:  { icon: PiCircleNotch, color: '#f59e0b', spin: true },
  pending: { icon: PiClock,       color: '#64748b' },
};

export default function FirWorkflowStepper({ firNo = 'KSP-2026-0142', crimeType = '', ioId = 'IO-1042' }) {
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const [toast, setToast] = useState(null);

  const loadStatus = () => {
    setLoading(true);
    apiFetch(`/fir_workflow/status?firNo=${firNo}`)
      .then(r => r ? r.json() : null)
      .then(d => { if (d) setWorkflow(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadStatus(); }, [firNo]);

  const advance = async () => {
    if (!workflow) return;
    setAdvancing(true);
    try {
      const res = await apiFetch('/fir_workflow/advance', {
        method: 'POST',
        body: JSON.stringify({ firNo, currentStep: workflow.currentStep, crimeType, ioId })
      });
      const data = res ? await res.json() : null;
      if (data?.success) {
        showToast(`✅ Advanced to: ${data.step?.replace(/_/g, ' ')} — powered by Catalyst Circuits`);
        // Update workflow state optimistically
        setWorkflow(prev => {
          if (!prev) return prev;
          const updated = prev.steps.map(s => {
            if (s.id === data.step) return { ...s, status: 'active', at: new Date().toISOString() };
            if (prev.steps.findIndex(x => x.id === s.id) < prev.steps.findIndex(x => x.id === data.step))
              return { ...s, status: 'done' };
            return s;
          });
          return { ...prev, steps: updated, currentStep: data.step, nextStep: data.nextStep };
        });
      }
    } catch (e) {
      showToast('⚠️ Advance failed — try again');
    } finally {
      setAdvancing(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  if (loading) return (
    <div className="fws-shell">
      <div className="fws-loading"><PiCircleNotch className="spin" /><span>Loading workflow…</span></div>
    </div>
  );

  return (
    <div className="fws-shell">
      <div className="fws-header">
        <h3 className="fws-title">FIR Workflow</h3>
        <span className="fws-badge">Catalyst Circuits</span>
      </div>

      <div className="fws-stepper">
        {(workflow?.steps || []).map((step, idx) => {
          const meta = STEP_META[step.id] || {};
          const Icon = meta.icon || PiClipboardText;
          const { icon: StatusIcon, color: statusColor, spin } = STATUS_ICON[step.status] || STATUS_ICON.pending;
          return (
            <div key={step.id} className={`fws-step fws-step--${step.status}`}>
              <div className="fws-step-icon" style={{ '--step-color': meta.color }}>
                <Icon weight="fill" />
              </div>
              <div className="fws-step-body">
                <div className="fws-step-label">{step.label}</div>
                {step.at && (
                  <div className="fws-step-time">
                    {new Date(step.at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
              <StatusIcon className={`fws-status-icon${spin ? ' spin' : ''}`} style={{ color: statusColor }} />
              {idx < (workflow.steps.length - 1) && (
                <div className={`fws-connector fws-connector--${workflow.steps[idx + 1]?.status !== 'pending' ? 'done' : 'pending'}`} />
              )}
            </div>
          );
        })}
      </div>

      {workflow?.nextStep && (
        <button
          className="fws-advance-btn"
          onClick={advance}
          disabled={advancing}
        >
          {advancing
            ? <><PiCircleNotch className="spin" /> Advancing…</>
            : <><PiArrowRight /> Advance to {STEP_META[workflow.nextStep]?.label || workflow.nextStep}</>
          }
        </button>
      )}

      {!workflow?.nextStep && (
        <div className="fws-complete">
          <PiCheckCircle /> All workflow steps complete
        </div>
      )}

      {toast && <div className="fws-toast">{toast}</div>}
    </div>
  );
}

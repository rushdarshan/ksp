import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  PiFiles,
  PiLightbulb,
  PiMagnifyingGlass,
  PiRobot,
  PiSpinnerGap,
  PiTrendUp,
} from 'react-icons/pi';
import apiFetch from '../../utils/apiFetch';
import { useCaseContext } from './caseContext';
import { ACTIVE_CASE_FACTS } from './caseFacts';
import './InvestigationCopilot.scss';

const ACTIONS = [
  { id: 'explain', label: 'Explain case', icon: PiRobot, prompt: 'Explain this case and the strongest reasons behind the assessment.' },
  { id: 'evidence_gaps', label: 'Evidence gaps', icon: PiFiles, prompt: 'Detect missing evidence and investigation completeness gaps.' },
  { id: 'next_lead', label: 'Next lead', icon: PiLightbulb, prompt: 'Suggest the next investigative lead and explain why it should be prioritized.' },
  { id: 'similar_cases', label: 'Similar cases', icon: PiMagnifyingGlass, prompt: 'Find similar cases and explain every match.' },
  { id: 'outcome', label: 'Readiness forecast', icon: PiTrendUp, prompt: 'Assess investigation readiness and identify what could change the outcome.' },
];

const FALLBACK = {
  answer: 'The intelligence service could not complete this reasoning request. Open the AI Brief to inspect the available evidence modules individually.',
  confidence: 0.2,
  sources: [],
  reasoning: [],
  limitations: ['No live reasoning response was available.'],
  mode: 'demo',
};

const ACTIVE_CASE_SOURCES = [
  `FIR ${ACTIVE_CASE_FACTS.firId}`,
  `Investigation record - ${ACTIVE_CASE_FACTS.investigatingOfficer}`,
  'Evidence register E1-E5',
];

const ACTIVE_CASE_RESULTS = {
  explain: {
    answer: `${ACTIVE_CASE_FACTS.firId} records a robbery at ${ACTIVE_CASE_FACTS.location} on ${ACTIVE_CASE_FACTS.incidentDateLabel}. Mohan Kumar and Kiran Joseph are listed as accused, with Kiran Joseph still at large. Investigation readiness is ${ACTIVE_CASE_FACTS.readiness}%. The identified CCTV source has not yet been acquired, hashed, or supported by a BSA Section 63 certificate.`,
    confidence: 0.67,
    reasoning: [
      { label: 'Readiness', value: '67%', impact: 'Evidence handling tasks prevent filing readiness.' },
      { label: 'At-large status', value: 'Kiran Joseph', impact: 'Operational follow-up remains active.' },
      { label: 'Filing window', value: '18 days', impact: 'The case is approaching its statutory filing date but is not overdue.' },
    ],
  },
  evidence_gaps: {
    answer: 'Three linked CCTV tasks remain open: acquire the identified SH-9 junction footage, generate and record its hash, and obtain the BSA Section 63 certificate. Do not describe the footage as collected or verified until those records exist.',
    confidence: 0.8,
    reasoning: [
      { label: 'Acquisition', value: 'Pending', impact: 'No footage file is recorded in the evidence register.' },
      { label: 'Integrity', value: 'Pending', impact: 'No cryptographic hash is recorded.' },
      { label: 'Certification', value: 'Pending', impact: 'BSA Section 63 documentation is not recorded.' },
    ],
  },
  next_lead: {
    answer: 'Prioritise lawful CCTV acquisition and the corresponding integrity record. In parallel, continue the documented location and arrest follow-up for Kiran Joseph. Record both workstreams against the active FIR.',
    confidence: 0.72,
    reasoning: [
      { label: 'Evidence priority', value: 'CCTV source', impact: 'The source is known, but the evidence is not yet secured.' },
      { label: 'Operational priority', value: 'Kiran Joseph', impact: 'The second accused remains at large.' },
      { label: 'Owner', value: 'PI Dharmendra', impact: 'The assigned IO should validate and record completion.' },
    ],
  },
  similar_cases: {
    answer: 'Two robbery records have pattern-level similarities for officer review. No direct person, device, vehicle, or financial linkage is established from the active-case record, so they must not be presented as connected cases without corroboration.',
    confidence: 0.54,
    reasoning: [
      { label: 'KSP-2025-0098', value: '62% pattern match', impact: 'Offence pattern and urban-junction context only.' },
      { label: 'KSP-2025-0301', value: '54% pattern match', impact: 'Shared offence category only.' },
      { label: 'Direct linkage', value: 'Not established', impact: 'Cross-case access and officer validation are required.' },
    ],
  },
  outcome: {
    answer: `Investigation readiness is ${ACTIVE_CASE_FACTS.readiness}%. The statutory filing date is ${ACTIVE_CASE_FACTS.filingDueDays} days away, not overdue. Readiness should be recalculated after CCTV acquisition, hash verification, BSA Section 63 certification, and updated at-large follow-up.`,
    confidence: 0.67,
    reasoning: [
      { label: 'Current readiness', value: '67%', impact: 'Material evidence-handling steps remain open.' },
      { label: 'Deadline', value: 'Due in 18 days', impact: 'Prioritise blockers while preserving review time.' },
      { label: 'Review indicator', value: '84%', impact: 'Narrative review support only; not an evidentiary finding.' },
    ],
  },
};

const sourceLabel = source => typeof source === 'string' ? source : source?.label || source?.table || 'Evidence record';

const normalizeResult = payload => ({
  ...FALLBACK,
  ...payload,
  confidence: Math.min(1, Math.max(0, Number(payload?.confidence) || 0)),
  sources: Array.isArray(payload?.sources) ? payload.sources : [],
  reasoning: Array.isArray(payload?.reasoning) ? payload.reasoning : [],
  limitations: Array.isArray(payload?.limitations) ? payload.limitations : FALLBACK.limitations,
});

export default function InvestigationCopilot({ initialAction }) {
  const { firId, switchTab } = useCaseContext();
  const [activeAction, setActiveAction] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const lastInitialAction = useRef(null);

  const actionMap = useMemo(() => new Map(ACTIONS.map(action => [action.id, action])), []);

  const runAction = useCallback(async (actionId) => {
    const action = actionMap.get(actionId);
    if (!action || loading) return;
    setActiveAction(actionId);
    setLoading(true);
    setResult(null);

    try {
      if (firId === ACTIVE_CASE_FACTS.firId && ACTIVE_CASE_RESULTS[actionId]) {
        setResult(normalizeResult({
          ...ACTIVE_CASE_RESULTS[actionId],
          sources: ACTIVE_CASE_SOURCES,
          limitations: ['Synthetic demonstration record. An authorised investigating officer must verify every source and action.'],
          mode: 'case-record',
          method: 'canonical-case-record',
        }));
        return;
      }
      const response = await apiFetch('/crime_chat/query', {
        method: 'POST',
        body: JSON.stringify({
          query: `${action.prompt} FIR ${firId}`,
          language: 'en',
          history: [],
        }),
      });
      if (!response?.ok) throw new Error(`Copilot returned HTTP ${response?.status || 'unknown'}`);
      const payload = await response.json();
      setResult(normalizeResult(payload));
    } catch (error) {
      setResult({ ...FALLBACK, error: true, limitations: [error.message] });
    } finally {
      setLoading(false);
    }
  }, [actionMap, firId, loading]);

  useEffect(() => {
    if (!initialAction || lastInitialAction.current === initialAction || !actionMap.has(initialAction)) return;
    lastInitialAction.current = initialAction;
    runAction(initialAction);
  }, [actionMap, initialAction, runAction]);

  const sourceCoverage = Math.round((result?.confidence || 0) * 100);

  return (
    <section className="investigation-copilot" aria-label="Investigation copilot">
      <div className="investigation-copilot__lead">
        <span className="investigation-copilot__icon"><PiRobot weight="duotone" /></span>
        <div>
          <strong>Investigation Copilot</strong>
          <span>Evidence-grounded reasoning for {firId}</span>
        </div>
      </div>

      <div className="investigation-copilot__actions" role="group" aria-label="Copilot actions">
        {ACTIONS.map(({ id, label, icon: Icon }) => (
          <button
            type="button"
            key={id}
            className={activeAction === id ? 'is-active' : ''}
            onClick={() => runAction(id)}
            disabled={loading}
          >
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {(loading || result) && (
        <div className="investigation-copilot__result" aria-live="polite">
          {loading ? (
            <div className="investigation-copilot__loading">
              <PiSpinnerGap aria-hidden="true" />
              Connecting case records and analytical signals…
            </div>
          ) : (
            <>
              <div className="investigation-copilot__result-head">
                <div>
                  <span className={`investigation-copilot__mode investigation-copilot__mode--${result.mode || 'live'}`}>
                    {result.mode === 'demo' ? 'Synthetic demo' : result.mode === 'case-record' ? 'Case record' : 'Live evidence'}
                  </span>
                  <strong>{actionMap.get(activeAction)?.label || 'Copilot analysis'}</strong>
                </div>
                <div className="investigation-copilot__confidence" aria-label={`${sourceCoverage}% source coverage`}>
                  <span>{sourceCoverage}% coverage</span>
                  <i><b style={{ width: `${sourceCoverage}%` }} /></i>
                </div>
              </div>

              <p className="investigation-copilot__answer">{result.answer}</p>

              {result.reasoning?.length > 0 && (
                <div className="investigation-copilot__reasoning">
                  {result.reasoning.map((reason, index) => (
                    <div key={`${reason?.label || 'reason'}-${index}`}>
                      <span>{reason?.label || 'Analytical factor'}</span>
                      <strong>{reason?.value || 'Not available'}</strong>
                      <p>{reason?.impact || 'No explanatory detail was returned.'}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="investigation-copilot__evidence">
                <span>Evidence trail</span>
                {result.sources?.length ? result.sources.map((source, index) => (
                  <small key={`${sourceLabel(source)}-${index}`}>{sourceLabel(source)}</small>
                )) : <small>No source record returned</small>}
              </div>

              {result.limitations?.length > 0 && (
                <p className="investigation-copilot__limits">
                  <strong>Limits:</strong> {result.limitations.join(' ')}
                </p>
              )}

              <div className="investigation-copilot__footer">
                <span>{result.method?.replace(/-/g, ' ') || 'approved query plan'}</span>
                {result.error && <button type="button" onClick={() => runAction(activeAction)}>Retry analysis</button>}
                {activeAction === 'similar_cases' && <button type="button" onClick={() => switchTab('network')}>Open entity graph</button>}
                {activeAction === 'evidence_gaps' && <button type="button" onClick={() => switchTab('evidence')}>Review evidence</button>}
                {activeAction === 'next_lead' && <button type="button" onClick={() => switchTab('notes')}>Open case notes</button>}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}

InvestigationCopilot.propTypes = {
  initialAction: PropTypes.string,
};

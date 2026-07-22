import PropTypes from 'prop-types';
import {
  PiBrain,
  PiFiles,
  PiLightbulb,
  PiMagnifyingGlass,
  PiTrendUp,
  PiUserPlus,
  PiWarningCircle,
} from 'react-icons/pi';

const BRIEF_ACTIONS = [
  { id: 'explain', label: 'Explain why', icon: PiLightbulb },
  { id: 'evidence', label: 'Show evidence', icon: PiFiles },
  { id: 'similar', label: 'Similar cases', icon: PiMagnifyingGlass },
  { id: 'assign', label: 'Assign team', icon: PiUserPlus },
  { id: 'predict', label: 'Readiness', icon: PiTrendUp },
];

function DailyBriefSkeleton() {
  return (
    <div className="panel-shell" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="redaction-bar" style={{ width: 28, height: 28, borderRadius: '50%' }} />
        <div>
          <div className="redaction-bar" style={{ width: '160px', height: '18px', marginBottom: '6px' }} />
          <div className="redaction-bar" style={{ width: '120px', height: '11px' }} />
        </div>
      </div>
      <div className="redaction-bar" style={{ width: '100%', height: '48px' }} />
      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-xs)' }}>
        <div className="redaction-bar" style={{ width: '120px', height: '24px', borderRadius: 'var(--radius-sm)' }} />
        <div className="redaction-bar" style={{ width: '100px', height: '24px', borderRadius: 'var(--radius-sm)' }} />
      </div>
    </div>
  );
}

function DailyBriefError({ onRetry }) {
  return (
    <div className="panel-shell" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', alignItems: 'center' }}>
      <PiWarningCircle size={28} color="var(--pastel-red-text)" />
      <div style={{ color: 'var(--pastel-red-text)', fontSize: 'var(--size-sub)', fontWeight: 700 }}>Failed to load daily brief</div>
      <button onClick={onRetry} className="btn btn-secondary" style={{ fontSize: 'var(--size-caption)', padding: '6px 16px' }}>
        Retry
      </button>
    </div>
  );
}

export function DailyBriefSkeletonBlock() {
  return <DailyBriefSkeleton />;
}

function renderBriefMessage(message) {
  return message.replace(/\u200b/g, '').split(/(\*\*.*?\*\*)/g).filter(Boolean).map((part, index) => (
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>
      : part
  ));
}

export default function DailyBrief({ brief, loading, error, onRetry, onAction }) {
  if (loading) return <DailyBriefSkeleton />;
  if (error) return <DailyBriefError onRetry={onRetry} />;
  if (!brief) return null;

  return (
    <div className="panel-shell" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span className="daily-brief__icon"><PiBrain weight="duotone" /></span>
        <div>
          <h2 className="panel-title" style={{ margin: 0, fontSize: '18px' }}>ZIA Morning Brief</h2>
          <div style={{ fontSize: 'var(--size-label)', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{brief.timestamp}</div>
        </div>
      </div>
      <p style={{ margin: 0, color: 'var(--text)', fontSize: 'var(--size-sub)', lineHeight: 1.6 }}>
        {renderBriefMessage(brief.message)}
      </p>
      {brief.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-xs)', flexWrap: 'wrap' }}>
          {brief.tags.map((tag, i) => (
            <span key={i} className={`badge badge--${tag.color === 'red' ? 'critical' : tag.color === 'amber' ? 'warning' : 'info'}`}>
              {tag.label}
            </span>
          ))}
        </div>
      )}
      <div className="daily-brief__actions" role="group" aria-label="Morning brief actions">
        {BRIEF_ACTIONS.map(({ id, label, icon: Icon }) => (
          <button type="button" key={id} onClick={() => onAction?.(id)}>
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

DailyBrief.propTypes = {
  brief: PropTypes.shape({
    timestamp: PropTypes.string,
    message: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      color: PropTypes.string,
    })),
  }),
  loading: PropTypes.bool.isRequired,
  error: PropTypes.bool.isRequired,
  onRetry: PropTypes.func.isRequired,
  onAction: PropTypes.func,
};

DailyBriefError.propTypes = {
  onRetry: PropTypes.func.isRequired,
};

import { useState, useEffect, useRef } from 'react';
import { PiPlayFill, PiPauseFill, PiClockCounterClockwise } from 'react-icons/pi';
import { useCaseContext } from './caseContext';
import { ACTIVE_CASE_TIMELINE } from './caseFacts';

const INTERVAL_BASE = 2000;
const SPEEDS = [1, 2, 4];

const typeColors = {
  report: 'var(--color-red-soft)',
  evidence: '#60a5fa',
  analysis: '#a78bfa',
  action: 'var(--color-green-alt)',
};

export default function CaseTimeline() {
  const { firId } = useCaseContext();
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef(null);

  const events = ACTIVE_CASE_TIMELINE;
  const currentEvent = currentIndex >= 0 ? events[currentIndex] : null;

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= events.length - 1) { return prev; }
          return prev + 1;
        });
      }, INTERVAL_BASE / speed);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, speed, events.length]);

  useEffect(() => {
    if (currentIndex >= events.length - 1 && currentIndex >= 0) {
      setIsPlaying(false);
    }
  }, [currentIndex, events.length]);

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (currentIndex >= events.length - 1) { setCurrentIndex(-1); }
      setIsPlaying(true);
    }
  };

  const handleScrub = e => {
    const idx = parseInt(e.target.value, 10);
    setCurrentIndex(idx);
    setIsPlaying(false);
  };

  const handleReset = () => {
    setCurrentIndex(-1);
    setIsPlaying(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: 'inherit' }}>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
        Case Timeline — {firId}
      </h3>

      {/* Controls */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        padding: '10px 14px', background: 'var(--surface-alt)', borderRadius: 8,
        border: '1px solid var(--border-light)',
      }}>
        <button
          onClick={handlePlayPause}
          title={isPlaying ? 'Pause' : 'Play'}
          style={{
            width: 32, height: 32, borderRadius: 6, border: '1px solid var(--border)',
            background: 'var(--surface)', color: 'var(--text)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}
        >
          {isPlaying ? <PiPauseFill /> : <PiPlayFill />}
        </button>

        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {SPEEDS.map(s => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              style={{
                padding: '3px 8px', borderRadius: 4, border: '1px solid var(--border)',
                background: speed === s ? 'var(--accent)' : 'var(--surface)',
                color: speed === s ? '#fff' : 'var(--text)',
                cursor: 'pointer', fontSize: 11, fontWeight: 700, lineHeight: 1,
              }}
            >{s}x</button>
          ))}
        </div>

        <input
          type="range"
          min={0}
          max={events.length - 1}
          value={currentIndex >= 0 ? currentIndex : 0}
          onChange={handleScrub}
          style={{ flex: 1, minWidth: 120, accentColor: 'var(--accent)' }}
        />

        <span style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap', minWidth: 60, textAlign: 'right', fontFamily: 'monospace' }}>
          {currentIndex >= 0 ? `${currentIndex + 1}/${events.length}` : '—'}
        </span>

        <button
          onClick={handleReset}
          title="Reset"
          style={{
            width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)',
            background: 'var(--surface)', color: 'var(--text-secondary)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
          }}
        >
          <PiClockCounterClockwise />
        </button>
      </div>

      {/* Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative', paddingLeft: 20 }}>
        <div style={{
          position: 'absolute', left: 7, top: 8, bottom: 8, width: 2,
          background: 'var(--border-light)',
        }} />
        {events.map((e, idx) => {
          const isCurrent = idx === currentIndex;
          return (
            <div
              key={`${e.date}-${e.label}`}
              onClick={() => { setCurrentIndex(idx); setIsPlaying(false); }}
              style={{
                cursor: 'pointer', position: 'relative',
                padding: '10px 12px', marginLeft: 20, borderRadius: 8,
                transition: 'background 0.2s, box-shadow 0.2s',
                background: isCurrent ? 'var(--accent-light, rgba(99,102,241,0.08))' : 'transparent',
                boxShadow: isCurrent ? `inset 2px 0 0 ${typeColors[e.type] || 'var(--text-secondary)'}` : 'none',
              }}
            >
              {/* Dot */}
              <div style={{
                position: 'absolute', left: -33, top: 16,
                width: isCurrent ? 16 : 12, height: isCurrent ? 16 : 12, borderRadius: '50%',
                background: isCurrent ? (typeColors[e.type] || 'var(--text-secondary)') : (typeColors[e.type] || 'var(--text-secondary)'),
                border: `2px solid var(--surface)`,
                transition: 'transform 0.2s', transform: isCurrent ? 'scale(1.15)' : 'scale(1)',
              }} />
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace', marginBottom: 2 }}>
                {new Date(e.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}{' '}
                {new Date(e.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{e.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{e.detail}</div>
              <span style={{
                display: 'inline-block', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                background: `${typeColors[e.type]}20`, color: typeColors[e.type],
                marginTop: 4,
              }}>{e.type}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

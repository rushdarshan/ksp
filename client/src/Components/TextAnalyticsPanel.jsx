import { useState } from 'react';
import { PanelCard, PanelHeader, PanelBadge } from './panels';
import apiFetch from '../utils/apiFetch';

const ENTITY_COLORS = {
  person: 'var(--pastel-blue)',
  location: 'var(--pastel-green)',
  crime_type: 'var(--pastel-red)',
  date: 'var(--pastel-yellow)',
  weapon: 'var(--pastel-orange)',
  vehicle: 'var(--pastel-purple)',
};

const ENTITY_TEXT_COLORS = {
  person: 'var(--pastel-blue-text)',
  location: 'var(--pastel-green-text)',
  crime_type: 'var(--pastel-red-text)',
  date: 'var(--pastel-yellow-text)',
  weapon: 'var(--pastel-orange-text)',
  vehicle: 'var(--pastel-purple-text)',
};

const PRESET_TEXTS = {
  fir: `FIR No. 84/2026 — On 15th March 2026 at approximately 8:30 PM, complainant Shri Rajesh Kumar (35), a shopkeeper residing at #42, 4th Cross, Koramangala, reported that while returning home on his motorcycle (KA-01-MX-4523) from his shop on MG Road, two unknown persons on a motorcycle intercepted him near the Corporation Circle. One of them, a male aged approximately 25-30, displayed a knife and demanded his bag. When the complainant resisted, the accused pushed him off his vehicle, causing a minor injury to his right elbow. The accused then snatched his bag containing Rs. 15,000 cash and a Samsung mobile phone, and fled towards the Ejipura direction. A case under Sections 392 and 397 IPC has been registered. Investigation is ongoing.`,
  witness: `My name is Sunita Sharma. I live at 22, 5th Main, Indiranagar. On the night of 22nd December 2025, I heard shouting from my neighbour's house around 11 PM. I looked through my window and saw a man climbing over the back wall. He was carrying something heavy. The next morning I learned that there had been a burglary — jewellery worth approximately Rs. 2 lakhs was stolen. I did not see the man's face clearly because it was dark, but he was wearing a dark blue shirt and had a distinctive limp in his left leg. I am willing to give a formal statement.`,
  alert: `Alert from PCR van V-42 at coordinates 12.9719, 77.6412 near the Yeshwanthpur railway station. Two unidentified males were spotted fighting with iron rods around 4:30 AM today. Both subjects fled on foot upon seeing the patrol vehicle. One subject dropped a country-made pistol at the scene. Scene secured by constable Hanumanthappa. Awaiting senior officer inspection. Nearby CCTV at the railway station entrance may have captured the incident. No injuries reported.`,
};

const TextAnalyticsPanel = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const analyze = async (inputText) => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await apiFetch('/text_analytics/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });
      if (!res || !res.ok) throw new Error(`Server error: ${res?.status || 'network error'}`);
      setResult(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim().length < 5) return;
    analyze(text);
  };

  const loadPreset = (key) => {
    setText(PRESET_TEXTS[key]);
  };

  const sentimentBadge = (s) => {
    const map = {
      positive: { label: 'POSITIVE', color: 'var(--pastel-green-text)', bg: 'var(--pastel-green)' },
      negative: { label: 'NEGATIVE', color: 'var(--pastel-red-text)', bg: 'var(--pastel-red)' },
      neutral: { label: 'NEUTRAL', color: 'var(--pastel-yellow-text)', bg: 'var(--pastel-yellow)' },
    };
    const m = map[s] || map.neutral;
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '4px 12px', borderRadius: 'var(--radius-full)',
        fontSize: 'var(--size-caption)', fontWeight: 600,
        fontFamily: 'var(--font-body)', background: m.bg, color: m.color,
      }}>
        <span style={{ fontSize: '1.1em' }}>
          {s === 'positive' ? '\u2191' : s === 'negative' ? '\u2193' : '\u2014'}
        </span>
        {m.label}
      </span>
    );
  };

  return (
    <PanelCard title="Text Analytics" badge="NLP">
      <PanelHeader
        subtitle="Paste an FIR narrative, witness statement, or field report for automated entity extraction, sentiment analysis, and summarization."
        action={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => loadPreset('fir')} style={btnStyle}>FIR sample</button>
            <button onClick={() => loadPreset('witness')} style={btnStyle}>Witness sample</button>
            <button onClick={() => loadPreset('alert')} style={{ ...btnStyle, color: 'var(--pastel-red-text)' }}>Alert sample</button>
          </div>
        }
      />

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste FIR text, witness statement, or patrol report here..."
          rows={8}
          style={inputStyle}
          required
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--size-caption)', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            {text.length} chars
          </span>
          <button type="submit" disabled={loading || text.trim().length < 5} style={{
            ...btnStyle, color: 'var(--accent)', fontWeight: 600,
            opacity: loading || text.trim().length < 5 ? 0.5 : 1,
          }}>
            {loading ? 'Analyzing\u2026' : 'Analyze text'}
          </button>
        </div>
      </form>

      {error && (
        <div style={{ marginTop: '16px', padding: '12px', background: 'var(--pastel-red)', color: 'var(--pastel-red-text)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--size-sub)', fontFamily: 'var(--font-body)' }}>
          Error: {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ fontSize: 'var(--size-sub)', fontWeight: 600, fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}>Sentiment:</div>
            {sentimentBadge(result.sentiment)}
            <PanelBadge
              status={result.methodology?.includes('zia') ? 'high' : 'medium'}
              label={result.methodology?.includes('zia') ? 'ZIA' : 'PATTERN'}
            />
          </div>

          {result.entities && result.entities.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: 'var(--size-caption)', fontWeight: 600, fontFamily: 'var(--font-body)', color: 'var(--accent)', marginBottom: '8px' }}>
                Entities ({result.entities.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {result.entities.map((e, i) => (
                  <span key={i} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '3px 10px', borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--size-caption)', fontFamily: 'var(--font-body)',
                    background: ENTITY_COLORS[e.type] || 'var(--bg)',
                    color: ENTITY_TEXT_COLORS[e.type] || 'var(--text)',
                    border: `1px solid ${ENTITY_TEXT_COLORS[e.type] || 'var(--border)'}`,
                  }}>
                    <span style={{ fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', opacity: 0.7 }}>
                      {e.type === 'crime_type' ? 'crime' : e.type}
                    </span>
                    {e.text}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.summary && (
            <div style={{ padding: '12px', background: 'var(--bg)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--size-sub)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
              <div style={{ fontWeight: 600, fontSize: 'var(--size-caption)', color: 'var(--text-secondary)', marginBottom: '6px' }}>SUMMARY</div>
              {result.summary}
            </div>
          )}

          {result.warning && (
            <div style={{ marginTop: '12px', padding: '10px', background: 'var(--pastel-yellow)', color: 'var(--pastel-yellow-text)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--size-caption)', fontFamily: 'var(--font-body)' }}>
              {result.warning}
            </div>
          )}
        </div>
      )}
    </PanelCard>
  );
};

const inputStyle = {
  padding: '10px 12px',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'var(--size-body)',
  fontFamily: 'var(--font-body)',
  background: 'var(--surface)',
  color: 'var(--text)',
  resize: 'vertical',
};

const btnStyle = {
  padding: '8px 16px',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-full)',
  fontSize: 'var(--size-sub)',
  fontFamily: 'var(--font-body)',
  cursor: 'pointer',
  background: 'transparent',
  color: 'var(--text-secondary)',
  whiteSpace: 'nowrap',
};

export default TextAnalyticsPanel;

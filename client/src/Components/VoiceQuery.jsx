import React, { useState } from 'react';

const VoiceQuery = () => {
    const [status, setStatus] = useState('Idle');
    const [transcript, setTranscript] = useState('');
    const [ragAnswer, setRagAnswer] = useState('');
    const [sources, setSources] = useState([]);
    const [textQuery, setTextQuery] = useState('');

    const handleTextSubmit = async () => {
        if (!textQuery.trim()) return;
        setStatus('Querying Legal RAG...');
        setTranscript(textQuery);
        setRagAnswer('');
        setSources([]);
        try {
            const ragRes = await fetch('/server/legal_rag/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: textQuery.trim() })
            });
            if (!ragRes.ok) throw new Error('Query failed');
            const ragData = await ragRes.json();
            setRagAnswer(ragData.answer);
            setSources(ragData.sources || []);
            setStatus('Complete');
        } catch {
            setStatus('Error occurred');
        }
    };

    return (
        <div className="panel" style={{ padding: '24px', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: 'var(--size-h3)', fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text)' }}>
              Legal Intelligence Desk
            </h2>
            <p style={{ margin: '0 0 20px 0', fontSize: 'var(--size-sub)', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', lineHeight: 1.4 }}>
              Query the CCTNS Legal Knowledge Base. Retreive relevant Bharatiya Nyaya Sanhita (BNS) and IT Act provisions mapped to incident patterns using AI semantic retrieval.
            </p>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <input 
                    type="text" 
                    placeholder="Describe crime details or ask about specific BNS/IPC sections (e.g., 'What is BNS section for murder?')..."
                    value={textQuery} 
                    onChange={e => setTextQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleTextSubmit()}
                    style={{ 
                      flex: 1, 
                      padding: '10px 16px', 
                      borderRadius: 'var(--radius-sm)', 
                      border: '1px solid var(--border-strong)', 
                      fontSize: 'var(--size-sub)', 
                      outline: 'none',
                      fontFamily: 'var(--font-body)',
                      background: 'var(--surface)',
                      color: 'var(--text)'
                    }} 
                />
                <button 
                    onClick={handleTextSubmit} 
                    disabled={!textQuery.trim() || status === 'Querying Legal RAG...'}
                    style={{ 
                      padding: '10px 24px', 
                      borderRadius: 'var(--radius-full)', 
                      border: 'none', 
                      background: 'var(--accent)', 
                      color: 'var(--text-inverse)', 
                      cursor: 'pointer', 
                      fontWeight: 600, 
                      fontSize: 'var(--size-sub)', 
                      opacity: textQuery.trim() && status !== 'Querying Legal RAG...' ? 1 : 0.6,
                      fontFamily: 'var(--font-body)',
                      transition: 'all 0.15s'
                    }}
                >
                    {status === 'Querying Legal RAG...' ? 'Querying...' : 'Ask RAG'}
                </button>
            </div>
            
            <div style={{ fontSize: 'var(--size-caption)', marginBottom: '12px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                STATUS: <span style={{ fontWeight: 600, color: status === 'Complete' ? 'var(--pastel-green-text)' : 'var(--text)' }}>{status}</span>
            </div>

            {transcript && (
              <div style={{ 
                fontSize: 'var(--size-sub)', 
                marginBottom: '16px', 
                padding: '12px 16px', 
                background: 'var(--surface-alt)', 
                borderLeft: '3px solid var(--border-strong)', 
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text)' 
              }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: 'var(--size-caption)', display: 'block', marginBottom: '4px' }}>QUERY:</span> 
                {transcript}
              </div>
            )}

            {ragAnswer && (
              <div style={{ 
                fontSize: 'var(--size-body)', 
                lineHeight: 1.6,
                padding: '18px 20px', 
                background: 'var(--surface)', 
                border: '1px solid var(--border-strong)', 
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text)',
                fontFamily: 'var(--font-body)',
                boxShadow: 'var(--shadow-soft)'
              }}>
                <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 'var(--size-caption)', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>RESOLVED BNS/IPC RESPONSE:</span>
                <div style={{ whiteSpace: 'pre-line' }}>{ragAnswer}</div>

                {sources && sources.length > 0 && (
                  <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--size-caption)', fontWeight: 600 }}>CITED SOURCES:</span>
                    {sources.map(src => (
                      <span key={src} style={{
                        fontSize: 'var(--size-caption)',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 600,
                        backgroundColor: 'var(--pastel-blue)',
                        color: 'var(--pastel-blue-text)',
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid rgba(31, 108, 159, 0.2)'
                      }}>
                        {src}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
        </div>
    );
};

export default VoiceQuery;

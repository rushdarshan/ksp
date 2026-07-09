import React, { useState, useRef } from 'react';

const VoiceQuery = () => {
    const [status, setStatus] = useState('Idle');
    const [transcript, setTranscript] = useState('');
    const [ragAnswer, setRagAnswer] = useState('');
    const [textQuery, setTextQuery] = useState('');

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/wav';
            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                stream.getTracks().forEach(track => track.stop());
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                setStatus('Processing (STT)...');
                processAudio(audioBlob);
            };

            mediaRecorder.onerror = () => {
                stream.getTracks().forEach(track => track.stop());
                setStatus('Recording error — try text input');
            };

            mediaRecorder.start();
            setStatus('Recording...');
        } catch (err) {
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setStatus('Mic denied — use text input');
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                setStatus('No mic found — use text input');
            } else {
                setStatus('Mic unavailable — use text input');
            }
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
    };

    const processAudio = async (audioBlob) => {
        try {
            const sttRes = await fetch('/server/zia_voice/stt', {
                method: 'POST',
                headers: { 'Content-Type': 'audio/wav' },
                body: audioBlob
            });
            const sttData = await sttRes.json();
            setTranscript(sttData.text);
            setStatus('Querying Legal RAG...');

            const ragRes = await fetch('/server/legal_rag/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: sttData.text })
            });
            const ragData = await ragRes.json();
            setRagAnswer(ragData.answer);
            setStatus('Playing TTS...');

            const ttsRes = await fetch('/server/zia_voice/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: ragData.answer })
            });
            if (ttsRes.ok) setStatus('Complete');
            else setStatus('TTS unavailable');
        } catch (err) {
            console.error(err);
            setStatus('Error occurred');
        }
    };

    const handleTextSubmit = async () => {
        if (!textQuery.trim()) return;
        setStatus('Querying Legal RAG...');
        setTranscript(textQuery);
        try {
            const ragRes = await fetch('/server/legal_rag/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: textQuery.trim() })
            });
            const ragData = await ragRes.json();
            setRagAnswer(ragData.answer);
            setStatus('Complete');
        } catch {
            setStatus('Error occurred');
        }
    };

    return (
        <div className="panel" style={{ padding: '20px' }}>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 700 }}>[ VOICE + TEXT INVESTIGATOR ]</h2>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#6b7280' }}>
                Type a question or record audio → Legal RAG → AI answer. CCTNS + IPC knowledge base.
            </p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <input type="text" placeholder="Ask a question about CCTNS data..."
                    value={textQuery} onChange={e => setTextQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleTextSubmit()}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, outline: 'none', maxWidth: 400 }} />
                <button onClick={handleTextSubmit} disabled={!textQuery.trim()}
                    style={{ padding: '10px 20px', borderRadius: 6, border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13, opacity: textQuery.trim() ? 1 : 0.5 }}>
                    Ask
                </button>
            </div>
            <button onClick={status === 'Recording...' ? stopRecording : startRecording} disabled={status !== 'Idle' && status !== 'Complete' && status !== 'Recording...'}
                style={{ padding: '10px 24px', background: status === 'Recording...' ? '#b91c1c' : '#E61919', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px', marginBottom: '16px' }}>
                {status === 'Recording...' ? '> STOP RECORDING' : '> START RECORDING'}
            </button>
            <div style={{ fontSize: '13px', marginBottom: '8px' }}>
                <span style={{ color: '#6b7280' }}>STATUS:</span> <span style={{ fontWeight: 600 }}>{status}</span>
            </div>
            {transcript && <div style={{ fontSize: '13px', marginBottom: '8px' }}><span style={{ color: '#6b7280' }}>TRANSCRIPT:</span> {transcript}</div>}
            {ragAnswer && <div style={{ fontSize: '13px', marginBottom: '8px' }}><span style={{ color: '#6b7280' }}>AI ANSWER:</span> {ragAnswer}</div>}
        </div>
    );
};

export default VoiceQuery;

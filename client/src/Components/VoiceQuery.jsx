import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PiKeyboard, PiMicrophone, PiSpinner, PiStop, PiSpeakerHigh, PiFileText } from 'react-icons/pi';
import apiFetch from '../utils/apiFetch';

const VoiceQuery = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const basePath = location.pathname.replace(/\/voice$/, '');
    const [status, setStatus] = useState('Idle');
    const [transcript, setTranscript] = useState('');
    const [ragAnswer, setRagAnswer] = useState('');
    const [sources, setSources] = useState([]);
    const [textQuery, setTextQuery] = useState('');
    const [audioUrl, setAudioUrl] = useState('');
    const [mode, setMode] = useState('voice'); // 'voice' or 'text'
    const [firMode, setFirMode] = useState(false);
    
    // Recording Refs & State
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef(null);
    const recognitionRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const startRecording = async () => {
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.lang = 'kn-IN';
                recognition.interimResults = false;
                recognition.continuous = false;
                recognition.onresult = async (event) => {
                    const spokenText = event.results?.[0]?.[0]?.transcript || '';
                    setTranscript(spokenText);
                    if (spokenText) {
                        if (firMode) {
                            navigate(`${basePath}/addfir`, {
                                state: { voiceTranscription: spokenText, prefill: { place_of_offence: spokenText, Complaint_Mode: 'Voice' } }
                            });
                        } else {
                            await queryLegalRag(spokenText);
                        }
                    }
                };
                recognition.onerror = (event) => setStatus(`Kannada speech recognition unavailable: ${event.error}`);
                recognition.onend = () => {
                    setIsRecording(false);
                    if (timerRef.current) clearInterval(timerRef.current);
                };
                recognitionRef.current = recognition;
                recognition.start();
                setIsRecording(true);
                setStatus('Listening in Kannada (browser speech)...');
                setRecordingTime(0);
                setRagAnswer('');
                setTranscript('');
                setSources([]);
                timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioChunksRef.current = [];
            
            let options = { mimeType: 'audio/webm' };
            if (!MediaRecorder.isTypeSupported('audio/webm')) {
                options = { mimeType: 'audio/ogg' };
                if (!MediaRecorder.isTypeSupported('audio/ogg')) {
                    options = {}; 
                }
            }
            
            const recorder = new MediaRecorder(stream, options);
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };
            
            recorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: options.mimeType || 'audio/webm' });
                await handleAudioUpload(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };
            
            mediaRecorderRef.current = recorder;
            recorder.start();
            setIsRecording(true);
            setStatus('Recording audio...');
            setRecordingTime(0);
            setRagAnswer('');
            setTranscript('');
            setSources([]);
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
                setAudioUrl('');
            }
            
            timerRef.current = setInterval(() => {
                setRecordingTime(t => t + 1);
            }, 1000);
        } catch (err) {
            console.error('Failed to start recording:', err);
            setStatus('Microphone access denied or unavailable');
        }
    };

    const stopRecording = () => {
        if (recognitionRef.current && isRecording) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    };

    const handleAudioUpload = async (blob) => {
        setStatus('Processing Kannada Speech (STT)...');
        try {
            const sttRes = await apiFetch('/zia_voice/stt', {
                method: 'POST',
                headers: { 'Content-Type': blob.type },
                body: blob
            });
            if (!sttRes.ok) throw new Error('STT translation failed');
            const sttData = await sttRes.json();
            
            setTranscript(sttData.text);
            if (firMode) {
                navigate(`${basePath}/addfir`, {
                    state: { voiceTranscription: sttData.text, prefill: { place_of_offence: sttData.text, Complaint_Mode: 'Voice' } }
                });
                return;
            }
            await queryLegalRag(sttData.text);
        } catch (err) {
            console.error('Audio processing failed:', err);
            setStatus('STT Error: ' + err.message);
        }
    };

    const queryLegalRag = async (queryText) => {
        setStatus('Querying Legal RAG...');
        try {
            const ragRes = await apiFetch('/crime_chat/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: queryText, language: 'kn', history: [] })
            });
            if (!ragRes.ok) throw new Error('RAG query failed');
            const ragData = await ragRes.json();
            setRagAnswer(ragData.answer || ragData.text);
            setSources(ragData.sources || []);
            
            // Speak the response via Zia TTS
            await speakResponse(ragData.answer);
        } catch (err) {
            console.error('RAG query failed:', err);
            setStatus('RAG Error: ' + err.message);
        }
    };

    const speakResponse = async (textToSpeak) => {
        setStatus('Generating Kannada audio response...');
        try {
            const ttsRes = await apiFetch('/zia_voice/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textToSpeak })
            });
            const contentType = ttsRes.headers.get('content-type') || '';
            const hasAudio = contentType.includes('audio') || ttsRes.headers.get('content-disposition');
            if (!ttsRes.ok || !hasAudio) throw new Error('Server Kannada voice is not configured');

            const audioBlob = await ttsRes.blob();
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);
            const audio = new Audio(url);
            audio.play().catch(e => console.warn('Autoplay blocked:', e));
            setStatus('Complete · server Kannada voice');
        } catch (ttsErr) {
            console.warn('Server TTS unavailable, using browser speech:', ttsErr);
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(textToSpeak);
                utterance.lang = 'kn-IN';
                const kannadaVoice = window.speechSynthesis.getVoices().find(voice => voice.lang?.toLowerCase().startsWith('kn'));
                if (kannadaVoice) utterance.voice = kannadaVoice;
                window.speechSynthesis.speak(utterance);
                setStatus('Complete · device speech preview');
            } else {
                setStatus('Complete · audio unavailable');
            }
        }
    };

    const handleTextSubmit = async () => {
        if (!textQuery.trim()) return;
        setTranscript(textQuery);
        setRagAnswer('');
        setSources([]);
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
            setAudioUrl('');
        }
        await queryLegalRag(textQuery.trim());
    };

    const playAudio = () => {
        if (audioUrl) {
            const audio = new Audio(audioUrl);
            audio.play().catch(e => console.warn('Playback failed:', e));
        }
    };

    return (
        <div className="panel" style={{ padding: '24px', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h2 style={{ margin: 0, fontSize: 'var(--size-h3)', fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text)' }}>
                  Legal Intelligence Desk
                </h2>
                <div style={{ display: 'flex', gap: '8px', background: 'var(--bg)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                    <button 
                        onClick={() => { setMode('voice'); setFirMode(false); }} 
                        style={{
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-sm)',
                            border: 'none',
                            background: mode === 'voice' && !firMode ? 'var(--surface)' : 'transparent',
                            color: mode === 'voice' && !firMode ? 'var(--accent)' : 'var(--text-secondary)',
                            fontWeight: 600,
                            fontSize: '11px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <PiMicrophone /> Legal Query
                    </button>
                    <button 
                        onClick={() => { setMode('text'); setFirMode(false); }} 
                        style={{
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-sm)',
                            border: 'none',
                            background: mode === 'text' && !firMode ? 'var(--surface)' : 'transparent',
                            color: mode === 'text' && !firMode ? 'var(--accent)' : 'var(--text-secondary)',
                            fontWeight: 600,
                            fontSize: '11px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <PiKeyboard /> Text Query
                    </button>
                    <button 
                        onClick={() => { setMode('voice'); setFirMode(true); }}
                        style={{
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-sm)',
                            border: 'none',
                            background: firMode ? 'var(--surface)' : 'transparent',
                            color: firMode ? 'var(--accent)' : 'var(--text-secondary)',
                            fontWeight: 600,
                            fontSize: '11px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <PiFileText /> File FIR by Voice
                    </button>
                </div>
            </div>
            
            <p style={{ margin: '0 0 20px 0', fontSize: 'var(--size-sub)', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', lineHeight: 1.4 }}>
              {firMode
                ? 'Speak the incident details in Kannada to auto-fill an FIR form. Zia transcribes your voice and pre-fills the Add FIR page with the transcribed complaint.'
                : 'Query the CCTNS Legal Knowledge Base. Retrieve relevant Bharatiya Nyaya Sanhita (BNS) and IT Act provisions mapped to incident patterns using AI semantic retrieval.'}
            </p>

            {mode === 'voice' ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px 20px', border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius-md)', background: 'var(--bg)', marginBottom: '20px' }}>
                    {isRecording ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                            <div className="recording-wave" style={{ display: 'flex', gap: '4px', height: '40px', alignItems: 'center' }}>
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} style={{
                                        width: '4px',
                                        height: '24px',
                                        background: 'var(--pastel-red-text)',
                                        borderRadius: '2px',
                                        animation: 'pulse 0.8s ease-in-out infinite alternate',
                                        animationDelay: `${i * 0.15}s`
                                    }} />
                                ))}
                            </div>
                            <span style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--pastel-red-text)' }}>
                                {formatTime(recordingTime)}
                            </span>
                            <button 
                                onClick={stopRecording}
                                style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '50%',
                                    background: 'var(--pastel-red-text)',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    fontSize: '18px',
                                    boxShadow: '0 4px 12px rgba(159, 47, 45, 0.3)'
                                }}
                            >
                                <PiStop weight="fill" />
                            </button>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Click to stop recording</span>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                            <button 
                                onClick={startRecording}
                                disabled={status.includes('Processing') || status.includes('Querying') || status.includes('Generating')}
                                style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '50%',
                                    background: 'var(--accent)',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    fontSize: '22px',
                                    boxShadow: 'var(--shadow-soft)',
                                    opacity: status.includes('Processing') || status.includes('Querying') ? 0.6 : 1
                                }}
                            >
                                <PiMicrophone />
                            </button>
                            <span style={{ fontSize: '13px', fontWeight: 600 }}>{firMode ? 'Click to describe the incident (in Kannada)' : 'Click to speak query (in Kannada)'}</span>
                            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{firMode ? 'E.g. describe what happened, where, and when' : 'E.g. &quot;ಖೂನಿಗೆ ಶಿಕ್ಷೆ ಏನು?&quot; (What is the punishment for murder?)'}</span>
                        </div>
                    )}
                </div>
            ) : (
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
                        disabled={!textQuery.trim() || status.includes('Querying') || status.includes('Processing')}
                        style={{ 
                          padding: '10px 24px', 
                          borderRadius: 'var(--radius-full)', 
                          border: 'none', 
                          background: 'var(--accent)', 
                          color: 'var(--text-inverse)', 
                          cursor: 'pointer', 
                          fontWeight: 600, 
                          fontSize: 'var(--size-sub)', 
                          opacity: textQuery.trim() && !status.includes('Querying') ? 1 : 0.6,
                          fontFamily: 'var(--font-body)',
                          transition: 'all 0.15s'
                        }}
                    >
                        {status.includes('Querying') ? 'Querying...' : 'Ask RAG'}
                    </button>
                </div>
            )}
            
            <div style={{ fontSize: 'var(--size-caption)', marginBottom: '12px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                STATUS: 
                <span style={{ fontWeight: 600, color: status === 'Complete' || status.includes('Complete') ? 'var(--pastel-green-text)' : 'var(--text)' }}>
                    {status}
                </span>
                {(status.includes('Processing') || status.includes('Querying') || status.includes('Generating')) && (
                    <PiSpinner className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                )}
            </div>

            {transcript && (
              <div style={{ 
                fontSize: 'var(--size-sub)', 
                marginBottom: '16px', 
                padding: '12px 16px', 
                background: 'var(--surface-alt)', 
                borderLeft: '1px solid var(--border-light)', 
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text)' 
              }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: 'var(--size-caption)', display: 'block', marginBottom: '4px' }}>RESOLVED QUERY:</span> 
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 'var(--size-caption)', letterSpacing: '0.5px' }}>RESOLVED BNS/IPC RESPONSE:</span>
                    {audioUrl && (
                        <button 
                            onClick={playAudio}
                            style={{
                                padding: '4px 10px',
                                background: 'var(--pastel-blue)',
                                color: 'var(--pastel-blue-text)',
                                border: '1px solid rgba(31, 108, 159, 0.2)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            <PiSpeakerHigh /> Hear response (Kannada)
                        </button>
                    )}
                </div>
                <div style={{ whiteSpace: 'pre-line' }}>{ragAnswer}</div>

                {sources && sources.length > 0 && (
                  <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--size-caption)', fontWeight: 600 }}>CITED SOURCES:</span>
                    {sources.map((source, index) => {
                      const label = typeof source === 'string' ? source : source.label || 'Evidence source';
                      const sourceStyle = {
                        fontSize: 'var(--size-caption)',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 600,
                        backgroundColor: 'var(--pastel-blue)',
                        color: 'var(--pastel-blue-text)',
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid rgba(31, 108, 159, 0.2)',
                        textDecoration: 'none'
                      };
                      return source?.url ? (
                        <a key={`${label}-${index}`} href={source.url} target="_blank" rel="noreferrer" style={sourceStyle}>{label}</a>
                      ) : <span key={`${label}-${index}`} style={sourceStyle}>{label}</span>;
                    })}
                  </div>
                )}
              </div>
            )}

            <style>{`
                @keyframes bounce {
                    0% { transform: scaleY(0.3); }
                    100% { transform: scaleY(1.3); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default VoiceQuery;

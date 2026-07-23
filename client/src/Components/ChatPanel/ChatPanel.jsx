import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  PiChats,
  PiDownloadSimple,
  PiPaperPlaneTilt,
  PiRobot,
  PiShieldCheck,
  PiTranslate,
  PiUser,
  PiX,
} from 'react-icons/pi';
import apiFetch from '../../utils/apiFetch';
import './ChatPanel.scss';

const STORAGE_KEY = 'ksp-zia-conversation-v2';

const WELCOME = {
  en: 'Welcome to ZIA. Ask about an FIR, accused person, hotspot, crime pattern, or applicable BNS provision.',
  kn: 'ZIA ಗೆ ಸ್ವಾಗತ. FIR, ಆರೋಪಿ, ಅಪರಾಧ ಹಾಟ್‌ಸ್ಪಾಟ್, ಮಾದರಿ ಅಥವಾ ಅನ್ವಯಿಸುವ BNS ವಿಧಿಯ ಬಗ್ಗೆ ಕೇಳಿ.',
};

const SUGGESTIONS = {
  en: [
    'Summarize FIR KSP-2026-0142',
    'Show unsolved robbery patterns in Bengaluru',
    'Which accused are still at large?',
    'What BNS sections apply to chain snatching?',
  ],
  kn: [
    'FIR KSP-2026-0142 ಅನ್ನು ಸಂಕ್ಷಿಪ್ತಗೊಳಿಸಿ',
    'ಬೆಂಗಳೂರಿನ ಬಗೆಹರಿಯದ ದರೋಡೆ ಮಾದರಿಗಳನ್ನು ತೋರಿಸಿ',
    'ಇನ್ನೂ ಬಂಧನವಾಗದ ಆರೋಪಿಗಳು ಯಾರು?',
    'ಚೈನ್ ಸ್ನ್ಯಾಚಿಂಗ್‌ಗೆ ಯಾವ BNS ವಿಧಿಗಳು ಅನ್ವಯಿಸುತ್ತವೆ?',
  ],
};

const FALLBACKS = [
  {
    match: /142|summari[sz]e fir|ಸಂಕ್ಷಿಪ್ತ/iu,
    answer: '**FIR KSP-2026-0142 — Evidence summary**\n\nRobbery registered at Brigade Road PS. Two witnesses are recorded and junction CCTV is referenced but not yet acquired. Investigation readiness is 67%; the narrative documentation signal is 84% and does not assess truth. The current filing date is 18 days away.\n\n**Next action:** Retrieve junction CCTV and preserve its hash before overwrite.',
    sources: ['FIR KSP-2026-0142', 'Accused records for KSP-2026-0142', 'Case-readiness checklist', 'Narrative documentation review'],
  },
  {
    match: /at large|ಬಂಧನವಾಗದ/iu,
    answer: '**Accused-at-large review**\n\nThe current demo dataset identifies four priority subjects without a matching arrest event. Two share co-accused links with the M G Road cluster. Open the Accused at Large ledger before operational action.',
    sources: ['Accused table', 'ArrestSurrender table', 'Network analysis'],
  },
  {
    match: /bns|chain snatch|ವಿಧಿ/iu,
    answer: '**Legal retrieval required**\n\nChain-snatching facts may map to theft, robbery, hurt, or common-intention provisions depending on force, injury, and participation. Confirm the retrieved sections with the legal officer before filing.',
    sources: ['Legal RAG knowledge base'],
  },
];

function makeWelcome(language) {
  return {
    id: `welcome-${language}`,
    role: 'bot',
    text: WELCOME[language],
    ts: new Date().toISOString(),
    mode: 'system',
  };
}

function loadConversation() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored?.messages?.length) return stored;
  } catch {
    // Ignore invalid local state and start a clean, auditable session.
  }
  return { language: 'en', messages: [makeWelcome('en')] };
}

function sourceLabel(source) {
  if (typeof source === 'string') return source;
  return source?.label || source?.record || source?.table || 'Evidence source';
}

function parseMarkdown(text) {
  return String(text || '').split('\n').filter(Boolean).map((line) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return { type: 'heading', content: line.replace(/\*\*/g, '') };
    }
    if (line.startsWith('- ')) return { type: 'list', content: line.slice(2) };
    return { type: 'text', content: line.replace(/\*\*/g, '') };
  });
}

function demoResponse(query) {
  const matched = FALLBACKS.find((item) => item.match.test(query));
  return matched || {
    answer: 'The live intelligence service is unavailable. Specify an FIR number, district, crime type, or accused person so the request can be constrained and verified.',
    sources: ['Demo dataset'],
  };
}

async function exportConversationPdf(messages, language) {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);

  const report = document.createElement('section');
  report.className = 'cp__pdf-report';
  report.lang = language === 'kn' ? 'kn' : 'en';
  report.innerHTML = `
    <header>
      <p>KARNATAKA STATE POLICE · CRIME GENOME</p>
      <h1>ZIA Conversation Evidence Report</h1>
      <span>Generated ${new Date().toLocaleString('en-IN')} · Language ${language === 'kn' ? 'Kannada' : 'English'}</span>
    </header>
  `;

  messages.forEach((message) => {
    const article = document.createElement('article');
    const title = document.createElement('strong');
    title.textContent = `${message.role === 'bot' ? 'ZIA' : 'OFFICER'} · ${new Date(message.ts).toLocaleTimeString('en-IN')}`;
    const body = document.createElement('p');
    body.textContent = message.text.replace(/\*\*/g, '');
    article.append(title, body);
    if (message.sources?.length) {
      const evidence = document.createElement('small');
      evidence.textContent = `Evidence: ${message.sources.map(sourceLabel).join(' · ')}`;
      article.append(evidence);
    }
    report.append(article);
  });

  document.body.append(report);
  await document.fonts.ready;
  const canvas = await html2canvas(report, { scale: 1.7, backgroundColor: '#ffffff', logging: false });
  report.remove();

  const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });
  const margin = 32;
  const pageWidth = pdf.internal.pageSize.getWidth() - margin * 2;
  const pageHeight = pdf.internal.pageSize.getHeight() - margin * 2;
  const imageHeight = canvas.height * pageWidth / canvas.width;
  const image = canvas.toDataURL('image/png');
  const pages = Math.max(1, Math.ceil(imageHeight / pageHeight));

  for (let page = 0; page < pages; page += 1) {
    if (page > 0) pdf.addPage();
    pdf.addImage(image, 'PNG', margin, margin - page * pageHeight, pageWidth, imageHeight);
  }
  pdf.save(`zia-evidence-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}

const ChatPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const workspaceArea = ['inspector', 'subinspector', 'supervisor'].find((area) => location.pathname.startsWith(`/${area}`));
  const workspaceBase = workspaceArea ? `/${workspaceArea}` : '/dashboard';
  const initial = useRef(loadConversation()).current;
  const [isOpen, setIsOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [messages, setMessages] = useState(initial.messages);
  const [language, setLanguage] = useState(initial.language || 'en');
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('Idle');
  const [exporting, setExporting] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ language, messages: messages.slice(-40) }));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [language, messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const clearConversation = useCallback(() => {
    setMessages([makeWelcome(language)]);
    setStatus('Idle');
  }, [language]);

  const handleExport = useCallback(async () => {
    setExporting(true);
    setStatus('Preparing PDF');
    try {
      await exportConversationPdf(messages, language);
      setStatus('PDF downloaded');
    } catch {
      setStatus('PDF export failed');
    } finally {
      setExporting(false);
      window.setTimeout(() => setStatus('Idle'), 1800);
    }
  }, [language, messages]);

  const handleSend = useCallback(async (value) => {
    const query = String(value || input).trim();
    if (!query || status !== 'Idle') return;

    if (query === '/clear') {
      clearConversation();
      setInput('');
      return;
    }
    if (query.startsWith('/case ')) {
      const caseId = query.split(/\s+/)[1];
      navigate(`${workspaceBase}/case/KSP-2026-${String(caseId).padStart(4, '0')}`);
    }

    const userMessage = { id: crypto.randomUUID(), role: 'user', text: query, ts: new Date().toISOString() };
    const context = messages.slice(-8).map(({ role, text }) => ({ role, text }));
    setMessages((current) => [...current, userMessage]);
    setInput('');
    setStatus('Querying evidence');

    let payload;
    try {
      const response = await apiFetch('/crime_chat/query', {
        method: 'POST',
        body: JSON.stringify({ query, language, history: context }),
      });
      if (!response?.ok) throw new Error(`Crime intelligence service returned ${response?.status || 'no response'}`);
      payload = await response.json();
    } catch (error) {
      const fallback = demoResponse(query);
      payload = {
        ...fallback,
        mode: 'demo',
        method: 'local-degraded-fallback',
        confidence: 0.35,
        warning: error.message,
      };
    }

    setMessages((current) => [...current, {
      id: crypto.randomUUID(),
      role: 'bot',
      text: payload.answer || payload.text,
      sources: payload.sources || [],
      method: payload.method,
      confidence: payload.confidence,
      mode: payload.mode || 'live',
      ts: new Date().toISOString(),
    }]);
    setStatus('Idle');
  }, [clearConversation, input, language, messages, navigate, status, workspaceBase]);

  const switchLanguage = () => {
    const next = language === 'en' ? 'kn' : 'en';
    setLanguage(next);
    setMessages((current) => [...current, makeWelcome(next)]);
  };

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setClosing(false);
    }, 220);
  };

  if (!isOpen) {
    return (
      <button className="cp__fab" onClick={() => setIsOpen(true)} aria-label="Open ZIA intelligence assistant" title="Open ZIA intelligence assistant">
        <PiChats size={18} />
      </button>
    );
  }

  return (
    <section className={`cp ${closing ? 'closing' : ''}`} aria-label="ZIA intelligence assistant">
      <header className="cp__header">
        <div className="cp__header-left">
          <div className="cp__header-icon"><PiRobot size={19} /></div>
          <div>
            <div className="cp__header-title">ZIA Intelligence Assistant</div>
            <div className="cp__header-sub">{status}</div>
          </div>
        </div>
        <div className="cp__header-actions">
          <button className="cp__header-btn" onClick={switchLanguage} title="Switch language" aria-label="Switch English and Kannada">
            <PiTranslate size={17} /><span>{language === 'en' ? 'EN' : 'ಕ'}</span>
          </button>
          <button className="cp__header-btn" onClick={handleExport} disabled={exporting} title="Export evidence PDF" aria-label="Export conversation as PDF">
            <PiDownloadSimple size={17} />
          </button>
          <button className="cp__header-btn cp__header-btn--close" onClick={handleClose} title="Close" aria-label="Close assistant">
            <PiX size={18} />
          </button>
        </div>
      </header>

      <div className="cp__body" aria-live="polite">
        {messages.map((message) => (
          <article key={message.id} className={`cp__msg cp__msg--${message.role}`}>
            <div className="cp__msg-icon">{message.role === 'bot' ? <PiRobot size={15} /> : <PiUser size={15} />}</div>
            <div className="cp__msg-content">
              <div className="cp__msg-label">{message.role === 'bot' ? 'ZIA' : 'You'}</div>
              {message.role === 'bot' && message.mode && message.mode !== 'system' && (
                <div className={`cp__trust cp__trust--${message.mode}`}>
                  <PiShieldCheck />
                  <span>{message.mode === 'live' ? 'Live evidence' : 'Demo fallback'}</span>
                  {Number.isFinite(message.confidence) && <span>{Math.round(message.confidence * 100)}% confidence</span>}
                </div>
              )}
              {parseMarkdown(message.text).map((block, index) => {
                if (block.type === 'heading') return <strong key={index}>{block.content}</strong>;
                if (block.type === 'list') return <p key={index} className="cp__msg-text">• {block.content}</p>;
                return <p key={index} className="cp__msg-text">{block.content}</p>;
              })}
              {message.sources?.length > 0 && (
                <div className="cp__msg-sources" aria-label="Evidence sources">
                  {message.sources.map((source, index) => source?.url ? (
                    <a key={`${sourceLabel(source)}-${index}`} className="cp__msg-source" href={source.url} target="_blank" rel="noreferrer">
                      {sourceLabel(source)}
                    </a>
                  ) : <span key={`${sourceLabel(source)}-${index}`} className="cp__msg-source">{sourceLabel(source)}</span>)}
                </div>
              )}
              <div className="cp__msg-time">{new Date(message.ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </article>
        ))}
        {status !== 'Idle' && (
          <div className="cp__msg cp__msg--bot"><div className="cp__msg-icon"><PiRobot /></div><div className="cp__msg-content"><div className="cp__typing"><i /><i /><i /></div></div></div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 2 && (
        <div className="cp__suggestions">
          {SUGGESTIONS[language].map((suggestion) => <button key={suggestion} className="cp__suggestion" onClick={() => handleSend(suggestion)}>{suggestion}</button>)}
        </div>
      )}

      <form className="cp__footer" onSubmit={(event) => { event.preventDefault(); handleSend(); }}>
        <div className="cp__input-wrap">
          <input
            ref={inputRef}
            className="cp__input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={language === 'kn' ? 'FIR, ಆರೋಪಿ ಅಥವಾ ಅಪರಾಧ ಮಾದರಿಯ ಬಗ್ಗೆ ಕೇಳಿ…' : 'Ask about an FIR, person, pattern, or BNS section…'}
            disabled={status !== 'Idle'}
          />
          <button type="submit" className="cp__send" disabled={!input.trim() || status !== 'Idle'} aria-label="Send query"><PiPaperPlaneTilt size={16} /></button>
        </div>
      </form>
    </section>
  );
};

export default ChatPanel;

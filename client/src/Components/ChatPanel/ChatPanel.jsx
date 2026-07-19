import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PiChats, PiDownloadSimple, PiPaperPlaneTilt, PiRobot, PiUser, PiX } from 'react-icons/pi';
import apiFetch from '../../utils/apiFetch';
import './ChatPanel.scss';

var BOLD_RE = /\*\*(.*?)\*\*/g;

var SLASH_COMMANDS = {
  '/help': { desc: 'Show available commands', usage: '/help' },
  '/case': { desc: 'Jump to a case by FIR number', usage: '/case <FIR number> (e.g. /case 142)' },
  '/person': { desc: 'Jump to a person profile', usage: '/person <name>' },
  '/officer': { desc: 'Open officer roster', usage: '/officer' },
  '/hotspots': { desc: 'Open crime hotspot map', usage: '/hotspots' },
  '/clear': { desc: 'Clear conversation', usage: '/clear' },
  '/export': { desc: 'Export conversation as text', usage: '/export' },
};

var SUGGESTED_QUERIES = [
  'Show me unsolved robbery cases in Bengaluru',
  'What are the top crime hotspots this month?',
  'Summarize FIR KSP-2026-0142',
  'Which accused are still at large?',
  'Compare theft rates across districts',
  'What BNS sections apply to chain snatching?',
  'Show victim profile for FIR 142',
  'What is the current case status?',
  'Predict crime risk for next 7 days',
  'Analyze the M G Road Snatchers gang network',
];

var MOCK_RESPONSES = {
  'unsolved robbery': {
    text: 'Based on CCTNS data, there are **23 unsolved robbery cases** in Bengaluru Urban district as of July 2026.\n\n**Top patterns identified:**\n- 67% occur between 8 PM to 2 AM\n- MG Road and Brigade Road corridors show highest concentration\n- Average solvability score: 0.42 (LOW)\n- 14 cases have CCTV evidence pending analysis\n\n**Recommended action:** Cross-reference with the M G Road Snatchers gang network — 8 cases share similar MO markers.',
    sources: ['CCTNS-2026', 'Solvability Engine', 'Network Analysis'],
  },
  'crime hotspot': {
    text: '**Top 5 Crime Hotspots — July 2026**\n\n1. **MG Road / Brigade Road** — 47 incidents (up 12% MoM)\n2. **Majestic / City Railway Station** — 38 incidents (up 8%)\n3. **Koramangala 5th Block** — 31 incidents (down 5%)\n4. **Whitefield Main Road** — 28 incidents (up 22%)\n5. **Yeshwanthpur Industrial Area** — 24 incidents (stable)\n\n**Key insight:** Whitefield shows the steepest climb — Recommend increasing patrol frequency during 6 to 10 PM window.',
    sources: ['Hotspot Engine', 'Predictive Analytics'],
  },
  'summarize fir': {
    text: '**FIR KSP-2026-0142 — Quick Summary**\n\nCase: Robbery near MG Road Metro Station\nReported: 2026-03-15\nStation: Brigade Road PS\nStage: Under Investigation\n\n**Key facts:**\n- 2 witnesses identified, CCTV footage within 48hr window\n- Primary accused linked to M G Road Snatchers gang\n- Solvability: 67% | Veracity: 84% (GENUINE)\n- Chargesheet deadline: 18 days remaining\n\n**Urgent:** CCTV from SH-9 junction needs retrieval before 48h overwrite.',
    sources: ['Case Management', 'ZIA Brief'],
  },
  'at large': {
    text: '**Accused At Large — Active Tracker**\n\nHIGH PRIORITY\n- **Mohan Kumar** (Age 28) — Linked to 4 robbery cases, last seen Peenya area\n- **Ravi Shankar** (Age 34) — Fugitive since 2026-02-20, Interceptor notice pending\n\nMEDIUM\n- **Ajay Patel** (Age 22) — Bail jumper, electronic surveillance active\n- **Deepak N** (Age 31) — Suspected cross-district operative\n\n**Network alert:** 2 of these accused share co-offender links with the M G Road Snatchers gang cluster.',
    sources: ['Accused Tracker', 'Network Analysis'],
  },
  'theft rate': {
    text: '**District-wise Theft Rate Comparison (Jan–Jul 2026)**\n\n- **Bengaluru Urban** — 1,247 cases, 18.3/100K (up 12%)\n- **Mysuru** — 423 cases, 14.1/100K (down 3%)\n- **Mangaluru** — 312 cases, 12.8/100K (up 5%)\n- **Hubli-Dharwad** — 287 cases, 15.2/100K (up 18%)\n- **Kalaburagi** — 198 cases, 9.4/100K (stable)\n\n**Insight:** Hubli-Dharwad shows alarming 18% increase — recommend deploying Crime Genome predictive resources.',
    sources: ['Analytics Engine', 'Crime Head Database'],
  },
  'bns section': {
    text: '**BNS Section Lookup — Chain Snatching**\n\n**Section 321 (BNS)**: Chain snatching — punishable with imprisonment up to 7 years and fine.\n\n**Related sections:**\n- Section 322: Attempt to commit murder during snatching\n- Section 323: Hurt caused during snatching\n- Section 324: Grievous hurt during snatching\n\n**Note:** IPC Section 397 replaced by BNS Section 321 following BNSS 2023 implementation.',
    sources: ['Legal RAG', 'BNS Section Database'],
  },
  'gang network': {
    text: '**M G Road Snatchers — Network Analysis**\n\nCluster size: 12 members across 8 FIRs\nPrimary activity zone: MG Road to Brigade Road corridor\nPeak hours: 20:00 to 02:00\n\n**Key nodes:**\n- Arjun Rao (leader) — 6 linked cases\n- Suresh HN (driver) — 4 linked cases\n- Vikram P (fence) — 3 linked cases\n\n**Cross-case links:** 4 cases share same MO pattern (motorcycle-based snatch, single victim)',
    sources: ['Network Analysis', 'Co-Accused Graph'],
  },
  'default': {
    text: 'I have processed your query. To provide a precise answer, please specify the FIR number, district, or crime type you want to investigate. You can also use slash commands like `/case 142` or `/person mohankumar` for direct lookups.',
    sources: ['ZIA Analyst'],
  },
};

function parseMarkdown(text) {
  if (!text) return [];
  const lines = text.split('\n');
  const blocks = [];
  let currentBlock = { type: 'text', content: '' };

  lines.forEach(line => {
    if (line.startsWith('**') && line.endsWith('**')) {
      if (currentBlock.content.trim()) blocks.push(currentBlock);
      currentBlock = { type: 'heading', content: line.replace(/\*\*/g, '') };
    } else if (line.startsWith('- ')) {
      if (currentBlock.type === 'text' && currentBlock.content.trim()) blocks.push(currentBlock);
      if (currentBlock.type !== 'list') {
        currentBlock = { type: 'list', content: [line.substring(2)] };
      } else {
        currentBlock.content.push(line.substring(2));
      }
    } else if (line.match(/^\d+\./)) {
      if (currentBlock.type === 'text' && currentBlock.content.trim()) blocks.push(currentBlock);
      if (currentBlock.type !== 'ordered') {
        currentBlock = { type: 'ordered', content: [line.replace(/^\d+\.\s*/, '')] };
      } else {
        currentBlock.content.push(line.replace(/^\d+\.\s*/, ''));
      }
    } else {
      if (currentBlock.content.trim()) blocks.push(currentBlock);
      currentBlock = { type: 'text', content: line };
    }
  });
  if (currentBlock.content.trim()) blocks.push(currentBlock);
  return blocks;
}

const ChatPanel = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [entering, setEntering] = useState(false);
  const [closing, setClosing] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'bot',
      text: 'Welcome to ZIA, Karnataka Police Intelligence Assistant. How can I help with your investigation today?',
      ts: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('Idle');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    setEntering(true);
    const frame = requestAnimationFrame(() => setEntering(false));
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  const handleSend = useCallback(async (text) => {
    const query = text || input;
    if (!query.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      text: query,
      ts: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setShowSuggestions(false);
    setStatus('Processing');

    // Simulate processing delay
    setTimeout(() => {
      setStatus('Querying');
      setTimeout(() => {
        const lowerQuery = query.toLowerCase();
        let response = MOCK_RESPONSES.default;

        for (const [key, val] of Object.entries(MOCK_RESPONSES)) {
          if (key !== 'default' && lowerQuery.includes(key)) {
            response = val;
            break;
          }
        }

        // Slash command handling
        if (query.startsWith('/')) {
          const parts = query.split(' ');
          const cmd = parts[0].toLowerCase();
          if (cmd === '/help') {
            response = { text: 'Available commands: ' + Object.entries(SLASH_COMMANDS).map(([k, v]) => `${k}: ${v.desc}`).join('\n'), sources: ['ZIA'] };
          } else if (cmd === '/case' && parts[1]) {
            navigate(`/case/${parts[1]}`);
            response = { text: `Navigating to case ${parts[1]}.`, sources: ['Navigation'] };
          } else if (cmd === '/clear') {
            setMessages([{
              id: 'welcome',
              role: 'bot',
              text: 'Conversation cleared. How can I help?',
              ts: new Date().toISOString(),
            }]);
            setStatus('Idle');
            return;
          } else if (cmd === '/export') {
            const exportText = messages.map(m => `[${new Date(m.ts).toLocaleTimeString()}] ${m.role.toUpperCase()}: ${m.text}`).join('\n\n');
            const blob = new Blob([exportText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `zia-brief-${new Date().toISOString().slice(0,10)}.txt`;
            a.click();
            response = { text: 'Conversation exported.', sources: ['Export'] };
          } else if (SLASH_COMMANDS[cmd]) {
            response = { text: `Usage: ${SLASH_COMMANDS[cmd].usage}\n\n${SLASH_COMMANDS[cmd].desc}`, sources: ['Commands'] };
          } else {
            response = { text: `Unknown command: ${cmd}. Type /help for available commands.`, sources: ['Commands'] };
          }
        }

        const botMsg = {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          text: response.text,
          sources: response.sources || ['ZIA Analyst'],
          ts: new Date().toISOString(),
        };
        setMessages(prev => [...prev, botMsg]);
        setStatus('Idle');
      }, 600);
    }, 300);
  }, [input, navigate, messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (suggestion) => {
    handleSend(suggestion);
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
      <button
        className="cp__fab"
        onClick={() => {
          setClosing(false);
          setIsOpen(true);
        }}
        aria-label="Open ZIA Chat"
      >
        <PiChats size={16} />
        <span className="cp__fab-label">ZIA Assistant</span>
      </button>
    );
  }

  return (
    <div className={`cp ${entering ? 'entering' : ''} ${closing ? 'closing' : ''}`}>
      <div className="cp__header">
        <div className="cp__header-left">
          <div className="cp__header-icon">
            <PiRobot size={18} />
          </div>
          <div>
            <div className="cp__header-title">ZIA Intelligence Assistant</div>
            <div className="cp__header-sub">Status: {status}</div>
          </div>
        </div>
        <div className="cp__header-actions">
          <button
            className="cp__header-btn"
            onClick={() => {
              const exportText = messages.map(m =>
                `[${new Date(m.ts).toLocaleTimeString()}] ${m.role.toUpperCase()}: ${m.text}`
              ).join('\n\n');
              const blob = new Blob([exportText], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `zia-brief-${new Date().toISOString().slice(0, 10)}.txt`;
              a.click();
            }}
            title="Export"
          >
            <PiDownloadSimple size={14} />
          </button>
          <button
            className="cp__header-btn cp__header-btn--close"
            onClick={handleClose}
            title="Close"
          >
            <PiX size={16} />
          </button>
        </div>
      </div>

      <div className="cp__body">
        {messages.map(msg => (
          <div key={msg.id} className={`cp__msg cp__msg--${msg.role}`}>
            <div className="cp__msg-icon">
              {msg.role === 'bot' ? <PiRobot size={14} /> : <PiUser size={14} />}
            </div>
            <div className="cp__msg-content">
              <div className="cp__msg-label">{msg.role === 'bot' ? 'ZIA' : 'You'}</div>
              {parseMarkdown(msg.text).map((block, i) => {
                if (block.type === 'heading') {
                  return <strong key={i}>{block.content}</strong>;
                }
                if (block.type === 'list') {
                  return block.content.map((item, j) => (
                    <div key={j} style={{ paddingLeft: '12px', marginBottom: '2px' }}>
                      {'\u2022'} {item}
                    </div>
                  ));
                }
                if (block.type === 'ordered') {
                  return block.content.map((item, j) => (
                    <div key={j} style={{ paddingLeft: '12px', marginBottom: '2px' }}>
                      {j + 1}. {item}
                    </div>
                  ));
                }
                return <p key={i} className="cp__msg-text">{block.content}</p>;
              })}
              {msg.sources && msg.sources.length > 0 && (
                <div className="cp__msg-sources">
                  {msg.sources.map((src, i) => (
                    <span key={i} className="cp__msg-source">{src}</span>
                  ))}
                </div>
              )}
              <div className="cp__msg-time">
                {new Date(msg.ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {status === 'Processing' && (
          <div className="cp__msg cp__msg--bot">
            <div className="cp__msg-icon"><PiRobot size={14} /></div>
            <div className="cp__msg-content">
              <div className="cp__typing">
                <div className="cp__typing-dot" />
                <div className="cp__typing-dot" />
                <div className="cp__typing-dot" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {showSuggestions && (
        <div className="cp__suggestions">
          {SUGGESTED_QUERIES.slice(0, 4).map((s, i) => (
            <button
              key={i}
              className="cp__suggestion"
              onClick={() => handleSuggestion(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form className="cp__footer" onSubmit={handleSubmit}>
        <div className="cp__input-wrap">
          <input
            ref={inputRef}
            className="cp__input"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about cases, FIRs, BNS sections..."
            disabled={status !== 'Idle'}
          />
          <button
            type="submit"
            className="cp__send"
            disabled={!input.trim() || status !== 'Idle'}
          >
            <PiPaperPlaneTilt size={14} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;

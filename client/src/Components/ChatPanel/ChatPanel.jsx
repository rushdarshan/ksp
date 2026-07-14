import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaPaperPlane, FaRobot, FaUser, FaTimes, FaComments, FaDownload } from 'react-icons/fa';
import apiFetch from '../../utils/apiFetch';
import './ChatPanel.scss';

var BOLD_RE = /\*\*(.*?)\*\*/g;

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
    text: 'Based on CCTNS data, there are **23 unsolved robbery cases** in Bengaluru Urban district as of July 2026.\n\n**Top patterns identified:**\n\u2022 67% occur between 8 PM \u2013 2 AM\n\u2022 MG Road and Brigade Road corridors show highest concentration\n\u2022 Average solvability score: 0.42 (LOW)\n\u2022 14 cases have CCTV evidence pending analysis\n\n**Recommended action:** Cross-reference with the M G Road Snatchers gang network \u2014 8 cases share similar MO markers.',
    sources: ['CCTNS-2026', 'Solvability Engine', 'Network Analysis'],
  },
  'crime hotspot': {
    text: '**Top 5 Crime Hotspots \u2014 July 2026**\n\n1. **MG Road / Brigade Road** \u2014 47 incidents (\u219112% MoM)\n2. **Majestic / City Railway Station** \u2014 38 incidents (\u21918%)\n3. **Koramangala 5th Block** \u2014 31 incidents (\u21935%)\n4. **Whitefield Main Road** \u2014 28 incidents (\u219122%)\n5. **Yeshwanthpur Industrial Area** \u2014 24 incidents (stable)\n\n**Key insight:** Whitefield shows the steepest climb \u2014 Recommend increasing patrol frequency during 6\u201310 PM window.',
    sources: ['Hotspot Engine', 'Predictive Analytics'],
  },
  'summarize fir': {
    text: '**FIR KSP-2026-0142 \u2014 Quick Summary**\n\n\ud83d\udccb **Crime:** Robbery near MG Road Metro Station\n\ud83d\udcc5 **Reported:** 2026-03-15\n\ud83c\udfe2 **Station:** Brigade Road PS\n\ud83d\udc64 **Stage:** Under Investigation\n\n**Key facts:**\n\u2022 2 witnesses identified, CCTV footage within 48hr window\n\u2022 Primary accused linked to M G Road Snatchers gang\n\u2022 Solvability: 67% | Veracity: 84% (GENUINE)\n\u2022 Chargesheet deadline: 18 days remaining\n\n**\u26a0\ufe0f Urgent:** CCTV from SH-9 junction needs retrieval before 48h overwrite.',
    sources: ['Case Management', 'ZIA Brief'],
  },
  'at large': {
    text: '**Accused At Large \u2014 Active Tracker**\n\n\ud83d\udd34 **HIGH PRIORITY**\n\u2022 **Mohan Kumar** (Age 28) \u2014 Linked to 4 robbery cases, last seen Peenya area\n\u2022 **Ravi Shankar** (Age 34) \u2014 Fugitive since 2026-02-20, Interceptor notice pending\n\n\ud83d\udfe1 **MEDIUM**\n\u2022 **Ajay Patel** (Age 22) \u2014 Bail jumper, electronic surveillance active\n\u2022 **Deepak N** (Age 31) \u2014 Suspected cross-district operative\n\n**Network alert:** 2 of these accused share co-offender links with the M G Road Snatchers gang cluster.',
    sources: ['Accused Tracker', 'Network Analysis'],
  },
  'theft rate': {
    text: '**District-wise Theft Rate Comparison (Jan\u2013Jul 2026)**\n\n\u2022 **Bengaluru Urban** \u2014 1,247 cases, 18.3/100K (\u219112%)\n\u2022 **Mysuru** \u2014 423 cases, 14.1/100K (\u21933%)\n\u2022 **Mangaluru** \u2014 312 cases, 12.8/100K (\u21915%)\n\u2022 **Hubli-Dharwad** \u2014 287 cases, 15.2/100K (\u219118%)\n\u2022 **Kalaburagi** \u2014 198 cases, 9.4/100K (stable)\n\n**Insight:** Hubli-Dharwad shows alarming 18% increase \u2014 recommend deploying Crime Genome predictive resources.',
    sources: ['Topology Navigator', 'Crime Statistics'],
  },
  'bns section': {
    text: '**BNS Sections for Chain Snatching**\n\n**Primary:**\n\u2022 **Section 304(2)** \u2014 Robbery (3\u201310 years imprisonment)\n\u2022 **Section 304(1)** \u2014 Theft with threat of force (up to 7 years)\n\n**Applicable aggravating factors:**\n\u2022 **Section 3(5)** \u2014 Gang involvement (enhanced sentencing)\n\u2022 **Section 61** \u2014 Criminal conspiracy\n\n**IT Act (if electronic evidence):**\n\u2022 **Section 65B** \u2014 Admissibility of electronic records\n\u2022 **Section 66C** \u2014 Identity theft (if Aadhaar/card cloning involved)\n\n**Evidence chain note:** Ensure CCTV footage is preserved per Section 65B requirements.',
    sources: ['Legal RAG', 'BNS Database'],
  },
  'witness': {
    text: '**Witness Reliability Assessment \u2014 FIR 142/2026**\n\n**Witness 1: Auto-driver Raju**\n\u2022 Reliability score: 78% (MODERATE)\n\u2022 Corroborated by CCTV timeline\n\u2022 Statement consistent across 2 interviews\n\n**Witness 2: Store clerk Priya**\n\u2022 Reliability score: 85% (HIGH)\n\u2022 Direct visual identification of primary accused\n\u2022 Cross-validated with phone location data\n\n**\u26a0\ufe0f Flag:** 1 witness retraction detected in similar case KSP-2026-0098 \u2014 recommend proactive witness protection measures.',
    sources: ['Witness Analytics', 'Retraction Monitor'],
  },
  'victim': {
    text: '**Victim Profile \u2014 FIR 142/2026**\n\n\ud83d\udc64 **Suresh Babu**, Age 52, Jewellery shop owner\n\u2022 Loss estimate: \u20b912,00,000\n\u2022 Injury: Minor (shock, no hospitalization)\n\u2022 Insurance claim: Pending\n\n**Risk factors identified:**\n\u2022 Shop located in high-crime corridor (MG Road)\n\u2022 No security guard on premises during incident\n\u2022 Prior threat notification filed 2026-01-10 (ignored)\n\n**Victim assistance:** Auto-referred to Legal Aid Cell and Victim Compensation Fund.',
    sources: ['Victim Risk Engine', 'CCTNS'],
  },
  'case status': {
    text: '**Case Progress Dashboard \u2014 FIR 142/2026**\n\n\u2705 FIR Registered (Day 0)\n\u2705 Scene of Crime visited (Day 1)\n\u2705 CCTV evidence collected (Day 2)\n\u2705 Witness statements recorded (Day 3)\n\u23f3 **Accused identification** (IN PROGRESS)\n\u274c Arrest warrant pending\n\u274c Chargesheet not filed\n\n**Timeline:** 18 of 90 days elapsed\n**Bottleneck:** Forensic analysis of mobile dump data delayed \u2014 expected 3 days\n\n**Next steps:**\n1. Complete mobile forensics\n2. Execute arrest warrants\n3. File chargesheet by Day 60',
    sources: ['Case Tracker', 'Timeline Engine'],
  },
  'predict': {
    text: '**Crime Forecast \u2014 Next 7 Days (Bengaluru Urban)**\n\n**High risk zones:**\n\u2022 MG Road corridor \u2014 73% probability of theft/robbery\n\u2022 Majestic area \u2014 68% probability (pickpocketing)\n\u2022 Whitefield \u2014 61% probability (vehicle theft)\n\n**Temporal patterns:**\n\u2022 Peak hours: 7 PM \u2013 11 PM (all zones)\n\u2022 Weekend surge expected: +34% above daily average\n\n**Resource recommendation:** Deploy 2 additional patrol units to MG Road during 6\u201310 PM window. Historical deployment data shows 42% crime reduction with this adjustment.',
    sources: ['Predictive Engine', 'Spatio-Temporal Model'],
  },
  'gang': {
    text: '**Gang Network Analysis \u2014 M G Road Snatchers**\n\n**Core members (3):**\n\u2022 **Mohan Kumar** (Leader) \u2014 4 linked cases, modus: motorcycle snatch\n\u2022 **Ravi Shankar** (Enforcer) \u2014 3 linked cases, physical intimidation\n\u2022 **Suresh P** (Fencer) \u2014 handles stolen goods disposal\n\n**Associates (4):**\n\u2022 4 known associates providing safe houses and alibis\n\n**Operational pattern:**\n\u2022 Active days: Tue/Thu/Sat evenings\n\u2022 Target profile: solo walkers, phone/laptop\n\u2022 Escape route: Brigade Road \u2192 St. Marks Road \u2192 Residential area\n\n**Network risk:** 2 members have cross-links to Delhi-based fencing network.',
    sources: ['Co-Offender Network', 'Gang Intelligence'],
  },
};

function getMockResponse(query) {
  var q = query.toLowerCase();
  var keys = Object.keys(MOCK_RESPONSES);
  for (var i = 0; i < keys.length; i++) {
    if (q.includes(keys[i])) return MOCK_RESPONSES[keys[i]];
  }
  return {
    text: "I've analyzed your query: **" + query + "**\n\nHere's what I can help with:\n\n\u2022 **Case analysis** \u2014 Ask about specific FIRs, accused, victims, or case status\n\u2022 **Crime patterns** \u2014 Hotspots, trends, district comparisons, predictions\n\u2022 **Legal lookup** \u2014 BNS/IPC sections, chargesheet requirements, evidence rules\n\u2022 **Network intelligence** \u2014 Gang analysis, co-offender links, associate mapping\n\u2022 **Witness & victim** \u2014 Reliability scores, risk profiles, protection measures\n\n**Try asking:**\n\u2022 \"Show victim profile for FIR 142\"\n\u2022 \"What is the current case status?\"\n\u2022 \"Predict crime risk for next 7 days\"\n\u2022 \"Analyze the M G Road Snatchers gang\"",
    sources: ['ZIA General'],
  };
}

// ponytail: detect FIR summary queries → zia_brief, BNS queries → legal_rag, else mock
function detectQueryType(query) {
  var q = query.toLowerCase();
  if (q.includes('summarize fir') || q.includes('fir ') || q.includes('case status') || q.includes('case summary')) {
    var match = query.match(/(?:FIR\s*)?(\d{3,4})/i);
    return { type: 'zia_brief', caseId: match ? 'FIR-2026-' + match[1].padStart(4, '0') : 'FIR-2026-0142' };
  }
  if (q.includes('bns') || q.includes('section') || q.includes('ipc') || q.includes('law') || q.includes('legal') || q.includes('punishment for')) {
    return { type: 'legal_rag', query: query };
  }
  return { type: 'mock' };
}

async function callZiaBrief(caseId) {
  try {
    var res = await apiFetch('/zia_brief', { method: 'POST', body: JSON.stringify({ caseId }) });
    if (!res || !res.ok) throw new Error('API error');
    var data = await res.json();
    var text = data.narrative || 'Brief generated.';
    if (data.recommendations && data.recommendations.length) {
      text += '\n\n**Recommendations:**\n' + data.recommendations.map(function(r) { return '\u2022 ' + r; }).join('\n');
    }
    if (data.similarCases && data.similarCases.length) {
      text += '\n\n**Similar cases:** ' + data.similarCases.map(function(c) { return c.caseId; }).join(', ');
    }
    return { text: text, sources: ['ZIA Brief', 'Case Management'], demo: false };
  } catch (e) {
    return null;
  }
}

async function callLegalRag(query) {
  try {
    var res = await apiFetch('/legal_rag/query', { method: 'POST', body: JSON.stringify({ query: query }) });
    if (!res || !res.ok) throw new Error('API error');
    var data = await res.json();
    return { text: data.answer || 'No matching sections found.', sources: data.sources || ['Legal RAG'], demo: false };
  } catch (e) {
    return null;
  }
}

async function getResponse(query) {
  var detection = detectQueryType(query);
  if (detection.type === 'zia_brief') {
    var result = await callZiaBrief(detection.caseId);
    if (result) return result;
  } else if (detection.type === 'legal_rag') {
    var result = await callLegalRag(detection.query);
    if (result) return result;
  }
  var mock = getMockResponse(query);
  return { text: mock.text, sources: mock.sources, demo: true };
}

function renderBold(text) {
  var parts = [];
  var last = 0;
  BOLD_RE.lastIndex = 0;
  var m;
  while ((m = BOLD_RE.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(React.createElement('strong', { key: m.index }, m[1]));
    last = BOLD_RE.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function renderMessageLines(text) {
  return text.split('\n').map(function (line, i) {
    if (!line) return React.createElement('br', { key: 'br-' + i });
    return React.createElement('p', { key: i, style: { margin: '2px 0' } }, renderBold(line));
  });
}

function TypingIndicator() {
  return React.createElement('div', { className: 'cp__typing' },
    React.createElement('span', { className: 'cp__typing-dot' }),
    React.createElement('span', { className: 'cp__typing-dot' }),
    React.createElement('span', { className: 'cp__typing-dot' })
  );
}

function MessageBubble(props) {
  var msg = props.msg;
  var isUser = msg.role === 'user';
  var className = isUser ? 'cp__msg cp__msg--user' : 'cp__msg cp__msg--bot';

  var children = [
    React.createElement('div', { className: 'cp__msg-icon', key: 'icon' },
      isUser ? React.createElement(FaUser, { size: 12 }) : React.createElement(FaRobot, { size: 12 })
    ),
  ];

  var contentChildren = [];
  if (!isUser) {
    contentChildren.push(React.createElement('div', { className: 'cp__msg-label', key: 'label' }, 'ZIA Assistant'));
  }
  contentChildren.push(React.createElement('div', { className: 'cp__msg-text', key: 'text' }, renderMessageLines(msg.text)));

  if (msg.sources && msg.sources.length > 0) {
    contentChildren.push(React.createElement('div', { className: 'cp__msg-sources', key: 'sources' },
      msg.sources.map(function (s, i) {
        return React.createElement('span', { key: i, className: 'cp__msg-source' }, s);
      }),
      msg.demo && React.createElement('span', { key: 'demo-badge', className: 'cp__msg-source', style: { background: '#fef3c7', color: '#92400e' } }, 'Demo Mode')
    ));
  }

  contentChildren.push(React.createElement('div', { className: 'cp__msg-time', key: 'time' },
    new Date(msg.ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  ));

  children.push(React.createElement('div', { className: 'cp__msg-content', key: 'content' }, contentChildren));

  return React.createElement('div', { className: className }, children);
}

export default function ChatPanel() {
  var _o = useState(false);
  var isOpen = _o[0], setIsOpen = _o[1];

  var _m = useState([{
    role: 'bot',
    text: 'Hello, I am **ZIA** \u2014 the Zero-latency Intelligence Assistant for Karnataka State Police.\n\nI can help you with:\n\u2022 Case analysis and FIR summaries\n\u2022 Crime hotspot identification\n\u2022 BNS/IPC section lookup\n\u2022 Network and entity analysis\n\u2022 Crime trend comparison across districts\n\nWhat would you like to know?',
    ts: Date.now(),
    sources: ['ZIA v1.0'],
  }]);
  var messages = _m[0], setMessages = _m[1];

  var _i = useState('');
  var input = _i[0], setInput = _i[1];

  var _t = useState(false);
  var isTyping = _t[0], setIsTyping = _t[1];

  var scrollRef = useRef(null);
  var inputRef = useRef(null);

  useEffect(function () {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(function () {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  var sendMessage = useCallback(function (text) {
    if (!text.trim()) return;
    var userMsg = { role: 'user', text: text.trim(), ts: Date.now() };
    setMessages(function (prev) { return prev.concat([userMsg]); });
    setInput('');
    setIsTyping(true);

    getResponse(text).then(function (resp) {
      setMessages(function (prev) { return prev.concat([{ role: 'bot', text: resp.text, sources: resp.sources, ts: Date.now(), demo: resp.demo }]); });
      setIsTyping(false);
    });
  }, []);

  var handleKeyDown = function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  var exportChat = function () {
    var lines = messages.map(function (m) {
      var role = m.role === 'user' ? 'You' : 'ZIA';
      var time = new Date(m.ts).toLocaleString('en-IN');
      return '[' + time + '] ' + role + ':\n' + m.text + '\n';
    }).join('\n---\n\n');
    var blob = new Blob([lines], { type: 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'zia-chat-' + new Date().toISOString().slice(0, 10) + '.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return React.createElement(React.Fragment, null,
    !isOpen && React.createElement('button', {
      className: 'cp__fab',
      onClick: function () { setIsOpen(true); },
      title: 'ZIA Chat Assistant'
    },
      React.createElement(FaComments, { size: 22 }),
      React.createElement('span', { className: 'cp__fab-label' }, 'Ask ZIA')
    ),
    isOpen && React.createElement('div', { className: 'cp' },
      React.createElement('div', { className: 'cp__header' },
        React.createElement('div', { className: 'cp__header-left' },
          React.createElement('div', { className: 'cp__header-icon' }, React.createElement(FaRobot, { size: 18 })),
          React.createElement('div', null,
            React.createElement('div', { className: 'cp__header-title' }, 'ZIA Assistant'),
            React.createElement('div', { className: 'cp__header-sub' }, 'Crime Intelligence \u00b7 Always Online')
          )
        ),
        React.createElement('div', { className: 'cp__header-actions' },
          React.createElement('button', { className: 'cp__header-btn', onClick: exportChat, title: 'Export conversation' }, React.createElement(FaDownload, { size: 14 })),
          React.createElement('button', { className: 'cp__header-btn cp__header-btn--close', onClick: function () { setIsOpen(false); }, title: 'Close' }, React.createElement(FaTimes, { size: 16 }))
        )
      ),
      React.createElement('div', { className: 'cp__body', ref: scrollRef },
        messages.map(function (m, i) { return React.createElement(MessageBubble, { key: i, msg: m }); }),
        isTyping && React.createElement('div', { className: 'cp__msg cp__msg--bot' },
          React.createElement('div', { className: 'cp__msg-icon' }, React.createElement(FaRobot, { size: 12 })),
          React.createElement('div', { className: 'cp__msg-content' }, React.createElement(TypingIndicator, null))
        )
      ),
      messages.length <= 1 && React.createElement('div', { className: 'cp__suggestions' },
        SUGGESTED_QUERIES.map(function (q, i) {
          return React.createElement('button', { key: i, className: 'cp__suggestion', onClick: function () { sendMessage(q); } }, q);
        })
      ),
      React.createElement('div', { className: 'cp__footer' },
        React.createElement('div', { className: 'cp__input-wrap' },
          React.createElement('input', {
            ref: inputRef,
            className: 'cp__input',
            type: 'text',
            placeholder: 'Ask about cases, FIRs, BNS sections...',
            value: input,
            onChange: function (e) { setInput(e.target.value); },
            onKeyDown: handleKeyDown,
            disabled: isTyping
          }),
          React.createElement('button', {
            className: 'cp__send',
            onClick: function () { sendMessage(input); },
            disabled: !input.trim() || isTyping,
            title: 'Send message'
          }, React.createElement(FaPaperPlane, { size: 14 }))
        )
      )
    )
  );
}

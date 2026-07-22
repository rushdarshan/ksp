const express = require('express');
const catalyst = require('zcatalyst-sdk-node');
const { logAuditEvent } = require('../shared/audit-log');

const app = express();
app.use(express.json({ limit: '256kb' }));

const ALLOWED_ROLES = new Set(['acp', 'dysp', 'dsp', 'inspector', 'subinspector', 'superintendent', 'admin']);
const MAX_HISTORY = 8;

function unwrap(row, table) {
    return row?.[table] || row || {};
}

function extractCaseId(query, history) {
    const context = `${query} ${(history || []).map(item => item.text || '').join(' ')}`;
    const full = context.match(/KSP[-\s/]?2026[-\s/]?0*(\d{1,6})/i);
    if (full) return Number(full[1]);
    const explicit = context.match(/(?:FIR|case|crime)\s*(?:no\.?|number|#)?\s*0*(\d{1,6})/i);
    return explicit ? Number(explicit[1]) : null;
}

function detectIntent(query, caseId) {
    const normalized = query.toLowerCase();
    if (caseId) return 'case_summary';
    if (/bns|section|legal|punishment|ವಿಧಿ|ಶಿಕ್ಷೆ/u.test(normalized)) return 'legal';
    if (/at large|not arrested|abscond|ಬಂಧನವಾಗದ/u.test(normalized)) return 'accused_at_large';
    if (/hotspot|cluster|where|ಹಾಟ್.?ಸ್ಪಾಟ್/u.test(normalized)) return 'hotspots';
    if (/trend|pattern|compare|increase|decrease|ಮಾದರಿ/u.test(normalized)) return 'trends';
    return 'general';
}

async function currentUser(catalystApp) {
    const user = await catalystApp.userManagement().getCurrentProjectUser();
    const role = user?.role_details?.role_name || user?.role || 'Unknown';
    const normalizedRole = String(role).toLowerCase().replace(/[\s_-]/g, '');
    if (!ALLOWED_ROLES.has(normalizedRole)) {
        const error = new Error('Role is not authorized for crime intelligence queries');
        error.status = 403;
        throw error;
    }
    return { id: user?.user_id || user?.zaaid || 'unknown', role };
}

async function translateKannada(catalystApp, answer) {
    try {
        const result = await catalystApp.zia().generateContent({
            prompt: `Translate the following Karnataka Police analytical response into clear Kannada. Preserve FIR numbers, table names, percentages, and BNS section numbers exactly. Return only the translation.\n\n${answer}`,
        });
        return result?.text || result?.output || answer;
    } catch (error) {
        console.warn('Kannada translation unavailable:', error.message);
        return answer;
    }
}

async function translateQueryToEnglish(catalystApp, query) {
    try {
        const result = await catalystApp.zia().generateContent({
            prompt: `Translate this Kannada police query into concise English for database intent classification. Preserve FIR numbers, names, locations, dates, and BNS section numbers exactly. Return only the translation.\n\n${query}`,
        });
        return result?.text || result?.output || query;
    } catch (error) {
        console.warn('Kannada query translation unavailable:', error.message);
        return query;
    }
}

async function caseSummary(catalystApp, caseId) {
    const zcql = catalystApp.zcql();
    const [caseRows, accusedRows, victimRows, arrestRows, sectionRows] = await Promise.all([
        zcql.executeZCQLQuery(`SELECT * FROM CaseMaster WHERE CaseMasterID = ${caseId} LIMIT 1`),
        zcql.executeZCQLQuery(`SELECT * FROM Accused WHERE CaseMasterID = ${caseId} LIMIT 20`),
        zcql.executeZCQLQuery(`SELECT * FROM Victim WHERE CaseMasterID = ${caseId} LIMIT 20`),
        zcql.executeZCQLQuery(`SELECT * FROM ArrestSurrender WHERE CaseMasterID = ${caseId} LIMIT 20`),
        zcql.executeZCQLQuery(`SELECT * FROM ActSectionAssociation WHERE CaseMasterID = ${caseId} LIMIT 20`),
    ]);
    const record = unwrap(caseRows[0], 'CaseMaster');
    if (!record.CaseMasterID) return null;

    const accused = accusedRows.map(row => unwrap(row, 'Accused'));
    const victims = victimRows.map(row => unwrap(row, 'Victim'));
    const arrests = arrestRows.map(row => unwrap(row, 'ArrestSurrender'));
    const sections = sectionRows.map(row => unwrap(row, 'ActSectionAssociation'));
    const arrestedIds = new Set(arrests.map(item => String(item.AccusedMasterID)));
    const atLarge = accused.filter(item => !arrestedIds.has(String(item.AccusedMasterID)));
    const legal = sections.map(item => `${item.ActID || item.ActCode || 'Act'} ${item.SectionID || item.SectionCode || ''}`.trim());

    return {
        answer: `**Case ${record.CrimeNo || record.CaseNo || caseId}**\n\nRegistered ${record.CrimeRegisteredDate || 'date unavailable'} at police station ${record.PoliceStationID || 'unknown'}. ${record.BriefFacts || 'No brief facts recorded.'}\n\n- Accused: ${accused.length}; not matched to an arrest event: ${atLarge.length}\n- Victims: ${victims.length}\n- Arrest or surrender events: ${arrests.length}\n- Invoked provisions: ${legal.join(', ') || 'not recorded'}\n\n**Evidence note:** This summary is assembled directly from relational records. Investigative conclusions still require officer verification.`,
        sources: [
            { label: `CaseMaster #${caseId}`, table: 'CaseMaster', record: caseId },
            { label: `Accused records (${accused.length})`, table: 'Accused', record: caseId },
            { label: `Victim records (${victims.length})`, table: 'Victim', record: caseId },
            { label: `ArrestSurrender records (${arrests.length})`, table: 'ArrestSurrender', record: caseId },
            { label: `ActSectionAssociation (${sections.length})`, table: 'ActSectionAssociation', record: caseId },
        ],
        confidence: 0.96,
        method: 'schema-grounded-relational-join',
    };
}

async function accusedAtLarge(catalystApp) {
    const zcql = catalystApp.zcql();
    const [accusedRows, arrestRows] = await Promise.all([
        zcql.executeZCQLQuery('SELECT * FROM Accused LIMIT 250'),
        zcql.executeZCQLQuery('SELECT * FROM ArrestSurrender LIMIT 500'),
    ]);
    const accused = accusedRows.map(row => unwrap(row, 'Accused'));
    const arrests = arrestRows.map(row => unwrap(row, 'ArrestSurrender'));
    const arrestedIds = new Set(arrests.map(item => String(item.AccusedMasterID)));
    const atLarge = accused.filter(item => !arrestedIds.has(String(item.AccusedMasterID)));
    const sample = atLarge.slice(0, 8).map(item => `${item.AccusedName} (${item.PersonID || 'role unknown'}, case ${item.CaseMasterID})`).join('; ');
    return {
        answer: `**Accused-at-large relational check**\n\n${atLarge.length} of ${accused.length} reviewed accused records have no matching ArrestSurrender event in the current query window.\n\n${sample || 'No unmatched accused records were found.'}\n\nOpen the Accused at Large ledger and verify warrants before operational use.`,
        sources: [
            { label: `Accused query (${accused.length})`, table: 'Accused' },
            { label: `ArrestSurrender query (${arrests.length})`, table: 'ArrestSurrender' },
        ],
        confidence: accused.length ? 0.9 : 0.4,
        method: 'anti-join-accused-arrests',
    };
}

async function aggregateIntelligence(catalystApp, intent) {
    const rows = await catalystApp.zcql().executeZCQLQuery(
        'SELECT PoliceStationID, CrimeMajorHeadID, CrimeMinorHeadID, COUNT(CaseMasterID) AS CaseCount FROM CaseMaster GROUP BY PoliceStationID, CrimeMajorHeadID, CrimeMinorHeadID LIMIT 100'
    );
    const facts = rows.map(row => unwrap(row, 'CaseMaster')).slice(0, 12);
    const top = [...facts].sort((a, b) => Number(b.CaseCount || 0) - Number(a.CaseCount || 0)).slice(0, 5);
    return {
        answer: `**${intent === 'hotspots' ? 'Hotspot' : 'Crime trend'} evidence window**\n\nThe strongest station and crime-head combinations in the current aggregate are:\n${top.map((item, index) => `${index + 1}. Station ${item.PoliceStationID}, crime head ${item.CrimeMajorHeadID}/${item.CrimeMinorHeadID}: ${item.CaseCount} cases`).join('\n')}\n\nUse the command map for spatial inspection. Counts describe correlation and concentration, not causation.`,
        sources: [{ label: 'CaseMaster aggregate', table: 'CaseMaster' }],
        confidence: top.length ? 0.86 : 0.35,
        method: 'whitelisted-zcql-aggregate',
    };
}

async function legalQuery(query) {
    if (!process.env.APP_URL) throw new Error('APP_URL is required for Legal RAG routing');
    const response = await fetch(`${process.env.APP_URL}/server/legal_rag/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
    });
    if (!response.ok) throw new Error(`Legal RAG returned HTTP ${response.status}`);
    const result = await response.json();
    return {
        answer: result.answer,
        sources: (result.sources || []).map(label => ({ label, table: 'LegalKnowledgeBase' })),
        confidence: result.method === 'rag' ? 0.9 : 0.72,
        method: `legal-${result.method || 'retrieval'}`,
    };
}

app.post('/query', async (req, res) => {
    let catalystApp;
    try {
        const query = String(req.body?.query || '').trim().slice(0, 2000);
        const language = req.body?.language === 'kn' ? 'kn' : 'en';
        const history = Array.isArray(req.body?.history) ? req.body.history.slice(-MAX_HISTORY) : [];
        if (!query) return res.status(400).json({ error: 'query is required' });

        catalystApp = catalyst.initialize(req);
        const user = await currentUser(catalystApp);
        const analysisQuery = language === 'kn' ? await translateQueryToEnglish(catalystApp, query) : query;
        const caseId = extractCaseId(analysisQuery, history);
        const intent = detectIntent(analysisQuery, caseId);
        let result;

        if (intent === 'case_summary') result = await caseSummary(catalystApp, caseId);
        if (intent === 'accused_at_large') result = await accusedAtLarge(catalystApp);
        if (intent === 'hotspots' || intent === 'trends') result = await aggregateIntelligence(catalystApp, intent);
        if (intent === 'legal') result = await legalQuery(analysisQuery);
        if (!result) {
            result = {
                answer: 'I could not ground that request in an approved query plan. Add an FIR number, crime type, district, or legal provision.',
                sources: [],
                confidence: 0.2,
                method: 'clarification-required',
            };
        }

        if (language === 'kn') result.answer = await translateKannada(catalystApp, result.answer);
        await logAuditEvent(catalystApp, {
            userId: user.id,
            action: 'crime_chat.query',
            target: caseId ? `CaseMaster:${caseId}` : intent,
            details: { intent, language, sourceCount: result.sources.length, method: result.method },
        });

        return res.status(200).json({ ...result, intent, language, mode: 'live' });
    } catch (error) {
        console.error('Crime chat query failed:', error);
        if (catalystApp) {
            await logAuditEvent(catalystApp, {
                action: 'crime_chat.error',
                target: 'query',
                details: { message: error.message },
            });
        }
        return res.status(error.status || 503).json({ error: 'Crime intelligence query failed', details: error.message });
    }
});

module.exports = app;

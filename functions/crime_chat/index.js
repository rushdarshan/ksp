const express = require('express');
const catalyst = require('zcatalyst-sdk-node');
const { logAuditEvent } = require('../shared/audit-log');

const app = express();
app.use(express.json({ limit: '256kb' }));

const GEMINI_KEY = () => process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash';
const SARVAM_KEY = () => process.env.SARVAM_API_KEY;

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
    if (/missing evidence|evidence gap|completeness|what is missing/i.test(normalized)) return 'evidence_gaps';
    if (/next investigative lead|next lead|prioriti[sz]e|what.*next/i.test(normalized)) return 'next_lead';
    if (/similar case|same modus|same mo|historical match/i.test(normalized)) return 'similar_cases';
    if (/readiness|outcome|case confidence|case strength/i.test(normalized)) return 'readiness_forecast';
    if (/bns|section|legal|punishment|ವಿಧಿ|ಶಿಕ್ಷೆ/u.test(normalized)) return 'legal';
    if (/at large|not arrested|abscond|ಬಂಧನವಾಗದ/u.test(normalized)) return 'accused_at_large';
    if (/hotspot|cluster|where|ಹಾಟ್.?ಸ್ಪಾಟ್/u.test(normalized)) return 'hotspots';
    if (/trend|pattern|compare|increase|decrease|ಮಾದರಿ/u.test(normalized)) return 'trends';
    if (caseId) return 'case_summary';
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
        reasoning: [
            { label: 'Case record', value: 'Registered', impact: 'CaseMaster supplies the controlling FIR facts and station.' },
            { label: 'People linked', value: `${accused.length} accused · ${victims.length} victims`, impact: 'Counts come from direct CaseMasterID relationships.' },
            { label: 'Process status', value: `${arrests.length} arrest events`, impact: 'Absence of a matching row is a review flag, not proof that a person is absconding.' },
        ],
        limitations: ['The supplied schema does not include a complete digital evidence or chain-of-custody table.'],
    };
}

async function investigativeSupport(catalystApp, caseId, intent) {
    const zcql = catalystApp.zcql();
    const [caseRows, accusedRows, victimRows, arrestRows, sectionRows, chargesheetRows] = await Promise.all([
        zcql.executeZCQLQuery(`SELECT * FROM CaseMaster WHERE CaseMasterID = ${caseId} LIMIT 1`),
        zcql.executeZCQLQuery(`SELECT * FROM Accused WHERE CaseMasterID = ${caseId} LIMIT 50`),
        zcql.executeZCQLQuery(`SELECT * FROM Victim WHERE CaseMasterID = ${caseId} LIMIT 50`),
        zcql.executeZCQLQuery(`SELECT * FROM ArrestSurrender WHERE CaseMasterID = ${caseId} LIMIT 50`),
        zcql.executeZCQLQuery(`SELECT * FROM ActSectionAssociation WHERE CaseMasterID = ${caseId} LIMIT 50`),
        zcql.executeZCQLQuery(`SELECT * FROM ChargesheetDetails WHERE CaseMasterID = ${caseId} LIMIT 20`),
    ]);
    const record = unwrap(caseRows[0], 'CaseMaster');
    if (!record.CaseMasterID) return null;
    const accused = accusedRows.map(row => unwrap(row, 'Accused'));
    const victims = victimRows.map(row => unwrap(row, 'Victim'));
    const arrests = arrestRows.map(row => unwrap(row, 'ArrestSurrender'));
    const sections = sectionRows.map(row => unwrap(row, 'ActSectionAssociation'));
    const chargesheets = chargesheetRows.map(row => unwrap(row, 'ChargesheetDetails'));
    const arrestedIds = new Set(arrests.map(item => String(item.AccusedMasterID)));
    const unmatchedAccused = accused.filter(item => !arrestedIds.has(String(item.AccusedMasterID)));
    const sources = [
        { label: `CaseMaster #${caseId}`, table: 'CaseMaster', record: caseId },
        { label: `Accused (${accused.length})`, table: 'Accused', record: caseId },
        { label: `Victim (${victims.length})`, table: 'Victim', record: caseId },
        { label: `ArrestSurrender (${arrests.length})`, table: 'ArrestSurrender', record: caseId },
        { label: `ActSectionAssociation (${sections.length})`, table: 'ActSectionAssociation', record: caseId },
        { label: `ChargesheetDetails (${chargesheets.length})`, table: 'ChargesheetDetails', record: caseId },
    ];
    const limitations = [
        'The supplied schema has no complete evidence inventory, chain-of-custody, CDR, vehicle, bank-account, or forensic-result table.',
        'These results prioritize record review; they do not infer guilt or legal sufficiency.',
    ];

    if (intent === 'evidence_gaps') {
        const checks = [
            { label: 'Victim linkage', ready: victims.length > 0, detail: victims.length ? `${victims.length} record(s) linked` : 'No victim record linked' },
            { label: 'Accused linkage', ready: accused.length > 0, detail: accused.length ? `${accused.length} record(s) linked` : 'No accused record linked' },
            { label: 'Legal classification', ready: sections.length > 0, detail: sections.length ? `${sections.length} provision record(s)` : 'No section association recorded' },
            { label: 'Process event', ready: arrests.length > 0, detail: arrests.length ? `${arrests.length} arrest/surrender event(s)` : 'No arrest or surrender event recorded' },
            { label: 'Chargesheet', ready: chargesheets.length > 0, detail: chargesheets.length ? `${chargesheets.length} chargesheet record(s)` : 'No chargesheet record found' },
        ];
        const complete = checks.filter(check => check.ready).length;
        return {
            answer: `The supplied relational record is complete on ${complete} of ${checks.length} measurable checks. ${checks.filter(check => !check.ready).map(check => check.label).join(', ') || 'No relational gap'} requires review. Digital evidence completeness cannot be calculated because the required evidence tables were not supplied.`,
            sources,
            confidence: 0.91,
            method: 'schema-completeness-check',
            reasoning: checks.map(check => ({ label: check.label, value: check.ready ? 'Recorded' : 'Gap', impact: check.detail })),
            limitations,
        };
    }

    if (intent === 'next_lead') {
        const lead = unmatchedAccused.length
            ? `Verify the current process status and last known location for ${unmatchedAccused[0].AccusedName || 'the unmatched accused'}; no matching ArrestSurrender row was found.`
            : !chargesheets.length
                ? 'Review the legal classification and outstanding evidence before the next supervisory case review; no chargesheet record was found.'
                : 'Reconcile the chargesheet record against the linked legal provisions and victim records before supervisory approval.';
        return {
            answer: lead,
            sources,
            confidence: 0.88,
            method: 'priority-rule-over-relational-gaps',
            reasoning: [
                { label: 'Unmatched accused', value: String(unmatchedAccused.length), impact: 'Accused records without a matching process event receive first review priority.' },
                { label: 'Chargesheet state', value: chargesheets.length ? 'Recorded' : 'Not recorded', impact: 'Determines whether the immediate task is investigation completion or supervisory reconciliation.' },
                { label: 'Legal provisions', value: String(sections.length), impact: 'Provision records define the legal review scope but require officer verification.' },
            ],
            limitations,
        };
    }

    if (intent === 'similar_cases') {
        const head = Number(record.CrimeMajorHeadID || 0);
        const rows = head ? await zcql.executeZCQLQuery(`SELECT CaseMasterID, CrimeNo, PoliceStationID, CrimeMinorHeadID, BriefFacts FROM CaseMaster WHERE CrimeMajorHeadID = ${head} LIMIT 20`) : [];
        const matches = rows.map(row => unwrap(row, 'CaseMaster')).filter(item => Number(item.CaseMasterID) !== Number(caseId)).slice(0, 5);
        return {
            answer: matches.length
                ? `Found ${matches.length} candidates sharing crime major head ${head}. They are candidates for officer comparison, not confirmed linked cases.`
                : 'No same-head comparison cases were found in the current query window.',
            sources: [...sources, { label: `CaseMaster crime-head comparison (${matches.length})`, table: 'CaseMaster' }],
            confidence: matches.length ? 0.84 : 0.4,
            method: 'same-crime-head-retrieval',
            reasoning: matches.map(item => ({
                label: String(item.CrimeNo || `Case ${item.CaseMasterID}`),
                value: `Station ${item.PoliceStationID || 'unknown'}`,
                impact: `Same major crime head${String(item.CrimeMinorHeadID) === String(record.CrimeMinorHeadID) ? ' and minor head' : ''}; compare MO and entities manually.`,
            })),
            limitations: [...limitations, 'Similarity uses recorded crime classification only; narrative embeddings and MO features require validated model deployment.'],
        };
    }

    const factors = [Boolean(record.BriefFacts), victims.length > 0, accused.length > 0, sections.length > 0, arrests.length > 0, chargesheets.length > 0];
    const readiness = Math.round(factors.filter(Boolean).length / factors.length * 100);
    return {
        answer: `Investigation record readiness is ${readiness}% across six observable relational checks. This is a completeness forecast, not a prediction of conviction, guilt, or judicial outcome.`,
        sources,
        confidence: 0.9,
        method: 'transparent-readiness-score',
        reasoning: [
            { label: 'Core narrative', value: record.BriefFacts ? 'Present' : 'Missing', impact: 'Provides the factual basis for downstream review.' },
            { label: 'People coverage', value: `${accused.length + victims.length} records`, impact: 'Measures linked accused and victim records.' },
            { label: 'Procedure coverage', value: `${arrests.length + chargesheets.length} events`, impact: 'Measures recorded arrest/surrender and chargesheet milestones.' },
        ],
        limitations,
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

async function callSarvam(query, history, language) {
    if (!SARVAM_KEY()) throw new Error('SARVAM_API_KEY not configured');
    const messages = [];
    if (history.length) {
        for (const msg of history.slice(-6)) {
            messages.push({ role: msg.role || 'user', content: msg.text || msg.content || '' });
        }
    }
    messages.push({ role: 'user', content: query });
    const resp = await fetch('https://api.sarvam.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-subscription-key': SARVAM_KEY(),
        },
        body: JSON.stringify({
            model: 'sarvam-105b',
            messages,
            temperature: 0.3,
            max_tokens: 512,
        }),
    });
    if (!resp.ok) {
        const errText = await resp.text().catch(() => 'unknown error');
        throw new Error(`Sarvam API returned ${resp.status}: ${errText}`);
    }
    const data = await resp.json();
    const answer = data?.choices?.[0]?.message?.content || 'No response from Sarvam.';
    return {
        answer,
        sources: [{ label: 'Sarvam AI', table: 'LLM' }],
        confidence: 0.65,
        method: 'sarvam-llm',
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
        if (['evidence_gaps', 'next_lead', 'similar_cases', 'readiness_forecast'].includes(intent)) {
            if (!caseId) return res.status(400).json({ error: 'An FIR or case number is required for this copilot action' });
            result = await investigativeSupport(catalystApp, caseId, intent);
        }
        if (intent === 'accused_at_large') result = await accusedAtLarge(catalystApp);
        if (intent === 'hotspots' || intent === 'trends') result = await aggregateIntelligence(catalystApp, intent);
        if (intent === 'legal') result = await legalQuery(analysisQuery);
        if (!result) {
            try {
                result = await callSarvam(analysisQuery, history, language);
            } catch (sarvamErr) {
                console.warn('Sarvam fallback failed:', sarvamErr.message);
                result = {
                    answer: 'I could not ground that request. Try adding an FIR number, crime type, district, or legal provision.',
                    sources: [],
                    confidence: 0.2,
                    method: 'clarification-required',
                };
            }
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

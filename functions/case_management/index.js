const express = require('express');
const catalyst = require('zcatalyst-sdk-node');
const { createSeededRandom } = require('../shared/deterministic');

const app = express();
app.use(express.json());

const STAGES = ['filed', 'assigned', 'evidence_collection', 'witness_examination', 'charge_sheet', 'court_submitted'];
const DEMO_REFERENCE_TIME = new Date('2026-07-15T12:00:00Z');
const DEMO_METADATA = Object.freeze({
    dataSource: 'synthetic_demo',
    synthetic: true,
    note: 'Deterministic in-memory case workflow data for interface demonstration. It is not an official case record.',
    humanReviewRequired: true
});

const CHECKLISTS = {
    theft: ['CCTV requisition', 'Witness identification', 'Scene of crime photographs', 'Neighborhood inquiry', 'Known offender check'],
    assault: ['Medical report collection', 'Witness statements', 'Scene examination', 'Accused arrest memo', 'Weapon recovery'],
    fraud: ['Document seizure memo', 'Financial record requisition', 'Digital evidence collection', 'Witness identification', 'Expert opinion requisition'],
    robbery: ['CCTV requisition', 'Witness identification', 'Scene of crime photographs', 'Weapon recovery', 'Stolen property recovery'],
    burglary: ['CCTV requisition', 'Witness identification', 'Scene of crime photographs', 'Neighborhood inquiry', 'Known offender check', 'Forensic evidence collection'],
    cyber: ['Device seizure', 'IP address tracing', 'Digital evidence collection', 'Forensic image acquisition', 'Service provider notice'],
    sexual: ['Medical report collection', 'Witness statements', 'Scene examination', 'Magistrate statement (BNSS 183)', 'Forensic evidence collection'],
    murder: ['Scene of crime photographs', 'Medical report collection', 'Witness statements', 'Weapon recovery', 'Forensic evidence collection', 'Accused arrest memo'],
    drugs: ['Seizure memo preparation', 'Forensic analysis request', 'Witness identification', 'Source investigation', 'Conspiracy angle investigation'],
    property: ['Document seizure', 'Property valuation', 'Witness identification', 'Title deed verification', 'Known offender check'],
    extortion: ['Threat communication evidence', 'Witness identification', 'Financial transaction records', 'Phone call records collection', 'Accused arrest memo'],
    publicorder: ['Incident report collection', 'Witness statements', 'Video evidence collection', 'Scene examination', 'Accused arrest memo']
};

const LEAD_TEMPLATES = {
    theft: [
        { text: 'Check nearby CCTV cameras for suspect vehicle', weight: 0.9 },
        { text: 'Interview known receivers of stolen property in area', weight: 0.7 },
        { text: 'Compare legally authorized prior-case MO records; do not infer involvement from history', weight: 0.6 }
    ],
    assault: [
        { text: 'Collect medical report from treating hospital', weight: 0.95 },
        { text: 'Identify and interview independent witnesses', weight: 0.8 },
        { text: 'Check for prior incidents between parties', weight: 0.7 }
    ],
    fraud: [
        { text: 'Seek lawful authorization to preserve or freeze relevant accounts', weight: 0.95 },
        { text: 'Collect call detail records for suspect phone numbers', weight: 0.8 },
        { text: 'Verify company registration documents', weight: 0.65 }
    ],
    robbery: [
        { text: 'Review CCTV from all exits within 500m radius', weight: 0.9 },
        { text: 'Canvass for eyewitnesses during time of incident', weight: 0.8 },
        { text: 'Check for stolen property at local pawn shops', weight: 0.65 }
    ],
    burglary: [
        { text: 'Process scene for latent fingerprints', weight: 0.9 },
        { text: 'Check for forced entry tool marks', weight: 0.8 },
        { text: 'Question neighbors about suspicious activity', weight: 0.75 },
        { text: 'Check serial numbers of stolen items on national database', weight: 0.6 }
    ],
    cyber: [
        { text: 'Preserve digital evidence with hash verification', weight: 0.95 },
        { text: 'Trace IP addresses through VPN logs', weight: 0.85 },
        { text: 'Send requisition to platform provider for account data', weight: 0.8 }
    ],
    sexual: [
        { text: 'Ensure victim medical examination completed', weight: 0.95 },
        { text: 'Record the applicable statement before a Magistrate under BNSS 183', weight: 0.9 },
        { text: 'Collect DNA evidence from scene and accused', weight: 0.85 }
    ],
    murder: [
        { text: 'Secure crime scene — no entry without authorization', weight: 0.98 },
        { text: 'Collect post-mortem report', weight: 0.95 },
        { text: 'Trace last known movements of deceased', weight: 0.85 },
        { text: 'Identify and interview family members', weight: 0.8 }
    ],
    drugs: [
        { text: 'Get forensic analysis of seized substance', weight: 0.95 },
        { text: 'Trace supply chain upstream', weight: 0.8 },
        { text: 'Check for linked cases with similar substance', weight: 0.7 }
    ],
    property: [
        { text: 'Verify title deed authenticity with sub-registrar office', weight: 0.9 },
        { text: 'Interview all parties to transaction', weight: 0.8 },
        { text: 'Check for prior property dispute FIRs', weight: 0.7 }
    ],
    extortion: [
        { text: 'Preserve threat communication evidence (messages, calls)', weight: 0.95 },
        { text: 'Trace caller ID / sender information', weight: 0.85 },
        { text: 'Compare legally authorized prior-case MO records; do not infer involvement from history', weight: 0.75 }
    ],
    publicorder: [
        { text: 'Collect and preserve all video footage from scene', weight: 0.9 },
        { text: 'Verify identities named in records and follow lawful process for any action', weight: 0.85 },
        { text: 'Record statements of injured persons', weight: 0.8 }
    ]
};

const OFFICERS = ['Inspector Kumar', 'Inspector Patil', 'Inspector Reddy', 'SI Venkatesh', 'SI Rangaswamy', 'SI Hegde'];

// ponytail: in-memory arrays, migrate to Data Store tables
let CASE_NOTES = [
    { id: 'cn-001', caseId: 142, author: 'Inspector Kumar', text: 'Initial scene of crime visited. Blood samples collected from floor.', timestamp: '2026-07-01T09:00:00Z', linkedEntity: 'evidence-001' },
    { id: 'cn-002', caseId: 142, author: 'SI Venkatesh', text: 'Neighbor witness statement recorded. Confirmed hearing raised voices at 11 PM.', timestamp: '2026-07-01T14:30:00Z', linkedEntity: null },
    { id: 'cn-003', caseId: 142, author: 'Inspector Kumar', text: 'Accused phone CDR analysis pending from service provider.', timestamp: '2026-07-02T08:15:00Z', linkedEntity: 'evidence-003' },
];

let THEORY_BOARDS = [];
let THEORY_CLASSIFICATIONS = [];
let EVIDENCE_REVIEW_STATE = [];
let AUDIT_LOG = [];

function generateCases() {
    const cases = [];
    const crimeTypes = Object.keys(CHECKLISTS);

    for (let i = 1001; i <= 1020; i++) {
        const demoIndex = i - 1001;
        const crimeType = crimeTypes[i % crimeTypes.length];
        const stageIdx = i % STAGES.length;
        const filedDate = new Date(DEMO_REFERENCE_TIME.getTime() - (demoIndex * 9 + 6) * 3600000);
        const hoursSinceFiled = Math.floor((DEMO_REFERENCE_TIME.getTime() - filedDate.getTime()) / 3600000);
        const random = createSeededRandom(`case:${i}:v2`);

        const checklist = CHECKLISTS[crimeType].map((item, ci) => ({
            id: `${i}-${ci}`,
            text: item,
            done: ci < stageIdx
        }));

        const leads = LEAD_TEMPLATES[crimeType].map((t, li) => ({
            id: `lead-${i}-${li}`,
            text: t.text,
            relevance: +Math.min(0.99, Math.max(0.01, t.weight + (random() - 0.5) * 0.08)).toFixed(3),
            status: li < stageIdx ? 'completed' : 'pending',
            created_at: filedDate.toISOString()
        }));

        cases.push({
            caseId: i,
            firNo: `FIR-${i}`,
            districtId: (i % 20) + 1,
            crimeType,
            stage: STAGES[stageIdx],
            officer: OFFICERS[i % OFFICERS.length],
            filedDate: filedDate.toISOString(),
            goldenPeriodRemainingHours: Math.max(0, 72 - hoursSinceFiled),
            checklist,
            leads,
            checklistCompletion: Math.round((checklist.filter(c => c.done).length / checklist.length) * 100),
            victimName: `Victim ${i}`,
            accusedName: i % 3 === 0 ? null : `Accused ${i}`,
            location: `Location ${i}`
        });
    }
    return cases;
}

let CASES = generateCases();

app.get('/case-management/cases', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const { stage, officer, district } = req.query;
        let filtered = [...CASES];
        if (stage) filtered = filtered.filter(c => c.stage === stage);
        if (officer) filtered = filtered.filter(c => c.officer === officer);
        if (district) filtered = filtered.filter(c => c.districtId === parseInt(district));
        res.status(200).json({ cases: filtered, total: filtered.length, metadata: DEMO_METADATA });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch cases', details: err.message });
    }
});

app.get('/case-management/cases/expiring', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const expiring = CASES
            .filter(c => c.goldenPeriodRemainingHours <= 12 && c.stage !== 'court_submitted')
            .sort((a, b) => a.goldenPeriodRemainingHours - b.goldenPeriodRemainingHours);
        res.status(200).json({ cases: expiring, total: expiring.length, metadata: DEMO_METADATA });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch expiring cases', details: err.message });
    }
});

app.get('/case-management/cases/:id', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const c = CASES.find(x => x.caseId === parseInt(req.params.id));
        if (!c) return res.status(404).json({ error: 'Case not found' });
        res.status(200).json({ ...c, metadata: DEMO_METADATA });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch case', details: err.message });
    }
});

app.put('/case-management/cases/:id/stage', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const c = CASES.find(x => x.caseId === parseInt(req.params.id));
        if (!c) return res.status(404).json({ error: 'Case not found' });
        const { stage } = req.body;
        if (!STAGES.includes(stage)) return res.status(400).json({ error: `Invalid stage. Must be one of: ${STAGES.join(', ')}` });
        c.stage = stage;
        res.status(200).json({ caseId: c.caseId, stage: c.stage, metadata: DEMO_METADATA });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update stage', details: err.message });
    }
});

app.put('/case-management/cases/:id/checklist/:itemId', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const c = CASES.find(x => x.caseId === parseInt(req.params.id));
        if (!c) return res.status(404).json({ error: 'Case not found' });
        const item = c.checklist.find(x => x.id === req.params.itemId);
        if (!item) return res.status(404).json({ error: 'Checklist item not found' });
        item.done = !item.done;
        c.checklistCompletion = Math.round((c.checklist.filter(x => x.done).length / c.checklist.length) * 100);
        res.status(200).json({ caseId: c.caseId, checklistCompletion: c.checklistCompletion, checklist: c.checklist, metadata: DEMO_METADATA });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update checklist', details: err.message });
    }
});

app.get('/case-management/cases/:id/leads', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const c = CASES.find(x => x.caseId === parseInt(req.params.id));
        if (!c) return res.status(404).json({ error: 'Case not found' });
        const sorted = [...c.leads].sort((a, b) => b.relevance - a.relevance);
        res.status(200).json({ leads: sorted, metadata: DEMO_METADATA });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch leads', details: err.message });
    }
});

app.get('/case-management/stages', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        res.status(200).json({ stages: STAGES, metadata: DEMO_METADATA });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch stages', details: err.message });
    }
});

app.get('/case-management/stats', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const stats = STAGES.map(s => ({ stage: s, count: CASES.filter(c => c.stage === s).length }));
        const expiringCount = CASES.filter(c => c.goldenPeriodRemainingHours <= 12 && c.stage !== 'court_submitted').length;
        const avgCompletion = Math.round(CASES.reduce((s, c) => s + c.checklistCompletion, 0) / CASES.length);
        res.status(200).json({ stageCounts: stats, expiringCases: expiringCount, avgChecklistCompletion: avgCompletion, metadata: DEMO_METADATA });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch stats', details: err.message });
    }
});

app.get('/case-management/notifications', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const caseId = parseInt(req.query.caseId);
        if (caseId) {
            const c = CASES.find(x => x.caseId === caseId);
            if (!c) return res.status(404).json({ error: 'Case not found' });
            return res.status(200).json({
                caseId: c.caseId,
                firNo: c.firNo,
                currentStage: c.stage,
                lastUpdated: c.filedDate,
                notifications: [
                    { type: 'stage_change', message: `Case ${c.firNo} moved to ${c.stage}`, timestamp: c.filedDate },
                    { type: 'golden_timer', message: `Golden period: ${c.goldenPeriodRemainingHours}h remaining`, timestamp: c.filedDate }
                ],
                metadata: DEMO_METADATA
            });
        }
        const all = CASES.map(c => ({
            caseId: c.caseId,
            firNo: c.firNo,
            currentStage: c.stage,
            lastUpdated: c.filedDate,
            unread: true,
            notificationCount: 2
        }));
        res.status(200).json({ notifications: all, total: all.length, metadata: DEMO_METADATA });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch notifications', details: err.message });
    }
});

module.exports = app;

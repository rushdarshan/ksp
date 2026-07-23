const express = require('express');
const catalyst = require('zcatalyst-sdk-node');

const app = express();
app.use(express.json());

const MO_KEYWORDS = [
    'forced', 'broke', 'lock', 'window', 'mask', 'gloves', 'weapon',
    'knife', 'gun', 'threatened', 'demanded', 'ransom', 'burglary',
    'pickpocket', 'snatched', 'scammed', 'impersonated'
];

function computeReadiness({ narrative, evidenceTypes, delayHours, witnessCount, suspectIdentified }) {
    const factors = [];
    const evidence = Array.isArray(evidenceTypes) ? evidenceTypes : [];
    const evidenceScore = Math.min(30, evidence.length * 6);
    factors.push({ name: 'Recorded evidence types', score: evidenceScore, max: 30 });

    const delay = Number.isFinite(Number(delayHours)) ? Math.max(0, Number(delayHours)) : null;
    const delayScore = delay === null ? 0 : delay <= 24 ? 15 : delay <= 72 ? 11 : delay <= 168 ? 7 : 3;
    factors.push({ name: 'Reporting timeline recorded', score: delayScore, max: 15 });

    const text = (narrative || '').toLowerCase();
    const moMatches = MO_KEYWORDS.filter(keyword => text.includes(keyword)).length;
    const moScore = Math.min(10, moMatches * 2);
    factors.push({ name: 'Incident method detail', score: moScore, max: 10 });

    const specificityMarkers = (text.match(/\b(?:\d{1,2}:\d{2}|\d{4}-\d{2}-\d{2}|road|street|junction|station|vehicle|phone|cctv)\b/g) || []).length;
    const specificityScore = Math.min(10, specificityMarkers * 2);
    factors.push({ name: 'Time, place, and identifier detail', score: specificityScore, max: 10 });

    const witnesses = Math.max(0, parseInt(witnessCount, 10) || 0);
    const witnessScore = witnesses >= 3 ? 20 : witnesses === 2 ? 15 : witnesses === 1 ? 8 : 0;
    factors.push({ name: 'Witness records', score: witnessScore, max: 20 });

    const suspectScore = suspectIdentified ? 15 : 0;
    factors.push({ name: 'Named or described suspect', score: suspectScore, max: 15 });

    const readinessScore = Math.min(100, factors.reduce((sum, factor) => sum + factor.score, 0));
    const uncertaintyBand = readinessScore >= 20 && readinessScore <= 80 ? 15 : 8;
    return { readinessScore, solvabilityScore: readinessScore, uncertaintyBand, factors };
}

app.post('/solvability', async (req, res) => {
    try {
        catalyst.initialize(req);
        const { narrative, firNo, firYear, evidenceTypes, delayHours, witnessCount, suspectIdentified } = req.body;
        if (!firNo) return res.status(400).json({ error: 'firNo is required' });

        const result = computeReadiness({ narrative, evidenceTypes, delayHours, witnessCount, suspectIdentified });
        res.status(200).json({
            ...result,
            firNo,
            firYear: firYear || null,
            label: 'HUMAN REVIEW REQUIRED',
            note: 'Heuristic evidence-completeness signal. It is not a prediction of guilt, conviction, or case outcome.',
            dataSource: 'submitted_case_fields',
            humanReviewRequired: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Case readiness analysis failed', details: err.message });
    }
});

module.exports = app;

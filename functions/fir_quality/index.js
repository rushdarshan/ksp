const express = require('express');
const catalyst = require('zcatalyst-sdk-node');
const { computeQualityScore } = require('../shared/quality_score');

const app = express();
app.use(express.json());

const CRIME_TYPES = ['theft', 'assault', 'fraud', 'robbery', 'burglary', 'cyber', 'sexual', 'murder', 'drugs', 'property', 'extortion', 'publicorder'];

const SYNTHETIC_FIRS = [
    { firNo: 'FIR001', crimeType: 'theft', qualityScore: 82, topFlag: 'Well-documented' },
    { firNo: 'FIR002', crimeType: 'assault', qualityScore: 45, topFlag: 'Missing witness statements' },
    { firNo: 'FIR003', crimeType: 'fraud', qualityScore: 67, topFlag: 'Partial evidence' },
    { firNo: 'FIR004', crimeType: 'robbery', qualityScore: 31, topFlag: 'Minimal narrative' },
    { firNo: 'FIR005', crimeType: 'burglary', qualityScore: 73, topFlag: 'Good location detail' },
    { firNo: 'FIR006', crimeType: 'cyber', qualityScore: 28, topFlag: 'Incomplete technical details' },
    { firNo: 'FIR007', crimeType: 'sexual', qualityScore: 55, topFlag: 'Delay not justified' },
    { firNo: 'FIR008', crimeType: 'murder', qualityScore: 88, topFlag: 'Comprehensive documentation' },
    { firNo: 'FIR009', crimeType: 'drugs', qualityScore: 41, topFlag: 'Missing evidence chain' },
    { firNo: 'FIR010', crimeType: 'property', qualityScore: 63, topFlag: 'Partial valuation' }
];

const CRIME_AVERAGES = {};
for (const ct of CRIME_TYPES) {
    const matching = SYNTHETIC_FIRS.filter(f => f.crimeType === ct);
    if (matching.length > 0) {
        const avg = Math.round(matching.reduce((s, f) => s + f.qualityScore, 0) / matching.length);
        CRIME_AVERAGES[ct] = { averageScore: avg, count: matching.length };
    } else {
        CRIME_AVERAGES[ct] = { averageScore: 60, count: 5 };
    }
}

app.post('/fir-quality', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const body = req.body;

        if (!body || Object.keys(body).length === 0) {
            return res.status(400).json({ error: 'Request body is required' });
        }

        const result = computeQualityScore(body);

        res.status(200).json({
            ...result,
            firNo: body.firNo || null,
            note: 'Heuristic quality score — not validated against ground truth'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'FIR quality analysis failed', details: err.message });
    }
});

app.get('/fir-quality/lowest', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        res.status(200).json({
            firs: SYNTHETIC_FIRS.sort((a, b) => a.qualityScore - b.qualityScore),
            note: 'Synthetic demo data — 10 representative FIRs'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to load lowest-quality FIRs', details: err.message });
    }
});

app.get('/fir-quality/crime-types', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        res.status(200).json({
            crimeTypes: CRIME_AVERAGES,
            note: 'Average scores by crime type — based on synthetic sample'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to load crime type averages', details: err.message });
    }
});

module.exports = app;

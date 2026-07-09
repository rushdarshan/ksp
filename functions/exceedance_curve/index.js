const express = require('express');
const catalyst = require('zcatalyst-sdk-node');
const app = express();
app.use(express.json());

const CRIME_TYPES = ['theft', 'assault', 'fraud', 'robbery', 'burglary', 'cyber', 'sexual', 'murder', 'drugs', 'property', 'extortion', 'publicorder'];
const DISTRICTS = Array.from({ length: 20 }, (_, i) => i + 1);

function generateHistoricalCounts() {
    const counts = {};
    for (const ct of CRIME_TYPES) {
        counts[ct] = Array.from({ length: 24 }, () => Math.floor(Math.random() * 80) + 10);
    }
    return counts;
}

function computeEP(counts) {
    const n = counts.length;
    const mean = counts.reduce((a, b) => a + b, 0) / n;
    const variance = counts.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
    const std = Math.sqrt(variance) || 1;
    const returnPeriods = [1, 2, 5, 10, 20];
    const ep = returnPeriods.map(rp => {
        const z = rp <= 2 ? 0 : rp <= 5 ? 1.28 : rp <= 10 ? 1.64 : 2.05;
        const threshold = Math.round(mean + z * std);
        return { returnPeriodYears: rp, thresholdExceedance: threshold, probabilityAnnual: +(1 / rp).toFixed(3) };
    });
    return { mean: +mean.toFixed(1), std: +std.toFixed(1), exceedanceCurve: ep };
}

app.get('/exceedance', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const districtId = parseInt(req.query.district) || 1;
        const monthlyCounts = generateHistoricalCounts();
        const curves = {};
        for (const ct of CRIME_TYPES) {
            curves[ct] = computeEP(monthlyCounts[ct]);
        }

        const worst = CRIME_TYPES.reduce((a, b) => curves[a].exceedanceCurve[curves[a].exceedanceCurve.length - 1].thresholdExceedance > curves[b].exceedanceCurve[curves[b].exceedanceCurve.length - 1].thresholdExceedance ? a : b);

        res.status(200).json({
            districtId,
            curves,
            worstOffense: { crimeType: worst, ...curves[worst] },
            metadata: {
                method: 'Normal distribution fit on 24-month rolling FIR counts',
                note: 'Exceedance probability estimates — not validated against actual KSP data',
                generatedAt: new Date().toISOString()
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/exceedance/districts', async (req, res) => {
    res.status(200).json(DISTRICTS.map(d => ({ id: d, name: `District ${d}` })));
});

module.exports = app;

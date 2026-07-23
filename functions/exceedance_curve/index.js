const express = require('express');
const catalyst = require('zcatalyst-sdk-node');
const { DEMO_GENERATED_AT, createSeededRandom, intBetween } = require('../shared/deterministic');
const app = express();
app.use(express.json());

const CRIME_TYPES = ['theft', 'assault', 'fraud', 'robbery', 'burglary', 'cyber', 'sexual', 'murder', 'drugs', 'property', 'extortion', 'publicorder'];
const DISTRICTS = Array.from({ length: 20 }, (_, i) => i + 1);

function generateHistoricalCounts(seed) {
    const random = createSeededRandom(seed);
    const counts = {};
    for (const [crimeIndex, ct] of CRIME_TYPES.entries()) {
        const baseline = 14 + crimeIndex * 2 + intBetween(random, 0, 12);
        counts[ct] = Array.from({ length: 24 }, (_, monthIndex) => {
            const seasonal = Math.sin(((monthIndex % 12) / 12) * Math.PI * 2) * (3 + crimeIndex % 4);
            const variation = intBetween(random, -4, 5);
            return Math.max(1, Math.round(baseline + seasonal + variation));
        });
    }
    return counts;
}

function buildHistoricalCounts(rows) {
    const parsed = rows.map(row => {
        const crimeHeadId = parseInt(row.CaseMaster?.CrimeHeadID || row.CrimeHeadID || 0);
        const dateValue = row.CaseMaster?.IncidentFromDate || row.IncidentFromDate;
        const date = new Date(dateValue);
        return { crimeHeadId, date };
    }).filter(item => item.crimeHeadId > 0 && !Number.isNaN(item.date.getTime()));

    const endDate = parsed.reduce((latest, item) => item.date > latest ? item.date : latest, new Date(0));
    const effectiveEnd = endDate.getTime() > 0 ? endDate : new Date('2026-06-30T00:00:00Z');
    const monthKeys = Array.from({ length: 24 }, (_, index) => {
        const date = new Date(Date.UTC(effectiveEnd.getUTCFullYear(), effectiveEnd.getUTCMonth() - (23 - index), 1));
        return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
    });
    const monthIndex = new Map(monthKeys.map((key, index) => [key, index]));
    const counts = Object.fromEntries(CRIME_TYPES.map(type => [type, Array(24).fill(0)]));

    for (const item of parsed) {
        const type = CRIME_TYPES[item.crimeHeadId - 1];
        const key = `${item.date.getUTCFullYear()}-${String(item.date.getUTCMonth() + 1).padStart(2, '0')}`;
        if (type && monthIndex.has(key)) counts[type][monthIndex.get(key)] += 1;
    }
    return { counts, periodStart: monthKeys[0], periodEnd: monthKeys[monthKeys.length - 1] };
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
        const districtId = Math.min(20, Math.max(1, parseInt(req.query.district) || 1));
        let monthlyCounts;
        let sourceMetadata;

        try {
            const rows = await catalystApp.zcql().executeZCQLQuery(
                `SELECT CrimeHeadID, IncidentFromDate FROM CaseMaster WHERE DistrictID = ${districtId}`
            );
            const historical = buildHistoricalCounts(rows || []);
            monthlyCounts = historical.counts;
            sourceMetadata = {
                dataSource: 'catalyst_data_store',
                synthetic: false,
                periodStart: historical.periodStart,
                periodEnd: historical.periodEnd
            };
        } catch (dataError) {
            console.warn('Data Store query failed, using deterministic demo counts:', dataError.message);
            monthlyCounts = generateHistoricalCounts(`exceedance:${districtId}:v2`);
            sourceMetadata = {
                dataSource: 'synthetic_demo',
                synthetic: true,
                periodStart: '2024-07',
                periodEnd: '2026-06'
            };
        }
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
                ...sourceMetadata,
                method: 'Normal distribution fit on 24-month rolling FIR counts',
                note: sourceMetadata.synthetic
                    ? 'Illustrative thresholds from deterministic synthetic counts. Do not use for deployment decisions.'
                    : 'Descriptive statistical thresholds from available FIR rows. This is not a validated forecast.',
                humanReviewRequired: true,
                generatedAt: sourceMetadata.synthetic ? DEMO_GENERATED_AT : new Date().toISOString()
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

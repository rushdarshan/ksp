const express = require('express');
const catalyst = require('zcatalyst-sdk-node');
const app = express();
app.use(express.json());

const CRIME_TYPES = ['theft', 'assault', 'fraud', 'robbery', 'burglary', 'cyber', 'sexual', 'murder', 'drugs', 'property', 'extortion', 'publicorder'];
const DISTRICTS = Array.from({ length: 20 }, (_, i) => i + 1);

function generateDailyCounts(days = 180, burstDays = []) {
    const series = [];
    const now = new Date();
    for (let d = days - 1; d >= 0; d--) {
        const date = new Date(now);
        date.setDate(date.getDate() - d);
        let count = Math.floor(Math.random() * 8) + 2;
        if (burstDays.includes(d)) count += Math.floor(Math.random() * 15) + 10;
        series.push({ date: date.toISOString().split('T')[0], count });
    }
    return series;
}

function blsDetect(series, crimeType) {
    const values = series.map(s => s.count);
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
    const std = Math.sqrt(variance) || 1;
    const transits = [];

    for (let width = 3; width <= 21; width += 3) {
        for (let start = 0; start + width <= n; start += 1) {
            const inside = values.slice(start, start + width);
            const outside = [...values.slice(0, start), ...values.slice(start + width)];
            const insideMean = inside.reduce((a, b) => a + b, 0) / width;
            const outsideMean = outside.length > 0 ? outside.reduce((a, b) => a + b, 0) / outside.length : 0;
            const delta = insideMean - outsideMean;
            if (delta <= 0) continue;
            const snr = delta / std;
            if (snr > 1.5) {
                transits.push({
                    startDate: series[start].date,
                    endDate: series[start + width - 1].date,
                    durationDays: width,
                    amplitude: +delta.toFixed(1),
                    significance: +snr.toFixed(2),
                    avgCount: +insideMean.toFixed(1),
                    baselineCount: +outsideMean.toFixed(1)
                });
            }
        }
    }

    transits.sort((a, b) => b.significance - a.significance);
    return transits.slice(0, 10);
}

app.get('/transit-detection', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const districtId = parseInt(req.query.district) || 1;
        const crimeType = req.query.crimeType || 'theft';

        const burstDays = [];
        for (let i = 0; i < 3; i++) burstDays.push(Math.floor(Math.random() * 180));
        const series = generateDailyCounts(180, burstDays);
        const transits = blsDetect(series, crimeType);

        res.status(200).json({
            districtId,
            crimeType,
            timeSeries: series,
            detectedTransits: transits,
            metadata: {
                algorithm: 'Box-Least-Squares (adapted from Kovács et al. 2002)',
                minDurationDays: 3,
                maxDurationDays: 21,
                significanceThreshold: 1.5,
                note: 'Synthetic daily crime data for demo — real deployment uses FIR filing dates'
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/transit-detection/districts', async (req, res) => {
    res.status(200).json(DISTRICTS.map(d => ({ id: d, name: `District ${d}` })));
});

module.exports = app;

const express = require('express');
const catalyst = require('zcatalyst-sdk-node');
const { createSeededRandom, intBetween } = require('../shared/deterministic');
const app = express();
app.use(express.json());

const CRIME_TYPES = ['theft', 'assault', 'fraud', 'robbery', 'burglary', 'cyber', 'sexual', 'murder', 'drugs', 'property', 'extortion', 'publicorder'];
const DISTRICTS = Array.from({ length: 20 }, (_, i) => i + 1);

function generateDailyCounts(days = 180, burstDays = [], seed = 'transit:v2') {
    const series = [];
    const random = createSeededRandom(seed);
    const endDate = new Date('2026-07-15T00:00:00Z');
    for (let d = days - 1; d >= 0; d--) {
        const date = new Date(endDate);
        date.setUTCDate(date.getUTCDate() - d);
        let count = intBetween(random, 2, 9);
        if (burstDays.includes(d)) count += intBetween(random, 10, 24);
        series.push({ date: date.toISOString().split('T')[0], count });
    }
    return series;
}

function buildDailyCounts(rows, days = 180) {
    const parsedDates = (rows || []).map(row => {
        const value = row.CaseMaster?.IncidentFromDate || row.IncidentFromDate;
        return new Date(value);
    }).filter(date => !Number.isNaN(date.getTime()));
    const latest = parsedDates.reduce((value, date) => date > value ? date : value, new Date(0));
    const endDate = latest.getTime() > 0 ? latest : new Date('2026-07-15T00:00:00Z');
    const countByDate = {};
    for (const date of parsedDates) {
        const key = date.toISOString().split('T')[0];
        countByDate[key] = (countByDate[key] || 0) + 1;
    }
    return Array.from({ length: days }, (_, index) => {
        const date = new Date(endDate);
        date.setUTCDate(date.getUTCDate() - (days - 1 - index));
        const key = date.toISOString().split('T')[0];
        return { date: key, count: countByDate[key] || 0 };
    });
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
        const requestedCrimeType = String(req.query.crimeType || 'theft').toLowerCase();
        const crimeType = CRIME_TYPES.includes(requestedCrimeType) ? requestedCrimeType : 'theft';

        let series;
        let synthetic = false;
        try {
            const crimeHeadId = CRIME_TYPES.indexOf(crimeType) + 1;
            const rows = await catalystApp.zcql().executeZCQLQuery(
                `SELECT IncidentFromDate FROM CaseMaster WHERE DistrictID = ${districtId} AND CrimeHeadID = ${crimeHeadId}`
            );
            series = buildDailyCounts(rows, 180);
        } catch (dataError) {
            console.warn('Data Store query failed, using deterministic synthetic demo series:', dataError.message);
            synthetic = true;
            const random = createSeededRandom(`transit-bursts:${districtId}:${crimeType}:v2`);
            const burstDays = new Set();
            while (burstDays.size < 3) burstDays.add(intBetween(random, 10, 169));
            series = generateDailyCounts(180, [...burstDays], `transit-series:${districtId}:${crimeType}:v2`);
        }
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
                dataSource: synthetic ? 'synthetic_demo' : 'catalyst_data_store',
                synthetic,
                modelValidationStatus: 'not_established',
                note: synthetic
                    ? 'Deterministic synthetic daily counts for interface demonstration. Detected windows are not verified crime events.'
                    : 'Detected windows are descriptive signals from available FIR dates, not a validated forecast or proof of a crime pattern.',
                humanReviewRequired: true
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

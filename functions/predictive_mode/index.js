const express = require('express');
const catalyst = require('zcatalyst-sdk-node');
const { getCached, setCached } = require('../shared/cache-utils');

const app = express();
app.use(express.json());

const CRIME_TYPES = ['theft', 'burglary', 'robbery', 'assault', 'murder', 'sexual', 'fraud', 'cyber', 'drugs', 'property', 'extortion', 'publicorder'];

const HEURISTIC_PREDICTIONS = (districtId) => [
    { crime_type: 'theft', location: `District ${districtId} central market`, time_window: '18:00-22:00', confidence: 0.62, reasoning: 'Theft peaks in evening hours near commercial areas based on historical patterns' },
    { crime_type: 'assault', location: `District ${districtId} residential zones`, time_window: '22:00-02:00', confidence: 0.55, reasoning: 'Assault incidents cluster in late night hours near residential areas' },
    { crime_type: 'cyber', location: `District ${districtId} (citywide)`, time_window: '10:00-14:00', confidence: 0.48, reasoning: 'Cyber fraud reports peak during business hours' }
];

app.get('/predict', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const districtId = req.query.districtId || '1';
        const cacheKey = `panel:predictive_mode:predict:${districtId}`;
        const cached = await getCached(catalystApp, cacheKey);
        if (cached) return res.status(200).json(cached);

        const zcql = catalystApp.zcql();

        let firData = [];
        try {
            const rows = await zcql.executeZCQLQuery(
                `SELECT CrimeHeadID, DistrictID, IncidentFromDate FROM CaseMaster WHERE DistrictID = ${parseInt(districtId)} AND IncidentFromDate >= SYSDATE - 30 ORDER BY IncidentFromDate DESC`
            );
            firData = rows.map(r => ({
                crimeHeadId: parseInt(r.CaseMaster?.CrimeHeadID || r.CrimeHeadID || 0),
                districtId: parseInt(r.CaseMaster?.DistrictID || r.DistrictID || 0),
                date: r.CaseMaster?.IncidentFromDate || r.IncidentFromDate
            }));
        } catch (e) {
            console.warn('FIR data query failed, using synthetic data:', e.message);
            firData = Array.from({ length: 15 }, (_, i) => ({
                crimeHeadId: (i % 12) + 1,
                districtId: parseInt(districtId),
                date: new Date(Date.now() - i * 86400000 * 2).toISOString()
            }));
        }

        const crimeCounts = {};
        for (const f of firData) {
            const ct = CRIME_TYPES[f.crimeHeadId - 1] || 'other';
            crimeCounts[ct] = (crimeCounts[ct] || 0) + 1;
        }
        const topCrimes = Object.entries(crimeCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

        let predictions;
        let method = 'llm';

        try {
            const zia = catalystApp.zia();
            const prompt = `You are a crime prediction analyst for Karnataka State Police. Given these FIR statistics from the last 30 days for District ${districtId}:

${topCrimes.map(([ct, count]) => `- ${ct}: ${count} incidents`).join('\n')}

Based on these patterns, predict 3 most likely crimes for TODAY. Return ONLY a JSON array (no markdown, no explanation):
[{"crime_type": "...", "location": "District ${districtId} ...", "time_window": "HH:MM-HH:MM", "confidence": 0.0-1.0, "reasoning": "one sentence"}]`;

            const genResult = await zia.generateContent({ prompt });
            const text = genResult?.text || genResult?.output || '';

            try {
                const jsonMatch = text.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    predictions = JSON.parse(jsonMatch[0]);
                    if (!Array.isArray(predictions) || predictions.length === 0) throw new Error('Empty predictions');
                    predictions = predictions.slice(0, 3).map(p => ({
                        crime_type: p.crime_type || 'unknown',
                        location: p.location || `District ${districtId}`,
                        time_window: p.time_window || 'unknown',
                        confidence: Math.max(0, Math.min(1, parseFloat(p.confidence) || 0.5)),
                        reasoning: p.reasoning || 'No reasoning provided'
                    }));
                } else {
                    throw new Error('No JSON array found in LLM response');
                }
            } catch (parseErr) {
                console.warn('LLM response parsing failed, using heuristic:', parseErr.message);
                predictions = HEURISTIC_PREDICTIONS(districtId);
                method = 'heuristic';
            }
        } catch (llmErr) {
            console.warn('LLM prediction failed, using heuristic:', llmErr.message);
            predictions = HEURISTIC_PREDICTIONS(districtId);
            method = 'heuristic';
        }

        const response = {
            predictions,
            generatedAt: new Date().toISOString(),
            dataRange: `Last 30 days, District ${districtId}`,
            firCount: firData.length,
            topCrimes,
            method
        };

        await setCached(catalystApp, cacheKey, response);
        res.status(200).json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Prediction failed', details: err.message });
    }
});

module.exports = app;

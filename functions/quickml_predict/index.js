const express = require('express');
const catalyst = require('zcatalyst-sdk-node');
const { getCached, setCached } = require('../shared/cache-utils');
const { createSeededRandom, numberBetween } = require('../shared/deterministic');

const app = express();
app.use(express.json());

const CRIME_TYPES = ['theft', 'burglary', 'robbery', 'assault', 'murder', 'sexual', 'fraud', 'cyber', 'drugs', 'property', 'extortion', 'publicorder'];

function seededRand(seed, index) {
    const x = Math.sin(seed + index) * 10000;
    return x - Math.floor(x);
}

app.get('/predict', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const quickml = catalystApp.quickML();
        const zcql = catalystApp.zcql();

        const districtId = Math.max(1, parseInt(req.query.districtId) || 1);
        const gridSize = parseFloat(req.query.gridSize) || 0.02;
        const weightByVeracityRequested = req.query.weightByVeracity === 'true';
        const cacheKey = `panel:quickml_predict:predict:v2:${districtId}:${gridSize}:${weightByVeracityRequested}`;
        const cached = await getCached(catalystApp, cacheKey);
        if (cached) return res.status(200).json(cached);

        const centerLat = 12.9716 + (districtId - 1) * 0.5;
        const centerLng = 77.5946 + (districtId - 1) * 0.3;
        const seed = parseInt(districtId) * 1000 + Math.floor(gridSize * 100);

        const features = [];
        for (let i = 0; i < 20; i++) {
            features.push({
                latitude: centerLat + (seededRand(seed, i * 4) - 0.5) * gridSize * 10,
                longitude: centerLng + (seededRand(seed, i * 4 + 1) - 0.5) * gridSize * 10,
                hour: Math.floor(seededRand(seed, i * 4 + 2) * 24),
                day_of_week: Math.floor(seededRand(seed, i * 4 + 3) * 7),
                month: Math.floor(seededRand(seed, i * 4 + 4) * 12) + 1,
                CourtID: (i % 2) + 1,
                risk_baseline: 0.5
            });
        }

        let preds;
        let predictionSource = 'quickml_model';
        try {
            const result = await quickml.predict('hotspot_model', features);
            preds = result?.predictions || result?.data?.predictions;
            if (!Array.isArray(preds) || preds.length === 0) {
                throw new Error('QuickML returned no prediction array');
            }
        } catch (mlErr) {
            console.warn('QuickML unavailable, attempting a Data Store-derived fallback:', mlErr.message);
            try {
                const rows = await zcql.executeZCQLQuery(
                    `SELECT CrimeHeadID, COUNT(*) as cnt FROM CaseMaster WHERE DistrictID = ${districtId} GROUP BY CrimeHeadID`
                );
                const counts = {};
                for (const row of rows || []) {
                    const crimeHeadId = parseInt(row.CaseMaster?.CrimeHeadID || row.CrimeHeadID || 0);
                    counts[crimeHeadId] = parseInt(row.CaseMaster?.cnt || row.cnt || row['COUNT(*)'] || 0);
                }
                const maxCount = Math.max(...Object.values(counts), 1);
                preds = features.map((feature, index) => {
                    const crimeHeadId = (index % CRIME_TYPES.length) + 1;
                    return +(0.2 + ((counts[crimeHeadId] || 0) / maxCount) * 0.65).toFixed(4);
                });
                predictionSource = 'catalyst_data_store_derived';
            } catch (dataError) {
                console.warn('Data Store fallback unavailable, using deterministic synthetic demo predictions:', dataError.message);
                const random = createSeededRandom(`hotspot:${districtId}:${gridSize}:v2`);
                preds = features.map(() => numberBetween(random, 0.24, 0.82, 4));
                predictionSource = 'synthetic_demo';
            }
        }

        const normalizeRisk = value => {
            const candidate = typeof value === 'number'
                ? value
                : value?.risk ?? value?.score ?? value?.probability ?? value?.prediction;
            const parsed = Number(candidate);
            return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : 0.5;
        };
        const hotspots = features.map((f, i) => ({
            lat: f.latitude,
            lng: f.longitude,
            risk: normalizeRisk(preds[i]),
            crimeType: CRIME_TYPES[i % CRIME_TYPES.length]
        }));

        const response = {
            hotspots,
            metadata: {
                dataSource: predictionSource,
                synthetic: predictionSource === 'synthetic_demo',
                modelValidationStatus: 'not_established',
                credibilityWeightingApplied: false,
                credibilityWeightingRequestIgnored: weightByVeracityRequested,
                note: predictionSource === 'quickml_model'
                    ? 'QuickML output for analyst review. No operational validation is asserted.'
                    : predictionSource === 'catalyst_data_store_derived'
                        ? 'Deterministic relative-density fallback from available FIR counts; not a model forecast.'
                        : 'Deterministic synthetic hotspot scenario for interface demonstration; not verified incidents.',
                humanReviewRequired: true
            }
        };

        await setCached(catalystApp, cacheKey, response);
        res.status(200).json(response);
    } catch (err) {
        console.error(err);
        res.status(500).send('Prediction Error');
    }
});

module.exports = app;

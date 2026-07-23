const express = require('express');
const catalyst = require('zcatalyst-sdk-node');
const { createSeededRandom } = require('../shared/deterministic');

const app = express();
app.use(express.json());

const CRIME_TYPES = ['theft', 'assault', 'fraud', 'robbery', 'burglary', 'cyber', 'sexual', 'murder', 'drugs', 'property', 'extortion', 'publicorder'];

const DISTRICT_NAMES = [
    'District 1', 'District 2', 'District 3', 'District 4', 'District 5',
    'District 6', 'District 7', 'District 8', 'District 9', 'District 10',
    'District 11', 'District 12', 'District 13', 'District 14', 'District 15',
    'District 16', 'District 17', 'District 18', 'District 19', 'District 20'
];

const MODELS = ['xgb_hotspot', 'solvability_index', 'victim_risk_shield'];

function generatePredictions(model) {
    const predictions = [];
    const random = createSeededRandom(`fairness-audit:${model}:v2`);
    for (let d = 1; d <= 20; d++) {
        for (let c = 0; c < 12; c++) {
            const baseAccuracy = model === 'xgb_hotspot' ? 0.75 :
                model === 'solvability_index' ? 0.65 : 0.55;
            const disparityFactor = d <= 7 ? 0.05 : d <= 14 ? -0.05 : -0.10;
            const accuracy = Math.min(0.95, Math.max(0.05, baseAccuracy + disparityFactor + (random() * 0.1 - 0.05)));
            const predicted = random() < 0.5 ? 1 : 0;
            const actual = random() < accuracy ? predicted : (1 - predicted);
            predictions.push({ districtId: d, crimeType: CRIME_TYPES[c], predicted, actual });
        }
    }
    return predictions;
}

const MODEL_PREDICTIONS = {
    xgb_hotspot: generatePredictions('xgb_hotspot'),
    solvability_index: generatePredictions('solvability_index'),
    victim_risk_shield: generatePredictions('victim_risk_shield')
};

function computeMetrics(model, predictions) {
    const perDistrict = {};
    for (let d = 1; d <= 20; d++) {
        perDistrict[d] = { total: 0, predictedPositive: 0, actualPositive: 0, truePositive: 0 };
    }

    for (const p of predictions) {
        perDistrict[p.districtId].total++;
        if (p.predicted === 1) perDistrict[p.districtId].predictedPositive++;
        if (p.actual === 1) perDistrict[p.districtId].actualPositive++;
        if (p.predicted === 1 && p.actual === 1) perDistrict[p.districtId].truePositive++;
    }

    const metrics = Object.entries(perDistrict).map(([did, data]) => {
        const positiveRate = data.total > 0 ? data.predictedPositive / data.total : 0;
        const truePositiveRate = data.actualPositive > 0 ? data.truePositive / data.actualPositive : 0;
        return {
            districtId: parseInt(did),
            districtName: DISTRICT_NAMES[parseInt(did) - 1],
            positiveRate: +positiveRate.toFixed(4),
            truePositiveRate: +truePositiveRate.toFixed(4),
            sampleCount: data.total
        };
    });

    const overallPositiveRate = predictions.filter(item => item.predicted === 1).length / Math.max(predictions.length, 1);
    const actualPositive = predictions.filter(item => item.actual === 1);
    const overallTPR = actualPositive.filter(item => item.predicted === 1).length / Math.max(actualPositive.length, 1);

    return metrics.map(m => ({
        ...m,
        demographicParityRatio: +(m.positiveRate > 0 && overallPositiveRate > 0
            ? Math.min(m.positiveRate / overallPositiveRate, overallPositiveRate / m.positiveRate)
            : 0).toFixed(4),
        equalOpportunityDiff: +(m.truePositiveRate - overallTPR).toFixed(4)
    }));
}

app.get('/fairness-audit/models', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        res.status(200).json({
            models: MODELS,
            metadata: {
                dataSource: 'synthetic_demo',
                synthetic: true,
                note: 'Catalog entries identify prototype pipelines only; they do not indicate validation or deployment approval.'
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to load models', details: err.message });
    }
});

app.get('/fairness-audit/metrics', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const model = req.query.model;

        if (model && !MODELS.includes(model)) {
            return res.status(400).json({
                error: `Unknown model '${model}'`,
                supportedModels: MODELS
            });
        }

        const modelsToCompute = model ? [model] : MODELS;
        const result = {};

        for (const m of modelsToCompute) {
            result[m] = computeMetrics(m, MODEL_PREDICTIONS[m]);
        }

        res.status(200).json({
            data: model ? result[model] : result,
            model: model || 'all',
            metadata: {
                dataSource: 'synthetic_demo',
                synthetic: true,
                auditStatus: 'not_assessable',
                sliceType: 'district_not_protected_attribute',
                note: 'Deterministic synthetic district slices demonstrate metric plumbing only. They are not demographic fairness evidence and do not validate any model.',
                humanReviewRequired: true
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to compute fairness metrics', details: err.message });
    }
});

app.get('/fairness-audit/summary', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const summaries = MODELS.map(m => {
            const metrics = computeMetrics(m, MODEL_PREDICTIONS[m]);
            const avgParity = metrics.reduce((s, v) => s + v.demographicParityRatio, 0) / metrics.length;
            const minParity = Math.min(...metrics.map(v => v.demographicParityRatio));
            const avgEO = metrics.reduce((s, v) => s + Math.abs(v.equalOpportunityDiff), 0) / metrics.length;
            return {
                model: m,
                avgDemographicParityRatio: +avgParity.toFixed(4),
                minParityRatio: +minParity.toFixed(4),
                avgEqualOpportunityDiff: +avgEO.toFixed(4),
                fairnessRating: 'not_assessable'
            };
        });

        res.status(200).json({
            models: summaries,
            metadata: {
                dataSource: 'synthetic_demo',
                synthetic: true,
                auditStatus: 'not_assessable',
                note: 'Synthetic metrics cannot establish fairness. Use approved protected-attribute cohorts, representative holdouts, and documented thresholds before assessment.',
                humanReviewRequired: true
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to compute fairness summary', details: err.message });
    }
});

module.exports = app;

const express = require('express');
const catalyst = require('zcatalyst-sdk-node');

const app = express();
app.use(express.json());

const CRIME_TYPES = ['theft', 'assault', 'fraud', 'robbery', 'burglary', 'cyber', 'sexual', 'murder', 'drugs', 'property', 'extortion', 'publicorder'];

const DISTRICT_PROFILES = {
    1: { name: 'District 1', literacyRate: 0.82, urbanRatio: 0.45, policePerCapita: 180, patrolBudget: 50, streetlightCoverage: 0.55, unemploymentRate: 0.08 },
    2: { name: 'District 2', literacyRate: 0.75, urbanRatio: 0.30, policePerCapita: 150, patrolBudget: 42, streetlightCoverage: 0.40, unemploymentRate: 0.12 },
    3: { name: 'District 3', literacyRate: 0.88, urbanRatio: 0.60, policePerCapita: 220, patrolBudget: 65, streetlightCoverage: 0.70, unemploymentRate: 0.05 },
    4: { name: 'District 4', literacyRate: 0.72, urbanRatio: 0.25, policePerCapita: 130, patrolBudget: 35, streetlightCoverage: 0.30, unemploymentRate: 0.15 },
    5: { name: 'District 5', literacyRate: 0.85, urbanRatio: 0.55, policePerCapita: 200, patrolBudget: 58, streetlightCoverage: 0.65, unemploymentRate: 0.06 },
    6: { name: 'District 6', literacyRate: 0.68, urbanRatio: 0.20, policePerCapita: 110, patrolBudget: 28, streetlightCoverage: 0.25, unemploymentRate: 0.18 },
    7: { name: 'District 7', literacyRate: 0.90, urbanRatio: 0.70, policePerCapita: 250, patrolBudget: 75, streetlightCoverage: 0.80, unemploymentRate: 0.04 },
    8: { name: 'District 8', literacyRate: 0.70, urbanRatio: 0.22, policePerCapita: 120, patrolBudget: 30, streetlightCoverage: 0.28, unemploymentRate: 0.16 },
    9: { name: 'District 9', literacyRate: 0.80, urbanRatio: 0.40, policePerCapita: 170, patrolBudget: 48, streetlightCoverage: 0.50, unemploymentRate: 0.09 },
    10: { name: 'District 10', literacyRate: 0.87, urbanRatio: 0.65, policePerCapita: 230, patrolBudget: 68, streetlightCoverage: 0.75, unemploymentRate: 0.05 },
    11: { name: 'District 11', literacyRate: 0.78, urbanRatio: 0.35, policePerCapita: 160, patrolBudget: 45, streetlightCoverage: 0.45, unemploymentRate: 0.10 },
    12: { name: 'District 12', literacyRate: 0.65, urbanRatio: 0.18, policePerCapita: 100, patrolBudget: 25, streetlightCoverage: 0.20, unemploymentRate: 0.20 },
    13: { name: 'District 13', literacyRate: 0.83, urbanRatio: 0.50, policePerCapita: 190, patrolBudget: 55, streetlightCoverage: 0.60, unemploymentRate: 0.07 },
    14: { name: 'District 14', literacyRate: 0.76, urbanRatio: 0.32, policePerCapita: 145, patrolBudget: 40, streetlightCoverage: 0.38, unemploymentRate: 0.11 },
    15: { name: 'District 15', literacyRate: 0.92, urbanRatio: 0.75, policePerCapita: 270, patrolBudget: 80, streetlightCoverage: 0.85, unemploymentRate: 0.03 },
    16: { name: 'District 16', literacyRate: 0.73, urbanRatio: 0.28, policePerCapita: 135, patrolBudget: 37, streetlightCoverage: 0.35, unemploymentRate: 0.14 },
    17: { name: 'District 17', literacyRate: 0.79, urbanRatio: 0.38, policePerCapita: 165, patrolBudget: 46, streetlightCoverage: 0.48, unemploymentRate: 0.09 },
    18: { name: 'District 18', literacyRate: 0.86, urbanRatio: 0.58, policePerCapita: 210, patrolBudget: 62, streetlightCoverage: 0.68, unemploymentRate: 0.05 },
    19: { name: 'District 19', literacyRate: 0.71, urbanRatio: 0.24, policePerCapita: 125, patrolBudget: 32, streetlightCoverage: 0.32, unemploymentRate: 0.17 },
    20: { name: 'District 20', literacyRate: 0.84, urbanRatio: 0.52, policePerCapita: 195, patrolBudget: 56, streetlightCoverage: 0.62, unemploymentRate: 0.06 }
};

const CORRELATION_WEIGHTS = {
    theft: { patrol: -0.40, literacy: -0.30, police: -0.35, streetlight: -0.25 },
    burglary: { patrol: -0.35, literacy: -0.20, police: -0.30, streetlight: -0.35 },
    robbery: { patrol: -0.30, literacy: -0.25, police: -0.40, streetlight: -0.20 },
    assault: { patrol: -0.25, literacy: -0.35, police: -0.25, streetlight: -0.15 },
    murder: { patrol: -0.20, literacy: -0.25, police: -0.30, streetlight: -0.10 },
    sexual: { patrol: -0.25, literacy: -0.40, police: -0.20, streetlight: -0.20 },
    fraud: { patrol: -0.15, literacy: -0.35, police: -0.15, streetlight: -0.10 },
    cyber: { patrol: -0.10, literacy: -0.30, police: -0.15, streetlight: -0.05 },
    drugs: { patrol: -0.35, literacy: -0.20, police: -0.30, streetlight: -0.15 },
    property: { patrol: -0.30, literacy: -0.15, police: -0.25, streetlight: -0.30 },
    extortion: { patrol: -0.20, literacy: -0.25, police: -0.30, streetlight: -0.15 },
    publicorder: { patrol: -0.35, literacy: -0.20, police: -0.35, streetlight: -0.20 }
};

function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val));
}

function simulate(params) {
    const { districtId, patrolBudget, literacyRate, policePerCapita, streetlightCoverage } = params;
    const profile = DISTRICT_PROFILES[parseInt(districtId)];
    if (!profile) return null;

    const patrolBudgetVal = patrolBudget !== undefined ? parseFloat(patrolBudget) : profile.patrolBudget;
    const literacyRateVal = literacyRate !== undefined ? parseFloat(literacyRate) : profile.literacyRate * 100;
    const policePerCapitaVal = policePerCapita !== undefined ? parseFloat(policePerCapita) : profile.policePerCapita;
    const streetlightCoverageVal = streetlightCoverage !== undefined ? parseFloat(streetlightCoverage) : profile.streetlightCoverage * 100;

    const baseline = {
        patrolBudget: profile.patrolBudget,
        literacyRate: Math.round(profile.literacyRate * 100),
        policePerCapita: profile.policePerCapita,
        streetlightCoverage: Math.round(profile.streetlightCoverage * 100)
    };

    const deltas = {};
    for (const ct of CRIME_TYPES) {
        const w = CORRELATION_WEIGHTS[ct];
        const delta =
            ((patrolBudgetVal - baseline.patrolBudget) / baseline.patrolBudget) * w.patrol * 10 +
            ((literacyRateVal - baseline.literacyRate) / 100) * w.literacy * 10 +
            ((policePerCapitaVal - baseline.policePerCapita) / baseline.policePerCapita) * w.police * 10 +
            ((streetlightCoverageVal - baseline.streetlightCoverage) / 100) * w.streetlight * 10;

        const deltaVal = +delta.toFixed(1);
        const direction = deltaVal > 0 ? 'increase' : deltaVal < 0 ? 'decrease' : 'stable';
        const absChange = Math.abs(deltaVal);
        const uncertaintyLower = +(absChange * 0.85).toFixed(1);
        const uncertaintyUpper = +(absChange * 1.15).toFixed(1);

        deltas[ct] = {
            delta: deltaVal,
            direction,
            percentChange: absChange,
            range: { lower: uncertaintyLower, upper: uncertaintyUpper }
        };
    }

    const maxDelta = Object.entries(deltas).sort((a, b) => Math.abs(b[1].delta) - Math.abs(a[1].delta))[0];
    let recommendation;
    if (patrolBudgetVal !== baseline.patrolBudget || literacyRateVal !== baseline.literacyRate ||
        policePerCapitaVal !== baseline.policePerCapita || streetlightCoverageVal !== baseline.streetlightCoverage) {
        const topCrime = CRIME_TYPES.find(ct => ct === maxDelta[0]) || 'theft';
        const changeDir = deltas[topCrime].direction === 'decrease' ? 'reduce' : 'increase';
        recommendation = `Estimated ${changeDir} in ${topCrime} by ${deltas[topCrime].percentChange.toFixed(0)}% ±15%. ${deltas[topCrime].direction === 'decrease' ? 'Intervention appears effective for this crime type.' : 'Consider additional measures for this crime type.'}`;
    } else {
        recommendation = 'No change from baseline. Adjust one or more parameters to see projected effects.';
    }

    return {
        districtId: parseInt(districtId),
        districtName: profile.name,
        baseline,
        params: { patrolBudget: patrolBudgetVal, literacyRate: literacyRateVal, policePerCapita: policePerCapitaVal, streetlightCoverage: streetlightCoverageVal },
        deltas,
        recommendation,
        note: 'Estimated based on demographic correlations — not causal'
    };
}

app.post('/countercrime/simulate', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const { districtId, patrolBudget, literacyRate, policePerCapita, streetlightCoverage } = req.body;

        if (!districtId) {
            return res.status(400).json({ error: 'districtId is required' });
        }

        const dId = parseInt(districtId);
        const profile = DISTRICT_PROFILES[dId];
        if (!profile) {
            return res.status(404).json({ error: `District ${dId} not found` });
        }

        const clamped = {};
        clamped.patrolBudget = patrolBudget !== undefined ? clamp(parseFloat(patrolBudget), 0, 200) : undefined;
        clamped.literacyRate = literacyRate !== undefined ? clamp(parseFloat(literacyRate), 0, 100) : undefined;
        clamped.policePerCapita = policePerCapita !== undefined ? clamp(parseFloat(policePerCapita), 0, 500) : undefined;
        clamped.streetlightCoverage = streetlightCoverage !== undefined ? clamp(parseFloat(streetlightCoverage), 0, 100) : undefined;

        const result = simulate({ districtId: dId, ...clamped });

        res.status(200).json({ ...result, generatedAt: new Date().toISOString() });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'CounterCrime simulation failed', details: err.message });
    }
});

app.get('/countercrime/presets', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        res.status(200).json({
            presets: [
                {
                    label: 'Increase patrols 20%',
                    description: 'Allocate resources 20% above current patrol budget',
                    params: { patrolBudget: 0 }
                },
                {
                    label: 'Improve literacy 10%',
                    description: '10% increase in literacy rate through community programs',
                    params: { literacyRate: 0 }
                },
                {
                    label: 'All interventions combined',
                    description: 'Patrol +20%, literacy +10%, police per capita +15%, streetlights +20%',
                    params: { patrolBudget: 0, literacyRate: 0, policePerCapita: 0, streetlightCoverage: 0 }
                }
            ],
            note: 'Preset params are target percentages — frontend computes actual values from district baseline'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to load presets', details: err.message });
    }
});

app.get('/countercrime/districts', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const districts = Object.entries(DISTRICT_PROFILES).map(([id, p]) => ({
            id: parseInt(id),
            name: p.name,
            baseline: {
                patrolBudget: p.patrolBudget,
                literacyRate: Math.round(p.literacyRate * 100),
                policePerCapita: p.policePerCapita,
                streetlightCoverage: Math.round(p.streetlightCoverage * 100)
            }
        }));
        res.status(200).json({ districts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to load districts', details: err.message });
    }
});

module.exports = app;

const express = require('express');
const catalyst = require('zcatalyst-sdk-node');

const app = express();
app.use(express.json());

const DISTRICT_CLEARANCE = {
    1: 0.62, 2: 0.55, 3: 0.48, 4: 0.71, 5: 0.59,
    6: 0.43, 7: 0.67, 8: 0.51, 9: 0.64, 10: 0.58,
    11: 0.52, 12: 0.47, 13: 0.61, 14: 0.56, 15: 0.73,
    16: 0.49, 17: 0.54, 18: 0.66, 19: 0.53, 20: 0.60
};

const MO_KEYWORDS = [
    'forced', 'broke', 'lock', 'window', 'mask', 'gloves', 'weapon',
    'knife', 'gun', 'threatened', 'demanded', 'ransom', 'tied', 'gagged',
    'staged', 'burglary', 'pickpocket', 'snatched', 'scammed', 'impersonated'
];

function computeSolvability({ narrative, evidenceTypes, delayHours, witnessCount, suspectIdentified, districtId }) {
    const factors = [];

    const evTypes = Array.isArray(evidenceTypes) ? evidenceTypes : [];
    const evidenceScore = Math.min(20, evTypes.length * 4);
    factors.push({ name: 'Evidence types present', score: evidenceScore, max: 20 });

    let delayScore = 0;
    if (delayHours <= 24) delayScore = 20;
    else if (delayHours <= 72) delayScore = 15;
    else if (delayHours <= 168) delayScore = 10;
    else if (delayHours <= 720) delayScore = 5;
    else delayScore = 0;
    factors.push({ name: 'Time-to-report delay', score: delayScore, max: 20 });

    const text = (narrative || '').toLowerCase();
    const moMatches = MO_KEYWORDS.filter(kw => text.includes(kw)).length;
    const moScore = Math.min(15, moMatches * 3);
    factors.push({ name: 'MO specificity', score: moScore, max: 15 });

    const clearanceRate = DISTRICT_CLEARANCE[parseInt(districtId)] || 0.5;
    const clearanceScore = Math.round(clearanceRate * 15);
    factors.push({ name: 'District clearance rate', score: clearanceScore, max: 15 });

    const wCount = parseInt(witnessCount) || 0;
    const witnessScore = wCount >= 3 ? 15 : wCount === 2 ? 10 : wCount === 1 ? 5 : 0;
    factors.push({ name: 'Witness count', score: witnessScore, max: 15 });

    const suspectScore = suspectIdentified ? 15 : 0;
    factors.push({ name: 'Suspect identified', score: suspectScore, max: 15 });

    const total = factors.reduce((s, f) => s + f.score, 0);
    const solvabilityScore = Math.min(100, total);

    let uncertaintyBand;
    if (solvabilityScore >= 20 && solvabilityScore <= 80) uncertaintyBand = 15;
    else uncertaintyBand = 5;

    return { solvabilityScore, uncertaintyBand, factors };
}

app.post('/solvability', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const { narrative, firNo, firYear, districtId, evidenceTypes, delayHours, witnessCount, suspectIdentified } = req.body;

        if (!firNo) {
            return res.status(400).json({ error: 'firNo is required' });
        }

        const result = computeSolvability({
            narrative,
            evidenceTypes,
            delayHours: parseInt(delayHours || 0),
            witnessCount: parseInt(witnessCount || 0),
            suspectIdentified: !!suspectIdentified,
            districtId
        });

        res.status(200).json({
            ...result,
            firNo,
            firYear: firYear || null,
            note: 'Heuristic score — not validated against local data'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Solvability analysis failed', details: err.message });
    }
});

module.exports = app;

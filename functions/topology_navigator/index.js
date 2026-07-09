const express = require('express');
const catalyst = require('zcatalyst-sdk-node');
const { VERACITY_CONFIG } = require('../shared/analyzer');
const { getCached, setCached } = require('../shared/cache-utils');

const app = express();
app.use(express.json());

const CRIME_FAMILIES = [
    { id: 'theft', label: 'Theft', color: '#f59e0b', keywords: ['379','380','theft','stolen','steal'] },
    { id: 'burglary', label: 'Burglary', color: '#f97316', keywords: ['451','453','housebreaking','trespass','break'] },
    { id: 'robbery', label: 'Robbery/Dacoity', color: '#ef4444', keywords: ['382','390','392','395','robbery','dacoity'] },
    { id: 'assault', label: 'Assault/Hurt', color: '#dc2626', keywords: ['319','320','323','324','hurt','assault','grievous'] },
    { id: 'murder', label: 'Homicide', color: '#7f1d1d', keywords: ['302','304','murder','homicide','kill','death'] },
    { id: 'sexual', label: 'Sexual Offences', color: '#be185d', keywords: ['354','356','376','rape','molest','harass','outraging'] },
    { id: 'fraud', label: 'Fraud/Cheating', color: '#d97706', keywords: ['419','420','406','408','fraud','cheat','scam','breach of trust'] },
    { id: 'cyber', label: 'Cybercrime', color: '#7c3aed', keywords: ['cyber','hack','phishing','online','computer','it act'] },
    { id: 'drugs', label: 'Narcotics', color: '#059669', keywords: ['ndps','narcotic','drug','ganja','cocaine','heroin'] },
    { id: 'property', label: 'Property Damage', color: '#0891b2', keywords: ['425','426','mischief','damage','vandalism'] },
    { id: 'extortion', label: 'Extortion', color: '#e11d48', keywords: ['384','385','extortion','blackmail','ransom'] },
    { id: 'publicorder', label: 'Public Order', color: '#6366f1', keywords: ['143','144','147','148','150','riot','unlawful assembly'] }
];

const TRANSITION_MATRIX = {
    theft: { burglary: 0.28, robbery: 0.22, fraud: 0.12, assault: 0.08, cyber: 0.05, extortion: 0.03, property: 0.12, sexual: 0.01, drugs: 0.02, murder: 0.01, publicorder: 0.06 },
    burglary: { theft: 0.25, robbery: 0.20, assault: 0.12, property: 0.18, extortion: 0.05, fraud: 0.04, drugs: 0.03, sexual: 0.03, murder: 0.04, cyber: 0.01, publicorder: 0.05 },
    robbery: { assault: 0.25, murder: 0.15, theft: 0.12, extortion: 0.12, burglary: 0.10, drugs: 0.06, fraud: 0.05, property: 0.05, sexual: 0.03, cyber: 0.02, publicorder: 0.05 },
    assault: { murder: 0.20, robbery: 0.15, sexual: 0.12, assault: 0.10, extortion: 0.10, theft: 0.08, publicorder: 0.08, burglary: 0.05, property: 0.05, drugs: 0.04, fraud: 0.03 },
    murder: { murder: 0.08, assault: 0.25, robbery: 0.15, sexual: 0.12, extortion: 0.10, drugs: 0.08, theft: 0.06, publicorder: 0.06, burglary: 0.04, property: 0.03, fraud: 0.03 },
    sexual: { sexual: 0.15, assault: 0.22, murder: 0.10, theft: 0.10, robbery: 0.08, extortion: 0.08, drugs: 0.06, publicorder: 0.06, burglary: 0.05, fraud: 0.05, property: 0.05 },
    fraud: { fraud: 0.25, cyber: 0.18, theft: 0.15, extortion: 0.12, robbery: 0.06, assault: 0.06, burglary: 0.05, property: 0.05, drugs: 0.03, sexual: 0.03, murder: 0.02 },
    cyber: { cyber: 0.20, fraud: 0.25, theft: 0.15, extortion: 0.12, assault: 0.06, robbery: 0.05, burglary: 0.04, property: 0.04, drugs: 0.03, sexual: 0.03, murder: 0.03 },
    drugs: { drugs: 0.20, robbery: 0.15, assault: 0.15, murder: 0.10, theft: 0.10, extortion: 0.08, burglary: 0.07, fraud: 0.05, sexual: 0.04, property: 0.03, publicorder: 0.03 },
    property: { theft: 0.22, burglary: 0.20, assault: 0.12, robbery: 0.10, property: 0.08, fraud: 0.08, extortion: 0.06, publicorder: 0.05, cyber: 0.03, drugs: 0.03, murder: 0.03 },
    extortion: { extortion: 0.15, robbery: 0.18, fraud: 0.15, assault: 0.12, murder: 0.08, theft: 0.08, burglary: 0.07, cyber: 0.06, drugs: 0.05, sexual: 0.03, property: 0.03 },
    publicorder: { assault: 0.22, murder: 0.12, robbery: 0.12, publicorder: 0.10, property: 0.10, theft: 0.10, burglary: 0.08, extortion: 0.06, sexual: 0.04, drugs: 0.03, fraud: 0.03 }
};

function varyMatrix(base, factor) {
    const result = {};
    for (const [src, targets] of Object.entries(base)) {
        result[src] = {};
        let sum = 0;
        const entries = Object.entries(targets);
        for (const [tgt, prob] of entries) {
            const varied = Math.max(0.01, prob * (1 + factor + (Math.random() * 0.1 - 0.05)));
            result[src][tgt] = varied;
            sum += varied;
        }
        for (const tgt of Object.keys(result[src])) {
            result[src][tgt] = +(result[src][tgt] / sum).toFixed(4);
        }
    }
    return result;
}

const MONTHLY_MATRICES = (() => {
    const factors = {
        '2025-01': 0.15, '2025-02': 0.10, '2025-03': 0.05,
        '2025-04': -0.05, '2025-05': -0.10, '2025-06': -0.15,
        '2025-07': -0.10, '2025-08': -0.05, '2025-09': 0.00,
        '2025-10': 0.05, '2025-11': 0.10, '2025-12': 0.15
    };
    const mats = {};
    for (const [month, factor] of Object.entries(factors)) {
        mats[month] = varyMatrix(TRANSITION_MATRIX, factor);
    }
    return mats;
})();

function computeFSC(transitionMatrix, crimeId) {
    const probs = transitionMatrix[crimeId];
    if (!probs) return 0;
    const sumSq = Object.values(probs).reduce((s, p) => s + p * p, 0);
    const k = Object.keys(probs).length;
    return (sumSq - 1 / k) / (1 - 1 / k);
}

app.get('/topology', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const districtId = req.query.districtId || 1;
        const weightByVeracity = req.query.weightByVeracity === 'true';
        const month = req.query.month || null;
        const cacheKey = `panel:topology:topology:${districtId}:${weightByVeracity}:${month || 'all'}`;
        const cached = await getCached(catalystApp, cacheKey);
        if (cached) return res.status(200).json(cached);

        const activeMatrix = month && MONTHLY_MATRICES[month] ? MONTHLY_MATRICES[month] : TRANSITION_MATRIX;
        const zcql = catalystApp.zcql();

        let districtCounts = {};
        try {
            const rows = await zcql.executeZCQLQuery(
                `SELECT CrimeHeadID, COUNT(*) as cnt FROM CaseMaster GROUP BY CrimeHeadID`
            );
            for (const row of rows) {
                const crimeId = row.CaseMaster?.CrimeHeadID || row.CrimeHeadID;
                const cnt = parseInt(row.CaseMaster?.cnt || row.cnt || 0);
                if (crimeId) districtCounts[crimeId] = cnt;
            }
        } catch (e) {
            console.warn('Data Store query failed, using synthetic distribution:', e.message);
            districtCounts = {
                1: 45, 3: 38, 4: 22, 5: 31, 6: 15, 7: 28,
                10: 20, 11: 18, 14: 25, 15: 30, 17: 12
            };
        }

        let weighted = false;
        let skippedLanguageCount = 0;

        if (weightByVeracity) {
            try {
                const veracityRows = await zcql.executeZCQLQuery(
                    `SELECT CrimeHeadID, AVG(VeracityScore) as avgScore, COUNT(*) as cnt FROM FirVeracity WHERE VeracityScore IS NOT NULL GROUP BY CrimeHeadID`
                );
                const veracityMap = {};
                for (const row of veracityRows) {
                    const crimeId = parseInt(row.FirVeracity?.CrimeHeadID || row.CrimeHeadID || 0);
                    const avgScore = parseFloat(row.FirVeracity?.avgScore || row.avgScore || 0);
                    if (crimeId) veracityMap[crimeId] = avgScore;
                }

                try {
                    const langRows = await zcql.executeZCQLQuery(
                        `SELECT COUNT(*) as cnt FROM FirVeracity WHERE Language != 'latin'`
                    );
                    skippedLanguageCount = parseInt(langRows[0]?.FirVeracity?.cnt || langRows[0]?.cnt || 0);
                } catch (e) { /* non-fatal */ }

                for (const [crimeIdStr, count] of Object.entries(districtCounts)) {
                    const crimeId = parseInt(crimeIdStr);
                    const meanVeracity = veracityMap[crimeId] || 0.5;
                    districtCounts[crimeId] = Math.round(count * meanVeracity);
                }
                weighted = true;
            } catch (e) {
                console.warn('FirVeracity query failed, falling back to unweighted:', e.message);
            }
        }

        const totalCrimes = Object.values(districtCounts).reduce((s, v) => s + v, 0) || 1;
        const crimeTypeCount = CRIME_FAMILIES.length;
        const nodeSizeScale = Math.min(80, Math.max(15, totalCrimes / 20));

        const nodes = CRIME_FAMILIES.map((cf, i) => ({
            id: cf.id,
            label: cf.label,
            color: cf.color,
            size: Math.max(8, nodeSizeScale * (0.3 + 0.7 * ((districtCounts[i + 1] || 5) / (Math.max(...Object.values(districtCounts)) || 10)))),
            fsc: computeFSC(activeMatrix, cf.id),
            crimeCount: districtCounts[i + 1] || 0
        }));

        const edges = [];
        for (const [source, targets] of Object.entries(activeMatrix)) {
            for (const [target, prob] of Object.entries(targets)) {
                if (prob > 0.05) {
                    edges.push({
                        source,
                        target,
                        weight: +prob.toFixed(2),
                        width: Math.max(1, prob * 8),
                        label: `${Math.round(prob * 100)}%`
                    });
                }
            }
        }

        const result = {
            nodes,
            edges,
            metadata: {
                totalCrimes,
                districtId: parseInt(districtId),
                crimeTypeCount,
                weighted,
                month: month && MONTHLY_MATRICES[month] ? month : undefined,
                temporalMode: month && MONTHLY_MATRICES[month],
                skippedLanguageCount: weighted ? skippedLanguageCount : undefined,
                generatedAt: new Date().toISOString()
            }
        };

        await setCached(catalystApp, cacheKey, result);
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Topology generation failed', details: err.message });
    }
});

app.get('/topology/months', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        res.status(200).json({ months: Object.keys(MONTHLY_MATRICES).sort() });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to load months', details: err.message });
    }
});

app.get('/crimes', async (req, res) => {
    res.status(200).json(CRIME_FAMILIES);
});

module.exports = app;

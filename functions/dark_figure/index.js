const express = require('express');
const catalyst = require('zcatalyst-sdk-node');
const { getCached, setCached } = require('../shared/cache-utils');
const { DEMO_GENERATED_AT, createSeededRandom, intBetween } = require('../shared/deterministic');

const app = express();
app.use(express.json());

const DISTRICT_PROFILES = {
    1: { name: 'District 1', literacyRate: 0.82, urbanRatio: 0.45, policePerCapita: 180, underreporting: { theft: 0.55, assault: 0.65, fraud: 0.50, robbery: 0.40, burglary: 0.55, cyber: 0.70, sexual: 0.75, murder: 0.15, drugs: 0.45, property: 0.50, extortion: 0.60, publicorder: 0.35 } },
    2: { name: 'District 2', literacyRate: 0.75, urbanRatio: 0.30, policePerCapita: 150, underreporting: { theft: 0.60, assault: 0.70, fraud: 0.55, robbery: 0.45, burglary: 0.60, cyber: 0.75, sexual: 0.80, murder: 0.20, drugs: 0.50, property: 0.55, extortion: 0.65, publicorder: 0.40 } },
    3: { name: 'District 3', literacyRate: 0.88, urbanRatio: 0.60, policePerCapita: 220, underreporting: { theft: 0.50, assault: 0.60, fraud: 0.45, robbery: 0.35, burglary: 0.50, cyber: 0.65, sexual: 0.70, murder: 0.10, drugs: 0.40, property: 0.45, extortion: 0.55, publicorder: 0.30 } },
    4: { name: 'District 4', literacyRate: 0.72, urbanRatio: 0.25, policePerCapita: 130, underreporting: { theft: 0.65, assault: 0.75, fraud: 0.60, robbery: 0.50, burglary: 0.65, cyber: 0.80, sexual: 0.85, murder: 0.25, drugs: 0.55, property: 0.60, extortion: 0.70, publicorder: 0.45 } },
    5: { name: 'District 5', literacyRate: 0.85, urbanRatio: 0.55, policePerCapita: 200, underreporting: { theft: 0.52, assault: 0.62, fraud: 0.47, robbery: 0.37, burglary: 0.52, cyber: 0.67, sexual: 0.72, murder: 0.12, drugs: 0.42, property: 0.47, extortion: 0.57, publicorder: 0.32 } },
    6: { name: 'District 6', literacyRate: 0.68, urbanRatio: 0.20, policePerCapita: 110, underreporting: { theft: 0.70, assault: 0.80, fraud: 0.65, robbery: 0.55, burglary: 0.70, cyber: 0.85, sexual: 0.90, murder: 0.30, drugs: 0.60, property: 0.65, extortion: 0.75, publicorder: 0.50 } },
    7: { name: 'District 7', literacyRate: 0.90, urbanRatio: 0.70, policePerCapita: 250, underreporting: { theft: 0.48, assault: 0.58, fraud: 0.42, robbery: 0.32, burglary: 0.48, cyber: 0.62, sexual: 0.68, murder: 0.08, drugs: 0.38, property: 0.42, extortion: 0.52, publicorder: 0.28 } },
    8: { name: 'District 8', literacyRate: 0.70, urbanRatio: 0.22, policePerCapita: 120, underreporting: { theft: 0.68, assault: 0.78, fraud: 0.62, robbery: 0.52, burglary: 0.68, cyber: 0.82, sexual: 0.87, murder: 0.27, drugs: 0.58, property: 0.62, extortion: 0.72, publicorder: 0.47 } },
    9: { name: 'District 9', literacyRate: 0.80, urbanRatio: 0.40, policePerCapita: 170, underreporting: { theft: 0.57, assault: 0.67, fraud: 0.52, robbery: 0.42, burglary: 0.57, cyber: 0.72, sexual: 0.77, murder: 0.17, drugs: 0.47, property: 0.52, extortion: 0.62, publicorder: 0.37 } },
    10: { name: 'District 10', literacyRate: 0.87, urbanRatio: 0.65, policePerCapita: 230, underreporting: { theft: 0.49, assault: 0.59, fraud: 0.44, robbery: 0.34, burglary: 0.49, cyber: 0.64, sexual: 0.69, murder: 0.09, drugs: 0.39, property: 0.44, extortion: 0.54, publicorder: 0.29 } },
    11: { name: 'District 11', literacyRate: 0.78, urbanRatio: 0.35, policePerCapita: 160, underreporting: { theft: 0.58, assault: 0.68, fraud: 0.53, robbery: 0.43, burglary: 0.58, cyber: 0.73, sexual: 0.78, murder: 0.18, drugs: 0.48, property: 0.53, extortion: 0.63, publicorder: 0.38 } },
    12: { name: 'District 12', literacyRate: 0.65, urbanRatio: 0.18, policePerCapita: 100, underreporting: { theft: 0.72, assault: 0.82, fraud: 0.67, robbery: 0.57, burglary: 0.72, cyber: 0.87, sexual: 0.92, murder: 0.32, drugs: 0.62, property: 0.67, extortion: 0.77, publicorder: 0.52 } },
    13: { name: 'District 13', literacyRate: 0.83, urbanRatio: 0.50, policePerCapita: 190, underreporting: { theft: 0.54, assault: 0.64, fraud: 0.49, robbery: 0.39, burglary: 0.54, cyber: 0.69, sexual: 0.74, murder: 0.14, drugs: 0.44, property: 0.49, extortion: 0.59, publicorder: 0.34 } },
    14: { name: 'District 14', literacyRate: 0.76, urbanRatio: 0.32, policePerCapita: 145, underreporting: { theft: 0.61, assault: 0.71, fraud: 0.56, robbery: 0.46, burglary: 0.61, cyber: 0.76, sexual: 0.81, murder: 0.22, drugs: 0.51, property: 0.56, extortion: 0.66, publicorder: 0.41 } },
    15: { name: 'District 15', literacyRate: 0.92, urbanRatio: 0.75, policePerCapita: 270, underreporting: { theft: 0.45, assault: 0.55, fraud: 0.40, robbery: 0.30, burglary: 0.45, cyber: 0.60, sexual: 0.65, murder: 0.07, drugs: 0.35, property: 0.40, extortion: 0.50, publicorder: 0.25 } },
    16: { name: 'District 16', literacyRate: 0.73, urbanRatio: 0.28, policePerCapita: 135, underreporting: { theft: 0.63, assault: 0.73, fraud: 0.58, robbery: 0.48, burglary: 0.63, cyber: 0.78, sexual: 0.83, murder: 0.23, drugs: 0.53, property: 0.58, extortion: 0.68, publicorder: 0.43 } },
    17: { name: 'District 17', literacyRate: 0.79, urbanRatio: 0.38, policePerCapita: 165, underreporting: { theft: 0.59, assault: 0.69, fraud: 0.54, robbery: 0.44, burglary: 0.59, cyber: 0.74, sexual: 0.79, murder: 0.19, drugs: 0.49, property: 0.54, extortion: 0.64, publicorder: 0.39 } },
    18: { name: 'District 18', literacyRate: 0.86, urbanRatio: 0.58, policePerCapita: 210, underreporting: { theft: 0.51, assault: 0.61, fraud: 0.46, robbery: 0.36, burglary: 0.51, cyber: 0.66, sexual: 0.71, murder: 0.11, drugs: 0.41, property: 0.46, extortion: 0.56, publicorder: 0.31 } },
    19: { name: 'District 19', literacyRate: 0.71, urbanRatio: 0.24, policePerCapita: 125, underreporting: { theft: 0.66, assault: 0.76, fraud: 0.61, robbery: 0.51, burglary: 0.66, cyber: 0.81, sexual: 0.86, murder: 0.26, drugs: 0.56, property: 0.61, extortion: 0.71, publicorder: 0.46 } },
    20: { name: 'District 20', literacyRate: 0.84, urbanRatio: 0.52, policePerCapita: 195, underreporting: { theft: 0.53, assault: 0.63, fraud: 0.48, robbery: 0.38, burglary: 0.53, cyber: 0.68, sexual: 0.73, murder: 0.13, drugs: 0.43, property: 0.48, extortion: 0.58, publicorder: 0.33 } }
};

const CRIME_TYPES = ['theft', 'assault', 'fraud', 'robbery', 'burglary', 'cyber', 'sexual', 'murder', 'drugs', 'property', 'extortion', 'publicorder'];

function computeDarkFigure(districtId, districtProfile, counts) {
    const firCounts = {};
    const estimatedTotals = {};
    const gaps = {};

    for (const ct of CRIME_TYPES) {
        const firCount = counts[ct] || 0;
        const underreportingRate = districtProfile.underreporting[ct] || 0.5;
        const estimatedTotal = firCount > 0 ? firCount / (1 - underreportingRate) : 0;
        const lowerBound = estimatedTotal * 0.65;
        const upperBound = estimatedTotal * 1.35;
        const gap = estimatedTotal - firCount;

        firCounts[ct] = firCount;
        estimatedTotals[ct] = { estimated: Math.round(estimatedTotal), lowerBound: Math.round(lowerBound), upperBound: Math.round(upperBound) };
        gaps[ct] = Math.round(gap);
    }

    const totalReported = Object.values(firCounts).reduce((s, v) => s + v, 0);
    const totalEstimated = Object.values(estimatedTotals).reduce((s, v) => s + v.estimated, 0);
    const gapPercent = totalReported > 0 ? Math.round(((totalEstimated - totalReported) / totalReported) * 100) : 0;
    const recommendation = gapPercent > 50
        ? 'Scenario review: consider community outreach and independent reporting-channel checks.'
        : 'Scenario review: continue monitoring and compare with independent victimisation evidence.';

    return { districtId, districtName: districtProfile.name, firCounts, estimatedTotals, gaps, gapPercent, recommendation };
}

app.get('/dark-figure', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const zcql = catalystApp.zcql();
        const districtId = req.query.district;
        const cacheKey = `panel:dark_figure:dark_figure:v2:${districtId || 'all'}`;
        const cached = await getCached(catalystApp, cacheKey);
        if (cached) return res.status(200).json(cached);

        let districtFIRCounts = {};
        let syntheticCounts = false;
        try {
            const rows = await zcql.executeZCQLQuery(
                `SELECT DistrictID, CrimeHeadID, COUNT(*) as cnt FROM CaseMaster GROUP BY DistrictID, CrimeHeadID`
            );
            for (const row of rows) {
                const dId = parseInt(row.CaseMaster?.DistrictID || row.DistrictID || 0);
                const crimeHeadId = parseInt(row.CaseMaster?.CrimeHeadID || row.CrimeHeadID || 0);
                const cnt = parseInt(row.CaseMaster?.cnt || row.cnt || 0);
                if (!districtFIRCounts[dId]) districtFIRCounts[dId] = {};
                districtFIRCounts[dId][CRIME_TYPES[crimeHeadId - 1] || 'other'] = cnt;
            }
        } catch (e) {
            console.warn('Data Store query failed, using deterministic synthetic demo counts:', e.message);
            syntheticCounts = true;
            for (let d = 1; d <= 20; d++) {
                const random = createSeededRandom(`dark-figure:${d}:v2`);
                districtFIRCounts[d] = {};
                for (const ct of CRIME_TYPES) {
                    districtFIRCounts[d][ct] = intBetween(random, 8, 46);
                }
            }
        }

        const profileIds = districtId ? [parseInt(districtId)] : Object.keys(DISTRICT_PROFILES).map(Number);

        const results = [];
        for (const dId of profileIds) {
            const profile = DISTRICT_PROFILES[dId];
            if (!profile) {
                results.push({ districtId: dId, error: 'No data' });
                continue;
            }
            results.push(computeDarkFigure(dId, profile, districtFIRCounts[dId] || {}));
        }

        const response = {
            data: districtId ? results[0] : results,
            dataYear: 2019,
            metadata: {
                dataSource: syntheticCounts ? 'synthetic_demo' : 'catalyst_data_store_with_demo_assumptions',
                synthetic: syntheticCounts,
                syntheticAssumptions: true,
                note: syntheticCounts
                    ? 'Deterministic synthetic FIR counts with fixed under-reporting assumptions. This is an interface scenario, not an official estimate.'
                    : 'Available FIR counts with fixed demonstration under-reporting assumptions. Validate against an approved victimisation study before use.',
                uncertaintyBand: 'Illustrative range of plus or minus 35%; not empirically calibrated',
                humanReviewRequired: true,
                generatedAt: syntheticCounts ? DEMO_GENERATED_AT : new Date().toISOString()
            }
        };

        await setCached(catalystApp, cacheKey, response);
        res.status(200).json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Dark figure estimation failed', details: err.message });
    }
});

module.exports = app;

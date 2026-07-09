const express = require('express');
const catalyst = require('zcatalyst-sdk-node');

const app = express();

const DISTRICTS = Array.from({ length: 20 }, (_, i) => i + 1);

const historicalBaselines = {
    1: { mean: 8, stddev: 3 }, 2: { mean: 12, stddev: 4 },
    3: { mean: 6, stddev: 2.5 }, 4: { mean: 15, stddev: 5 },
    5: { mean: 10, stddev: 3.5 }, 6: { mean: 7, stddev: 2 },
    7: { mean: 9, stddev: 3 }, 8: { mean: 5, stddev: 2 },
    9: { mean: 11, stddev: 4 }, 10: { mean: 14, stddev: 4.5 },
    11: { mean: 9, stddev: 3 }, 12: { mean: 7, stddev: 2.5 },
    13: { mean: 10, stddev: 3 }, 14: { mean: 6, stddev: 2 },
    15: { mean: 8, stddev: 3 }, 16: { mean: 12, stddev: 4 },
    17: { mean: 7, stddev: 2.5 }, 18: { mean: 10, stddev: 3.5 },
    19: { mean: 5, stddev: 2 }, 20: { mean: 11, stddev: 4 }
};

async function generateAndStoreBrief(catalystApp, districtId) {
    const zcql = catalystApp.zcql();
    const table = catalystApp.datastore().table('Alerts');
    const baseline = historicalBaselines[districtId] || { mean: 8, stddev: 3 };

    const todayRows = await zcql.executeZCQLQuery(
        `SELECT COUNT(*) as cnt FROM CaseMaster WHERE DistrictID = ${districtId} AND IncidentFromDate >= SYSDATE - 1`
    );
    const todayCount = parseInt(todayRows?.[0]?.CaseMaster?.cnt || 0);

    const sixtyDayRows = await zcql.executeZCQLQuery(
        `SELECT COUNT(*) as cnt FROM CaseMaster WHERE DistrictID = ${districtId} AND IncidentFromDate >= SYSDATE - 60`
    );
    const sixtyDayCount = parseInt(sixtyDayRows?.[0]?.CaseMaster?.cnt || 0);
    const sixtyDayAvg = +(sixtyDayCount / 60).toFixed(1);

    const topCrimeRows = await zcql.executeZCQLQuery(
        `SELECT CrimeHeadID, COUNT(*) as cnt FROM CaseMaster WHERE DistrictID = ${districtId} AND IncidentFromDate >= SYSDATE - 1 GROUP BY CrimeHeadID ORDER BY COUNT(*) DESC LIMIT 1`
    );
    const topCrimeId = parseInt(topCrimeRows?.[0]?.CaseMaster?.CrimeHeadID || 0);
    const topCrimeCount = parseInt(topCrimeRows?.[0]?.CaseMaster?.cnt || 0);

    const notableRows = await zcql.executeZCQLQuery(
        `SELECT CrimeHeadID, COUNT(*) as cnt FROM CaseMaster WHERE DistrictID = ${districtId} AND IncidentFromDate >= SYSDATE - 1 GROUP BY CrimeHeadID`
    );
    const notableFlags = [];
    const zScore = sixtyDayAvg > 0 ? +((todayCount - sixtyDayAvg) / Math.max(baseline.stddev, 0.5)).toFixed(2) : 0;
    if (zScore > 2) notableFlags.push(`Z-score ${zScore}: ${todayCount} vs ${sixtyDayAvg} daily avg`);

    const pctChange = sixtyDayAvg > 0 ? Math.round(((todayCount - sixtyDayAvg) / sixtyDayAvg) * 100) : 0;

    const description = [
        `Today: ${todayCount} FIRs (${pctChange >= 0 ? '+' : ''}${pctChange}% vs 60-day avg).`,
        topCrimeId ? `Top crime: CrimeHead ${topCrimeId} (${topCrimeCount} cases).` : '',
        notableFlags.length ? `Notable: ${notableFlags.join('; ')}.` : 'No notable anomalies.'
    ].filter(Boolean).join(' ');

    const alertRow = {
        Title: `Daily Brief — District ${districtId}`,
        Description: description,
        DistrictID: districtId,
        Severity: zScore > 3 ? 'High' : zScore > 1.5 ? 'Medium' : 'Low',
        CreatedAt: new Date().toISOString(),
        Type: 'DAILY_BRIEF',
        Recommendation: zScore > 3 ? `Consider deploying additional patrols in District ${districtId}` : ''
    };
    await table.insertRows([alertRow]);
    return alertRow;
}

app.get('/agentic/briefs/trigger', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const districtId = req.query.district ? parseInt(req.query.district) : null;

        if (districtId) {
            const brief = await generateAndStoreBrief(catalystApp, districtId);
            return res.status(200).json({ success: true, brief });
        }

        const results = [];
        for (const d of DISTRICTS) {
            const brief = await generateAndStoreBrief(catalystApp, d);
            results.push(brief);
        }

        const aggregateRow = {
            Title: 'Daily Brief — All Districts',
            Description: `Generated briefs for ${results.length} districts.`,
            DistrictID: 0,
            Severity: 'Low',
            CreatedAt: new Date().toISOString(),
            Type: 'DAILY_BRIEF'
        };
        const table = catalystApp.datastore().table('Alerts');
        await table.insertRows([aggregateRow]);

        res.status(200).json({ success: true, districts: results.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Brief generation failed', details: err.message });
    }
});

module.exports = app;

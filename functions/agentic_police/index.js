const express = require('express');
const catalyst = require('zcatalyst-sdk-node');
const { runCrossCheck } = require('../shared/cross_check');

const app = express();
app.use(express.json());

function severityFromScore(score) {
    if (score >= 80) return 'High';
    if (score >= 60) return 'Medium';
    return 'Low';
}

app.post('/agentic/cross-check/:firId', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const firId = parseInt(req.params.firId);
        if (!firId || isNaN(firId)) return res.status(400).json({ error: 'Invalid FIR ID' });

        const findings = await runCrossCheck(catalystApp, firId);
        if (findings.length === 0) return res.status(200).json({ findings: [], message: 'No linked cases found' });

        const table = catalystApp.datastore().table('Alerts');
        const alertRows = findings.map(f => ({
            Title: `Agent: Cross-check found linked FIR #${f.linkedFirId} (${f.score}% match)`,
            Description: `Matched on ${f.matchedDimensions.join(', ')}. FIR #${f.linkedFirId} (${f.firNo}) filed ${new Date(f.filedDate).toLocaleDateString()}.`,
            DistrictID: 0,
            Severity: severityFromScore(f.score),
            CreatedAt: new Date().toISOString(),
            Type: 'AGENT_ACTION'
        }));
        await table.insertRows(alertRows);

        res.status(200).json({ findings, alertsStored: alertRows.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Cross-check failed', details: err.message });
    }
});

app.post('/agentic/cross-check/:firId/demo', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const firId = parseInt(req.params.firId);

        const realFindings = await runCrossCheck(catalystApp, firId);
        if (realFindings.length > 0) {
            const table = catalystApp.datastore().table('Alerts');
            const alertRows = realFindings.map(f => ({
                Title: `Agent: Cross-check found linked FIR #${f.linkedFirId} (${f.score}% match)`,
                Description: `Matched on ${f.matchedDimensions.join(', ')}.`,
                DistrictID: 0,
                Severity: severityFromScore(f.score),
                CreatedAt: new Date().toISOString(),
                Type: 'AGENT_ACTION'
            }));
            await table.insertRows(alertRows);
            return res.status(200).json({ findings: realFindings, alertsStored: alertRows.length, demoMode: false });
        }

        const demoFindings = [
            { linkedFirId: firId + 7, score: 82, matchedDimensions: ['same crime type', 'same district', 'within 30 days'], firNo: `FIR-${firId + 7}`, crimeHeadId: 3, filedDate: new Date(Date.now() - 3 * 86400000).toISOString() },
            { linkedFirId: firId + 12, score: 65, matchedDimensions: ['same crime type', 'same district'], firNo: `FIR-${firId + 12}`, crimeHeadId: 3, filedDate: new Date(Date.now() - 8 * 86400000).toISOString() },
            { linkedFirId: firId + 3, score: 44, matchedDimensions: ['same district', 'within 30 days'], firNo: `FIR-${firId + 3}`, crimeHeadId: 5, filedDate: new Date(Date.now() - 12 * 86400000).toISOString() }
        ];

        const table = catalystApp.datastore().table('Alerts');
        const alertRows = demoFindings.map(f => ({
            Title: `Agent: Cross-check found linked FIR #${f.linkedFirId} (${f.score}% match)`,
            Description: `Matched on ${f.matchedDimensions.join(', ')}.`,
            DistrictID: 0,
            Severity: severityFromScore(f.score),
            CreatedAt: new Date().toISOString(),
            Type: 'AGENT_ACTION'
        }));
        await table.insertRows(alertRows);

        res.status(200).json({ findings: demoFindings, alertsStored: alertRows.length, demoMode: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Demo cross-check failed', details: err.message });
    }
});

app.get('/agentic/actions', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const zcql = catalystApp.zcql();
        const rows = await zcql.executeZCQLQuery(
            "SELECT * FROM Alerts WHERE Type IN ('AGENT_ACTION','DAILY_BRIEF','CASE_STARTER') ORDER BY CreatedAt DESC LIMIT 50"
        );
        const actions = (rows || []).map(r => {
            const a = r.Alerts || r;
            return {
                title: a.Title,
                description: a.Description,
                districtId: parseInt(a.DistrictID || 0),
                severity: a.Severity,
                type: a.Type,
                createdAt: a.CreatedAt
            };
        });
        res.status(200).json({ actions });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch actions', details: err.message });
    }
});

app.get('/agentic/briefs', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const zcql = catalystApp.zcql();
        const rows = await zcql.executeZCQLQuery(
            "SELECT * FROM Alerts WHERE Type = 'DAILY_BRIEF' ORDER BY CreatedAt DESC LIMIT 50"
        );
        const briefs = (rows || []).map(r => {
            const a = r.Alerts || r;
            return {
                title: a.Title,
                description: a.Description,
                districtId: parseInt(a.DistrictID || 0),
                severity: a.Severity,
                createdAt: a.CreatedAt,
                recommendation: a.Recommendation
            };
        });
        res.status(200).json({ briefs });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch briefs', details: err.message });
    }
});

module.exports = app;

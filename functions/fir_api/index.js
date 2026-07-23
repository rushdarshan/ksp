const express = require('express');
const catalyst = require('zcatalyst-sdk-node');
const { getCached, setCached } = require('../shared/cache-utils');
const { createSeededRandom, intBetween } = require('../shared/deterministic');
const { maskAadhaar, maskPhone } = require('../shared/pii-mask');

const app = express();
app.use(express.json());

app.get('/firs', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const unitId = req.headers['x-unit-id'] || '1';
        const cacheKey = `panel:fir_api:firs:${unitId}`;
        const cached = await getCached(catalystApp, cacheKey);
        if (cached) return res.status(200).json(cached);

        const zcql = catalystApp.zcql();
        const userManagement = catalystApp.userManagement();
        const userDetails = await userManagement.getCurrentProjectUser();
        const role = userDetails.role_details.role_name;

        let query = 'SELECT * FROM CaseMaster';
        if (role === 'Inspector') {
            query += ` WHERE PoliceStationID = ${unitId}`;
        }

        const firs = await zcql.executeZCQLQuery(query);
        await setCached(catalystApp, cacheKey, firs);
        res.status(200).json(firs);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching FIRs");
    }
});

app.get('/alerts', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const cacheKey = 'panel:fir_api:alerts';
        const cached = await getCached(catalystApp, cacheKey);
        if (cached) return res.status(200).json(cached);

        const zcql = catalystApp.zcql();

        let alerts;
        try {
            alerts = await zcql.executeZCQLQuery('SELECT * FROM Alerts ORDER BY CreatedAt DESC LIMIT 10');
        } catch (dbErr) {
            console.warn('Alerts table not found, returning empty:', dbErr.message);
            alerts = [];
        }

        const result = alerts.map(a => ({
            id: a.Alerts?.ROWID || a.ROWID,
            title: a.Alerts?.Title || a.Title,
            description: a.Alerts?.Description || a.Description,
            severity: a.Alerts?.Severity || a.Severity,
            type: a.Alerts?.Type || a.Type,
            recommendation: a.Alerts?.Recommendation || a.Recommendation,
            created_at: a.Alerts?.CreatedAt || a.CreatedAt
        }));

        await setCached(catalystApp, cacheKey, result);
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching alerts");
    }
});

app.post('/fir/lookup', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const { mobile, aadhaar } = req.body;
        if (!mobile && !aadhaar) return res.status(400).json({ error: 'Provide mobile or aadhaar' });
        const lookupKey = String(mobile || aadhaar).replace(/\D/g, '');
        const random = createSeededRandom(`fir-lookup:${lookupKey}:v2`);
        const mock = {
            name: `Demo person ${String(intBetween(random, 100, 999))}`,
            mobile: maskPhone(String(mobile || '')),
            aadhaar: maskAadhaar(String(aadhaar || '')),
            address: 'Synthetic address withheld',
            previousFIRs: intBetween(random, 0, 2),
            metadata: {
                dataSource: 'synthetic_demo',
                synthetic: true,
                note: 'No identity lookup was performed. This deterministic record exists only to demonstrate the interface.',
                humanReviewRequired: true
            }
        };
        res.status(200).json(mock);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = app;

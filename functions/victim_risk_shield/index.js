const express = require('express');
const catalyst = require('zcatalyst-sdk-node');
const { getCached, setCached } = require('../shared/cache-utils');
const { DEMO_GENERATED_AT, createSeededRandom, intBetween } = require('../shared/deterministic');

const app = express();
app.use(express.json());

app.get('/score/:victimId', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const zcql = catalystApp.zcql();
        const { victimId } = req.params;
        const weightByVeracityRequested = req.query.weightByVeracity === 'true';

        let victimFIRs = [];
        let allVictims = [];
        let synthetic = false;

        try {
            const rows = await zcql.executeZCQLQuery(
                `SELECT v.VictimID, v.VictimName, v.Age, v.Gender, v.CrimeHeadID, c.DistrictID, c.IncidentFromDate, c.FIRNo, c.FIRYear ` +
                `FROM Victim v INNER JOIN CaseMaster c ON v.CaseMasterID = c.CaseMasterID ` +
                `WHERE v.VictimID = '${victimId.replace(/[^a-zA-Z0-9]/g, '')}' ORDER BY c.IncidentFromDate DESC`
            );
            victimFIRs = rows.map(r => ({
                firNo: r.c?.FIRNo || r.FIRNo,
                year: r.c?.FIRYear || r.FIRYear,
                crimeHeadId: r.v?.CrimeHeadID || r.CrimeHeadID,
                districtId: r.c?.DistrictID || r.DistrictID,
                date: r.c?.IncidentFromDate || r.IncidentFromDate,
                age: r.v?.Age || r.Age,
                gender: r.v?.Gender || r.Gender,
                name: r.v?.VictimName || r.VictimName
            }));
        } catch (e) {
            console.warn('Data Store query failed, using deterministic synthetic demo records:', e.message);
            synthetic = true;
            const random = createSeededRandom(`victim-support:${victimId}:v2`);
            const recordCount = intBetween(random, 1, 4);
            const baseDate = new Date('2026-07-10T09:00:00Z');
            const demoAge = intBetween(random, 20, 54);
            victimFIRs = Array.from({ length: recordCount }, (_, i) => ({
                firNo: `${100 + i}`,
                year: 2026,
                crimeHeadId: (i % 12) + 1,
                districtId: (i % 10) + 1,
                date: new Date(baseDate.getTime() - i * 30 * 86400000).toISOString(),
                age: demoAge,
                gender: i % 2 === 0 ? 'Female' : 'Male',
                name: `Demo victim ${victimId}`
            }));
        }

        try {
            const countRows = await zcql.executeZCQLQuery(
                `SELECT VictimID, COUNT(*) as cnt FROM Victim GROUP BY VictimID ORDER BY COUNT(*) DESC LIMIT 100`
            );
            allVictims = countRows.map(r => ({
                victimId: r.Victim?.VictimID || r.VictimID,
                count: parseInt(r.Victim?.cnt || r.cnt || 0)
            }));
        } catch (e) {
            allVictims = [];
        }

        if (victimFIRs.length === 0) {
            return res.status(200).json({
                victimId,
                riskScore: 5,
                riskLevel: 'Low',
                firCount: 0,
                factors: ['No prior victimization record was returned by the available data source'],
                recommendation: 'No automated action. Confirm data completeness and follow standard support procedures.',
                history: [],
                metadata: {
                    dataSource: 'catalyst_data_store',
                    synthetic: false,
                    credibilityWeightingApplied: false,
                    credibilityWeightingRequestIgnored: weightByVeracityRequested,
                    note: 'FIR credibility scores never remove a person from victim-support review.',
                    humanReviewRequired: true
                }
            });
        }

        const firCount = victimFIRs.length;
        const recentMON = firCount > 1 ? victimFIRs.slice(0, 2).reduce((min, f, i, arr) => {
            if (i === 0) return Infinity;
            const d1 = new Date(arr[i - 1].date).getTime();
            const d2 = new Date(f.date).getTime();
            return Math.min(min, Math.abs(d2 - d1) / 86400000);
        }, Infinity) : Infinity;

        const hasViolentCrime = victimFIRs.some(f => [3, 4, 5, 6].includes(parseInt(f.crimeHeadId)));
        const hasSexualCrime = victimFIRs.some(f => parseInt(f.crimeHeadId) === 7);
        const timeSpanDays = firCount > 1 ?
            (new Date(victimFIRs[0].date).getTime() - new Date(victimFIRs[firCount - 1].date).getTime()) / 86400000
            : 0;
        const escalationRate = timeSpanDays > 0 && firCount > 1 ? firCount / (timeSpanDays / 30) : 0;

        const percentile = allVictims.length > 0
            ? (allVictims.filter(v => v.count <= firCount).length / allVictims.length) * 100
            : 50;

        let score = 0;
        const factors = [];

        if (firCount >= 5) { score += 30; factors.push(`Multiple victimizations (${firCount} FIRs)`); }
        else if (firCount >= 3) { score += 20; factors.push(`Repeat victim (${firCount} FIRs)`); }
        else if (firCount >= 2) { score += 10; factors.push(`Prior victimization (${firCount} FIRs)`); }

        if (recentMON < 30) { score += 20; factors.push('Recent revictimization within 30 days'); }
        else if (recentMON < 90) { score += 10; factors.push('Revictimization within 90 days'); }

        if (hasViolentCrime) { score += 15; factors.push('History of violent crime victimization'); }
        if (hasSexualCrime) { score += 20; factors.push('History of sexual crime victimization'); }
        if (escalationRate > 1) { score += 15; factors.push('Accelerating victimization rate'); }

        const riskScore = Math.min(99, score);
        const riskLevel = riskScore >= 50 ? 'High' : riskScore >= 25 ? 'Medium' : 'Low';

        let recommendation;
        if (riskLevel === 'High') {
            recommendation = 'Prompt human support review. Consider liaison outreach and voluntary safety planning under approved procedure.';
        } else if (riskLevel === 'Medium') {
            recommendation = 'Consider a human support assessment and confirm whether follow-up is appropriate.';
        } else {
            recommendation = 'Follow standard procedure and provide information about available support services.';
        }

        const recalculatedAt = synthetic ? DEMO_GENERATED_AT : new Date().toISOString();

        res.status(200).json({
            victimId,
            victimName: victimFIRs[0]?.name || null,
            riskScore,
            riskLevel,
            percentile: +percentile.toFixed(1),
            firCount,
            timeSpanDays: +timeSpanDays.toFixed(0),
            escalationRate: +escalationRate.toFixed(2),
            recentMONdays: recentMON === Infinity ? null : +recentMON.toFixed(0),
            factors,
            recommendation,
            recalculatedAt,
            metadata: {
                dataSource: synthetic ? 'synthetic_demo' : 'catalyst_data_store',
                synthetic,
                credibilityWeightingApplied: false,
                credibilityWeightingRequestIgnored: weightByVeracityRequested,
                note: synthetic
                    ? 'Deterministic synthetic history for interface demonstration. The score is not a protection decision.'
                    : 'Rule-based review aid from available history. It does not determine credibility, protection, or investigative action.',
                humanReviewRequired: true
            },
            history: victimFIRs.map(f => ({
                firNo: f.firNo,
                year: f.year,
                date: f.date,
                crimeHeadId: f.crimeHeadId,
                districtId: f.districtId
            }))
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Risk scoring failed', details: err.message });
    }
});

app.get('/high-risk', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const zcql = catalystApp.zcql();
        const cacheKey = 'panel:victim_risk_shield:high_risk:v2';
        const cached = await getCached(catalystApp, cacheKey);
        if (cached) return res.status(200).json(cached);

        let repeatVictims;
        let synthetic = false;
        try {
            const rows = await zcql.executeZCQLQuery(
                `SELECT VictimID, COUNT(*) as cnt FROM Victim GROUP BY VictimID HAVING COUNT(*) >= 2 ORDER BY COUNT(*) DESC LIMIT 20`
            );
            repeatVictims = rows.map(r => ({
                victimId: r.Victim?.VictimID || r.VictimID,
                count: parseInt(r.Victim?.cnt || r.cnt || 0)
            }));
        } catch (e) {
            synthetic = true;
            const random = createSeededRandom('victim-review-queue:v2');
            repeatVictims = Array.from({ length: 5 }, (_, i) => ({
                victimId: `V${i + 100}`,
                count: intBetween(random, 2, 6)
            }));
        }

        const response = {
            victims: repeatVictims,
            metadata: {
                dataSource: synthetic ? 'synthetic_demo' : 'catalyst_data_store',
                synthetic,
                note: 'Queue is ordered by repeat record count only. It is not a prediction of danger, culpability, or credibility.',
                humanReviewRequired: true
            }
        };
        await setCached(catalystApp, cacheKey, response);
        res.status(200).json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch high-risk victims', details: err.message });
    }
});

module.exports = app;

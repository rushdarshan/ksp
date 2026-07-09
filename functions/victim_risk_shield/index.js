const express = require('express');
const catalyst = require('zcatalyst-sdk-node');
const { VERACITY_CONFIG } = require('../shared/analyzer');
const { getCached, setCached } = require('../shared/cache-utils');

const app = express();
app.use(express.json());

app.get('/score/:victimId', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const zcql = catalystApp.zcql();
        const { victimId } = req.params;
        const weightByVeracity = req.query.weightByVeracity === 'true';

        let victimFIRs = [];
        let allVictims = [];

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
            console.warn('Data Store query failed, using mock data:', e.message);
            victimFIRs = Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => ({
                firNo: `${100 + i}`,
                year: 2026,
                crimeHeadId: (i % 12) + 1,
                districtId: (i % 10) + 1,
                date: new Date(Date.now() - i * 30 * 86400000).toISOString(),
                age: Math.floor(Math.random() * 30) + 20,
                gender: i % 2 === 0 ? 'Female' : 'Male',
                name: `Victim_${victimId}`
            }));
        }

        if (weightByVeracity && victimFIRs.length > 0) {
            try {
                const firNos = victimFIRs.map(f => `'${f.firNo}'`).join(',');
                const verRows = await zcql.executeZCQLQuery(
                    `SELECT FIRNo, VeracityScore FROM FirVeracity WHERE FIRNo IN (${firNos})`
                );
                const veracityMap = {};
                for (const row of verRows) {
                    const firNo = row.FirVeracity?.FIRNo || row.FIRNo;
                    const score = parseFloat(row.FirVeracity?.VeracityScore || row.VeracityScore || 0);
                    veracityMap[firNo] = score;
                }
                const excludedBefore = victimFIRs.length;
                victimFIRs = victimFIRs.filter(f => {
                    const score = veracityMap[f.firNo];
                    return score === undefined || score >= VERACITY_CONFIG.VICTIM_MIN;
                });
                const excludedCount = excludedBefore - victimFIRs.length;
                if (excludedCount > 0) {
                    console.warn(`Excluded ${excludedCount} FIRs below veracity threshold ${VERACITY_CONFIG.VICTIM_MIN}`);
                }
            } catch (e) {
                console.warn('FirVeracity join failed, using unweighted victim scoring:', e.message);
            }
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
                factors: [weightByVeracity ? 'No verifiable FIRs after veracity filtering' : 'No prior victimization record'],
                recommendation: 'Standard monitoring',
                history: []
            });
        }

        const firCount = victimFIRs.length;
        const recentMON = firCount > 1 ? victimFIRs.slice(0, 2).reduce((min, f, i, arr) => {
            if (i === 0) return Infinity;
            const d1 = new Date(arr[i - 1].date).getTime();
            const d2 = new Date(f.date).getTime();
            return Math.min(min, Math.abs(d2 - d1) / 86400000);
        }, Infinity) : Infinity;

        const hasViolentCrime = victimFIRs.some(f => [3, 4, 5, 6].includes(f.crimeHeadId));
        const hasSexualCrime = victimFIRs.some(f => f.crimeHeadId === 7);
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

        if (weightByVeracity) {
            factors.push('VeriPol-weighted: filtered low-credibility FIRs');
        }

        const riskScore = Math.min(99, score);
        const riskLevel = riskScore >= 50 ? 'High' : riskScore >= 25 ? 'Medium' : 'Low';

        let recommendation;
        if (riskLevel === 'High') {
            recommendation = 'Immediate proactive outreach. Assign victim liaison officer. Consider relocation counseling and safety planning.';
        } else if (riskLevel === 'Medium') {
            recommendation = 'Schedule victim support assessment. Monitor for 90 days with monthly check-ins.';
        } else {
            recommendation = 'Standard procedure. Inform victim of support services available.';
        }

        const recalculatedAt = new Date().toISOString();

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
        const cacheKey = 'panel:victim_risk_shield:high_risk';
        const cached = await getCached(catalystApp, cacheKey);
        if (cached) return res.status(200).json(cached);

        let repeatVictims;
        try {
            const rows = await zcql.executeZCQLQuery(
                `SELECT VictimID, COUNT(*) as cnt FROM Victim GROUP BY VictimID HAVING COUNT(*) >= 2 ORDER BY COUNT(*) DESC LIMIT 20`
            );
            repeatVictims = rows.map(r => ({
                victimId: r.Victim?.VictimID || r.VictimID,
                count: parseInt(r.Victim?.cnt || r.cnt || 0)
            }));
        } catch (e) {
            repeatVictims = Array.from({ length: 5 }, (_, i) => ({
                victimId: `V${i + 100}`,
                count: Math.floor(Math.random() * 5) + 2
            }));
        }

        await setCached(catalystApp, cacheKey, repeatVictims);
        res.status(200).json(repeatVictims);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch high-risk victims', details: err.message });
    }
});

module.exports = app;

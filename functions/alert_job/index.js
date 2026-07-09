const catalyst = require('zcatalyst-sdk-node');
const { runCrossCheck } = require('../shared/cross_check');

module.exports = async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const zcql = catalystApp.zcql();
        const table = catalystApp.datastore().table('Alerts');

        const alerts = [];

        const districtCounts = await zcql.executeZCQLQuery(
            `SELECT DistrictID, COUNT(*) as cnt FROM CaseMaster WHERE IncidentFromDate >= SYSDATE - 7 GROUP BY DistrictID`
        );

        const historicalBaselines = {
            1: { mean: 8, stddev: 3 }, 2: { mean: 12, stddev: 4 },
            3: { mean: 6, stddev: 2.5 }, 4: { mean: 15, stddev: 5 },
            5: { mean: 10, stddev: 3.5 }, 6: { mean: 7, stddev: 2 },
            7: { mean: 9, stddev: 3 }, 8: { mean: 5, stddev: 2 },
            9: { mean: 11, stddev: 4 }, 10: { mean: 14, stddev: 4.5 }
        };

        for (const row of districtCounts) {
            const districtId = parseInt(row.CaseMaster?.DistrictID || row.DistrictID);
            const count = parseInt(row.CaseMaster?.cnt || row.cnt || 0);
            const baseline = historicalBaselines[districtId] || { mean: 8, stddev: 3 };

            const zScore = (count - baseline.mean) / baseline.stddev;
            if (zScore > 2.0) {
                const severity = zScore > 4.0 ? 'High' : 'Medium';
                alerts.push({
                    Title: `${severity === 'High' ? '⚠️' : '⚡'} ${Math.round(zScore * 100)}% crime surge in District ${districtId}`,
                    Description: `Detected ${severity.toLowerCase()} surge over 7 days. Historical avg: ${baseline.mean}, Current: ${count}. Z-score: ${zScore.toFixed(2)}.`,
                    DistrictID: districtId,
                    Severity: severity,
                    CreatedAt: new Date().toISOString(),
                    Type: 'CRIME_SURGE',
                    Recommendation: zScore > 4 ? `Consider deploying ${Math.ceil((count - baseline.mean) / 2)} additional patrols in District ${districtId}` : 'Monitor situation'
                });
            }
        }

        const repeatVictims = await zcql.executeZCQLQuery(
            `SELECT VictimID, COUNT(*) as cnt FROM Victim GROUP BY VictimID HAVING COUNT(*) >= 3 ORDER BY COUNT(*) DESC`
        );

        for (const row of (repeatVictims || []).slice(0, 5)) {
            const victimId = row.Victim?.VictimID || row.VictimID;
            const count = parseInt(row.Victim?.cnt || row.cnt || 0);
            alerts.push({
                Title: `🛡️ Repeat victimization risk: ${count} FIRs`,
                Description: `VictimID ${victimId} has been named in ${count} separate FIRs — elevated revictimization risk. Recommend proactive outreach.`,
                DistrictID: 0,
                Severity: count > 5 ? 'High' : 'Medium',
                CreatedAt: new Date().toISOString(),
                Type: 'VICTIM_RISK',
                Recommendation: `Assign victim liaison officer for VictimID ${victimId}`
            });
        }

        for (const row of districtCounts) {
            const districtId = parseInt(row.CaseMaster?.DistrictID || row.DistrictID);
            const count = parseInt(row.CaseMaster?.cnt || row.cnt || 0);
            const baseline = historicalBaselines[districtId] || { mean: 8, stddev: 3 };
            const zScore = (count - baseline.mean) / baseline.stddev;

            if (zScore > 3.0) {
                const recentFirs = await zcql.executeZCQLQuery(
                    `SELECT CaseMasterID FROM CaseMaster WHERE DistrictID = ${districtId} AND IncidentFromDate >= SYSDATE - 7`
                );
                const clusterFirs = [];
                const firsToCheck = recentFirs || [];
                for (const rf of firsToCheck.slice(0, 5)) {
                    const fid = parseInt(rf.CaseMaster?.CaseMasterID || rf.CaseMasterID);
                    const linked = await runCrossCheck(catalystApp, fid);
                    for (const l of linked) {
                        if (!clusterFirs.find(x => x.linkedFirId === l.linkedFirId)) {
                            clusterFirs.push(l);
                        }
                    }
                }

                const crimeTypeDominance = clusterFirs.length > 0
                    ? `Cluster of ${clusterFirs.length} linked FIRs detected`
                    : `${count} FIRs in district with Z-score ${zScore.toFixed(2)}`;

                alerts.push({
                    Title: `Case Starter: Crime cluster in District ${districtId} (Z-score: ${zScore.toFixed(1)})`,
                    Description: `${crimeTypeDominance}. Historical avg: ${baseline.mean}, Current: ${count}. Recommended action: Prioritize investigation in District ${districtId}.`,
                    DistrictID: districtId,
                    Severity: 'High',
                    CreatedAt: new Date().toISOString(),
                    Type: 'CASE_STARTER',
                    Recommendation: `Deploy ${Math.ceil((count - baseline.mean) / 2)} additional resources to District ${districtId}`
                });
            }
        }

        if (alerts.length === 0) {
            alerts.push({
                Title: '✅ No anomalies detected',
                Description: 'All districts within normal crime ranges for the past 7 days.',
                DistrictID: 0,
                Severity: 'Low',
                CreatedAt: new Date().toISOString(),
                Type: 'INFO'
            });
        }

        try {
            await table.insertRows(alerts.slice(0, 10));
        } catch (dbErr) {
            console.warn('Could not persist alerts to Data Store (table may not exist):', dbErr.message);
        }

        try {
            await catalystApp.signal().publish({
                name: 'alert.computed',
                data: { count: alerts.length, generatedAt: new Date().toISOString() }
            });
        } catch (signalErr) {
            console.warn('Signal publish failed (may be unavailable in this DC):', signalErr.message);
        }

        res.status(200).send("Alert Job Executed Successfully: " + JSON.stringify(alerts.length) + " alerts generated.");
    } catch (err) {
        console.error(err);
        res.status(500).send("Alert Job Error: " + err.toString());
    }
};

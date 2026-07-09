const express = require('express');
const catalyst = require('zcatalyst-sdk-node');

const app = express();
app.use(express.json());

const DISTRICTS = Array.from({ length: 10 }, (_, i) => i + 1);

function generateBeats(districtId, count = 6) {
    const beats = [];
    const crimeHeads = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    for (let i = 0; i < count; i++) {
        const totalCrimes = Math.floor(Math.random() * 80) + 20;
        const byType = {};
        for (const h of crimeHeads) {
            byType[h] = Math.floor(Math.random() * (totalCrimes / crimeHeads.length) * 2);
        }
        beats.push({
            id: `${districtId}-B${String(i + 1).padStart(2, '0')}`,
            name: `Beat ${i + 1}`,
            districtId,
            totalCrimes,
            byType,
            areaKm2: +(Math.random() * 15 + 3).toFixed(1),
            officersAssigned: Math.floor(Math.random() * 8) + 3,
            responseTimeMin: +(Math.random() * 12 + 3).toFixed(1),
            riskScore: +(Math.random() * 0.8 + 0.2).toFixed(2),
            hotspots: Array.from({ length: Math.floor(Math.random() * 4) + 1 }, (_, j) => ({
                lat: 12.8 + Math.random() * 1.2,
                lng: 77.4 + Math.random() * 0.4,
                risk: Math.random(),
                label: `Hotspot ${j + 1}`
            }))
        });
    }
    return beats.sort((a, b) => b.riskScore - a.riskScore);
}

function computePatrolRoute(hotspots) {
    if (!hotspots.length) return [];
    const pts = hotspots.map((h, i) => ({ ...h, idx: i }));
    let current = pts.shift();
    const route = [current];
    while (pts.length) {
        let nearestIdx = 0;
        let nearestDist = Infinity;
        for (let i = 0; i < pts.length; i++) {
            const d = Math.abs(pts[i].lat - current.lat) + Math.abs(pts[i].lng - current.lng);
            if (d < nearestDist) { nearestDist = d; nearestIdx = i; }
        }
        current = pts.splice(nearestIdx, 1)[0];
        route.push(current);
    }
    return route.map(r => ({ lat: r.lat, lng: r.lng, label: r.label, risk: r.risk }));
}

function generateOptimization(beats) {
    const total = beats.reduce((s, b) => s + b.totalCrimes, 0);
    const avg = total / beats.length;
    return beats.map(b => {
        const loadRatio = b.totalCrimes / avg;
        const recommendedOfficers = Math.round((b.officersAssigned * loadRatio + b.officersAssigned) / 2);
        return {
            beatId: b.id,
            currentCrimes: b.totalCrimes,
            currentOfficers: b.officersAssigned,
            recommendedOfficers: Math.max(2, recommendedOfficers),
            loadRatio: +loadRatio.toFixed(2),
            status: loadRatio > 1.3 ? 'Overloaded' : loadRatio < 0.7 ? 'Underloaded' : 'Balanced'
        };
    });
}

app.get('/beats/:districtId', async (req, res) => {
    try {
        const districtId = parseInt(req.params.districtId) || 1;
        const catalystApp = catalyst.initialize(req);
        const zcql = catalystApp.zcql();
        let beats;
        try {
            const rows = await zcql.executeZCQLQuery(
                `SELECT b.BeatID, b.BeatName, b.DistrictID, COUNT(c.FIRNo) as crimeCount ` +
                `FROM Beat b LEFT JOIN CaseMaster c ON b.DistrictID = c.DistrictID ` +
                `WHERE b.DistrictID = ${districtId} ` +
                `GROUP BY b.BeatID, b.BeatName, b.DistrictID`
            );
            if (rows && rows.length > 0) {
                beats = rows.map(r => ({
                    id: r.b?.BeatID || r.BeatID,
                    name: r.b?.BeatName || r.BeatName,
                    districtId: parseInt(r.b?.DistrictID || r.DistrictID),
                    totalCrimes: parseInt(r['COUNT(FIRNo)'] || r.crimeCount || 0),
                    areaKm2: +(Math.random() * 15 + 3).toFixed(1),
                    officersAssigned: Math.floor(Math.random() * 8) + 3,
                    responseTimeMin: +(Math.random() * 12 + 3).toFixed(1),
                    riskScore: +(Math.random() * 0.8 + 0.2).toFixed(2),
                    hotspots: []
                }));
                return res.status(200).json({ beats, districtId });
            }
        } catch (e) { console.warn('DB query failed, using demo data:', e.message); }
        beats = generateBeats(districtId);
        res.status(200).json({ beats, districtId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/optimize/:districtId', async (req, res) => {
    try {
        const districtId = parseInt(req.params.districtId) || 1;
        const flowMode = req.query.flowMode === 'true';
        const beats = generateBeats(districtId);
        const optimization = generateOptimization(beats);

        let flowData = null;
        if (flowMode) {
            const criminalClusters = Array.from({ length: 5 }, (_, i) => ({
                clusterId: i + 1,
                criminalCount: Math.floor(Math.random() * 30) + 10,
                centroidLat: 12.8 + Math.random() * 1.2,
                centroidLng: 77.4 + Math.random() * 0.4,
                topCrimeType: ['theft', 'robbery', 'burglary', 'assault', 'cyber'][i],
                avgTravelKm: +(Math.random() * 8 + 2).toFixed(1)
            }));
            const flowBeats = beats.map(b => {
                const nearestCluster = criminalClusters.reduce((best, c) => {
                    const dist = Math.abs(c.centroidLat - (b.hotspots[0]?.lat || 13)) + Math.abs(c.centroidLng - (b.hotspots[0]?.lng || 77.6));
                    return dist < best.dist ? { cluster: c, dist } : best;
                }, { cluster: criminalClusters[0], dist: Infinity });
                return {
                    beatId: b.id,
                    criminalProximity: +nearestCluster.dist.toFixed(2),
                    predictedTargetCrime: nearestCluster.cluster.topCrimeType,
                    flowRiskScore: +(b.riskScore * (1 + nearestCluster.cluster.criminalCount / 100)).toFixed(2),
                    recommendedPatrolShift: nearestCluster.cluster.avgTravelKm > 5 ? 'Early morning' : 'Evening'
                };
            });
            flowData = { criminalClusters, flowBeats };
        }

        const overloaded = optimization.filter(o => o.status === 'Overloaded').length;
        const balanced = optimization.filter(o => o.status === 'Balanced').length;
        const underloaded = optimization.filter(o => o.status === 'Underloaded').length;
        res.status(200).json({
            districtId, optimization, flowMode, flowData,
            summary: { totalBeats: beats.length, overloaded, balanced, underloaded, avgLoad: +(beats.reduce((s, b) => s + b.totalCrimes, 0) / beats.length).toFixed(1) }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/patrol/:districtId', async (req, res) => {
    try {
        const districtId = parseInt(req.params.districtId) || 1;
        const beats = generateBeats(districtId);
        const routes = beats.map(b => ({
            beatId: b.id,
            beatName: b.name,
            route: computePatrolRoute(b.hotspots),
            totalDistance: +(b.hotspots.length * (Math.random() * 2 + 1)).toFixed(1),
            estimatedMinutes: +(b.hotspots.length * (Math.random() * 8 + 4)).toFixed(0)
        }));
        res.status(200).json({ districtId, routes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/districts', async (req, res) => {
    res.status(200).json(DISTRICTS.map(d => ({ id: d, name: `District ${d}` })));
});

module.exports = app;

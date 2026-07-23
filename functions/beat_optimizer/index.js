const express = require('express');
const catalyst = require('zcatalyst-sdk-node');
const { createSeededRandom, intBetween, numberBetween } = require('../shared/deterministic');

const app = express();
app.use(express.json());

const DISTRICTS = Array.from({ length: 10 }, (_, i) => i + 1);

function generateBeats(districtId, count = 6) {
    const beats = [];
    const crimeHeads = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    for (let i = 0; i < count; i++) {
        const random = createSeededRandom(`beat:${districtId}:${i}:v2`);
        const totalCrimes = intBetween(random, 32, 96);
        const byType = {};
        const weights = crimeHeads.map(() => 0.5 + random());
        const weightTotal = weights.reduce((sum, value) => sum + value, 0);
        let allocated = 0;
        for (const [headIndex, h] of crimeHeads.entries()) {
            const value = headIndex === crimeHeads.length - 1
                ? totalCrimes - allocated
                : Math.floor(totalCrimes * weights[headIndex] / weightTotal);
            byType[h] = value;
            allocated += value;
        }
        const riskScore = Math.min(0.95, 0.2 + totalCrimes / 150 + numberBetween(random, 0, 0.08));
        beats.push({
            id: `${districtId}-B${String(i + 1).padStart(2, '0')}`,
            name: `Beat ${i + 1}`,
            districtId,
            totalCrimes,
            byType,
            areaKm2: numberBetween(random, 4, 17, 1),
            officersAssigned: intBetween(random, 4, 10),
            responseTimeMin: numberBetween(random, 5, 14, 1),
            riskScore: +riskScore.toFixed(2),
            hotspots: Array.from({ length: intBetween(random, 2, 4) }, (_, j) => ({
                lat: numberBetween(random, 12.82, 13.12, 6),
                lng: numberBetween(random, 77.46, 77.76, 6),
                risk: numberBetween(random, 0.3, 0.9, 2),
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
    const avg = beats.length > 0 ? total / beats.length : 0;
    return beats.map(b => {
        const loadRatio = avg > 0 ? b.totalCrimes / avg : 0;
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

function enrichStoredBeat(row, districtId, index, maxCrimes) {
    const id = row.b?.BeatID || row.BeatID || `${districtId}-B${String(index + 1).padStart(2, '0')}`;
    const random = createSeededRandom(`stored-beat:${districtId}:${id}:v2`);
    const totalCrimes = parseInt(row['COUNT(FIRNo)'] || row.crimeCount || 0);
    return {
        id,
        name: row.b?.BeatName || row.BeatName || `Beat ${index + 1}`,
        districtId: parseInt(row.b?.DistrictID || row.DistrictID || districtId),
        totalCrimes,
        areaKm2: numberBetween(random, 4, 17, 1),
        officersAssigned: intBetween(random, 4, 10),
        responseTimeMin: numberBetween(random, 5, 14, 1),
        riskScore: +(0.2 + (maxCrimes > 0 ? totalCrimes / maxCrimes : 0) * 0.65).toFixed(2),
        hotspots: []
    };
}

async function loadBeats(zcql, districtId) {
    try {
        const rows = await zcql.executeZCQLQuery(
            `SELECT b.BeatID, b.BeatName, b.DistrictID, COUNT(c.FIRNo) as crimeCount ` +
            `FROM Beat b LEFT JOIN CaseMaster c ON b.DistrictID = c.DistrictID ` +
            `WHERE b.DistrictID = ${districtId} ` +
            `GROUP BY b.BeatID, b.BeatName, b.DistrictID`
        );
        if (rows && rows.length > 0) {
            const maxCrimes = Math.max(...rows.map(row => parseInt(row['COUNT(FIRNo)'] || row.crimeCount || 0)), 0);
            return {
                beats: rows.map((row, index) => enrichStoredBeat(row, districtId, index, maxCrimes)),
                metadata: {
                    dataSource: 'catalyst_data_store_with_demo_planning_assumptions',
                    synthetic: false,
                    syntheticFields: ['areaKm2', 'officersAssigned', 'responseTimeMin', 'riskScore', 'hotspots']
                }
            };
        }
    } catch (error) {
        console.warn('Data Store beat query failed, using deterministic synthetic demo data:', error.message);
    }

    return {
        beats: generateBeats(districtId),
        metadata: {
            dataSource: 'synthetic_demo',
            synthetic: true,
            syntheticFields: ['all']
        }
    };
}

function routeDistanceKm(route) {
    let distance = 0;
    for (let index = 1; index < route.length; index++) {
        const latKm = (route[index].lat - route[index - 1].lat) * 111;
        const lngKm = (route[index].lng - route[index - 1].lng) * 108;
        distance += Math.sqrt(latKm ** 2 + lngKm ** 2);
    }
    return distance;
}

app.get('/beats/:districtId', async (req, res) => {
    try {
        const districtId = parseInt(req.params.districtId) || 1;
        const catalystApp = catalyst.initialize(req);
        const zcql = catalystApp.zcql();
        const result = await loadBeats(zcql, districtId);
        res.status(200).json({
            beats: result.beats,
            districtId,
            metadata: {
                ...result.metadata,
                note: 'Planning attributes are illustrative and require supervisor review before resource allocation.',
                humanReviewRequired: true
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/optimize/:districtId', async (req, res) => {
    try {
        const districtId = parseInt(req.params.districtId) || 1;
        const flowMode = req.query.flowMode === 'true';
        const catalystApp = catalyst.initialize(req);
        const loaded = await loadBeats(catalystApp.zcql(), districtId);
        const beats = loaded.beats;
        const optimization = generateOptimization(beats);

        let flowData = null;
        if (flowMode) {
            const random = createSeededRandom(`beat-flow:${districtId}:v2`);
            const criminalClusters = Array.from({ length: 5 }, (_, i) => ({
                clusterId: i + 1,
                criminalCount: intBetween(random, 12, 36),
                centroidLat: numberBetween(random, 12.82, 13.12, 6),
                centroidLng: numberBetween(random, 77.46, 77.76, 6),
                topCrimeType: ['theft', 'robbery', 'burglary', 'assault', 'cyber'][i],
                avgTravelKm: numberBetween(random, 2, 9, 1)
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
            summary: { totalBeats: beats.length, overloaded, balanced, underloaded, avgLoad: beats.length > 0 ? +(beats.reduce((s, b) => s + b.totalCrimes, 0) / beats.length).toFixed(1) : 0 },
            metadata: {
                ...loaded.metadata,
                flowScenarioSynthetic: flowMode,
                note: 'Recommendations are deterministic planning scenarios, not deployment orders or evidence of criminal involvement.',
                humanReviewRequired: true
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/patrol/:districtId', async (req, res) => {
    try {
        const districtId = parseInt(req.params.districtId) || 1;
        const catalystApp = catalyst.initialize(req);
        const loaded = await loadBeats(catalystApp.zcql(), districtId);
        const beats = loaded.beats;
        const routes = beats.map(b => {
            const route = computePatrolRoute(b.hotspots);
            const totalDistance = routeDistanceKm(route);
            return {
                beatId: b.id,
                beatName: b.name,
                route,
                totalDistance: +totalDistance.toFixed(1),
                estimatedMinutes: Math.round((totalDistance / 18) * 60 + b.hotspots.length * 3)
            };
        });
        res.status(200).json({
            districtId,
            routes,
            metadata: {
                ...loaded.metadata,
                note: 'Routes are illustrative straight-line sequences. Validate road access, staffing, and safety before use.',
                humanReviewRequired: true
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/districts', async (req, res) => {
    res.status(200).json(DISTRICTS.map(d => ({ id: d, name: `District ${d}` })));
});

module.exports = app;

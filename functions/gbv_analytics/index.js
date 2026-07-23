const express = require('express');
const catalyst = require('zcatalyst-sdk-node');
const { createSeededRandom, intBetween, pick } = require('../shared/deterministic');

const app = express();
app.use(express.json());

const GBV_CRIME_TYPES = [
    { id: 'rape', label: 'Rape & Sexual Assault', crimeHeads: [7, 13, 14] },
    { id: 'domestic', label: 'Domestic Violence', crimeHeads: [8, 15] },
    { id: 'dowry', label: 'Dowry Deaths', crimeHeads: [9] },
    { id: 'kidnapping', label: 'Kidnapping & Abduction', crimeHeads: [11] },
    { id: 'trafficking', label: 'Human Trafficking', crimeHeads: [16] },
    { id: 'acid', label: 'Acid Attacks', crimeHeads: [17] },
    { id: 'harassment', label: 'Sexual Harassment', crimeHeads: [12, 18] },
    { id: 'honour', label: 'Honour Crimes', crimeHeads: [19] }
];

const GBV_KEYWORDS = [
    'rape', 'molest', 'sexual', 'harass', 'dowry', 'domestic violence',
    'acid attack', 'kidnap', 'traffick', 'outraging modesty', 'pocso',
    'immoral traffic', 'forced marriage', 'honour killing', 'eve teasing',
    'stalking', 'voyeurism', 'cruelty by husband', 'dowry death'
];

function allocateTotal(total, itemCount, random) {
    const weights = Array.from({ length: itemCount }, () => 0.6 + random());
    const weightTotal = weights.reduce((sum, value) => sum + value, 0);
    const values = weights.map(weight => Math.floor((weight / weightTotal) * total));
    let remainder = total - values.reduce((sum, value) => sum + value, 0);
    for (let index = 0; remainder > 0; index = (index + 1) % values.length) {
        values[index] += 1;
        remainder -= 1;
    }
    return values;
}

function percentChange(current, previous) {
    if (previous <= 0) return 0;
    return +(((current - previous) / previous) * 100).toFixed(1);
}

function getDefaultAnalytics(seed = 'gbv-analytics:v2') {
    const random = createSeededRandom(seed);
    const allTypes = GBV_CRIME_TYPES.map(type => type.id);
    const byMonth = Array.from({ length: 18 }, (_, index) => {
        const date = new Date(Date.UTC(2025, index, 1));
        return {
            year: date.getUTCFullYear(),
            month: date.getUTCMonth() + 1,
            cases: intBetween(random, 14, 29),
            type: pick(random, allTypes)
        };
    });
    const totalCases = byMonth.reduce((sum, item) => sum + item.cases, 0);
    const typeCounts = allocateTotal(totalCases, GBV_CRIME_TYPES.length, random);
    const districtCounts = allocateTotal(totalCases, 10, random);
    const latestSixMonths = byMonth.slice(-6).reduce((sum, item) => sum + item.cases, 0);
    const previousSixMonths = byMonth.slice(-12, -6).reduce((sum, item) => sum + item.cases, 0);

    return {
        summary: {
            totalCases,
            changePercent: percentChange(latestSixMonths, previousSixMonths),
            districtsAffected: districtCounts.filter(Boolean).length
        },
        byType: GBV_CRIME_TYPES.map((type, index) => ({
            type: type.id,
            label: type.label,
            count: typeCounts[index],
            trend: intBetween(random, -9, 11)
        })),
        byDistrict: districtCounts.map((count, index) => ({
            districtId: index + 1,
            count,
            gbvShare: +(count / totalCases).toFixed(3)
        })),
        byMonth,
        repeatVictims: districtCounts.slice(0, 8).map((count, index) => ({
            districtId: index + 1,
            count: Math.max(1, Math.round(count * 0.12)),
            victimCount: Math.max(1, Math.round(count * 0.08))
        })),
        convictionRate: { overall: 0, byDistrict: [], available: false },
        metadata: {
            dataSource: 'synthetic_demo',
            synthetic: true,
            periodStart: '2025-01',
            periodEnd: '2026-06',
            note: 'Deterministic synthetic records for interface demonstration. No outcome or conviction inference is available.',
            humanReviewRequired: true
        }
    };
}

app.get('/analytics', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const zcql = catalystApp.zcql();

        let analytics;
        try {
            const gbvCrimeHeads = GBV_CRIME_TYPES.flatMap(t => t.crimeHeads);
            const headList = gbvCrimeHeads.join(',');

            const data = await zcql.executeZCQLQuery(
                `SELECT v.VictimID, v.CrimeHeadID, v.Gender, v.Age, c.DistrictID, c.IncidentFromDate, c.FIRNo ` +
                `FROM Victim v INNER JOIN CaseMaster c ON v.CaseMasterID = c.CaseMasterID ` +
                `WHERE v.CrimeHeadID IN (${headList}) ` +
                `ORDER BY c.IncidentFromDate DESC LIMIT 500`
            );

            const cases = data.map(r => ({
                victimId: r.v?.VictimID || r.VictimID,
                crimeHeadId: parseInt(r.v?.CrimeHeadID || r.CrimeHeadID),
                gender: r.v?.Gender || r.Gender,
                age: parseInt(r.v?.Age || r.Age || 0),
                districtId: parseInt(r.c?.DistrictID || r.DistrictID),
                date: r.c?.IncidentFromDate || r.IncidentFromDate,
                firNo: r.c?.FIRNo || r.FIRNo
            })).filter(c => c.firNo);

            const validDates = cases.map(item => new Date(item.date)).filter(date => !Number.isNaN(date.getTime()));
            const latestDate = validDates.reduce((latest, date) => date > latest ? date : latest, new Date(0));
            const currentStart = latestDate.getTime() > 0 ? new Date(latestDate.getTime() - 90 * 86400000) : null;
            const previousStart = currentStart ? new Date(currentStart.getTime() - 90 * 86400000) : null;
            const byType = GBV_CRIME_TYPES.map(t => {
                const matching = cases.filter(c => t.crimeHeads.includes(c.crimeHeadId));
                const currentCount = currentStart ? matching.filter(c => new Date(c.date) >= currentStart).length : 0;
                const previousCount = previousStart ? matching.filter(c => {
                    const date = new Date(c.date);
                    return date >= previousStart && date < currentStart;
                }).length : 0;
                return {
                    type: t.id,
                    label: t.label,
                    count: matching.length,
                    trend: percentChange(currentCount, previousCount)
                };
            });

            const districtSet = new Set(cases.map(c => c.districtId));
            const byMonth = {};

            for (const c of cases) {
                if (c.date) {
                    const d = new Date(c.date);
                    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
                    byMonth[key] = (byMonth[key] || 0) + 1;
                }
            }

            const byDistrict = [...districtSet].map(did => {
                const dCases = cases.filter(c => c.districtId === did);
                return {
                    districtId: did,
                    count: dCases.length,
                    gbvShare: +(dCases.length / Math.max(cases.length, 1)).toFixed(3)
                };
            }).sort((a, b) => b.count - a.count);

            const byMonthArray = Object.entries(byMonth).map(([k, v]) => {
                const [y, m] = k.split('-').map(Number);
                return { year: y, month: m, cases: v };
            }).sort((a, b) => a.year - b.year || a.month - b.month);

            const currentTotal = currentStart ? cases.filter(c => new Date(c.date) >= currentStart).length : 0;
            const previousTotal = previousStart ? cases.filter(c => {
                const date = new Date(c.date);
                return date >= previousStart && date < currentStart;
            }).length : 0;

            analytics = {
                summary: {
                    totalCases: cases.length,
                    changePercent: percentChange(currentTotal, previousTotal),
                    districtsAffected: districtSet.size
                },
                byType,
                byDistrict,
                byMonth: byMonthArray,
                repeatVictims: [...districtSet].map(did => {
                    const victimCounts = {};
                    for (const item of cases.filter(c => c.districtId === did && c.victimId)) {
                        victimCounts[item.victimId] = (victimCounts[item.victimId] || 0) + 1;
                    }
                    const repeatCounts = Object.values(victimCounts).filter(count => count > 1);
                    return {
                        districtId: did,
                        count: repeatCounts.reduce((sum, count) => sum + count, 0),
                        victimCount: repeatCounts.length
                    };
                }).sort((a, b) => b.count - a.count),
                convictionRate: {
                    overall: 0,
                    byDistrict: [],
                    available: false
                },
                metadata: {
                    dataSource: 'catalyst_data_store',
                    synthetic: false,
                    note: 'Counts reflect available FIR and victim rows. Outcome rates are unavailable because no denominator-safe court outcome data was queried.',
                    humanReviewRequired: true
                }
            };
        } catch (e) {
            console.warn('Data Store query failed, using deterministic synthetic demo data:', e.message);
            analytics = getDefaultAnalytics('gbv-analytics:v2');
        }

        res.status(200).json(analytics);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'GBV analytics failed', details: err.message });
    }
});

app.get('/types', async (req, res) => {
    res.status(200).json(GBV_CRIME_TYPES);
});

app.get('/resources', async (req, res) => {
    res.status(200).json({
        shelters: [
            { name: 'Sakhi One-Stop Centre', district: 'Urban', phone: '181', services: ['Medical', 'Legal', 'Counseling', 'Shelter'] },
            { name: 'Mahila Police Station', district: 'All Districts', phone: '1091', services: ['Complaint Filing', 'Protection'] },
            { name: 'National Commission for Women', district: 'National', phone: '7827170170', services: ['Legal Aid', 'Helpline'] },
            { name: 'Vanita Sahayavani', district: 'Statewide', phone: '1091', services: ['Crisis Intervention', 'Counseling'] }
        ],
        laws: [
            { name: 'Protection of Women from Domestic Violence Act 2005', key: 'DV Act' },
            { name: 'BNS Section 63-70 (Sexual Offences)', key: 'BNS 63-70' },
            { name: 'Dowry Prohibition Act 1961', key: 'DP Act' },
            { name: 'POCSO Act 2012', key: 'POCSO' },
            { name: 'Immoral Traffic (Prevention) Act', key: 'ITPA' }
        ]
    });
});

module.exports = app;

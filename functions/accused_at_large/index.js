const express = require('express');
const catalyst = require('zcatalyst-sdk-node');

const app = express();
app.use(express.json());

const unwrap = (row, table) => row?.[table] || row || {};
const daysSince = value => Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86400000));

app.get('/ledger', async (req, res) => {
    try {
        const zcql = catalyst.initialize(req).zcql();
        const [accusedRows, arrestRows, caseRows] = await Promise.all([
            zcql.executeZCQLQuery('SELECT * FROM Accused LIMIT 1000'),
            zcql.executeZCQLQuery('SELECT AccusedMasterID FROM ArrestSurrender LIMIT 2000'),
            zcql.executeZCQLQuery('SELECT CaseMasterID, CrimeNo, CrimeRegisteredDate, PoliceStationID, CrimeMajorHeadID, PolicePersonID FROM CaseMaster LIMIT 1000'),
        ]);
        const arrested = new Set(arrestRows.map(row => String(unwrap(row, 'ArrestSurrender').AccusedMasterID)));
        const cases = new Map(caseRows.map(row => {
            const item = unwrap(row, 'CaseMaster');
            return [String(item.CaseMasterID), item];
        }));
        let entries = accusedRows
            .map(row => unwrap(row, 'Accused'))
            .filter(item => !arrested.has(String(item.AccusedMasterID)))
            .map(item => {
                const record = cases.get(String(item.CaseMasterID)) || {};
                const daysAtLarge = record.CrimeRegisteredDate ? daysSince(record.CrimeRegisteredDate) : 0;
                return {
                    id: item.AccusedMasterID,
                    name: item.AccusedName || 'Name withheld',
                    age: item.AgeYear || 'unknown',
                    crimeType: `crime head ${record.CrimeMajorHeadID || 'unknown'}`,
                    firNo: String(record.CrimeNo || item.CaseMasterID),
                    districtId: record.PoliceStationID || 'unknown',
                    daysAtLarge,
                    status: daysAtLarge > 30 ? 'absconding' : 'recent',
                    lastKnownLocation: null,
                    warrantsIssued: 0,
                    officer: `Officer ${record.PolicePersonID || 'unassigned'}`,
                };
            });
        if (req.query.station) entries = entries.filter(item => String(item.districtId) === String(req.query.station));
        const averageDaysAtLarge = entries.length ? Math.round(entries.reduce((sum, item) => sum + item.daysAtLarge, 0) / entries.length) : 0;
        res.status(200).json({
            total: entries.length,
            abscondingCount: entries.filter(item => item.status === 'absconding').length,
            bailableWarrantCount: 0,
            averageDaysAtLarge,
            entries,
            metadata: { mode: 'live', method: 'Accused anti-joined to ArrestSurrender', limitations: ['Warrant and last-known-location fields are absent from the supplied schema.'] },
        });
    } catch (error) {
        console.error('Accused-at-large ledger failed:', error);
        res.status(500).json({ error: 'Unable to build accused-at-large ledger' });
    }
});

module.exports = app;

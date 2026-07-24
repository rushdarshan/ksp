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

const REPEAT_OFFENDERS = [
  { caseId: 142, firNo: 'KSP-2026-0142', accusedName: 'Mohan Kumar', crimeType: 'robbery', status: 'Under Investigation', date: '2026-03-15' },
  { caseId: 301, firNo: 'KSP-2026-0301', accusedName: 'Mohan Kumar', crimeType: 'robbery', status: 'Under Investigation', date: '2026-05-10' },
  { caseId: 142, firNo: 'KSP-2026-0142', accusedName: 'Kiran Joseph', crimeType: 'robbery', status: 'At large', date: '2026-03-15' },
  { caseId: 89, firNo: 'KSP-2026-0089', accusedName: 'Ravi Shetty', crimeType: 'burglary', status: 'Under Investigation', date: '2026-02-28' },
  { caseId: 211, firNo: 'KSP-2026-0211', accusedName: 'Ravi Shetty', crimeType: 'burglary', status: 'Under Investigation', date: '2026-03-05' },
  { caseId: 201, firNo: 'KSP-2026-0201', accusedName: 'Venkatesh Gowda', crimeType: 'assault', status: 'Under Investigation', date: '2026-01-10' },
  { caseId: 198, firNo: 'KSP-2026-0198', accusedName: 'Venkatesh Gowda', crimeType: 'burglary', status: 'Under Investigation', date: '2026-02-14' },
  { caseId: 255, firNo: 'KSP-2026-0255', accusedName: 'Venkatesh Gowda', crimeType: 'burglary', status: 'Under Investigation', date: '2026-04-01' },
  { caseId: 190, firNo: 'KSP-2026-0190', accusedName: 'Suresh Patil', crimeType: 'robbery', status: 'Under Investigation', date: '2026-02-10' },
  { caseId: 198, firNo: 'KSP-2026-0198', accusedName: 'Suresh Patil', crimeType: 'burglary', status: 'Under Investigation', date: '2026-02-14' },
  { caseId: 211, firNo: 'KSP-2026-0211', accusedName: 'Suresh Patil', crimeType: 'burglary', status: 'Under Investigation', date: '2026-03-05' },
  { caseId: 255, firNo: 'KSP-2026-0255', accusedName: 'Suresh Patil', crimeType: 'burglary', status: 'Under Investigation', date: '2026-04-01' },
  { caseId: 234, firNo: 'KSP-2026-0234', accusedName: 'Arun Nair', crimeType: 'fraud', status: 'Under Investigation', date: '2026-03-20' },
  { caseId: 211, firNo: 'KSP-2026-0211', accusedName: 'Arun Nair', crimeType: 'burglary', status: 'Under Investigation', date: '2026-03-05' },
  { caseId: 267, firNo: 'KSP-2026-0267', accusedName: 'Imran Khan', crimeType: 'burglary', status: 'Under Investigation', date: '2026-05-20' },
  { caseId: 255, firNo: 'KSP-2026-0255', accusedName: 'Imran Khan', crimeType: 'burglary', status: 'Under Investigation', date: '2026-04-01' },
  { caseId: 388, firNo: 'KSP-2026-0388', accusedName: 'Prakash Acharya', crimeType: 'fraud', status: 'Under Investigation', date: '2026-06-22' },
  { caseId: 390, firNo: 'KSP-2026-0390', accusedName: 'Prakash Acharya', crimeType: 'fraud', status: 'Under Investigation', date: '2026-06-25' },
  { caseId: 412, firNo: 'KSP-2026-0412', accusedName: 'Prakash Acharya', crimeType: 'fraud', status: 'Under Investigation', date: '2026-07-05' },
  { caseId: 388, firNo: 'KSP-2026-0388', accusedName: 'Manjunath Hegde', crimeType: 'fraud', status: 'Under Investigation', date: '2026-06-22' },
  { caseId: 390, firNo: 'KSP-2026-0390', accusedName: 'Manjunath Hegde', crimeType: 'fraud', status: 'Under Investigation', date: '2026-06-25' },
  { caseId: 156, firNo: 'KSP-2026-0156', accusedName: 'Nadeem Pasha', crimeType: 'theft', status: 'Under Investigation', date: '2026-04-01' },
  { caseId: 201, firNo: 'KSP-2026-0201', accusedName: 'Girish Poojary', crimeType: 'assault', status: 'Under Investigation', date: '2026-01-10' },
  { caseId: 198, firNo: 'KSP-2026-0198', accusedName: 'Girish Poojary', crimeType: 'burglary', status: 'Under Investigation', date: '2026-02-14' },
  { caseId: 333, firNo: 'KSP-2026-0333', accusedName: 'Deepa Shetty', crimeType: 'assault', status: 'Under Investigation', date: '2026-06-01' },
  { caseId: 359, firNo: 'KSP-2026-0359', accusedName: 'Basavaraj Patil', crimeType: 'theft', status: 'Under Investigation', date: '2026-06-15' },
  { caseId: 425, firNo: 'KSP-2026-0425', accusedName: 'Basavaraj Patil', crimeType: 'assault', status: 'Under Investigation', date: '2026-07-10' },
  { caseId: 402, firNo: 'KSP-2026-0402', accusedName: 'Shantamma Naik', crimeType: 'fraud', status: 'Under Investigation', date: '2026-07-01' },
  { caseId: 267, firNo: 'KSP-2026-0267', accusedName: 'Shantamma Naik', crimeType: 'burglary', status: 'Under Investigation', date: '2026-05-20' },
  { caseId: 330, firNo: 'KSP-2026-0330', accusedName: 'Mahesh Gowda', crimeType: 'robbery', status: 'Under Investigation', date: '2026-06-05' },
  { caseId: 301, firNo: 'KSP-2026-0301', accusedName: 'Mahesh Gowda', crimeType: 'robbery', status: 'Under Investigation', date: '2026-05-10' },
];

app.get('/search-by-name', (req, res) => {
  try {
    const { name } = req.query;
    if (!name || String(name).trim().length < 2) {
      return res.status(400).json({ error: 'Name query must be at least 2 characters' });
    }
    const q = String(name).toLowerCase().trim();
    const matches = REPEAT_OFFENDERS.filter(r => r.accusedName.toLowerCase().includes(q));
    const uniqueNames = [...new Set(matches.map(m => m.accusedName))];
    res.status(200).json({
      matches,
      repeatCount: matches.length,
      uniqueNames,
      metadata: {
        mode: 'mock',
        method: 'Name-based repeat offender search across FIR records',
        note: 'Synthetic CCTNS Accused table data for demonstration.',
      },
    });
  } catch (error) {
    console.error('Search-by-name failed:', error);
    res.status(500).json({ error: 'Unable to search by name' });
  }
});

module.exports = app;

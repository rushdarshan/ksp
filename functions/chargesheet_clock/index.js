const express = require('express');
const catalyst = require('zcatalyst-sdk-node');

const app = express();
app.use(express.json());

const TARGET_DAYS = 90;
const unwrap = (row, table) => row?.[table] || row || {};
const dateOnly = value => new Date(value).toISOString().slice(0, 10);

app.get('/stats', async (req, res) => {
    try {
        const zcql = catalyst.initialize(req).zcql();
        const [caseRows, chargesheetRows] = await Promise.all([
            zcql.executeZCQLQuery('SELECT * FROM CaseMaster LIMIT 1000'),
            zcql.executeZCQLQuery('SELECT CaseMasterID, csdate FROM ChargesheetDetails LIMIT 2000'),
        ]);
        const filed = new Set(chargesheetRows.map(row => String(unwrap(row, 'ChargesheetDetails').CaseMasterID)));
        const now = Date.now();
        let cases = caseRows
            .map(row => unwrap(row, 'CaseMaster'))
            .filter(item => item.CrimeRegisteredDate && !filed.has(String(item.CaseMasterID)))
            .map(item => {
                const registered = new Date(item.CrimeRegisteredDate);
                const elapsed = Math.max(0, Math.floor((now - registered.getTime()) / 86400000));
                const daysRemaining = Math.max(0, TARGET_DAYS - elapsed);
                const daysOverdue = Math.max(0, elapsed - TARGET_DAYS);
                const status = daysOverdue > 0 ? 'overdue' : daysRemaining <= 30 ? 'at_risk' : 'safe';
                const deadline = new Date(registered);
                deadline.setDate(deadline.getDate() + TARGET_DAYS);
                return {
                    caseId: item.CaseMasterID,
                    firNo: String(item.CrimeNo || item.CaseMasterID),
                    crimeType: `crime head ${item.CrimeMajorHeadID || 'unknown'}`,
                    officer: `Officer ${item.PolicePersonID || 'unassigned'}`,
                    districtId: item.PoliceStationID || 'unknown',
                    dateRegistered: dateOnly(registered),
                    cpcLimitDays: TARGET_DAYS,
                    daysOverdue,
                    daysRemaining,
                    deadlineDate: dateOnly(deadline),
                    status,
                };
            });
        if (req.query.station) cases = cases.filter(item => String(item.districtId) === String(req.query.station));
        const overdue = cases.filter(item => item.status === 'overdue');
        res.status(200).json({
            overdueCount: overdue.length,
            atRiskCount: cases.filter(item => item.status === 'at_risk').length,
            safeCount: cases.filter(item => item.status === 'safe').length,
            averageOverdueDays: overdue.length ? Math.round(overdue.reduce((sum, item) => sum + item.daysOverdue, 0) / overdue.length) : 0,
            cases,
            metadata: { mode: 'live', targetDays: TARGET_DAYS, legalNotice: 'Operational review target only; verify the applicable BNSS provision and custody status.' },
        });
    } catch (error) {
        console.error('Chargesheet clock failed:', error);
        res.status(500).json({ error: 'Unable to build investigation milestone clock' });
    }
});

module.exports = app;

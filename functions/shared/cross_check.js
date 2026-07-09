const catalyst = require('zcatalyst-sdk-node');

const MATCH_THRESHOLD = 40;

async function runCrossCheck(catalystApp, firId) {
    const zcql = catalystApp.zcql();

    const sourceRows = await zcql.executeZCQLQuery(
        `SELECT CrimeHeadID, DistrictID, IncidentFromDate, FIRNo FROM CaseMaster WHERE CaseMasterID = ${parseInt(firId)}`
    );
    if (!sourceRows || sourceRows.length === 0) return [];
    const src = sourceRows[0].CaseMaster;
    const srcCrimeHead = parseInt(src.CrimeHeadID);
    const srcDistrict = parseInt(src.DistrictID);
    const srcDate = new Date(src.IncidentFromDate);
    const srcFirNo = src.FIRNo;

    const linked = await zcql.executeZCQLQuery(
        `SELECT CaseMasterID, CrimeHeadID, DistrictID, IncidentFromDate, FIRNo FROM CaseMaster WHERE (CrimeHeadID = ${srcCrimeHead} OR DistrictID = ${srcDistrict}) AND CaseMasterID != ${parseInt(firId)}`
    );
    if (!linked) return [];

    const findings = [];
    for (const row of linked) {
        const c = row.CaseMaster;
        const linkedId = parseInt(c.CaseMasterID);
        const linkedCrimeHead = parseInt(c.CrimeHeadID);
        const linkedDistrict = parseInt(c.DistrictID);
        const linkedDate = new Date(c.IncidentFromDate);

        let score = 0;
        const matched = [];

        if (linkedCrimeHead === srcCrimeHead) {
            score += 60;
            matched.push('same crime type');
        }
        if (linkedDistrict === srcDistrict) {
            score += 20;
            matched.push('same district');
        }
        const dayDiff = Math.abs((srcDate - linkedDate) / (1000 * 60 * 60 * 24));
        if (dayDiff <= 30) {
            score += 10;
            matched.push('within 30 days');
        }

        if (score >= MATCH_THRESHOLD) {
            findings.push({
                linkedFirId: linkedId,
                score: Math.min(score, 100),
                matchedDimensions: matched,
                firNo: c.FIRNo || `FIR-${linkedId}`,
                crimeHeadId: linkedCrimeHead,
                filedDate: c.IncidentFromDate
            });
        }
    }

    findings.sort((a, b) => b.score - a.score);
    return findings;
}

module.exports = { runCrossCheck, MATCH_THRESHOLD };

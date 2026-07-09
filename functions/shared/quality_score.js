const { tokenize, analyzeFIR, detectScript } = require('./analyzer');

const QUALITY_DIMENSIONS = [
    { id: 'witnessStatements', name: 'Witness Statements', max: 10, description: 'Number of witnesses cited' },
    { id: 'evidenceCited', name: 'Evidence Cited', max: 10, description: 'Types of evidence documented' },
    { id: 'timePrecision', name: 'Time Precision', max: 10, description: 'Temporal markers in narrative' },
    { id: 'locationSpecificity', name: 'Location Specificity', max: 10, description: 'Specific location details' },
    { id: 'accusedDescription', name: 'Accused Description', max: 10, description: 'Details about accused persons' },
    { id: 'narrativeCoherence', name: 'Narrative Coherence', max: 10, description: 'Linguistic coherence via VeriPol' },
    { id: 'propertyValuation', name: 'Property Valuation', max: 10, description: 'Property value documentation' },
    { id: 'legalSectionMatch', name: 'Legal Section Match', max: 10, description: 'IPC/BNS section alignment' },
    { id: 'delayJustification', name: 'Delay Justification', max: 10, description: 'Reason for reporting delay' },
    { id: 'officerNotesCompleteness', name: 'Officer Notes Completeness', max: 10, description: 'Completeness of officer remarks' }
];

const LOCATION_INDICATORS = [
    'road', 'street', 'lane', 'nagar', 'layout', 'colony', 'cross', 'circle',
    'gate', 'market', 'temple', 'church', 'mosque', 'school', 'hospital',
    'bridge', 'flyover', 'junction', 'square', 'park', 'station', 'bus stop',
    'signal', 'corner', 'building', 'apartment', 'complex', 'tower', 'block'
];

function computeQualityScore(firData) {
    const {
        narrative = '',
        evidenceTypes = [],
        witnessCount = 0,
        propertyValue = 0,
        delayReason = '',
        accusedCount = 0,
        accusedDescription = '',
        crimeType = '',
        firNo = ''
    } = firData;

    const text = (narrative || '').toLowerCase();
    const words = tokenize(narrative);
    const wordCount = words.length;
    const script = detectScript(narrative);
    const analysis = analyzeFIR({ narrative, accusedCount });

    const dimensions = [];
    const flags = [];
    const details = {};

    const witnessScore = Math.min(10, parseInt(witnessCount || 0) * 3);
    dimensions.push({ name: 'Witness Statements', score: witnessScore, max: 10 });
    details.witnessStatements = { witnessCount: parseInt(witnessCount || 0) };

    const evTypes = Array.isArray(evidenceTypes) ? evidenceTypes : [];
    const evidenceScore = Math.min(10, evTypes.length * 2);
    dimensions.push({ name: 'Evidence Cited', score: evidenceScore, max: 10 });
    details.evidenceCited = { typeCount: evTypes.length };

    const temporalMarkers = analysis?.details?.temporalDetails || 0;
    const timeScore = Math.min(10, temporalMarkers * 2);
    dimensions.push({ name: 'Time Precision', score: timeScore, max: 10 });
    details.timePrecision = { temporalMarkers };

    const locationMatches = LOCATION_INDICATORS.filter(w => text.includes(w)).length;
    const locationScore = Math.min(10, locationMatches * 2);
    dimensions.push({ name: 'Location Specificity', score: locationScore, max: 10 });
    details.locationSpecificity = { locationHits: locationMatches };

    let accusedScore = 0;
    if (parseInt(accusedCount || 0) > 0) {
        const descLen = (accusedDescription || '').length;
        accusedScore = Math.min(10, Math.round(descLen > 20 ? 10 : descLen > 5 ? 7 : descLen > 0 ? 4 : 2));
    }
    dimensions.push({ name: 'Accused Description', score: accusedScore, max: 10 });
    details.accusedDescription = { accusedCount: parseInt(accusedCount || 0), descriptionLength: (accusedDescription || '').length };

    let narrScore = 0;
    if (script !== 'latin') {
        narrScore = 0;
        flags.push('Narrative coherence not scored — non-Latin script');
    } else if (analysis?.veracityScore != null) {
        narrScore = Math.round(analysis.veracityScore * 10);
    }
    dimensions.push({ name: 'Narrative Coherence', score: narrScore, max: 10 });
    details.narrativeCoherence = { script, veracityScore: analysis?.veracityScore };

    let propScore = 0;
    const pv = parseFloat(propertyValue || 0);
    if (pv > 0) {
        propScore = pv > 100000 && wordCount > 50 ? 10 : 7;
    }
    dimensions.push({ name: 'Property Valuation', score: propScore, max: 10 });
    details.propertyValuation = { propertyValue: pv };

    let legalScore = 0;
    if (crimeType) {
        const ct = crimeType.toLowerCase();
        const crimeKeywords = {
            theft: ['379', '380', 'stolen', 'steal', 'theft'],
            burglary: ['451', '453', 'break', 'trespass', 'housebreaking'],
            robbery: ['382', '390', '392', '395', 'robbery', 'dacoity'],
            assault: ['319', '320', '323', '324', 'hurt', 'assault'],
            murder: ['302', '304', 'murder', 'homicide', 'kill'],
            sexual: ['354', '356', '376', 'rape', 'molest'],
            fraud: ['419', '420', '406', '408', 'fraud', 'cheat'],
            cyber: ['cyber', 'hack', 'phishing', 'online'],
            drugs: ['ndps', 'narcotic', 'drug'],
            property: ['425', '426', 'mischief', 'damage', 'vandalism'],
            extortion: ['384', '385', 'extortion', 'blackmail'],
            publicorder: ['143', '144', '147', '148', '150', 'riot']
        };
        const keywords = crimeKeywords[ct] || [];
        const matches = keywords.filter(kw => text.includes(kw));
        legalScore = Math.min(10, matches.length * 2);
    }
    dimensions.push({ name: 'Legal Section Match', score: legalScore, max: 10 });
    details.legalSectionMatch = { crimeType };

    let delayScore = 10;
    if (delayReason) {
        const drLen = (delayReason || '').length;
        delayScore = drLen > 10 ? 10 : drLen > 3 ? 5 : 2;
    }
    dimensions.push({ name: 'Delay Justification', score: delayScore, max: 10 });
    details.delayJustification = { delayReasonPresent: !!delayReason, delayReasonLength: (delayReason || '').length };

    let officerScore = 7;
    dimensions.push({ name: 'Officer Notes Completeness', score: officerScore, max: 10 });
    details.officerNotesCompleteness = { note: 'Default score — synthetic data does not include officer notes field' };
    flags.push('Officer notes score is a default — field not present in synthetic data');

    const total = dimensions.reduce((s, d) => s + d.score, 0);
    const qualityScore = Math.round(total);

    let uncertaintyBand;
    if (qualityScore >= 20 && qualityScore <= 80) uncertaintyBand = 15;
    else uncertaintyBand = 5;

    return { qualityScore, uncertaintyBand, dimensions, flags, details };
}

module.exports = { computeQualityScore, QUALITY_DIMENSIONS };

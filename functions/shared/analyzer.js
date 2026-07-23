function tokenize(text) {
    return (text || '')
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s.:/-]/gu, ' ')
        .split(/\s+/)
        .filter(Boolean);
}

const VERACITY_CONFIG = {
    WEIGHT_BY_VERACITY_DEFAULT: false,
    HOTSPOT_MIN: 0.3,
    VICTIM_MIN: 0.2,
    compatibilityNote: 'Legacy export name. Scores measure documentation completeness only.'
};

const LOCATION_WORDS = [
    'road', 'street', 'lane', 'nagar', 'layout', 'cross', 'circle', 'market',
    'junction', 'station', 'block', 'building', 'signal', 'park', 'hospital'
];
const SEQUENCE_WORDS = ['before', 'after', 'then', 'later', 'subsequently', 'while', 'when'];
const EVIDENCE_WORDS = ['cctv', 'camera', 'photo', 'video', 'document', 'receipt', 'phone', 'vehicle', 'witness', 'weapon'];

function detectScript(text) {
    if (!text) return 'other';
    for (const char of text) {
        const code = char.charCodeAt(0);
        if (code >= 0x0C80 && code <= 0x0CFF) return 'kannada';
        if ((code >= 0x0900 && code <= 0x0BFF) || (code >= 0x0D00 && code <= 0x0EFF)) return 'other';
    }
    return 'latin';
}

function countWordMatches(words, vocabulary) {
    return words.filter(word => vocabulary.includes(word)).length;
}

function analyzeFIR({ narrative, complainantName, accusedCount, hasWitnesses, delayReason, propertyValue }) {
    const text = narrative || '';
    const words = tokenize(text);
    const wordCount = words.length;
    const script = detectScript(text);

    if (script !== 'latin') {
        return {
            veracityScore: null,
            documentationScore: null,
            languageNotSupported: true,
            script,
            flags: ['Language-specific documentation scoring is not validated for this script; route the record to a qualified reviewer.'],
            details: { wordCount, script },
            reviewRequired: true
        };
    }

    const temporalDetails = (text.match(/\b(?:\d{1,2}:\d{2}|\d{1,2}\s*(?:am|pm)|\d{4}-\d{2}-\d{2}|morning|afternoon|evening|night|today|yesterday)\b/gi) || []).length;
    const locationDetails = countWordMatches(words, LOCATION_WORDS);
    const sequenceMarkers = countWordMatches(words, SEQUENCE_WORDS);
    const evidenceReferences = countWordMatches(words, EVIDENCE_WORDS);
    const identifierReferences = (text.match(/\b(?:KA[-\s]?\d{2}|FIR|KSP-\d{4}-\d{4}|\d{6,})\b/gi) || []).length;
    const structuredFields = [
        Boolean(complainantName),
        Number(accusedCount) > 0,
        Boolean(hasWitnesses),
        Boolean(delayReason),
        Number(propertyValue) > 0
    ].filter(Boolean).length;

    const score = Math.min(1,
        Math.min(0.2, wordCount / 100 * 0.2) +
        Math.min(0.15, temporalDetails * 0.075) +
        Math.min(0.15, locationDetails * 0.05) +
        Math.min(0.1, sequenceMarkers * 0.05) +
        Math.min(0.15, evidenceReferences * 0.05) +
        Math.min(0.1, identifierReferences * 0.05) +
        structuredFields * 0.03
    );

    const flags = [];
    if (wordCount < 30) flags.push('Narrative is short; verify that the event sequence and essential facts are recorded.');
    if (temporalDetails === 0) flags.push('No specific date or time marker was detected.');
    if (locationDetails === 0) flags.push('No location-detail marker was detected.');
    if (evidenceReferences === 0) flags.push('No evidence source or witness reference was detected in the narrative.');
    if (!complainantName) flags.push('Complainant identity is not present in the supplied fields.');

    const documentationScore = +score.toFixed(3);
    return {
        veracityScore: documentationScore,
        documentationScore,
        flags,
        details: {
            wordCount,
            temporalDetails,
            locationDetails,
            sequenceMarkers,
            evidenceReferences,
            identifierReferences,
            structuredFields,
            script
        },
        reviewRequired: true,
        methodology: 'Deterministic documentation-completeness heuristic; not a credibility, deception, or guilt assessment.'
    };
}

module.exports = { tokenize, analyzeFIR, detectScript, VERACITY_CONFIG };

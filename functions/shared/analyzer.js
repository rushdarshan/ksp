const express = require('express');
const catalyst = require('zcatalyst-sdk-node');

function tokenize(text) {
    return (text || '').toLowerCase().replace(/[^a-z0-9\s.]/g, ' ').split(/\s+/).filter(t => t.length > 0);
}

const VERACITY_CONFIG = {
    WEIGHT_BY_VERACITY_DEFAULT: false,
    HOTSPOT_MIN: 0.3,
    VICTIM_MIN: 0.2
};

function detectScript(text) {
    if (!text) return 'other';
    for (const char of text) {
        const code = char.charCodeAt(0);
        if (code >= 0x0C80 && code <= 0x0CFF) return 'kannada';
        if (code >= 0x0900 && code <= 0x097F) return 'other';
        if (code >= 0x0D00 && code <= 0x0D7F) return 'other';
        if (code >= 0x0B80 && code <= 0x0BFF) return 'other';
        if (code >= 0x0E00 && code <= 0x0E7F) return 'other';
    }
    return 'latin';
}

function analyzeFIR({ narrative, complainantName, accusedCount, hasWitnesses, delayReason, propertyValue }) {
    const text = narrative || '';
    const words = tokenize(text);
    const wordCount = words.length;

    const script = detectScript(text);
    if (script !== 'latin') {
        return { veracityScore: null, languageNotSupported: true, script, flags: ['Non-Latin script — VeriPol scoring limited to English FIRs (demo constraint)'], details: { wordCount, script } };
    }

    if (wordCount < 5) return { veracityScore: 0.5, flags: ['Narrative too short to analyze'], details: {} };

    const firstPersonSingular = words.filter(w => ['i', 'me', 'my', 'mine', 'myself'].includes(w)).length;
    const thirdPerson = words.filter(w => ['he', 'him', 'his', 'she', 'her', 'they', 'them', 'their', 'theirs'].includes(w)).length;
    const pastTenseVerbs = words.filter(w => w.endsWith('ed')).length;
    const presentTenseVerbs = words.filter(w => w.endsWith('s') && !w.endsWith('ss') && !w.endsWith('sh')).length;
    const sensoryWords = words.filter(w => ['saw', 'heard', 'felt', 'smelled', 'noticed', 'observed', 'witnessed'].includes(w)).length;
    const hedges = words.filter(w => ['maybe', 'perhaps', 'possibly', 'around', 'approximately', 'roughly', 'seems', 'apparently', 'supposedly'].includes(w)).length;
    const negations = words.filter(w => ['no', 'not', 'never', 'nobody', 'nothing', "didn't", "wasn't", "haven't", "hadn't", "couldn't"].includes(w)).length;
    const conjunctives = words.filter(w => ['then', 'after', 'before', 'so', 'because', 'since', 'subsequently', 'later', 'meanwhile'].includes(w)).length;
    const exclusiveWords = words.filter(w => ['but', 'except', 'without', 'however', 'although', 'though', 'unless'].includes(w)).length;
    const temporalDetails = words.filter(w => ['yesterday', 'today', 'morning', 'evening', 'night', 'afternoon', "o'clock", 'pm', 'am', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(w)).length;
    const emotionPositive = words.filter(w => ['fine', 'okay', 'good', 'normal', 'calm', 'safe', 'thankful', 'grateful'].includes(w)).length;
    const cognitiveProcess = words.filter(w => ['think', 'believe', 'guess', 'suppose', 'imagine', 'wonder', 'realize', 'understand', 'consider'].includes(w)).length;
    const spatialDetails = wordCount > 20 ? (words.filter(w => w.length > 2 && w.length < 8).length / wordCount) : 0.3;

    const firstPersonRatio = wordCount > 0 ? firstPersonSingular / wordCount : 0;
    const thirdPersonRatio = wordCount > 0 ? thirdPerson / wordCount : 0;
    const pastTenseRatio = pastTenseVerbs > 0 ? pastTenseVerbs / (pastTenseVerbs + presentTenseVerbs + 1) : 0;
    const sensoryRatio = wordCount > 0 ? sensoryWords / wordCount : 0;
    const hedgeRatio = wordCount > 0 ? hedges / wordCount : 0;
    const negationRatio = wordCount > 0 ? negations / wordCount : 0;
    const conjunctiveRatio = wordCount > 0 ? conjunctives / wordCount : 0;
    const temporalRatio = wordCount > 0 ? temporalDetails / wordCount : 0;

    const UC_SCALE = 0.12;
    const lingScore = (
        (firstPersonRatio > 0.02 ? 0.08 : -0.08) +
        (thirdPersonRatio < 0.05 ? 0.06 : -0.04) +
        (pastTenseRatio > 0.5 ? 0.12 : -0.06) +
        (sensoryRatio > 0.01 ? 0.08 : -0.04) +
        (hedgeRatio < 0.02 ? 0.06 : -0.06) +
        (negationRatio < 0.05 ? 0.04 : -0.04) +
        (conjunctiveRatio < 0.15 ? 0.06 : -0.04) +
        (temporalRatio > 0.02 ? 0.10 : -0.06) +
        (emotionPositive < 0.03 ? 0.04 : -0.02) +
        (cognitiveProcess < 0.05 ? 0.06 : -0.04) +
        (exclusiveWords > 1 ? 0.06 : -0.03) +
        (spatialDetails > 0.25 ? 0.08 : -0.04)
    ) / UC_SCALE;

    const flags = [];
    if (lingScore < -1.5) flags.push('Low linguistic detail — possible fabrication pattern');
    if (firstPersonRatio < 0.005 && wordCount > 20) flags.push('Minimal first-person references — distancing from event');
    if (thirdPersonRatio > 0.08) flags.push('High third-person references — possible blame shifting');
    if (pastTenseRatio < 0.3 && wordCount > 20) flags.push('Low past-tense usage — may lack genuine recall');
    if (hedgeRatio > 0.03) flags.push('High hedge word density — uncertainty markers');
    if (sensoryRatio === 0 && wordCount > 30) flags.push('No sensory details — fabricated accounts often lack perceptual information');
    if (temporalRatio === 0 && wordCount > 20) flags.push('No temporal anchoring — dates/times missing');
    if (negationRatio > 0.08) flags.push('High negation density — possible defensive posture');
    if (conjunctiveRatio > 0.2) flags.push('High text bridge ratio — artificially structured narrative');
    if (accusedCount === 0 && (narrative || '').includes('unknown')) flags.push('Unknown accused with minimal identifying details');
    if (delayReason && delayReason.length < 5) flags.push('Unsubstantiated delay in filing');
    if (propertyValue && parseInt(propertyValue) > 100000 && wordCount < 30) flags.push('High-value claim with minimal narrative');

    const veracityScore = Math.max(0, Math.min(1, (lingScore + 1) / 2.3));

    return {
        veracityScore,
        flags,
        details: {
            wordCount,
            firstPersonRatio: +firstPersonRatio.toFixed(4),
            thirdPersonRatio: +thirdPersonRatio.toFixed(4),
            pastTenseRatio: +pastTenseRatio.toFixed(3),
            sensoryWords,
            hedgeWordDensity: +hedgeRatio.toFixed(4),
            negationDensity: +negationRatio.toFixed(4),
            temporalDetails,
            textBridgeRatio: +conjunctiveRatio.toFixed(4),
            cognitiveProcessWords: cognitiveProcess,
            exclusiveWords: exclusiveWords
        }
    };
}

module.exports = { tokenize, analyzeFIR, detectScript, VERACITY_CONFIG };

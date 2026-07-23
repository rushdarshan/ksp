const DEMO_GENERATED_AT = '2026-07-15T12:00:00.000Z';

function hashSeed(value) {
    const input = String(value ?? 'ksp-demo');
    let hash = 2166136261;
    for (let i = 0; i < input.length; i++) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

function createSeededRandom(seed) {
    let state = hashSeed(seed) || 0x6d2b79f5;
    return function next() {
        state += 0x6d2b79f5;
        let value = state;
        value = Math.imul(value ^ (value >>> 15), value | 1);
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
        return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
}

function intBetween(random, min, max) {
    return Math.floor(random() * (max - min + 1)) + min;
}

function numberBetween(random, min, max, precision = 2) {
    return +(min + random() * (max - min)).toFixed(precision);
}

function pick(random, values) {
    return values[intBetween(random, 0, values.length - 1)];
}

module.exports = { DEMO_GENERATED_AT, createSeededRandom, hashSeed, intBetween, numberBetween, pick };

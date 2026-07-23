const WRAPPER_KEYS = ['data', 'result', 'payload', 'response', 'body'];

const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const parseJsonValue = (value) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed || (!trimmed.startsWith('{') && !trimmed.startsWith('['))) return value;
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
};

const visitPayload = (payload, preferredKeys, predicate) => {
  const queue = [parseJsonValue(payload)];
  const seen = new Set();
  const keys = [...preferredKeys, ...WRAPPER_KEYS];

  while (queue.length > 0) {
    const value = parseJsonValue(queue.shift());
    if (predicate(value)) return value;
    if (!isRecord(value) || seen.has(value)) continue;

    seen.add(value);
    keys.forEach((key) => {
      if (value[key] !== undefined) queue.push(value[key]);
    });
  }

  return null;
};

export async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const text = await response.text();
  const payload = parseJsonValue(text);

  if (!response.ok) {
    const message = isRecord(payload)
      ? payload.message || payload.error || payload.details
      : payload;
    throw new Error(message || `Request failed (${response.status})`);
  }

  return payload;
}

export function apiArray(payload, preferredKeys = []) {
  return visitPayload(payload, preferredKeys, Array.isArray) || [];
}

export function apiObject(payload, shapeKeys = [], preferredKeys = []) {
  const shaped = visitPayload(
    payload,
    preferredKeys,
    (value) => isRecord(value) && (shapeKeys.length === 0 || shapeKeys.some((key) => value[key] !== undefined)),
  );
  return shaped || {};
}

export function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function clampNumber(value, min = 0, max = 1, fallback = min) {
  return Math.min(max, Math.max(min, finiteNumber(value, fallback)));
}

export function displayText(value, fallback = 'Not available') {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text || fallback;
}

export const KARNATAKA_DISTRICTS = [
  'Bengaluru City', 'Mysuru City', 'Mangaluru City', 'Hubballi-Dharwad City',
  'Belagavi City', 'Kalaburagi City', 'Shivamogga', 'Tumakuru', 'Davanagere',
  'Ballari', 'Vijayapura', 'Bidar', 'Hassan', 'Udupi', 'Dharwad', 'Kolar',
  'Chikkamagaluru', 'Mandya', 'Bagalkote', 'Chitradurga',
].map((name, index) => ({ id: index + 1, name }));

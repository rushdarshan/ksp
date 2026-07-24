function hasValue(v) {
  if (v == null) return false;
  if (typeof v === 'string') return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'object') return Object.keys(v).length > 0;
  return true;
}

function extractField(caseData, ...keys) {
  for (const key of keys) {
    const val = caseData[key] ?? caseData[key.toLowerCase()] ?? caseData[key.replace(/^[A-Z]/, c => c.toLowerCase())];
    if (val != null) return val;
    const lower = key.toLowerCase();
    for (const k of Object.keys(caseData)) {
      if (k.toLowerCase() === lower) return caseData[k];
    }
  }
  return undefined;
}

function computeCompleteness(caseData) {
  const checks = [
    {
      key: 'firDescription',
      label: 'FIR description',
      present: hasValue(extractField(caseData, 'narrative', 'BriefFacts', 'Description')),
    },
    {
      key: 'coordinates',
      label: 'Latitude/Longitude',
      present: hasValue(extractField(caseData, 'Latitude', 'lat')) && hasValue(extractField(caseData, 'Longitude', 'lng')),
    },
    {
      key: 'accusedNamed',
      label: 'Accused named',
      present: (() => {
        const accused = extractField(caseData, 'accused', 'Accused');
        if (Array.isArray(accused) && accused.length > 0) return true;
        const count = extractField(caseData, 'accusedCount', 'accused_count');
        return parseInt(count || 0) > 0;
      })(),
    },
    {
      key: 'victimNamed',
      label: 'Victim named',
      present: (() => {
        const name = extractField(caseData, 'victimName', 'VictimName', 'Victim');
        if (Array.isArray(name) && name.length > 0) return true;
        return hasValue(name);
      })(),
    },
    {
      key: 'evidenceItems',
      label: 'Evidence items',
      present: (() => {
        const ev = extractField(caseData, 'evidenceTypes', 'evidenceTypes', 'Evidence');
        if (Array.isArray(ev) && ev.length > 0) return true;
        return hasValue(extractField(caseData, 'evidenceCount', 'evidence_count'));
      })(),
    },
    {
      key: 'witnessCount',
      label: 'Witness count > 0',
      present: parseInt(extractField(caseData, 'witnessCount', 'witness_count') || 0) > 0,
    },
    {
      key: 'actSection',
      label: 'ActSectionAssociation present',
      present: (() => {
        const sa = extractField(caseData, 'ActSectionAssociation', 'sections', 'legalSections');
        if (Array.isArray(sa) && sa.length > 0) return true;
        return hasValue(extractField(caseData, 'sectionCount', 'section_count'));
      })(),
    },
    {
      key: 'crimeHeadId',
      label: 'CrimeHeadID set',
      present: hasValue(extractField(caseData, 'CrimeHeadID', 'crimeType', 'CrimeHeadId')),
    },
  ];

  const presentCount = checks.filter(c => c.present).length;
  const total = checks.length;
  const completeness = presentCount / total;
  const missingFields = checks.filter(c => !c.present).map(c => c.label);

  let score;
  if (completeness >= 0.75) score = 'HIGH';
  else if (completeness >= 0.45) score = 'MEDIUM';
  else score = 'LOW';

  return { completeness, missingFields, score };
}

function adjustConfidence(baseConfidence, completeness) {
  const clamped = Math.max(0, Math.min(1, completeness));
  return baseConfidence * (0.3 + 0.7 * clamped);
}

module.exports = { computeCompleteness, adjustConfidence };

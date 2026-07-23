export const ACTIVE_CASE_FACTS = Object.freeze({
  firId: 'KSP-2026-0142',
  crimeType: 'Robbery',
  status: 'Under Investigation',
  station: 'Brigade Road PS',
  district: 'Bengaluru',
  location: 'Brigade Road / SH-9 junction',
  incidentDate: '2026-03-15',
  incidentDateLabel: '15 Mar 2026',
  investigatingOfficer: 'PI Dharmendra',
  readiness: 67,
  narrativeReviewScore: 84,
  filingDueDays: 18,
  accused: [
    { name: 'Mohan Kumar', status: 'Under investigation' },
    { name: 'Kiran Joseph', status: 'At large' },
  ],
  cctv: {
    status: 'Pending acquisition',
    summary: 'Camera source identified and referenced; acquisition, hash verification, and the BSA Section 63 certificate remain pending.',
  },
});

export const ACTIVE_CASE_ENTITIES = [
  { type: 'Person', name: 'Mohan Kumar', role: 'Accused - under investigation' },
  { type: 'Person', name: 'Kiran Joseph', role: 'Accused - at large' },
  { type: 'Location', name: 'Brigade Road / SH-9 junction', role: 'Incident location' },
  { type: 'Digital', name: 'SH-9 junction camera', role: 'Source identified - acquisition pending' },
];

export const ACTIVE_CASE_TIMELINE = [
  {
    date: '2026-03-15T09:15:00',
    type: 'report',
    label: 'FIR registered',
    detail: 'Robbery recorded at Brigade Road / SH-9 junction.',
  },
  {
    date: '2026-03-15T11:20:00',
    type: 'evidence',
    label: 'CCTV source identified',
    detail: 'SH-9 junction camera referenced; footage has not yet been acquired.',
  },
  {
    date: '2026-03-16T09:30:00',
    type: 'analysis',
    label: 'Accused records linked',
    detail: 'Mohan Kumar and Kiran Joseph linked to the investigation record.',
  },
  {
    date: '2026-03-17T14:10:00',
    type: 'action',
    label: 'At-large follow-up opened',
    detail: 'Kiran Joseph remains at large; location and arrest follow-up is active.',
  },
  {
    date: '2026-03-18T10:00:00',
    type: 'action',
    label: 'Evidence documentation gap flagged',
    detail: 'CCTV acquisition, hash verification, and BSA Section 63 certification remain pending.',
  },
];

export const ACTIVE_CASE_EVIDENCE = [
  {
    id: 'E1',
    type: 'Record',
    desc: 'FIR narrative - robbery at Brigade Road / SH-9 junction',
    status: 'intact',
    date: '2026-03-15',
    officer: 'PI Dharmendra',
    aiAnalysis: 'Registered incident record. The narrative indicator supports review prioritisation only and does not make an evidentiary finding.',
  },
  {
    id: 'E2',
    type: 'Person record',
    desc: 'Accused records - Mohan Kumar and Kiran Joseph',
    status: 'pending',
    date: '2026-03-16',
    officer: 'PI Dharmendra',
    aiAnalysis: 'Both accused are linked to this investigation record. Kiran Joseph remains at large; officer verification and operational follow-up continue.',
  },
  {
    id: 'E3',
    type: 'Digital',
    desc: 'CCTV source - SH-9 junction camera',
    status: 'pending',
    date: null,
    officer: 'PI Dharmendra',
    aiAnalysis: 'The source is identified and referenced, but footage acquisition has not been recorded.',
  },
  {
    id: 'E4',
    type: 'Integrity record',
    desc: 'CCTV acquisition and hash record',
    status: 'gap',
    date: null,
    officer: null,
    aiAnalysis: 'No acquired file or cryptographic hash is recorded. Create the integrity record immediately after lawful acquisition.',
  },
  {
    id: 'E5',
    type: 'Legal certificate',
    desc: 'BSA Section 63 certificate for CCTV evidence',
    status: 'gap',
    date: null,
    officer: null,
    aiAnalysis: 'Certificate remains pending and must be reviewed by the investigating and legal officers before filing.',
  },
];

export const ACTIVE_CASE_BRIEF = {
  narrative: `FIR ${ACTIVE_CASE_FACTS.firId} records a robbery at ${ACTIVE_CASE_FACTS.location} on ${ACTIVE_CASE_FACTS.incidentDateLabel}. ${ACTIVE_CASE_FACTS.investigatingOfficer} is the investigating officer. Mohan Kumar and Kiran Joseph are listed as accused; Kiran Joseph remains at large. The CCTV source has been identified and referenced, while acquisition, hash verification, and the BSA Section 63 certificate remain pending. Investigation readiness is ${ACTIVE_CASE_FACTS.readiness}%, and statutory filing is due in ${ACTIVE_CASE_FACTS.filingDueDays} days. The ${ACTIVE_CASE_FACTS.narrativeReviewScore}% narrative-credibility indicator is a review-support signal only; it is not an evidentiary finding and cannot determine the case outcome.`,
  solvability: {
    firNo: ACTIVE_CASE_FACTS.firId,
    score: ACTIVE_CASE_FACTS.readiness / 100,
    label: 'REVIEW REQUIRED',
    factors: [
      { name: 'Incident record', weight: 1, value: 'FIR registered with date and precise location' },
      { name: 'Accused records', weight: 0.7, value: 'Two accused linked; one remains at large' },
      { name: 'CCTV acquisition', weight: 0.25, value: 'Source identified; footage not yet acquired' },
      { name: 'Digital integrity', weight: 0.1, value: 'Hash and BSA Section 63 certificate pending' },
      { name: 'Filing preparation', weight: 0.65, value: 'Statutory filing due in 18 days' },
    ],
    recommendation: 'Acquire the referenced CCTV lawfully, record its hash, obtain the BSA Section 63 certificate, and continue the at-large follow-up for Kiran Joseph.',
  },
  narrativeReview: {
    score: ACTIVE_CASE_FACTS.narrativeReviewScore / 100,
    label: 'REVIEW SUPPORT',
    flags: [
      { type: 'location_detail', weight: 0.88, description: 'The incident location is recorded at junction level.' },
      { type: 'date_detail', weight: 0.86, description: 'The incident date is explicitly recorded.' },
      { type: 'record_linkage', weight: 0.78, description: 'Named accused records are linked for officer review.' },
      { type: 'evidence_gap', weight: 0.35, description: 'Referenced CCTV remains unacquired and undocumented.' },
    ],
    methodology: 'Narrative feature indicator for triage and human review; not a legal, factual, or evidentiary determination.',
  },
  similarCases: [
    { caseId: 98, similarity: 0.62, reason: 'Robbery pattern and nearby urban corridor; officer review required.' },
    { caseId: 301, similarity: 0.54, reason: 'Shared offence category; no direct linkage established.' },
  ],
  entityLinks: [
    { source: 'Mohan Kumar', target: 'Kiran Joseph', weight: 3, relation: 'co-accused' },
    { source: 'Kiran Joseph', target: 'At-large status', weight: 4, relation: 'operational-status' },
    { source: 'CCTV source', target: 'SH-9 junction', weight: 2, relation: 'referenced-at' },
  ],
  recommendations: [
    { priority: 'HIGH', action: 'Acquire the identified SH-9 junction CCTV footage through the authorised process', deadlineLabel: 'Immediate' },
    { priority: 'HIGH', action: 'Generate and record the CCTV file hash at acquisition', deadlineLabel: 'On receipt' },
    { priority: 'HIGH', action: 'Obtain and verify the BSA Section 63 certificate', deadlineLabel: 'Before filing' },
    { priority: 'HIGH', action: 'Continue location and arrest follow-up for Kiran Joseph', deadlineLabel: 'Ongoing' },
    { priority: 'MEDIUM', action: 'Complete the statutory filing pack', deadlineLabel: 'Due in 18 days' },
  ],
  provenance: [
    { function: 'case_record', methodology: 'FIR and investigation record fields' },
    { function: 'narrative_review', methodology: 'Review-support indicator with mandatory officer validation' },
    { function: 'network_analysis', methodology: 'Entity linkage from the active case record' },
  ],
};

// Preserve the backend contract while preventing stale demo responses from
// overriding the canonical active-case record.
export function getActiveCaseData(payload = {}) {
  return {
    ...payload,
    FIRNo: ACTIVE_CASE_FACTS.firId,
    FirNo: ACTIVE_CASE_FACTS.firId,
    CrimeGroup_Name: ACTIVE_CASE_FACTS.crimeType,
    UnitName: ACTIVE_CASE_FACTS.station,
    DistrictName: ACTIVE_CASE_FACTS.district,
    fir_stage: ACTIVE_CASE_FACTS.status,
    IncidentDate: ACTIVE_CASE_FACTS.incidentDate,
    IncidentLocation: ACTIVE_CASE_FACTS.location,
    InvestigatingOfficer: ACTIVE_CASE_FACTS.investigatingOfficer,
  };
}

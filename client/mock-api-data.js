export function defineMockApi() {
  return {
    // === Topology ===
    'GET /server/topology_navigator/topology': () => ({
      nodes: [
        { id: 'theft', label: 'Theft', size: 22, fsc: 0.42, crimeCount: 145 },
        { id: 'burglary', label: 'Burglary', size: 18, fsc: 0.55, crimeCount: 98 },
        { id: 'robbery', label: 'Robbery', size: 16, fsc: 0.38, crimeCount: 67 },
        { id: 'assault', label: 'Assault', size: 20, fsc: 0.61, crimeCount: 112 },
        { id: 'murder', label: 'Murder', size: 10, fsc: 0.78, crimeCount: 14 },
        { id: 'sexual', label: 'Sexual Violence', size: 14, fsc: 0.71, crimeCount: 43 },
        { id: 'fraud', label: 'Fraud', size: 17, fsc: 0.49, crimeCount: 89 },
        { id: 'cyber', label: 'Cybercrime', size: 15, fsc: 0.66, crimeCount: 56 },
        { id: 'drugs', label: 'Drug Offenses', size: 19, fsc: 0.58, crimeCount: 78 },
        { id: 'property', label: 'Property Damage', size: 13, fsc: 0.35, crimeCount: 34 },
        { id: 'extortion', label: 'Extortion', size: 11, fsc: 0.72, crimeCount: 22 },
        { id: 'publicorder', label: 'Public Order', size: 12, fsc: 0.40, crimeCount: 28 },
      ],
      edges: [
        { source: 'theft', target: 'burglary', weight: 0.28, label: '0.28', width: 2.8 },
        { source: 'theft', target: 'robbery', weight: 0.19, label: '0.19', width: 1.9 },
        { source: 'theft', target: 'fraud', weight: 0.15, label: '0.15', width: 1.5 },
        { source: 'burglary', target: 'robbery', weight: 0.22, label: '0.22', width: 2.2 },
        { source: 'burglary', target: 'property', weight: 0.31, label: '0.31', width: 3.1 },
        { source: 'robbery', target: 'assault', weight: 0.25, label: '0.25', width: 2.5 },
        { source: 'robbery', target: 'murder', weight: 0.08, label: '0.08', width: 0.8 },
        { source: 'assault', target: 'murder', weight: 0.12, label: '0.12', width: 1.2 },
        { source: 'assault', target: 'sexual', weight: 0.14, label: '0.14', width: 1.4 },
        { source: 'fraud', target: 'cyber', weight: 0.33, label: '0.33', width: 3.3 },
        { source: 'fraud', target: 'extortion', weight: 0.17, label: '0.17', width: 1.7 },
        { source: 'cyber', target: 'extortion', weight: 0.20, label: '0.20', width: 2.0 },
        { source: 'drugs', target: 'assault', weight: 0.16, label: '0.16', width: 1.6 },
        { source: 'drugs', target: 'publicorder', weight: 0.24, label: '0.24', width: 2.4 },
        { source: 'extortion', target: 'publicorder', weight: 0.11, label: '0.11', width: 1.1 },
      ],
      metadata: { totalCrimes: 1247, crimeTypeCount: 12, districtId: 1 }
    }),
    'GET /server/topology_navigator/topology/months': () => ({
      months: ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12']
    }),

    // === Fairness Audit ===
    'GET /server/fairness_audit/fairness-audit/models': () => ({
      models: ['xgb_hotspot', 'rf_solvability', 'lr_recidivism', 'gb_veracity']
    }),
    'GET /server/fairness_audit/fairness-audit/metrics': ({ query }) => {
      const model = query.model || 'xgb_hotspot';
      return {
        data: [
          { group: 'Male (18-35)', parity_ratio: 0.92, eo_diff: 0.03, fpr: 0.08, fnr: 0.12, count: 342 },
          { group: 'Male (35-60)', parity_ratio: 0.88, eo_diff: 0.06, fpr: 0.10, fnr: 0.15, count: 218 },
          { group: 'Female (18-35)', parity_ratio: 0.79, eo_diff: 0.12, fpr: 0.05, fnr: 0.22, count: 156 },
          { group: 'Female (35-60)', parity_ratio: 0.84, eo_diff: 0.08, fpr: 0.04, fnr: 0.18, count: 98 },
          { group: 'Senior (60+)', parity_ratio: 0.71, eo_diff: 0.18, fpr: 0.03, fnr: 0.28, count: 47 },
        ],
        model
      };
    },
    'GET /server/fairness_audit/fairness-audit/summary': () => ({
      models: [
        { model: 'xgb_hotspot', parity_ratio: 0.88, eo_diff: 0.05, status: 'PASS' },
        { model: 'rf_solvability', parity_ratio: 0.82, eo_diff: 0.09, status: 'REVIEW' },
        { model: 'lr_recidivism', parity_ratio: 0.75, eo_diff: 0.14, status: 'FAIL' },
        { model: 'gb_veracity', parity_ratio: 0.91, eo_diff: 0.03, status: 'PASS' },
      ]
    }),

    // === Dark Figure ===
    'GET /server/dark_figure/dark-figure': ({ query }) => ({
      data: {
        districtId: parseInt(query.district) || 1,
        districtName: 'Bangalore Urban',
        firCounts: { theft: 120, burglary: 85, robbery: 42, assault: 67, murder: 8, sexual: 23, fraud: 56, cyber: 31, drugs: 44, property: 19, extortion: 12, publicorder: 15 },
        estimatedTotals: {
          theft: { estimated: 218, lower: 185, upper: 251 },
          burglary: { estimated: 142, lower: 120, upper: 164 },
          robbery: { estimated: 78, lower: 62, upper: 94 },
          assault: { estimated: 98, lower: 82, upper: 114 },
          murder: { estimated: 11, lower: 9, upper: 13 },
          sexual: { estimated: 67, lower: 45, upper: 89 },
          fraud: { estimated: 89, lower: 71, upper: 107 },
          cyber: { estimated: 52, lower: 41, upper: 63 },
          drugs: { estimated: 71, lower: 58, upper: 84 },
          property: { estimated: 28, lower: 22, upper: 34 },
          extortion: { estimated: 19, lower: 14, upper: 24 },
          publicorder: { estimated: 24, lower: 18, upper: 30 },
        },
        reportingRate: 0.58,
        methodology: 'Capture-recapture estimation with Poisson regression (Biderman & Reiss 1967)'
      }
    }),

    // === CounterCrime ===
    'GET /server/countercrime/countercrime/districts': () => ({
      districts: [
        { id: 1, name: 'Bangalore Urban', baseline: { patrolBudget: 50, literacyRate: 82, policePerCapita: 180, streetlightCoverage: 55 } },
        { id: 2, name: 'Bangalore Rural', baseline: { patrolBudget: 35, literacyRate: 74, policePerCapita: 120, streetlightCoverage: 38 } },
        { id: 3, name: 'Mysuru', baseline: { patrolBudget: 42, literacyRate: 79, policePerCapita: 145, streetlightCoverage: 48 } },
        { id: 4, name: 'Mangaluru', baseline: { patrolBudget: 38, literacyRate: 81, policePerCapita: 135, streetlightCoverage: 52 } },
        { id: 5, name: 'Hubli-Dharwad', baseline: { patrolBudget: 33, literacyRate: 72, policePerCapita: 110, streetlightCoverage: 35 } },
      ]
    }),
    'POST /server/countercrime/countercrime/simulate': ({ body }) => ({
      districtId: body.districtId || 1,
      baseline: { crimeRate: 450, arrestRate: 0.28, clearanceRate: 0.42 },
      projected: { crimeRate: 362, arrestRate: 0.35, clearanceRate: 0.51 },
      deltas: {
        crimeRate: { baseline: 450, projected: 362, delta: -88, pctChange: -19.6 },
        arrestRate: { baseline: 0.28, projected: 0.35, delta: 0.07, pctChange: 25.0 },
        clearanceRate: { baseline: 0.42, projected: 0.51, delta: 0.09, pctChange: 21.4 },
      },
      confidence: 0.82,
      modelVersion: 'XGBoost-v2.1',
    }),

    // === Veracity ===
    'POST /server/veracity_index/analyze': ({ body }) => {
      const narrative = body.narrative || '';
      const wordCount = narrative.split(/\s+/).length;
      const hasSpecifics = /\d{1,2}:\d{2}|KA-\d{2}|\d{2,}/.test(narrative);
      const isVague = wordCount < 50 || /someone|something|bad person|bothering/.test(narrative.toLowerCase());
      const score = isVague ? 0.32 : hasSpecifics ? 0.84 : 0.61;
      const label = score >= 0.7 ? 'GENUINE' : score >= 0.45 ? 'NEEDS REVIEW' : 'FABRICATED';

      return {
        score,
        label,
        flags: [
          { type: 'specificity', weight: hasSpecifics ? 0.8 : 0.2, description: hasSpecifics ? 'Narrative contains specific temporal and spatial details' : 'Narrative lacks specific details (times, locations, identifiers)' },
          { type: 'coherence', weight: 0.7, description: 'Event sequence is logically ordered and internally consistent' },
          { type: 'complainant_detail', weight: body.complainantName && body.complainantName !== 'Anonymous' ? 0.9 : 0.3, description: body.complainantName && body.complainantName !== 'Anonymous' ? 'Complainant identified by name' : 'Complainant is anonymous or unidentified' },
          { type: 'delay_indicator', weight: body.delayReason ? 0.4 : 0.9, description: body.delayReason ? `Delay reported: "${body.delayReason}"` : 'No delay in reporting' },
          { type: 'property_claim', weight: body.propertyValue > 100000 ? 0.3 : 0.7, description: body.propertyValue > 100000 ? 'High-value property claim warrants verification' : 'Property value within expected range' },
        ],
        ziaAssessment: `Linguistic analysis completed. Veracity score: ${(score * 100).toFixed(0)}%. Based on ${wordCount} words, ${hasSpecifics ? 'high specificity markers detected' : 'low specificity markers'}. VeriPol-style behavioral pattern matching active.`,
        methodology: 'VeriPol-inspired logistic regression + TF-IDF features + behavioral markers'
      };
    },

    // === Agentic ===
    'GET /server/agentic/actions': () => ({
      actions: [
        { id: 1, agent: 'PatrolOptimizer', action: 'Reallocated 3 patrol units to Brigade Road corridor', timestamp: '2026-07-06T08:30:00Z', status: 'executed', confidence: 0.87 },
        { id: 2, agent: 'CaseTriager', action: 'Flagged FIR KSP-2026-0142 for priority review', timestamp: '2026-07-06T07:15:00Z', status: 'executed', confidence: 0.92 },
        { id: 3, agent: 'VeracityScanner', action: 'Batch-processed 47 FIR narratives for veracity scoring', timestamp: '2026-07-06T06:00:00Z', status: 'completed', confidence: 0.85 },
        { id: 4, agent: 'HotspotPredictor', action: 'Updated 12-hour crime forecast for District 1', timestamp: '2026-07-06T05:30:00Z', status: 'completed', confidence: 0.79 },
        { id: 5, agent: 'BriefGenerator', action: 'Generated morning intelligence brief for ACP Anjumala', timestamp: '2026-07-06T05:00:00Z', status: 'delivered', confidence: 0.91 },
      ]
    }),
    'GET /server/agentic/briefs': () => ({
      briefs: [
        { id: 1, date: '2026-07-06', title: 'Morning Intelligence Brief', summary: 'Overnight crime analysis: 12 FIRs registered, 3 flagged for veracity review. Brigade Road hotspot active.', sections: ['Crime Summary', 'Hotspot Alert', 'Case Status', 'Resource Allocation'] },
        { id: 2, date: '2026-07-05', title: 'Evening Intelligence Brief', summary: 'Day shift summary: 28 FIRs processed, 2 arrests made, clearance rate 42%.', sections: ['Crime Summary', 'Arrest Log', 'Pending Cases'] },
      ]
    }),
    'POST /server/daily_brief/agentic/briefs/trigger': () => ({
      status: 'triggered', message: 'Brief generation started. Will be ready in ~2 minutes.'
    }),

    // === Alerts ===
    'GET /server/fir_api/alerts': () => ([
      { id: 1, type: 'VERACITY', severity: 'high', title: 'FIR KSP-2026-0142 flagged as FABRICATED', district: 'Bangalore Urban', timestamp: '2026-07-06T08:45:00Z' },
      { id: 2, type: 'HOTSPOT', severity: 'medium', title: 'Brigade Road showing elevated theft activity', district: 'Bangalore Urban', timestamp: '2026-07-06T07:30:00Z' },
      { id: 3, type: 'SOLVABILITY', severity: 'low', title: 'Case #1234 solvability index dropped to 0.31', district: 'Mysuru', timestamp: '2026-07-06T06:15:00Z' },
      { id: 4, type: 'FAIRNESS', severity: 'medium', title: 'Recidivism model parity ratio below threshold (0.75)', district: 'All', timestamp: '2026-07-06T05:00:00Z' },
    ]),

    // === Beat Optimizer ===
    'GET /server/beat_optimizer/districts': () => ({
      districts: [
        { id: 1, name: 'Bangalore Urban', beats: 24, officers: 180, avgResponseTime: '8.2 min' },
        { id: 2, name: 'Bangalore Rural', beats: 16, officers: 95, avgResponseTime: '14.5 min' },
        { id: 3, name: 'Mysuru', beats: 18, officers: 120, avgResponseTime: '11.3 min' },
      ]
    }),
    'GET /server/beat_optimizer/beats/:id': ({ params }) => ({
      districtId: parseInt(params.id) || 1,
      beats: [
        { id: 'B1', name: 'Brigade Road', area: '1.2 km²', crimeIndex: 0.78, officers: 4, patrolTime: '45 min' },
        { id: 'B2', name: 'MG Road', area: '0.8 km²', crimeIndex: 0.65, officers: 3, patrolTime: '30 min' },
        { id: 'B3', name: 'Indiranagar', area: '2.1 km²', crimeIndex: 0.42, officers: 2, patrolTime: '60 min' },
        { id: 'B4', name: 'Koramangala', area: '1.5 km²', crimeIndex: 0.59, officers: 3, patrolTime: '40 min' },
        { id: 'B5', name: 'Whitefield', area: '3.2 km²', crimeIndex: 0.51, officers: 2, patrolTime: '75 min' },
      ],
    }),
    'GET /server/beat_optimizer/optimize/:id': ({ params, query }) => ({
      districtId: parseInt(params.id) || 1,
      flowMode: !!query.flowMode,
      optimizedBeats: [
        { id: 'B1', name: 'Brigade Road', officers: 5, patrolTime: '38 min', crimeReduction: '-12%' },
        { id: 'B2', name: 'MG Road', officers: 4, patrolTime: '25 min', crimeReduction: '-8%' },
        { id: 'B3', name: 'Indiranagar', officers: 2, patrolTime: '55 min', crimeReduction: '-3%' },
        { id: 'B4', name: 'Koramangala', officers: 4, patrolTime: '32 min', crimeReduction: '-10%' },
        { id: 'B5', name: 'Whitefield', officers: 3, patrolTime: '65 min', crimeReduction: '-6%' },
      ],
      totalReduction: '-8.2%',
      confidence: 0.84,
    }),
    'GET /server/beat_optimizer/patrol/:id': ({ params }) => ({
      districtId: parseInt(params.id) || 1,
      activePatrols: [
        { officer: 'PI Dharmendra', beat: 'Brigade Road', startTime: '08:00', status: 'active' },
        { officer: 'SI Maruti', beat: 'MG Road', startTime: '08:30', status: 'active' },
        { officer: 'HC Ramesh', beat: 'Koramangala', startTime: '09:00', status: 'break' },
      ],
    }),

    // === Case Management ===
    'GET /server/case-management/stats': () => ({
      totalCases: 1247,
      activeCases: 483,
      closedCases: 764,
      pendingInCourt: 218,
      clearanceRate: 0.61,
      avgResolutionDays: 47,
      byStage: { investigation: 198, chargesheet: 142, trial: 89, appeal: 54 },
      bySeverity: { petty: 312, misdemeanour: 156, felony: 15 },
    }),

    // === FIR Quality ===
    'GET /server/fir_quality/fir-quality/lowest': () => ([
      { firNo: 'KSP-2026-0142', district: 'Bangalore Urban', score: 0.31, issues: ['Missing witness details', 'Vague suspect description', 'No weapon mentioned'] },
      { firNo: 'KSP-2026-0089', district: 'Bangalore Urban', score: 0.38, issues: ['Delayed reporting without reason', 'Property value inflated'] },
      { firNo: 'KSP-2026-0201', district: 'Mysuru', score: 0.42, issues: ['Incomplete address', 'No FIR stage marked'] },
    ]),
    'GET /server/fir_quality/fir-quality/crime-types': () => ([
      { crimeType: 'theft', avgScore: 0.78, count: 145 },
      { crimeType: 'burglary', avgScore: 0.72, count: 98 },
      { crimeType: 'assault', avgScore: 0.81, count: 112 },
      { crimeType: 'cyber', avgScore: 0.65, count: 56 },
      { crimeType: 'fraud', avgScore: 0.69, count: 89 },
    ]),
    'POST /server/fir_quality/fir-quality': ({ body }) => ({
      firNo: body.firNo || 'KSP-2026-0142',
      score: 0.62,
      label: 'NEEDS REVIEW',
      issues: ['Vague suspect description', 'No weapon mentioned'],
      methodology: 'VeriPol-inspired quality scoring'
    }),

    // === GBV Analytics ===
    'GET /server/gbv_analytics/analytics': () => ({
      totalCases: 43,
      byAgeGroup: { '18-30': 18, '31-45': 15, '46-60': 7, '60+': 3 },
      byType: { domestic: 21, workplace: 8, public: 9, online: 5 },
      convictionRate: 0.34,
      avgResolutionDays: 92,
      districts: [
        { name: 'Bangalore Urban', cases: 18 },
        { name: 'Mysuru', cases: 9 },
        { name: 'Mangaluru', cases: 7 },
        { name: 'Hubli-Dharwad', cases: 9 },
      ],
    }),
    'GET /server/gbv_analytics/resources': () => ({
      resources: [
        { name: 'Women Helpline 1091', phone: '1091', available: true },
        { name: 'One Stop Centre - Bangalore', phone: '080-22871111', available: true },
        { name: 'Women Protection Officer - District 1', phone: '080-22942400', available: true },
      ]
    }),

    // === Hotspot / QuickML ===
    'GET /server/quickml_predict/predict': ({ query }) => ({
      districtId: parseInt(query.districtId) || 1,
      predictions: [
        { lat: 12.9762, lng: 77.6033, crimeType: 'theft', probability: 0.78, area: 'Brigade Road' },
        { lat: 12.9698, lng: 77.7499, crimeType: 'burglary', probability: 0.65, area: 'Whitefield' },
        { lat: 12.9279, lng: 77.6271, crimeType: 'robbery', probability: 0.52, area: 'BTM Layout' },
        { lat: 13.0298, lng: 77.5654, crimeType: 'assault', probability: 0.44, area: 'Malleshwaram' },
      ],
      modelVersion: 'QuickML-v3.2',
      confidence: 0.81,
    }),

    // === Network Analysis ===
    'GET /server/network_analysis/graph': () => ({
      nodes: [
        { id: 'N1', label: 'Suspect A', group: 1, size: 12 },
        { id: 'N2', label: 'Suspect B', group: 1, size: 10 },
        { id: 'N3', label: 'Suspect C', group: 2, size: 8 },
        { id: 'N4', label: 'Victim 1', group: 3, size: 6 },
        { id: 'N5', label: 'Witness', group: 4, size: 5 },
        { id: 'N6', label: 'Suspect D', group: 2, size: 9 },
        { id: 'N7', label: 'Associate', group: 4, size: 4 },
        { id: 'N8', label: 'Victim 2', group: 3, size: 5 },
      ],
      links: [
        { source: 'N1', target: 'N2', weight: 5, relation: 'co-offender' },
        { source: 'N1', target: 'N3', weight: 3, relation: 'known-associate' },
        { source: 'N2', target: 'N6', weight: 4, relation: 'family' },
        { source: 'N3', target: 'N6', weight: 2, relation: 'co-offender' },
        { source: 'N1', target: 'N4', weight: 1, relation: 'perpetrator-victim' },
        { source: 'N3', target: 'N8', weight: 1, relation: 'perpetrator-victim' },
        { source: 'N5', target: 'N4', weight: 1, relation: 'witness' },
        { source: 'N6', target: 'N7', weight: 2, relation: 'associate' },
      ],
      communities: 4,
      totalCases: 6,
    }),

    // === Notifications ===
    'GET /server/case_management/case-management/notifications': () => ([
      { id: 1, type: 'VERACITY_ALERT', message: 'FIR KSP-2026-0142 veracity score: 0.32 (FABRICATED)', timestamp: '2026-07-06T08:45:00Z', read: false },
      { id: 2, type: 'CASE_UPDATE', message: 'Case #1234 moved to chargesheet stage', timestamp: '2026-07-06T07:30:00Z', read: false },
      { id: 3, type: 'HOTSPOT_WARNING', message: 'Brigade Road theft probability elevated to 78%', timestamp: '2026-07-06T06:00:00Z', read: true },
      { id: 4, type: 'BRIEF_READY', message: 'Morning intelligence brief ready for review', timestamp: '2026-07-06T05:00:00Z', read: true },
    ]),

    // === FIR Lookup ===
    'POST /server/fir_api/fir/lookup': ({ body }) => ({
      firNo: body.firNo || 'KSP-2026-0142',
      district: 'Bangalore Urban',
      dateRegistered: '2026-03-15',
      complainant: 'Rajesh Kumar',
      sections: ['379 IPC', '506 IPC'],
      status: 'Under Investigation',
      io: 'PI Dharmendra',
    }),

    // === Solvability ===
    'POST /server/solvability_index/solvability': ({ body }) => ({
      firNo: body.firNo || 'KSP-2026-0142',
      score: 0.67,
      label: 'SOLVABLE',
      factors: [
        { name: 'Witness availability', weight: 0.85, value: '2 witnesses identified' },
        { name: 'Physical evidence', weight: 0.72, value: 'CCTV footage within 48hr window' },
        { name: 'Suspect identification', weight: 0.60, value: 'Partial — scar description, no name' },
        { name: 'Time to report', weight: 0.92, value: 'Reported within 4 hours' },
        { name: 'Location specificity', weight: 0.88, value: 'Exact location identified' },
      ],
      recommendation: 'Prioritize for investigation. Strong witness and evidence indicators.',
    }),

    // === Victim Risk ===
    'GET /server/victim_risk_shield/high-risk': () => ({
      victims: [
        { id: 1, name: 'Protected', age: 34, riskLevel: 'HIGH', riskScore: 0.82, factors: ['Repeat victim (3x)', 'High-crime area', 'No protection order'] },
        { id: 2, name: 'Protected', age: 28, riskLevel: 'MEDIUM', riskScore: 0.61, factors: ['Domestic violence history', 'Recent threats'] },
        { id: 3, name: 'Protected', age: 52, riskLevel: 'HIGH', riskScore: 0.78, factors: ['Elderly', 'Isolated living', 'Financial exploitation pattern'] },
      ],
      total: 3,
      avgRiskScore: 0.74,
    }),

    // === Voice Query ===
    'POST /server/zia_voice/stt': () => ({
      text: 'What is the crime rate in Bangalore Urban district for March 2026?'
    }),
    'POST /server/legal_rag/query': ({ body }) => {
      const q = (body.query || '').toLowerCase()
      let answer, context
      if (/ipc\s*379/.test(q) || /what.*theft/.test(q)) {
        answer = 'IPC 379: Theft. Whoever, intending to take dishonestly any movable property out of the possession of any person without that person\'s consent, moves that property in order to such taking. Punishment: Imprisonment up to 3 years or fine or both.'
        context = 'IPC Section 379'
      } else if (/ipc\s*302/.test(q) || /what.*murder/.test(q)) {
        answer = 'IPC 302: Murder. Whoever commits murder shall be punished with death or imprisonment for life and shall also be liable to fine.'
        context = 'IPC Section 302'
      } else if (/ipc\s*420/.test(q) || /what.*cheating/.test(q)) {
        answer = 'IPC 420: Cheating and dishonestly inducing delivery of property. Whoever cheats and thereby dishonestly induces the person deceived to deliver any property. Punishment: Imprisonment up to 7 years and fine.'
        context = 'IPC Section 420'
      } else if (/highest.*chargesheet|chargesheet.*highest|which.*station.*most/.test(q)) {
        answer = 'Brigade Road PS has the highest chargesheet rate at 92%, followed by Cubbon Park PS at 85%. Mysuru North PS has the lowest at 58%.'
        context = 'KSP Chargesheet Statistics, Q2 2026'
      } else if (/pending.*brigade|brigade.*pending|brigade.*case/.test(q)) {
        answer = 'Brigade Road PS has 47 pending cases, of which 12 are overdue beyond the 90-day CPC limit. The oldest pending case is KSP-2026-0201 (188 days).'
        context = 'CCTNS CaseMaster records for UnitID=3'
      } else if (/case.*master|casemaster|table.*schema/.test(q)) {
        answer = 'The CaseMaster table is the central CCTNS table. Key fields: CaseMasterID (PK), CrimeNo, FIRNumber, CrimeGroup, CrimeHead, IODate, FIRDate, Year, UnitID (FK→Unit), CourtID (FK→Court), Stage (Investigation/Chargesheet/Trial/Appeal), ActSection.'
        context = 'CCTNS Schema v1 — CaseMaster table'
      } else {
        answer = 'I can answer questions about CCTNS schema, IPC sections, and station statistics. Try: "What is IPC 379?", "Which station has the highest chargesheet rate?", "Tell me about the CaseMaster table."'
        context = 'QuickML RAG Knowledge Base'
      }
      return { answer, context, confidence: 0.87 }
    },
    'POST /server/zia_voice/tts': () => ({
      audioUrl: null,
      message: 'TTS not available in mock mode'
    }),

    // === Exceedance Curve ===
    'GET /server/exceedance_curve/exceedance': ({ query }) => {
      const crimeTypes = ['theft', 'burglary', 'assault', 'cyber_fraud', 'robbery', 'vehicle_theft', 'homicide', 'kidnapping'];
      const curves = {};
      crimeTypes.forEach(ct => {
        const mean = 80 + Math.round(Math.random() * 320);
        const std = Math.round(mean * (0.15 + Math.random() * 0.25));
        curves[ct] = { mean, std, exceedanceCurve: [1, 2, 5, 10, 20, 50].map(rp => ({ returnPeriodYears: rp, thresholdExceedance: Math.round(mean + std * Math.sqrt(rp) * 1.28), probabilityAnnual: rp === 1 ? 0.63 : 1 / rp })) };
      });
      const worst = Object.entries(curves).sort((a, b) => b[1].exceedanceCurve.find(e => e.returnPeriodYears === 1).thresholdExceedance - a[1].exceedanceCurve.find(e => e.returnPeriodYears === 1).thresholdExceedance)[0];
      return { districtId: parseInt(query.district) || 1, worstOffense: { crimeType: worst[0], ...worst[1] }, curves };
    },

    // === Deterrence (public dashboard) ===
    'GET /server/deterrence/stats': () => ({
      totalVisitors: 12847,
      uniqueVisitors: 8234,
      pageViews: 31256,
      avgSessionDuration: '4m 32s',
      topPages: [
        { page: 'Crime Statistics', views: 12847 },
        { page: 'District Dashboard', views: 8923 },
        { page: 'FIR Status Lookup', views: 6234 },
        { page: 'Safety Tips', views: 3152 },
      ],
    }),

    // === Transit Detection ===
    'GET /server/transit_detection/transit-detection': ({ query }) => {
      const detections = [
        { id: 1, vehicle: 'KA-01-MN-1234', type: 'flagged', reason: 'Stolen vehicle match', timestamp: '2026-07-06T08:30:00Z', location: 'MG Road checkpoint' },
        { id: 2, vehicle: 'KA-05-AB-5678', type: 'alert', reason: 'Owner has pending warrants', timestamp: '2026-07-06T07:45:00Z', location: 'Hebbal flyover' },
      ];
      return { districtId: parseInt(query.district) || 1, crimeType: query.crimeType || 'theft', detections, detectedTransits: detections, totalToday: 2 };
    },

    // === Case Management - Cases List ===
    'GET /server/case-management/cases': ({ query }) => ({
      cases: [
        { id: 1, firNo: 'KSP-2026-0142', stage: query.stage || 'investigation', severity: 'felony', io: 'PI Dharmendra', dateRegistered: '2026-03-15', nextHearing: '2026-07-20', expiringSoon: false },
        { id: 2, firNo: 'KSP-2026-0089', stage: 'chargesheet', severity: 'misdemeanour', io: 'PI Maruti', dateRegistered: '2026-02-28', nextHearing: '2026-07-12', expiringSoon: true },
        { id: 3, firNo: 'KSP-2026-0201', stage: 'trial', severity: 'felony', io: 'PI Anjumala', dateRegistered: '2026-01-10', nextHearing: '2026-07-15', expiringSoon: false },
        { id: 4, firNo: 'KSP-2026-0156', stage: 'investigation', severity: 'petty', io: 'SI Ramesh', dateRegistered: '2026-04-01', nextHearing: null, expiringSoon: false },
        { id: 5, firNo: 'KSP-2026-0234', stage: 'chargesheet', severity: 'misdemeanour', io: 'PI Dharmendra', dateRegistered: '2026-03-20', nextHearing: '2026-07-18', expiringSoon: true },
      ],
      total: 5,
    }),
    'GET /server/case-management/cases/expiring': () => ({
      cases: [
        { id: 2, firNo: 'KSP-2026-0089', stage: 'chargesheet', severity: 'misdemeanour', io: 'PI Maruti', dateRegistered: '2026-02-28', nextHearing: '2026-07-12', expiringSoon: true, daysRemaining: 6 },
        { id: 5, firNo: 'KSP-2026-0234', stage: 'chargesheet', severity: 'misdemeanour', io: 'PI Dharmendra', dateRegistered: '2026-03-20', nextHearing: '2026-07-18', expiringSoon: true, daysRemaining: 12 },
      ],
      total: 2,
    }),

    // === Chargesheet Clock ===
    'GET /server/chargesheet-clock/stats': () => {
      const now = Date.now();
      const cases = [
        { caseId: 1, firNo: 'KSP-2026-0142', crimeType: 'robbery', officer: 'PI Dharmendra', districtId: 3, dateRegistered: '2026-03-15', daysSinceRegistration: 114, cpcLimitDays: 90, daysOverdue: 24, deadlineDate: '2026-06-13', status: 'overdue' },
        { caseId: 2, firNo: 'KSP-2026-0089', crimeType: 'burglary', officer: 'PI Maruti', districtId: 7, dateRegistered: '2026-02-28', daysSinceRegistration: 129, cpcLimitDays: 90, daysOverdue: 39, deadlineDate: '2026-05-29', status: 'overdue' },
        { caseId: 3, firNo: 'KSP-2026-0201', crimeType: 'assault', officer: 'PI Anjumala', districtId: 2, dateRegistered: '2026-01-10', daysSinceRegistration: 178, cpcLimitDays: 90, daysOverdue: 88, deadlineDate: '2026-04-10', status: 'overdue' },
        { caseId: 4, firNo: 'KSP-2026-0156', crimeType: 'theft', officer: 'SI Ramesh', districtId: 5, dateRegistered: '2026-04-01', daysSinceRegistration: 97, cpcLimitDays: 90, daysOverdue: 7, deadlineDate: '2026-06-30', status: 'overdue' },
        { caseId: 5, firNo: 'KSP-2026-0234', crimeType: 'fraud', officer: 'PI Dharmendra', districtId: 3, dateRegistered: '2026-03-20', daysSinceRegistration: 109, cpcLimitDays: 90, daysOverdue: 19, deadlineDate: '2026-06-18', status: 'overdue' },
        { caseId: 6, firNo: 'KSP-2026-0301', crimeType: 'robbery', officer: 'SI Patel', districtId: 1, dateRegistered: '2026-05-10', daysSinceRegistration: 58, cpcLimitDays: 90, daysOverdue: 0, deadlineDate: '2026-08-08', status: 'at_risk', daysRemaining: 32 },
        { caseId: 7, firNo: 'KSP-2026-0267', crimeType: 'burglary', officer: 'PI Maruti', districtId: 7, dateRegistered: '2026-05-20', daysSinceRegistration: 48, cpcLimitDays: 90, daysOverdue: 0, deadlineDate: '2026-08-18', status: 'at_risk', daysRemaining: 42 },
        { caseId: 8, firNo: 'KSP-2026-0333', crimeType: 'assault', officer: 'SI Rao', districtId: 4, dateRegistered: '2026-06-01', daysSinceRegistration: 36, cpcLimitDays: 90, daysOverdue: 0, deadlineDate: '2026-08-30', status: 'at_risk', daysRemaining: 54 },
        { caseId: 9, firNo: 'KSP-2026-0359', crimeType: 'theft', officer: 'PI Anjumala', districtId: 2, dateRegistered: '2026-06-15', daysSinceRegistration: 22, cpcLimitDays: 90, daysOverdue: 0, deadlineDate: '2026-09-13', status: 'safe', daysRemaining: 68 },
        { caseId: 10, firNo: 'KSP-2026-0388', crimeType: 'fraud', officer: 'SI Ramesh', districtId: 5, dateRegistered: '2026-06-22', daysSinceRegistration: 15, cpcLimitDays: 90, daysOverdue: 0, deadlineDate: '2026-09-20', status: 'safe', daysRemaining: 75 },
      ];
      return {
        overdueCount: cases.filter(c => c.status === 'overdue').length,
        atRiskCount: cases.filter(c => c.status === 'at_risk').length,
        safeCount: cases.filter(c => c.status === 'safe').length,
        averageOverdueDays: Math.round(cases.filter(c => c.status === 'overdue').reduce((s, c) => s + c.daysOverdue, 0) / cases.filter(c => c.status === 'overdue').length),
        worstCase: cases.reduce((w, c) => c.daysOverdue > w.daysOverdue ? c : w, { daysOverdue: 0 }),
        cases,
      };
    },

    // === Retraction Rate ===
    'GET /server/retraction_rate/summary': () => ({
      totalChargesheets: 847,
      typeA: 612,
      typeB: 148,
      typeC: 87,
      retractionRate: (148 + 87) / 847,
      bRate: 148 / 847,
      cRate: 87 / 847,
    }),
    'GET /server/retraction_rate/by_station': () => {
      const stations = [
        { station: 'Brigade Road PS', district: 'Bangalore Urban', total: 64, A: 51, B: 9, C: 4, retractionPct: 20.3 },
        { station: 'Cubbon Park PS', district: 'Bangalore Urban', total: 72, A: 58, B: 10, C: 4, retractionPct: 19.4 },
        { station: 'Mysuru North PS', district: 'Mysuru', total: 55, A: 39, B: 11, C: 5, retractionPct: 29.1 },
        { station: 'Mysuru South PS', district: 'Mysuru', total: 48, A: 33, B: 10, C: 5, retractionPct: 31.2 },
        { station: 'Hubli PS', district: 'Dharwad', total: 38, A: 28, B: 7, C: 3, retractionPct: 26.3 },
        { station: 'Belgaum City PS', district: 'Belgaum', total: 42, A: 36, B: 4, C: 2, retractionPct: 14.3 },
        { station: 'Mangaluru PS', district: 'Dakshina Kannada', total: 51, A: 44, B: 5, C: 2, retractionPct: 13.7 },
        { station: 'Udupi PS', district: 'Udupi', total: 33, A: 25, B: 6, C: 2, retractionPct: 24.2 },
        { station: 'Central Crime Branch', district: 'Bangalore Urban', total: 89, A: 48, B: 26, C: 15, retractionPct: 46.1 },
        { station: 'Shivamogga PS', district: 'Shivamogga', total: 29, A: 22, B: 5, C: 2, retractionPct: 24.1 },
        { station: 'Dharwad PS', district: 'Dharwad', total: 31, A: 25, B: 4, C: 2, retractionPct: 19.4 },
        { station: 'Chitradurga PS', district: 'Chitradurga', total: 27, A: 24, B: 2, C: 1, retractionPct: 11.1 },
      ];
      return { stations: stations.sort((a, b) => b.retractionPct - a.retractionPct) };
    },
    'GET /server/retraction_rate/by_io': () => {
      const ios = [
        { officer: 'PI Dharmendra', total: 67, A: 44, B: 15, C: 8, retractionPct: 34.3, station: 'Brigade Road PS' },
        { officer: 'PI Maruti', total: 55, A: 40, B: 10, C: 5, retractionPct: 27.3, station: 'Brigade Road PS' },
        { officer: 'PI Anjumala', total: 72, A: 52, B: 14, C: 6, retractionPct: 27.8, station: 'Mysuru North PS' },
        { officer: 'SI Ramesh', total: 44, A: 35, B: 6, C: 3, retractionPct: 20.5, station: 'Mangaluru PS' },
        { officer: 'SI Patel', total: 38, A: 32, B: 4, C: 2, retractionPct: 15.8, station: 'Cubbon Park PS' },
        { officer: 'SI Rao', total: 41, A: 29, B: 8, C: 4, retractionPct: 29.3, station: 'Shivamogga PS' },
      ];
      return { officers: ios.sort((a, b) => b.retractionPct - a.retractionPct) };
    },
    'GET /server/retraction_rate/trend': () => ({
      months: [
        { month: '2026-01', total: 68, retracted: 9 },
        { month: '2026-02', total: 72, retracted: 11 },
        { month: '2026-03', total: 65, retracted: 14 },
        { month: '2026-04', total: 71, retracted: 13 },
        { month: '2026-05', total: 74, retracted: 16 },
        { month: '2026-06', total: 69, retracted: 12 },
      ],
    }),

    // === Duration-Weighted Harm ===
    'GET /server/duration_harm/harm-weight': () => {
      const crimes = ['burglary', 'robbery', 'assault', 'theft', 'fraud', 'extortion', 'kidnapping', 'rioting'];
      const points = Array.from({ length: 120 }, (_, i) => {
        const lat = 12.8 + Math.random() * 0.8;
        const lng = 74.5 + Math.random() * 0.6 + (i % 3) * 0.4;
        const durationDays = [1, 1, 1, 1, 2, 3, 5, 7, 14, 21, 30, 60, 90, 120, 180][Math.floor(Math.random() * 15)];
        const harmWeight = Math.round(Math.log10(durationDays + 1) * 100) / 100;
        return {
          id: i + 1, lat: Math.round(lat * 10000) / 10000, lng: Math.round(lng * 10000) / 10000,
          crimeType: crimes[i % crimes.length], durationDays, harmWeight,
          firNo: `KSP-2026-${String(1000 + i).slice(1)}`,
        };
      });
      const rawCount = points.length;
      const weightedSum = points.reduce((s, p) => s + p.harmWeight, 0);
      return {
        rawCount, weightedSum,
        shiftPct: Math.round((weightedSum / rawCount - 1) * 100),
        maxWeight: Math.max(...points.map(p => p.harmWeight)),
        points,
      };
    },

    // === Co-Accused Network ===
    'GET /server/co_accused_network/graph': () => {
      const nodes = [
        { id: 'Suresh Patil', personId: 'A1', community: 1, cases: 4, firNos: ['KSP-2026-0142', 'KSP-2026-0198', 'KSP-2026-0211', 'KSP-2026-0255'] },
        { id: 'Ravi Shetty', personId: 'A1', community: 1, cases: 3, firNos: ['KSP-2026-0089', 'KSP-2026-0211', 'KSP-2026-0330'] },
        { id: 'Venkatesh Gowda', personId: 'A1', community: 1, cases: 3, firNos: ['KSP-2026-0201', 'KSP-2026-0198', 'KSP-2026-0255'] },
        { id: 'Mohan Kumar', personId: 'A2', community: 1, cases: 2, firNos: ['KSP-2026-0142', 'KSP-2026-0330'] },
        { id: 'Arun Nair', personId: 'A2', community: 1, cases: 2, firNos: ['KSP-2026-0211', 'KSP-2026-0089'] },
        { id: 'Kiran Joseph', personId: 'A3', community: 1, cases: 1, firNos: ['KSP-2026-0142'] },
        { id: 'Imran Khan', personId: 'A2', community: 1, cases: 2, firNos: ['KSP-2026-0267', 'KSP-2026-0255'] },
        { id: 'Deepa Shetty', personId: 'A3', community: 2, cases: 1, firNos: ['KSP-2026-0333'] },
        { id: 'Prakash Acharya', personId: 'A1', community: 2, cases: 3, firNos: ['KSP-2026-0388', 'KSP-2026-0390', 'KSP-2026-0412'] },
        { id: 'Manjunath Hegde', personId: 'A2', community: 2, cases: 2, firNos: ['KSP-2026-0388', 'KSP-2026-0390'] },
        { id: 'Shweta Kamath', personId: 'A3', community: 2, cases: 1, firNos: ['KSP-2026-0412'] },
        { id: 'Girish Poojary', personId: 'A2', community: 1, cases: 2, firNos: ['KSP-2026-0198', 'KSP-2026-0201'] },
      ];
      const links = [
        { source: 'Suresh Patil', target: 'Ravi Shetty', cases: 1, role: 'A1-A1', firNos: ['KSP-2026-0211'] },
        { source: 'Suresh Patil', target: 'Venkatesh Gowda', cases: 2, role: 'A1-A1', firNos: ['KSP-2026-0198', 'KSP-2026-0255'] },
        { source: 'Suresh Patil', target: 'Mohan Kumar', cases: 1, role: 'A1-A2', firNos: ['KSP-2026-0142'] },
        { source: 'Suresh Patil', target: 'Kiran Joseph', cases: 1, role: 'A1-A3', firNos: ['KSP-2026-0142'] },
        { source: 'Ravi Shetty', target: 'Arun Nair', cases: 1, role: 'A1-A2', firNos: ['KSP-2026-0089'] },
        { source: 'Ravi Shetty', target: 'Mohan Kumar', cases: 1, role: 'A1-A2', firNos: ['KSP-2026-0330'] },
        { source: 'Venkatesh Gowda', target: 'Girish Poojary', cases: 2, role: 'A1-A2', firNos: ['KSP-2026-0198', 'KSP-2026-0201'] },
        { source: 'Venkatesh Gowda', target: 'Imran Khan', cases: 1, role: 'A1-A2', firNos: ['KSP-2026-0255'] },
        { source: 'Prakash Acharya', target: 'Manjunath Hegde', cases: 2, role: 'A1-A2', firNos: ['KSP-2026-0388', 'KSP-2026-0390'] },
        { source: 'Prakash Acharya', target: 'Shweta Kamath', cases: 1, role: 'A1-A3', firNos: ['KSP-2026-0412'] },
      ];
      return { nodes, links, summary: { gangs: 2, totalAccused: nodes.length, A1Count: nodes.filter(n => n.personId === 'A1').length } };
    },

    // === Mutual Accusation Signal ===
    'GET /server/mutual_accusation/summary': () => ({
      totalPairs: 18,
      activePairs: 7,
      resolvedPairs: 11,
      avgResolutionDays: 34,
      flaggedThisMonth: 3,
    }),
    'GET /server/mutual_accusation/pairs': () => {
      const pairs = [
        { id: 1, fir1: 'KSP-2026-0142', fir2: 'KSP-2026-0160', complainant1: 'Rajesh Kumar', complainant2: 'Suresh Patil', crimeType: 'robbery', dateFiled1: '2026-03-15', dateFiled2: '2026-03-22', status: 'active', crossAllegations: 'Both accuse each other of assault during property dispute', station1: 'Brigade Road PS', station2: 'Brigade Road PS' },
        { id: 2, fir1: 'KSP-2026-0201', fir2: 'KSP-2026-0215', complainant1: 'Venkatesh Gowda', complainant2: 'Manjunath Hegde', crimeType: 'assault', dateFiled1: '2026-01-10', dateFiled2: '2026-01-18', status: 'resolved', crossAllegations: 'Neighbourhood dispute — both sides filed assault charges', station1: 'Mysuru North PS', station2: 'Mysuru North PS' },
        { id: 3, fir1: 'KSP-2026-0267', fir2: 'KSP-2026-0280', complainant1: 'Imran Khan', complainant2: 'Ravi Shetty', crimeType: 'burglary', dateFiled1: '2026-04-30', dateFiled2: '2026-05-05', status: 'active', crossAllegations: 'Both parties claim the other burgled their shop', station1: 'Brigade Road PS', station2: 'Cubbon Park PS' },
        { id: 4, fir1: 'KSP-2026-0333', fir2: 'KSP-2026-0341', complainant1: 'Deepa Shetty', complainant2: 'Shweta Kamath', crimeType: 'assault', dateFiled1: '2026-06-01', dateFiled2: '2026-06-08', status: 'active', crossAllegations: 'Family dispute — sisters accusing each other', station1: 'Shivamogga PS', station2: 'Shivamogga PS' },
        { id: 5, fir1: 'KSP-2026-0388', fir2: 'KSP-2026-0402', complainant1: 'Prakash Acharya', complainant2: 'Arun Nair', crimeType: 'fraud', dateFiled1: '2026-06-22', dateFiled2: '2026-07-01', status: 'active', crossAllegations: 'Business transaction gone wrong — each claims fraud', station1: 'Mangaluru PS', station2: 'Mangaluru PS' },
      ];
      return { pairs };
    },

    // === Officer Career Spine ===
    'GET /server/officer/spine': () => ({
      officer: { name: 'PI Dharmendra', rank: 'Police Inspector', kgid: 'KG1841136', station: 'Brigade Road PS', district: 'Bangalore Urban', yearsOfService: 14, totalFirs: 47, totalArrests: 32, totalChargesheets: 28, convictionRate: 71, clearanceRate: 68 },
      timeline: [
        { year: '2012', event: 'Appointed as PSI', station: 'Mysuru North PS' },
        { year: '2014', event: 'Promoted to PI', station: 'Mysuru North PS' },
        { year: '2016', event: 'Transferred to CCB', station: 'Central Crime Branch' },
        { year: '2018', event: 'Transferred to Brigade Road PS', station: 'Brigade Road PS' },
        { year: '2020', event: 'Received DG Commendation', station: 'Brigade Road PS' },
        { year: '2022', event: 'Transferred to Cubbon Park PS', station: 'Cubbon Park PS' },
        { year: '2024', event: 'Returned to Brigade Road PS', station: 'Brigade Road PS' },
      ],
      yearlyStats: [
        { year: '2020', firs: 8, arrests: 6, chargesheets: 5 },
        { year: '2021', firs: 7, arrests: 5, chargesheets: 4 },
        { year: '2022', firs: 9, arrests: 7, chargesheets: 6 },
        { year: '2023', firs: 11, arrests: 8, chargesheets: 7 },
        { year: '2024', firs: 7, arrests: 4, chargesheets: 4 },
        { year: '2025', firs: 5, arrests: 2, chargesheets: 2 },
      ],
      comparisons: [
        { metric: 'FIRs per year', value: 7.8, stationAvg: 5.2, districtAvg: 4.1 },
        { metric: 'Clearance rate', value: '68%', stationAvg: '55%', districtAvg: '48%' },
        { metric: 'Conviction rate', value: '71%', stationAvg: '58%', districtAvg: '52%' },
        { metric: 'Arrests per FIR', value: 0.68, stationAvg: 0.52, districtAvg: 0.44 },
      ],
    }),

    // === Arrest Vector ===
    'GET /server/arrest_vector/vectors': ({ query }) => {
      const karnatakaStations = [
        { name: 'Brigade Road PS', district: 'Bangalore Urban', lat: 12.9719, lng: 77.6067 },
        { name: 'Cubbon Park PS', district: 'Bangalore Urban', lat: 12.9762, lng: 77.5933 },
        { name: 'Mysuru North PS', district: 'Mysuru', lat: 12.3121, lng: 76.6404 },
        { name: 'Mysuru South PS', district: 'Mysuru', lat: 12.2958, lng: 76.6394 },
        { name: 'Hubli PS', district: 'Dharwad', lat: 15.3500, lng: 75.1400 },
        { name: 'Belgaum City PS', district: 'Belgaum', lat: 15.8497, lng: 74.4977 },
        { name: 'Mangaluru PS', district: 'Dakshina Kannada', lat: 12.9141, lng: 74.8560 },
        { name: 'Udupi PS', district: 'Udupi', lat: 13.3409, lng: 74.7421 },
        { name: 'Central Crime Branch', district: 'Bangalore Urban', lat: 12.9780, lng: 77.5740 },
      ];
      const vectors = [
        { caseId: 1, firNo: 'KSP-2026-0142', incident: { lat: 12.9592, lng: 77.6193 }, stationIdx: 0, gravity: 'felony', date: '2026-03-18', officer: 'PI Dharmendra' },
        { caseId: 2, firNo: 'KSP-2026-0089', incident: { lat: 12.9340, lng: 77.6100 }, stationIdx: 0, gravity: 'misdemeanour', date: '2026-03-05', officer: 'PI Maruti' },
        { caseId: 3, firNo: 'KSP-2026-0201', incident: { lat: 12.3100, lng: 76.6200 }, stationIdx: 2, gravity: 'felony', date: '2026-01-20', officer: 'PI Anjumala' },
        { caseId: 4, firNo: 'KSP-2026-0156', incident: { lat: 12.9000, lng: 74.8700 }, stationIdx: 6, gravity: 'petty', date: '2026-04-10', officer: 'SI Ramesh' },
        { caseId: 5, firNo: 'KSP-2026-0234', incident: { lat: 12.9719, lng: 77.6067 }, stationIdx: 8, gravity: 'felony', date: '2026-03-25', officer: 'PI Dharmendra' },
        { caseId: 6, firNo: 'KSP-2026-0301', incident: { lat: 12.9850, lng: 77.5900 }, stationIdx: 1, gravity: 'felony', date: '2026-05-15', officer: 'SI Patel' },
        { caseId: 7, firNo: 'KSP-2026-0267', incident: { lat: 12.9200, lng: 77.5600 }, stationIdx: 0, gravity: 'misdemeanour', date: '2026-05-25', officer: 'PI Maruti' },
        { caseId: 8, firNo: 'KSP-2026-0333', incident: { lat: 12.9900, lng: 77.4800 }, stationIdx: 8, gravity: 'misdemeanour', date: '2026-06-10', officer: 'SI Rao' },
        { caseId: 9, firNo: 'KSP-2026-0359', incident: { lat: 15.3700, lng: 75.1200 }, stationIdx: 4, gravity: 'petty', date: '2026-06-20', officer: 'PI Anjumala' },
        { caseId: 10, firNo: 'KSP-2026-0388', incident: { lat: 13.3500, lng: 74.7300 }, stationIdx: 7, gravity: 'misdemeanour', date: '2026-07-01', officer: 'SI Ramesh' },
      ];
      const enriched = vectors.map(v => {
        const st = karnatakaStations[v.stationIdx];
        const d = ((v.incident.lat - st.lat) ** 2 + (v.incident.lng - st.lng) ** 2) ** 0.5 * 111;
        const tier = d <= 1 ? 'on_scene' : d <= 5 ? 'short' : 'cross_district';
        return { ...v, arrestStation: st.name, arrestDistrict: st.district, vectorKm: Math.round(d * 10) / 10, tier };
      });
      const onScene = enriched.filter(v => v.tier === 'on_scene').length;
      const crossDistrict = enriched.filter(v => v.tier === 'cross_district').length;
      const distances = enriched.map(v => v.vectorKm);
      return {
        summary: {
          total: enriched.length, onScene, crossDistrict,
          avgDistanceKm: Math.round(distances.reduce((a, b) => a + b, 0) / distances.length * 10) / 10,
          maxDistanceKm: Math.max(...distances),
          onScenePct: Math.round(onScene / enriched.length * 100),
        },
        vectors: enriched,
        stations: karnatakaStations,
        sinkStations: [
          { station: 'Central Crime Branch', avgVectorKm: 14.2, captureCount: 5, sourceDistricts: ['Bangalore Urban', 'Bangalore Rural'] },
          { station: 'Brigade Road PS', avgVectorKm: 3.6, captureCount: 4, sourceDistricts: ['Bangalore Urban'] },
          { station: 'Mysuru North PS', avgVectorKm: 4.5, captureCount: 3, sourceDistricts: ['Mysuru', 'Chamarajanagar'] },
        ],
      };
    },

    // === Accused-at-Large Ledger ===
    'GET /server/accused-at-large/ledger': () => {
      const accused = [
        { id: 1, name: 'Suresh Patil', age: 34, crimeType: 'robbery', firNo: 'KSP-2026-0142', districtId: 3, abscondingSince: '2026-04-20', daysAtLarge: 78, status: 'absconding', lastKnownLocation: 'Hubli', warrantsIssued: 2, officer: 'PI Dharmendra' },
        { id: 2, name: 'Ravi Shetty', age: 28, crimeType: 'burglary', firNo: 'KSP-2026-0089', districtId: 7, abscondingSince: '2026-03-15', daysAtLarge: 114, status: 'absconding', lastKnownLocation: 'Belgaum', warrantsIssued: 3, officer: 'PI Maruti' },
        { id: 3, name: 'Venkatesh Gowda', age: 42, crimeType: 'assault', firNo: 'KSP-2026-0201', districtId: 2, abscondingSince: '2026-02-01', daysAtLarge: 156, status: 'absconding', lastKnownLocation: 'Mysuru', warrantsIssued: 4, officer: 'PI Anjumala' },
        { id: 4, name: 'Mohan Kumar', age: 25, crimeType: 'theft', firNo: 'KSP-2026-0156', districtId: 5, abscondingSince: '2026-05-10', daysAtLarge: 58, status: 'absconding', lastKnownLocation: 'Mangaluru', warrantsIssued: 1, officer: 'SI Ramesh' },
        { id: 5, name: 'Arun Nair', age: 31, crimeType: 'fraud', firNo: 'KSP-2026-0234', districtId: 3, abscondingSince: '2026-04-05', daysAtLarge: 93, status: 'absconding', lastKnownLocation: 'Udupi', warrantsIssued: 2, officer: 'PI Dharmendra' },
        { id: 6, name: 'Kiran Joseph', age: 29, crimeType: 'robbery', firNo: 'KSP-2026-0301', districtId: 1, abscondingSince: '2026-06-01', daysAtLarge: 36, status: 'bailable_warrant', lastKnownLocation: 'Bengaluru', warrantsIssued: 1, officer: 'SI Patel' },
        { id: 7, name: 'Imran Khan', age: 38, crimeType: 'burglary', firNo: 'KSP-2026-0267', districtId: 7, abscondingSince: '2026-04-30', daysAtLarge: 68, status: 'absconding', lastKnownLocation: 'Dharwad', warrantsIssued: 2, officer: 'PI Maruti' },
        { id: 8, name: 'Deepa Shetty', age: 27, crimeType: 'assault', firNo: 'KSP-2026-0333', districtId: 4, abscondingSince: '2026-06-15', daysAtLarge: 22, status: 'bailable_warrant', lastKnownLocation: 'Shivamogga', warrantsIssued: 1, officer: 'SI Rao' },
        { id: 9, name: 'Prakash Acharya', age: 45, crimeType: 'fraud', firNo: 'KSP-2026-0388', districtId: 5, abscondingSince: '2026-07-01', daysAtLarge: 6, status: 'recent', lastKnownLocation: 'Chitradurga', warrantsIssued: 0, officer: 'SI Ramesh' },
      ];
      return {
        total: accused.length,
        abscondingCount: accused.filter(a => a.status === 'absconding').length,
        bailableWarrantCount: accused.filter(a => a.status === 'bailable_warrant').length,
        averageDaysAtLarge: Math.round(accused.reduce((s, a) => s + a.daysAtLarge, 0) / accused.length),
        oldestAbsconder: accused.reduce((w, a) => a.daysAtLarge > w.daysAtLarge ? a : w, { daysAtLarge: 0 }),
        entries: accused,
      };
    },
    // === Entity Search ===
    'GET /server/entity/search': ({ query }) => {
      const q = (query.q || '').toLowerCase()
      const people = [
        { id: 1, name: 'Suresh Patil', roles: [
          { role: 'accused', firNo: 'KSP-2026-0142', station: 'Brigade Road PS', crimeType: 'robbery' },
          { role: 'accused', firNo: 'KSP-2026-0198', station: 'Brigade Road PS', crimeType: 'burglary' },
          { role: 'complainant', firNo: 'KSP-2026-0160', station: 'Brigade Road PS', crimeType: 'assault' },
        ]},
        { id: 2, name: 'Ravi Shetty', roles: [
          { role: 'accused', firNo: 'KSP-2026-0089', station: 'Brigade Road PS', crimeType: 'burglary' },
          { role: 'complainant', firNo: 'KSP-2026-0280', station: 'Cubbon Park PS', crimeType: 'burglary' },
        ]},
        { id: 3, name: 'Venkatesh Gowda', roles: [
          { role: 'accused', firNo: 'KSP-2026-0201', station: 'Mysuru North PS', crimeType: 'assault' },
          { role: 'complainant', firNo: 'KSP-2026-0007', station: 'Mysuru North PS', crimeType: 'assault' },
        ]},
        { id: 4, name: 'Mohan Kumar', roles: [
          { role: 'accused', firNo: 'KSP-2026-0156', station: 'Mangaluru PS', crimeType: 'theft' },
          { role: 'victim', firNo: 'KSP-2026-0330', station: 'Brigade Road PS', crimeType: 'burglary' },
        ]},
        { id: 5, name: 'Arun Nair', roles: [
          { role: 'accused', firNo: 'KSP-2026-0234', station: 'CCB', crimeType: 'fraud' },
          { role: 'complainant', firNo: 'KSP-2026-0402', station: 'Mangaluru PS', crimeType: 'fraud' },
        ]},
        { id: 6, name: 'Kiran Joseph', roles: [
          { role: 'accused', firNo: 'KSP-2026-0301', station: 'Cubbon Park PS', crimeType: 'robbery' },
        ]},
        { id: 7, name: 'Imran Khan', roles: [
          { role: 'accused', firNo: 'KSP-2026-0267', station: 'Brigade Road PS', crimeType: 'burglary' },
          { role: 'complainant', firNo: 'KSP-2026-0008', station: 'Brigade Road PS', crimeType: 'burglary' },
        ]},
        { id: 8, name: 'Deepa Shetty', roles: [
          { role: 'accused', firNo: 'KSP-2026-0333', station: 'Shivamogga PS', crimeType: 'assault' },
          { role: 'complainant', firNo: 'KSP-2026-0341', station: 'Shivamogga PS', crimeType: 'assault' },
        ]},
        { id: 9, name: 'Prakash Acharya', roles: [
          { role: 'accused', firNo: 'KSP-2026-0388', station: 'Mangaluru PS', crimeType: 'fraud' },
          { role: 'accused', firNo: 'KSP-2026-0390', station: 'Mangaluru PS', crimeType: 'fraud' },
          { role: 'complainant', firNo: 'KSP-2026-0009', station: 'Mangaluru PS', crimeType: 'fraud' },
        ]},
        { id: 10, name: 'Manjunath Hegde', roles: [
          { role: 'accused', firNo: 'KSP-2026-0388', station: 'Mangaluru PS', crimeType: 'fraud' },
          { role: 'complainant', firNo: 'KSP-2026-0215', station: 'Mysuru North PS', crimeType: 'assault' },
        ]},
        { id: 11, name: 'Rajesh Kumar', roles: [
          { role: 'complainant', firNo: 'KSP-2026-0142', station: 'Brigade Road PS', crimeType: 'robbery' },
          { role: 'victim', firNo: 'KSP-2026-0160', station: 'Brigade Road PS', crimeType: 'assault' },
        ]},
        { id: 12, name: 'Shweta Kamath', roles: [
          { role: 'victim', firNo: 'KSP-2026-0412', station: 'Mangaluru PS', crimeType: 'fraud' },
          { role: 'complainant', firNo: 'KSP-2026-0341', station: 'Shivamogga PS', crimeType: 'assault' },
        ]},
        { id: 13, name: 'Girish Poojary', roles: [
          { role: 'accused', firNo: 'KSP-2026-0201', station: 'Mysuru North PS', crimeType: 'assault' },
        ]},
      ]
      const matched = people.filter(p => q.length >= 2 && p.name.toLowerCase().includes(q))
      return { results: matched.map(p => ({
        ...p,
        linkedPersons: [
          { name: 'Rajesh Kumar', relation: 'complainant', firNo: 'KSP-2026-0142' },
        ].filter(l => l.name !== p.name)
      })) }
    },

    // === Proactive Triage ===
    'GET /server/anomaly/detections': () => ({
      anomalies: [
        { station: 'Brigade Road PS', metric: 'chargesheet_rate', zScore: 3.8, direction: 'down', severity: 'critical', previousValue: 0.72, currentValue: 0.41, detectedAt: '2026-07-06T06:00:00Z' },
        { station: 'CCB', metric: 'acquittal_rate', zScore: 3.2, direction: 'up', severity: 'critical', previousValue: 0.18, currentValue: 0.44, detectedAt: '2026-07-06T06:00:00Z' },
        { station: 'Mysuru North PS', metric: 'closure_time_p90', zScore: 2.9, direction: 'up', severity: 'high', previousValue: 64, currentValue: 112, detectedAt: '2026-07-06T06:00:00Z' },
        { station: 'Cubbon Park PS', metric: 'chargesheet_rate', zScore: 2.5, direction: 'down', severity: 'high', previousValue: 0.68, currentValue: 0.52, detectedAt: '2026-07-06T06:00:00Z' },
        { station: 'Mangaluru PS', metric: 'acquittal_rate', zScore: 2.2, direction: 'up', severity: 'high', previousValue: 0.15, currentValue: 0.27, detectedAt: '2026-07-06T06:00:00Z' },
        { station: 'Hubli PS', metric: 'chargesheet_rate', zScore: 2.1, direction: 'down', severity: 'high', previousValue: 0.65, currentValue: 0.49, detectedAt: '2026-07-06T06:00:00Z' },
      ]
    }),
    'GET /server/triage/matrix': () => ({
      cases: [
        { caseId: 1, firNo: 'KSP-2026-0142', crimeType: 'robbery', impact: 82, urgency: 91, station: 'Brigade Road PS' },
        { caseId: 2, firNo: 'KSP-2026-0089', crimeType: 'burglary', impact: 45, urgency: 78, station: 'Brigade Road PS' },
        { caseId: 3, firNo: 'KSP-2026-0201', crimeType: 'assault', impact: 76, urgency: 45, station: 'Mysuru North PS' },
        { caseId: 4, firNo: 'KSP-2026-0156', crimeType: 'theft', impact: 28, urgency: 35, station: 'Mangaluru PS' },
        { caseId: 5, firNo: 'KSP-2026-0234', crimeType: 'fraud', impact: 62, urgency: 72, station: 'CCB' },
        { caseId: 6, firNo: 'KSP-2026-0301', crimeType: 'robbery', impact: 88, urgency: 85, station: 'Cubbon Park PS' },
        { caseId: 7, firNo: 'KSP-2026-0267', crimeType: 'burglary', impact: 35, urgency: 58, station: 'Brigade Road PS' },
        { caseId: 8, firNo: 'KSP-2026-0333', crimeType: 'assault', impact: 71, urgency: 82, station: 'Shivamogga PS' },
        { caseId: 9, firNo: 'KSP-2026-0359', crimeType: 'theft', impact: 18, urgency: 22, station: 'Hubli PS' },
        { caseId: 10, firNo: 'KSP-2026-0388', crimeType: 'fraud', impact: 55, urgency: 60, station: 'Mangaluru PS' },
        { caseId: 11, firNo: 'KSP-2026-0390', crimeType: 'extortion', impact: 90, urgency: 38, station: 'Mangaluru PS' },
        { caseId: 12, firNo: 'KSP-2026-0412', crimeType: 'fraud', impact: 42, urgency: 44, station: 'Mangaluru PS' },
        { caseId: 13, firNo: 'KSP-2026-0425', crimeType: 'assault', impact: 67, urgency: 55, station: 'Mysuru North PS' },
      ]
    }),
    'POST /server/getofficers': () => ([
      { id: 1, ioname: 'PI Dharmendra', rank: 'PI', kgid: 'KG1841136', station: 'Brigade Road PS', cases: 47, status: 'Active' },
      { id: 2, ioname: 'SI Maruti G', rank: 'PSI', kgid: 'KG1942111', station: 'Brigade Road PS', cases: 28, status: 'Active' },
      { id: 3, ioname: 'HC Ramesh', rank: 'HC', kgid: 'KG2048102', station: 'Brigade Road PS', cases: 14, status: 'On Leave' },
      { id: 4, ioname: 'PC Girish', rank: 'PC', kgid: 'KG2159182', station: 'Brigade Road PS', cases: 8, status: 'Suspended' },
      { id: 5, ioname: 'SI Patel', rank: 'PSI', kgid: 'KG1953112', station: 'Cubbon Park PS', cases: 31, status: 'Active' },
      { id: 6, ioname: 'SI Rao', rank: 'PSI', kgid: 'KG1968114', station: 'Shivamogga PS', cases: 22, status: 'Active' }
    ]),
    'POST /server/getfirdetails': ({ body }) => {
      const year = body.year || 2026;
      return [
        { FirNo: `KSP-${year}-0142`, UnitName: 'Brigade Road PS', year: year, Complaint_Mode: 'Online', fir_stage: 'Under Investigation', Fir_Date: `${year}-03-15`, CrimeGroup_Name: 'robbery', CrimeHead_Name: 'ROBBERY' },
        { FirNo: `KSP-${year}-0089`, UnitName: 'Brigade Road PS', year: year, Complaint_Mode: 'Written', fir_stage: 'Under Investigation', Fir_Date: `${year}-02-28`, CrimeGroup_Name: 'burglary', CrimeHead_Name: 'BURGLARY' },
        { FirNo: `KSP-${year}-0201`, UnitName: 'Mysuru North PS', year: year, Complaint_Mode: 'Oral', fir_stage: 'Case Closed', Fir_Date: `${year}-01-10`, CrimeGroup_Name: 'assault', CrimeHead_Name: 'ASSAULT' },
        { FirNo: `KSP-${year}-0156`, UnitName: 'Mangaluru PS', year: year, Complaint_Mode: 'Online', fir_stage: 'Under Investigation', Fir_Date: `${year}-04-01`, CrimeGroup_Name: 'theft', CrimeHead_Name: 'THEFT' },
        { FirNo: `KSP-${year}-0234`, UnitName: 'CCB', year: year, Complaint_Mode: 'Written', fir_stage: 'Under Investigation', Fir_Date: `${year}-03-20`, CrimeGroup_Name: 'fraud', CrimeHead_Name: 'FRAUD' },
        { FirNo: `KSP-${year}-0301`, UnitName: 'Cubbon Park PS', year: year, Complaint_Mode: 'Oral', fir_stage: 'Under Investigation', Fir_Date: `${year}-05-10`, CrimeGroup_Name: 'robbery', CrimeHead_Name: 'ROBBERY' },
        { FirNo: `KSP-${year}-0267`, UnitName: 'Brigade Road PS', year: year, Complaint_Mode: 'Online', fir_stage: 'Under Investigation', Fir_Date: `${year}-05-20`, CrimeGroup_Name: 'burglary', CrimeHead_Name: 'BURGLARY' },
        { FirNo: `KSP-${year}-0333`, UnitName: 'Shivamogga PS', year: year, Complaint_Mode: 'Written', fir_stage: 'Under Investigation', Fir_Date: `${year}-06-01`, CrimeGroup_Name: 'assault', CrimeHead_Name: 'ASSAULT' },
        { FirNo: `KSP-${year}-0359`, UnitName: 'Hubli PS', year: year, Complaint_Mode: 'Oral', fir_stage: 'Under Investigation', Fir_Date: `${year}-06-15`, CrimeGroup_Name: 'theft', CrimeHead_Name: 'THEFT' },
        { FirNo: `KSP-${year}-0388`, UnitName: 'Mangaluru PS', year: year, Complaint_Mode: 'Online', fir_stage: 'Under Investigation', Fir_Date: `${year}-06-22`, CrimeGroup_Name: 'fraud', CrimeHead_Name: 'FRAUD' }
      ];
    },
  };
}

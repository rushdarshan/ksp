export function defineMockApi() {
  return {
    // Development-only identity boundary. Demo accounts are handled by Login.jsx;
    // unknown credentials must not fall through as a successful empty response.
    'POST /server/login': () => ({ __status: 401, message: 'Use an approved development demo account.' }),
    'GET /server/verify': () => ({ __status: 401, message: 'Development demo tokens are verified in the client guard.' }),
    'POST /server/register': ({ body }) => {
      if (body?.InvitationCode !== 'KSP-DEMO-2026') {
        return { __status: 403, message: 'Invitation code is invalid or expired.' };
      }
      return { message: 'Development invitation validated. Account activation is simulated locally.' };
    },

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
      models: ['xgb_hotspot', 'rf_case_readiness', 'lr_resource_demand', 'narrative_quality']
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
        { model: 'narrative_quality', parity_ratio: 0.91, eo_diff: 0.03, status: 'REVIEW' },
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
      const label = score >= 0.7 ? 'MORE COMPLETE' : score >= 0.45 ? 'NEEDS REVIEW' : 'SPARSE RECORD';

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
        ziaAssessment: `Narrative quality review completed. Documentation signal: ${(score * 100).toFixed(0)}%. Based on ${wordCount} words, ${hasSpecifics ? 'specific temporal or identifier markers were found' : 'few specific markers were found'}. This does not assess truthfulness or guilt.`,
        methodology: 'Synthetic narrative-completeness heuristic; not validated for truth classification',
        reviewRequired: true,
        mode: 'synthetic-demo',
      };
    },

    // === Agentic ===
    'GET /server/agentic/actions': () => ({
      actions: [
        { id: 1, agent: 'PatrolPlanner', action: 'Prepared a Brigade Road coverage scenario for supervisor review', timestamp: '2026-07-22T08:30:00Z', status: 'awaiting-review', confidence: 0.67 },
        { id: 2, agent: 'CaseTriager', action: 'Flagged FIR KSP-2026-0142 for priority review', timestamp: '2026-07-06T07:15:00Z', status: 'executed', confidence: 0.92 },
        { id: 3, agent: 'NarrativeQuality', action: 'Reviewed 47 FIR narratives for documentation gaps', timestamp: '2026-07-22T06:00:00Z', status: 'completed', confidence: 0.85 },
        { id: 4, agent: 'PatternAnalyst', action: 'Updated 12-hour district pattern signals for analyst review', timestamp: '2026-07-22T05:30:00Z', status: 'completed', confidence: 0.64 },
        { id: 5, agent: 'BriefGenerator', action: 'Generated morning intelligence brief for ACP Anjumala', timestamp: '2026-07-06T05:00:00Z', status: 'delivered', confidence: 0.91 },
      ]
    }),
    'GET /server/agentic/briefs': () => ({
      briefs: [
        { id: 1, date: '2026-07-22', title: 'Morning Intelligence Brief', summary: 'Overnight review: 12 FIRs registered and 3 flagged for documentation review. Brigade Road pattern requires analyst verification.', sections: ['Crime Summary', 'Pattern Review', 'Case Status', 'Coverage Scenarios'] },
        { id: 2, date: '2026-07-05', title: 'Evening Intelligence Brief', summary: 'Day shift summary: 28 FIRs processed, 2 arrests made, clearance rate 42%.', sections: ['Crime Summary', 'Arrest Log', 'Pending Cases'] },
      ]
    }),
    'POST /server/daily_brief/agentic/briefs/trigger': () => ({
      status: 'triggered', message: 'Brief generation started. Will be ready in ~2 minutes.'
    }),

    // === Alerts ===
    'GET /server/fir_api/alerts': () => ([
      { id: 1, type: 'DOCUMENTATION', severity: 'high', title: 'FIR KSP-2026-0142 needs CCTV custody documentation', district: 'Bangalore Urban', timestamp: '2026-07-22T08:45:00Z' },
      { id: 2, type: 'HOTSPOT', severity: 'medium', title: 'Brigade Road showing elevated theft activity', district: 'Bangalore Urban', timestamp: '2026-07-06T07:30:00Z' },
      { id: 3, type: 'CASE_READINESS', severity: 'low', title: 'FIR KSP-2026-0234 readiness needs review', district: 'Bengaluru Urban', timestamp: '2026-07-06T06:15:00Z' },
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
      { firNo: 'KSP-2026-0234', district: 'Bangalore Urban', score: 0.31, issues: ['Witness details incomplete', 'Location description incomplete', 'Evidence source not recorded'] },
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
      score: 0.84,
      label: 'MORE COMPLETE',
      issues: ['CCTV acquisition not recorded', 'CCTV hash not recorded', 'BSA Section 63 certificate pending'],
      methodology: 'Synthetic documentation-completeness checklist'
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
    'GET /server/predictive_mode/predict': ({ query }) => ({
      districtId: Number(query.districtId) || 1,
      districtName: ['Bengaluru Urban', 'Mysuru', 'Dakshina Kannada'][((Number(query.districtId) || 1) - 1) % 3],
      firCount: 1247,
      method: 'calibrated-demonstration-baseline',
      generatedAt: '2026-07-22T09:00:00+05:30',
      topCrimes: [['robbery', 145], ['theft', 121], ['burglary', 88]],
      predictions: [
        { crime_type: 'robbery', confidence: 0.78, location: 'Brigade Road corridor', time_window: '18:00-22:00', reasoning: 'Seven-day robbery count is 1.6x the seasonal baseline; event density is concentrated in two adjacent beats.' },
        { crime_type: 'theft', confidence: 0.64, location: 'Majestic transit interchange', time_window: '16:00-20:00', reasoning: 'Transit-footfall and recent theft reports exceed the demonstration threshold.' },
        { crime_type: 'burglary', confidence: 0.47, location: 'Indiranagar east beat', time_window: '00:00-04:00', reasoning: 'A small night-time cluster is present; confidence remains below deployment threshold.' },
      ],
      limitations: ['Synthetic demonstration data', 'Signals support patrol planning only', 'Supervisor review required before deployment'],
    }),

    // === Network Analysis ===
    'GET /server/network_analysis/graph': () => ({
      nodes: [
        { id: 'N1', label: 'Person A', group: 1, size: 12 },
        { id: 'N2', label: 'Person B', group: 1, size: 10 },
        { id: 'N3', label: 'Person C', group: 2, size: 8 },
        { id: 'N4', label: 'Victim 1', group: 3, size: 6 },
        { id: 'N5', label: 'Witness', group: 4, size: 5 },
        { id: 'N6', label: 'Person D', group: 2, size: 9 },
        { id: 'N7', label: 'Recorded contact', group: 4, size: 4 },
        { id: 'N8', label: 'Victim 2', group: 3, size: 5 },
      ],
      links: [
        { source: 'N1', target: 'N2', weight: 5, relation: 'shared-FIR record' },
        { source: 'N1', target: 'N3', weight: 3, relation: 'recorded contact' },
        { source: 'N2', target: 'N6', weight: 4, relation: 'recorded family relation' },
        { source: 'N3', target: 'N6', weight: 2, relation: 'shared-FIR record' },
        { source: 'N1', target: 'N4', weight: 1, relation: 'accused-victim record' },
        { source: 'N3', target: 'N8', weight: 1, relation: 'accused-victim record' },
        { source: 'N5', target: 'N4', weight: 1, relation: 'witness record' },
        { source: 'N6', target: 'N7', weight: 2, relation: 'recorded contact' },
      ],
      communities: 4,
      totalCases: 6,
      metadata: { mode: 'synthetic-demo', humanReviewRequired: true, note: 'Links describe source-record relationships only.' },
    }),

    // === Notifications ===
    'GET /server/case_management/case-management/notifications': ({ query }) => {
      if (query && query.caseId) {
        const caseId = parseInt(query.caseId) || 142;
        const firNo = `KSP-2026-0${caseId}`;
        const stages = ['Under Investigation', 'Chargesheet Filed', 'Evidence Collection'];
        return {
          firNo,
          currentStage: stages[caseId % 3],
          lastUpdated: '2026-07-06T08:45:00Z',
          notifications: [
            { message: `SMS Alert: FIR ${firNo} registered successfully.`, timestamp: '2026-07-06T08:45:00Z' },
            { message: `WhatsApp Status: Case assigned to Investigating Officer PI Dharmendra.`, timestamp: '2026-07-06T09:00:00Z' },
            { message: `SMS Alert: Case stage updated to ${stages[caseId % 3]}.`, timestamp: '2026-07-06T14:30:00Z' }
          ]
        };
      }
      return {
        notifications: [
          { caseId: 142, firNo: 'KSP-2026-0142', currentStage: 'Under Investigation', notificationCount: 3, unread: true },
          { caseId: 301, firNo: 'KSP-2026-0301', currentStage: 'Chargesheet Filed', notificationCount: 2, unread: false },
          { caseId: 156, firNo: 'KSP-2026-0156', currentStage: 'Evidence Collection', notificationCount: 4, unread: false },
          { caseId: 234, firNo: 'KSP-2026-0234', currentStage: 'Under Investigation', notificationCount: 1, unread: true }
        ]
      };
    },

    // === FIR Lookup ===
    'POST /server/fir_api/fir/lookup': ({ body }) => ({
      firNo: body.firNo || 'KSP-2026-0142',
      district: 'Bangalore Urban',
      dateRegistered: '2026-03-15',
      complainant: 'Rajesh Kumar',
      sections: ['BNS 304', 'BNS 309', 'BNS 3(5) - legal officer review required'],
      status: 'Under Investigation',
      io: 'PI Dharmendra',
    }),

    // === Solvability ===
    'POST /server/solvability_index/solvability': ({ body }) => ({
      firNo: body.firNo || 'KSP-2026-0142',
      score: 0.67,
      readinessScore: 67,
      solvabilityScore: 67,
      uncertaintyBand: 15,
      label: 'HUMAN REVIEW REQUIRED',
      factors: [
        { name: 'Witness records', score: 15, max: 20, value: '2 witnesses identified' },
        { name: 'Recorded evidence types', score: 18, max: 30, value: 'CCTV source identified; acquisition and integrity records pending' },
        { name: 'Named accused records', score: 15, max: 15, value: 'Mohan Kumar and Kiran Joseph are named' },
        { name: 'Time and place detail', score: 10, max: 10, value: 'Date, time, and SH-9 junction recorded' },
        { name: 'Reporting timeline', score: 9, max: 15, value: 'Registration timing recorded' },
      ],
      recommendation: 'Acquire the referenced CCTV lawfully, record its hash, obtain the BSA Section 63 certificate, and verify the at-large status.',
      note: 'Synthetic evidence-completeness heuristic; not a prediction of guilt, conviction, or case outcome.',
    }),

    // === Victim Risk ===
    'GET /server/victim_risk_shield/high-risk': () => ({
      victims: [
        { victimId: 'V-1042', name: 'Identity protected', count: 3, riskLevel: 'High', riskScore: 82, factors: ['Three reports in 180 days', 'Recent escalation marker', 'Protection-plan review pending'] },
        { victimId: 'V-1187', name: 'Identity protected', count: 2, riskLevel: 'Medium', riskScore: 61, factors: ['Two related reports', 'Recent threat marker'] },
        { victimId: 'V-1209', name: 'Identity protected', count: 3, riskLevel: 'High', riskScore: 78, factors: ['Repeat financial exploitation reports', 'Safeguarding referral pending'] },
      ],
      total: 3,
      avgRiskScore: 0.74,
      mode: 'synthetic-demo',
      reviewRequired: true,
    }),
    'GET /server/victim_risk_shield/score/:id': ({ params }) => ({
      victimId: params.id,
      victimName: 'Identity protected',
      riskLevel: 'High',
      riskScore: 82,
      percentile: 87,
      firCount: 3,
      timeSpanDays: 176,
      escalationRate: 0.5,
      recentMONdays: 18,
      factors: ['Three related reports in 180 days', 'Shortening interval between reports', 'Safeguarding review not yet recorded'],
      recommendation: 'Route to the district safeguarding officer for human review. Do not use this score as the sole basis for enforcement action.',
      history: [
        { firNo: 'KSP-2026-0061', year: 2026, date: '2026-01-18', districtId: 'Bengaluru Urban' },
        { firNo: 'KSP-2026-0214', year: 2026, date: '2026-04-12', districtId: 'Bengaluru Urban' },
        { firNo: 'KSP-2026-0417', year: 2026, date: '2026-07-04', districtId: 'Bengaluru Urban' },
      ],
      mode: 'synthetic-demo',
      reviewRequired: true,
    }),

    // === Voice Query ===
    'POST /server/zia_voice/stt': () => ({
      text: 'What is the crime rate in Bangalore Urban district for March 2026?'
    }),
    'POST /server/legal_rag/query': ({ body }) => {
      const q = (body.query || '').toLowerCase()
      let answer, context
      if (/snatch|chain/.test(q)) {
        answer = 'BNS 304: Snatching means suddenly, quickly, or forcibly seizing movable property from a person or their possession. Punishment may extend to three years and fine. Depending on force or hurt, BNS 309 robbery may also require review.'
        context = 'BNS 304 · BNS 309 · official India Code'
      } else if (/theft/.test(q)) {
        answer = 'BNS 303: Theft. Punishment may extend to three years, or fine, or both; the section also contains enhanced and first-offence provisions.'
        context = 'BNS 303 · official India Code'
      } else if (/murder/.test(q)) {
        answer = 'BNS 103: Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine.'
        context = 'BNS 103 · official India Code'
      } else if (/cheating|fraud/.test(q)) {
        answer = 'BNS 318: Cheating. Punishment depends on the applicable subsection and may extend from three to seven years, with fine.'
        context = 'BNS 318 · official India Code'
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
        answer = 'I can answer questions about CCTNS schema, verified BNS sections, and station statistics. Try: "What is BNS 304?", "Which station has the highest chargesheet rate?", or "Tell me about the CaseMaster table."'
        context = 'QuickML RAG Knowledge Base'
      }
      return { answer: `${answer} Verify the facts and subsection against the official text before filing.`, sources: [context], method: 'verified-keyword-retrieval', confidence: 0.87 }
    },
    'POST /server/crime_chat/query': ({ body }) => {
      const query = String(body?.query || '').toLowerCase();
      const history = Array.isArray(body?.history) ? body.history.map(item => String(item?.text || '')).join(' ').toLowerCase() : '';
      const contextualFir = `${query} ${history}`.match(/ksp-2026-0?142|\bfir\s*0?142\b/) ? 'KSP-2026-0142' : null;
      const kannada = body?.language === 'kn';
      const copilotResponse = (intent, answer, confidence, reasoning, sources, limitations = []) => ({
        intent,
        answer,
        confidence,
        reasoning,
        sources,
        limitations,
        method: intent === 'similar_cases' ? 'same-mo-and-entity-retrieval' : 'synthetic-schema-grounded-analysis',
        mode: 'demo',
      });
      const caseSources = [
        { label: 'CaseMaster #142', table: 'CaseMaster', record: 142 },
        { label: 'Accused records (3)', table: 'Accused', record: 142 },
        { label: 'ArrestSurrender records (1)', table: 'ArrestSurrender', record: 142 },
        { label: 'ActSectionAssociation (2)', table: 'ActSectionAssociation', record: 142 },
      ];
      if (/at large|not arrested|unmatched arrest|ಬಂಧನವಾಗದ|ತಲೆಮರೆಸಿಕೊಂಡ/u.test(query) && contextualFir) {
        return copilotResponse('accused_status', kannada
          ? '**FIR KSP-2026-0142 — ಆರೋಪಿ ಸ್ಥಿತಿ**\n\nಕಿರಣ್ ಜೋಸೆಫ್‌ಗೆ ಹೊಂದುವ ಬಂಧನ ಅಥವಾ ಶರಣಾಗತಿ ದಾಖಲೆ ಇಲ್ಲ. ಮೋಹನ್ ಕುಮಾರ್ ಬಂಧನದಲ್ಲಿದ್ದಾರೆ.\n\n**ಅಧಿಕಾರಿ ಕ್ರಮ:** ವಾರಂಟ್ ಮತ್ತು ಕೊನೆಯ ಪರಿಶೀಲಿತ ಸ್ಥಳವನ್ನು ದೃಢೀಕರಿಸಿ; ಈ ಡೆಮೋ ಫಲಿತಾಂಶದ ಆಧಾರದ ಮೇಲೆ ಮಾತ್ರ ಕಾರ್ಯಾಚರಣೆ ಮಾಡಬೇಡಿ.'
          : '**FIR KSP-2026-0142 — Accused status**\n\nKiran Joseph has no matching arrest or surrender record. Mohan Kumar is recorded in custody.\n\n**Officer action:** Verify the warrant and last confirmed location before any field action.', 0.91, [
          { label: 'Mohan Kumar', value: 'In custody', impact: 'ArrestSurrender record AS-142-01 is present.' },
          { label: 'Kiran Joseph', value: 'At large', impact: 'No matching arrest or surrender event is recorded.' },
        ], caseSources, ['Synthetic demonstration records require CCTNS and warrant-register verification.']);
      }
      if (/missing evidence|evidence gap|completeness/.test(query)) {
        return copilotResponse('evidence_gaps', 'The case has strong witness and location records, but CCTV acquisition, chain-of-custody confirmation, and one accused process event remain unresolved. Completeness is 72% across the available demonstration checks.', 0.89, [
          { label: 'Witness statements', value: 'Recorded', impact: 'Two witness records support event reconstruction.' },
          { label: 'CCTV acquisition', value: 'Pending', impact: 'Footage is referenced but its evidence hash is not recorded.' },
          { label: 'Process status', value: '1 unmatched', impact: 'One accused has no matching arrest or surrender event.' },
        ], caseSources, ['The supplied schema has no complete digital evidence or chain-of-custody table.']);
      }
      if (/next investigative lead|next lead|prioriti[sz]e/.test(query)) {
        return copilotResponse('next_lead', 'Retrieve and hash the SH-9 junction CCTV first, then verify the unmatched accused process status. The footage has the shortest preservation window and can validate the vehicle description used in two similar robberies.', 0.88, [
          { label: 'Time sensitivity', value: 'High', impact: 'Referenced CCTV may be overwritten before other evidence expires.' },
          { label: 'Cross-case value', value: '2 candidates', impact: 'A vehicle match could connect the current FIR to two comparable incidents.' },
          { label: 'Operational gap', value: '1 accused', impact: 'No matching process event is recorded for one accused.' },
        ], caseSources, ['Recommendation prioritizes record preservation; an investigating officer must approve operational action.']);
      }
      if (/similar case|same modus|same mo|historical match/.test(query)) {
        return copilotResponse('similar_cases', 'Three comparison cases were retrieved. KSP-2026-0089 is the strongest candidate because it shares a two-wheeler snatching MO, evening time window, and nearby station geography.', 0.86, [
          { label: 'KSP-2026-0089', value: '78% match', impact: 'Same MO, time window, and nearby geography.' },
          { label: 'KSP-2026-0301', value: '65% match', impact: 'Shares an accused association and vehicle descriptor.' },
          { label: 'KSP-2026-0255', value: '52% match', impact: 'Geographic similarity without a confirmed entity match.' },
        ], [...caseSources, { label: 'CaseMaster comparison set (3)', table: 'CaseMaster' }], ['Matches identify cases for comparison, not proof that incidents are connected.']);
      }
      if (/readiness|outcome|case confidence|case strength/.test(query)) {
        return copilotResponse('readiness_forecast', 'Investigation readiness is 67%. Witness coverage and prompt reporting are strong; missing CCTV custody confirmation and an unresolved accused process status prevent a higher score. This is not a conviction forecast.', 0.9, [
          { label: 'Witness coverage', value: 'Strong', impact: 'Two identified witnesses improve reconstruction readiness.' },
          { label: 'Digital evidence', value: 'At risk', impact: 'CCTV is referenced but acquisition and hash are not confirmed.' },
          { label: 'Suspect process', value: 'Incomplete', impact: 'One accused lacks a matching arrest or surrender event.' },
        ], caseSources, ['Readiness measures recorded completeness, not guilt, conviction probability, or legal sufficiency.']);
      }
      if ((contextualFir && !/bns|snatch|ವಿಧಿ|common intention|two accused|ಇಬ್ಬರು/u.test(query)) || /ಸಂಕ್ಷಿಪ್ತ/u.test(query)) {
        return {
          answer: kannada
            ? '**FIR KSP-2026-0142 — ಸಾಕ್ಷ್ಯ ಸಾರಾಂಶ**\n\nಬ್ರಿಗೇಡ್ ರೋಡ್ ಪೊಲೀಸ್ ಠಾಣೆಯಲ್ಲಿ ದರೋಡೆ ಪ್ರಕರಣ ದಾಖಲಾಗಿದೆ. ಇಬ್ಬರು ಸಾಕ್ಷಿಗಳು ಮತ್ತು CCTV ದಾಖಲಿಸಲಾಗಿದೆ. ಪ್ರಾಥಮಿಕ ಆರೋಪಿ ಪುನರಾವರ್ತಿತ ಅಪರಾಧಿಗಳ ಜಾಲಕ್ಕೆ ಸಂಬಂಧಿಸಿದ್ದಾನೆ.\n\n**ಮುಂದಿನ ಕ್ರಮ:** CCTV ವೀಡಿಯೊವನ್ನು ಪಡೆದು ಅದರ ಹ್ಯಾಶ್ ಅನ್ನು ಸಂರಕ್ಷಿಸಿ.'
            : '**FIR KSP-2026-0142 — Evidence summary**\n\nRobbery registered at Brigade Road PS. Two witnesses are recorded and junction CCTV is referenced but not yet acquired. Investigation readiness is 67%; the narrative documentation signal is 84% and does not assess truth. The current filing date is 18 days away.\n\n**Next action:** Retrieve junction CCTV and preserve its hash before overwrite.',
          sources: [
            { label: 'CaseMaster #142', table: 'CaseMaster', record: 142 },
            { label: 'Accused records (3)', table: 'Accused', record: 142 },
            { label: 'ArrestSurrender records (1)', table: 'ArrestSurrender', record: 142 },
            { label: 'ActSectionAssociation (2)', table: 'ActSectionAssociation', record: 142 },
          ],
          reasoning: [
            { label: 'Witness coverage', value: '2 recorded', impact: 'Independent witness records support reconstruction of the reported event.' },
            { label: 'Digital evidence', value: 'CCTV referenced', impact: 'The record identifies footage, but acquisition and chain-of-custody still require confirmation.' },
            { label: 'Network signal', value: 'Repeat cluster', impact: 'The primary accused shares relational indicators with previous robbery records.' },
          ],
          limitations: ['This demonstration summary uses synthetic CCTNS records. Every fact and legal provision requires officer verification.'],
          method: 'synthetic-schema-grounded-join', confidence: 0.92, mode: 'demo', intent: 'case_summary'
        };
      }
      if (/bns|snatch|ವಿಧಿ|common intention|two accused|ಇಬ್ಬರು/u.test(query)) {
        return {
          answer: 'The official BNS text supports reviewing section 304 for snatching and section 309 where the facts amount to robbery. Because the record names two alleged participants, section 3(5) on acts done by several persons in furtherance of common intention may also require review. This is retrieval support, not a charging decision; verify facts and subsections with the legal officer.',
          sources: [
            { label: 'Bharatiya Nyaya Sanhita, 2023 · India Code', url: 'https://www.indiacode.nic.in/handle/123456789/20062?locale=en' },
            { label: 'Official BNS Act PDF · India Code', url: 'https://www.indiacode.nic.in/bitstream/123456789/20062/1/a2023-45.pdf' },
          ],
          method: 'verified-keyword-retrieval', confidence: 0.87, mode: 'demo', intent: 'legal'
        };
      }
      return {
        answer: 'The synthetic evidence service needs a narrower query. Add an FIR number, district, crime type, accused person, or BNS provision.',
        sources: [{ label: 'Synthetic CCTNS dataset' }], method: 'clarification-required', confidence: 0.35, mode: 'demo', intent: 'general'
      };
    },
    'POST /server/zia_voice/tts': () => ({
      audioUrl: null,
      message: 'TTS not available in mock mode'
    }),

    // === Exceedance Curve ===
    'GET /server/exceedance_curve/exceedance': ({ query }) => {
      const crimeTypes = ['robbery', 'theft', 'burglary', 'assault', 'cyber fraud', 'vehicle theft', 'homicide', 'kidnapping'];
      const baselines = { robbery: [338, 145], theft: [310, 112], burglary: [244, 91], assault: [221, 76], 'cyber fraud': [196, 88], 'vehicle theft': [184, 62], homicide: [42, 13], kidnapping: [37, 12] };
      const curves = {};
      crimeTypes.forEach(ct => {
        const [mean, std] = baselines[ct];
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


    // === Case Management (legacy hyphen aliases — canonical routes use underscore below) ===


    // === Chargesheet Clock ===
    'GET /server/chargesheet_clock/stats': () => {
      const cases = [
        { caseId: 1, firNo: 'KSP-2026-0142', crimeType: 'robbery', officer: 'PI Dharmendra', districtId: 3, dateRegistered: '2026-03-15', clockBasis: 'Current court-approved investigation schedule', daysSinceRegistration: 129, cpcLimitDays: 147, daysOverdue: 0, daysRemaining: 18, deadlineDate: '2026-08-09', status: 'at_risk' },
        { caseId: 2, firNo: 'KSP-2026-0089', crimeType: 'burglary', officer: 'PI Maruti', districtId: 7, dateRegistered: '2026-02-28', clockBasis: 'Current court-approved investigation schedule', daysSinceRegistration: 144, cpcLimitDays: 150, daysOverdue: 0, daysRemaining: 6, deadlineDate: '2026-07-28', status: 'at_risk' },
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
      const durationOptions = [1, 1, 1, 1, 2, 3, 5, 7, 14, 21, 30, 60, 90, 120, 180];
      const points = Array.from({ length: 120 }, (_, i) => {
        const lat = 12.8 + ((i * 37) % 80) / 100;
        const lng = 74.5 + ((i * 23) % 60) / 100 + (i % 3) * 0.4;
        const durationDays = durationOptions[(i * 7) % durationOptions.length];
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
        { id: 'Suresh Patil', personId: 'A1', community: 1, cases: 4, firNos: ['KSP-2026-0190', 'KSP-2026-0198', 'KSP-2026-0211', 'KSP-2026-0255'] },
        { id: 'Ravi Shetty', personId: 'A1', community: 1, cases: 3, firNos: ['KSP-2026-0089', 'KSP-2026-0211', 'KSP-2026-0330'] },
        { id: 'Venkatesh Gowda', personId: 'A1', community: 1, cases: 3, firNos: ['KSP-2026-0201', 'KSP-2026-0198', 'KSP-2026-0255'] },
        { id: 'Mohan Kumar', personId: 'A1', community: 1, cases: 2, firNos: ['KSP-2026-0142', 'KSP-2026-0301'] },
        { id: 'Arun Nair', personId: 'A2', community: 1, cases: 2, firNos: ['KSP-2026-0211', 'KSP-2026-0089'] },
        { id: 'Kiran Joseph', personId: 'A2', community: 1, cases: 1, firNos: ['KSP-2026-0142'] },
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
        { source: 'Mohan Kumar', target: 'Kiran Joseph', cases: 1, role: 'A1-A2', firNos: ['KSP-2026-0142'] },
        { source: 'Ravi Shetty', target: 'Arun Nair', cases: 1, role: 'A1-A2', firNos: ['KSP-2026-0089'] },
        { source: 'Ravi Shetty', target: 'Mohan Kumar', cases: 1, role: 'A1-A2', firNos: ['KSP-2026-0330'] },
        { source: 'Venkatesh Gowda', target: 'Girish Poojary', cases: 2, role: 'A1-A2', firNos: ['KSP-2026-0198', 'KSP-2026-0201'] },
        { source: 'Venkatesh Gowda', target: 'Imran Khan', cases: 1, role: 'A1-A2', firNos: ['KSP-2026-0255'] },
        { source: 'Prakash Acharya', target: 'Manjunath Hegde', cases: 2, role: 'A1-A2', firNos: ['KSP-2026-0388', 'KSP-2026-0390'] },
        { source: 'Prakash Acharya', target: 'Shweta Kamath', cases: 1, role: 'A1-A3', firNos: ['KSP-2026-0412'] },
      ];
      return { nodes, links, summary: { communities: 2, totalAccused: nodes.length, A1Count: nodes.filter(n => n.personId === 'A1').length }, metadata: { method: 'shared-FIR connected components', humanReviewRequired: true } };
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
        { id: 1, fir1: 'KSP-2026-0112', fir2: 'KSP-2026-0160', complainant1: 'Ravi Prasad', complainant2: 'Suresh Patil', crimeType: 'assault', dateFiled1: '2026-03-12', dateFiled2: '2026-03-22', status: 'active', crossAllegations: 'Both parties recorded allegations arising from the same property dispute', station1: 'Brigade Road PS', station2: 'Brigade Road PS' },
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
    'GET /server/arrest_vector/vectors': () => {
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
        { caseId: 1, firNo: 'KSP-2026-0142', incident: { lat: 12.9762, lng: 77.6033 }, stationIdx: 0, gravity: 'felony', date: '2026-03-15', officer: 'PI Dharmendra' },
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
    'GET /server/accused_at_large/ledger': () => {
      const accused = [
        { id: 1, name: 'Kiran Joseph', age: 29, crimeType: 'robbery', firNo: 'KSP-2026-0142', districtId: 1, abscondingSince: '2026-04-01', daysAtLarge: 112, status: 'warrant_verification', lastKnownLocation: 'Shivajinagar, Bengaluru', warrantsIssued: 1, officer: 'PI Dharmendra' },
        { id: 2, name: 'Ravi Shetty', age: 28, crimeType: 'burglary', firNo: 'KSP-2026-0089', districtId: 7, abscondingSince: '2026-03-15', daysAtLarge: 114, status: 'absconding', lastKnownLocation: 'Belgaum', warrantsIssued: 3, officer: 'PI Maruti' },
        { id: 3, name: 'Venkatesh Gowda', age: 42, crimeType: 'assault', firNo: 'KSP-2026-0201', districtId: 2, abscondingSince: '2026-02-01', daysAtLarge: 156, status: 'absconding', lastKnownLocation: 'Mysuru', warrantsIssued: 4, officer: 'PI Anjumala' },
        { id: 4, name: 'Nadeem Pasha', age: 35, crimeType: 'theft', firNo: 'KSP-2026-0156', districtId: 5, abscondingSince: '2026-05-10', daysAtLarge: 73, status: 'absconding', lastKnownLocation: 'Mangaluru', warrantsIssued: 1, officer: 'SI Ramesh' },
        { id: 5, name: 'Arun Nair', age: 31, crimeType: 'fraud', firNo: 'KSP-2026-0234', districtId: 3, abscondingSince: '2026-04-05', daysAtLarge: 93, status: 'absconding', lastKnownLocation: 'Udupi', warrantsIssued: 2, officer: 'PI Dharmendra' },
        { id: 6, name: 'Ajay Rao', age: 29, crimeType: 'robbery', firNo: 'KSP-2026-0301', districtId: 1, abscondingSince: '2026-06-01', daysAtLarge: 51, status: 'bailable_warrant', lastKnownLocation: 'Bengaluru', warrantsIssued: 1, officer: 'SI Patel' },
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
          { role: 'accused', firNo: 'KSP-2026-0190', station: 'Brigade Road PS', crimeType: 'robbery' },
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
          { role: 'accused', firNo: 'KSP-2026-0142', station: 'Brigade Road PS', crimeType: 'robbery' },
          { role: 'accused', firNo: 'KSP-2026-0301', station: 'Cubbon Park PS', crimeType: 'robbery' },
        ]},
        { id: 5, name: 'Arun Nair', roles: [
          { role: 'accused', firNo: 'KSP-2026-0234', station: 'CCB', crimeType: 'fraud' },
          { role: 'complainant', firNo: 'KSP-2026-0402', station: 'Mangaluru PS', crimeType: 'fraud' },
        ]},
        { id: 6, name: 'Kiran Joseph', roles: [
          { role: 'accused', firNo: 'KSP-2026-0142', station: 'Brigade Road PS', crimeType: 'robbery' },
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
      const linksByPerson = {
        'Mohan Kumar': [{ name: 'Kiran Joseph', relation: 'named in same FIR', firNo: 'KSP-2026-0142' }],
        'Kiran Joseph': [{ name: 'Mohan Kumar', relation: 'named in same FIR', firNo: 'KSP-2026-0142' }],
        'Rajesh Kumar': [
          { name: 'Mohan Kumar', relation: 'complainant-accused record', firNo: 'KSP-2026-0142' },
          { name: 'Kiran Joseph', relation: 'complainant-accused record', firNo: 'KSP-2026-0142' },
        ],
      }
      return { results: matched.map(p => ({ ...p, linkedPersons: linksByPerson[p.name] || [] })) }
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
    'POST /server/getdata_withid': () => ([
      { FirNo: 'KSP-2026-0142', fir_stage: 'Under Investigation', CrimeGroup_Name: 'Robbery', Fir_Date: '2026-03-15' },
      { FirNo: 'KSP-2026-0234', fir_stage: 'Under Investigation', CrimeGroup_Name: 'Fraud', Fir_Date: '2026-03-20' },
      { FirNo: 'KSP-2026-0301', fir_stage: 'Chargesheet Filed', CrimeGroup_Name: 'Robbery', Fir_Date: '2026-05-10' },
      { FirNo: 'KSP-2026-0359', fir_stage: 'Case Closed', CrimeGroup_Name: 'Theft', Fir_Date: '2026-06-15' },
    ]),
    'POST /server/getofficerinfo_withid': () => ([
      { id: 1, ioname: 'PI Dharmendra', rank: 'PI', kgid: 'KG1841136', station: 'Brigade Road PS', status: 'Active' },
    ]),
    'POST /server/getresponsetime': () => ({ response_time: 8.2 }),
    'POST /server/getconviction': () => ([
      { accused_chargesheeted_count: 18, conviction_count: 11 },
      { accused_chargesheeted_count: 14, conviction_count: 9 },
      { accused_chargesheeted_count: 9, conviction_count: 5 },
    ]),
    'POST /server/getcrimehotspot': () => ([
      { beat_name: 'Brigade Road beat', village_area_name: 'Brigade Road corridor', district: 'Bengaluru Urban', Latitude: 12.9719, Longitude: 77.6077, CrimeGroup_Name: 'Robbery' },
      { beat_name: 'Brigade Road beat', village_area_name: 'Brigade Road corridor', district: 'Bengaluru Urban', Latitude: 12.9719, Longitude: 77.6077, CrimeGroup_Name: 'Theft' },
      { beat_name: 'Majestic transit beat', village_area_name: 'Majestic interchange', district: 'Bengaluru Urban', Latitude: 12.9767, Longitude: 77.5713, CrimeGroup_Name: 'Theft' },
      { beat_name: 'Indiranagar east beat', village_area_name: 'Indiranagar east', district: 'Bengaluru Urban', Latitude: 12.9784, Longitude: 77.6408, CrimeGroup_Name: 'Burglary' },
      { beat_name: 'MG Road beat', village_area_name: 'MG Road metro', district: 'Bengaluru Urban', Latitude: 12.9756, Longitude: 77.6068, CrimeGroup_Name: 'Robbery' },
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

    // === Case Management Mocks ===
    'GET /server/case_management/cases': () => {
      // Dynamic mock cases aligned with functions/case_management
      const STAGES = ['filed', 'assigned', 'evidence_collection', 'witness_examination', 'charge_sheet', 'court_submitted'];
      const cases = [];
      const startDate = new Date('2026-06-01');
      const crimeTypes = ['theft', 'assault', 'fraud', 'robbery', 'burglary', 'cyber', 'sexual', 'murder'];
      const OFFICERS = ['Inspector Kumar', 'Inspector Patil', 'Inspector Reddy', 'SI Venkatesh', 'SI Rangaswamy', 'SI Hegde'];

      for (let i = 1001; i <= 1020; i++) {
        const crimeType = crimeTypes[i % crimeTypes.length];
        const stageIdx = i % STAGES.length;
        const filedDate = new Date(startDate);
        filedDate.setHours(filedDate.getHours() - (i * 37));
        const hoursSinceFiled = Math.floor((Date.now() - filedDate.getTime()) / 3600000);

        cases.push({
          caseId: i,
          firNo: `KSP-2026-${i}`,
          districtId: (i % 20) + 1,
          crimeType,
          stage: STAGES[stageIdx],
          officer: OFFICERS[i % OFFICERS.length],
          filedDate: filedDate.toISOString(),
          goldenPeriodRemainingHours: Math.max(0, 72 - Math.floor(hoursSinceFiled / 24)),
          checklistCompletion: Math.round((stageIdx / 6) * 100),
          victimName: `Victim ${i}`,
          accusedName: i % 3 === 0 ? null : `Accused ${i}`,
          location: `Location ${i}`
        });
      }
      return { cases, total: cases.length };
    },

    'GET /server/case_management/cases/:id': ({ params }) => {
      const caseId = parseInt(params.id) || 1001;
      const STAGES = ['filed', 'assigned', 'evidence_collection', 'witness_examination', 'charge_sheet', 'court_submitted'];
      const crimeTypes = ['theft', 'assault', 'fraud', 'robbery', 'burglary', 'cyber', 'sexual', 'murder'];
      const OFFICERS = ['Inspector Kumar', 'Inspector Patil', 'Inspector Reddy', 'SI Venkatesh', 'SI Rangaswamy', 'SI Hegde'];
      const crimeType = crimeTypes[caseId % crimeTypes.length];
      const stageIdx = caseId % STAGES.length;
      
      const checklist = ['CCTV requisition', 'Witness identification', 'Scene photographs', 'Accused arrest', 'Weapon recovery'].map((item, ci) => ({
        id: `${caseId}-${ci}`,
        text: item,
        done: ci < stageIdx
      }));

      const leads = [
        { id: `lead-${caseId}-0`, text: 'Check nearby CCTV cameras for suspect vehicle', relevance: 0.9, status: stageIdx > 1 ? 'completed' : 'pending' },
        { id: `lead-${caseId}-1`, text: 'Question neighbors about suspicious activity', relevance: 0.75, status: stageIdx > 3 ? 'completed' : 'pending' }
      ];

      return {
        caseId,
        firNo: `KSP-2026-${caseId}`,
        districtId: (caseId % 20) + 1,
        crimeType,
        stage: STAGES[stageIdx],
        officer: OFFICERS[caseId % OFFICERS.length],
        filedDate: new Date('2026-06-01').toISOString(),
        goldenPeriodRemainingHours: 24,
        checklist,
        leads,
        checklistCompletion: Math.round((checklist.filter(c => c.done).length / checklist.length) * 100),
        victimName: `Victim ${caseId}`,
        accusedName: caseId % 3 === 0 ? null : `Accused ${caseId}`,
        location: `Location ${caseId}`
      };
    },

    'PUT /server/case-management/cases/:id/stage': ({ params, body }) => {
      return { caseId: parseInt(params.id), stage: body.stage };
    },

    'PUT /server/case-management/cases/:id/checklist/:itemId': ({ params }) => {
      return { caseId: parseInt(params.id), checklistCompletion: 60, checklist: [] };
    },

    // === Detailed FIR Mocks ===
    'POST /server/getfirdetails_withid': ({ body }) => {
      const rawFir = body.FirNo || '';
      const parts = rawFir.split('/');
      let num = parts[0];
      let year = parts[1] || '2026';
      if (rawFir.startsWith('KSP-')) {
        const subparts = rawFir.split('-');
        year = subparts[1] || '2026';
        num = subparts[2] || '0142';
      }
      
      const cleanNum = parseInt(num) || 142;
      
      const crimeTypeMap = {
        142: { type: 'robbery', head: 'ROBBERY', desc: 'Robbery near MG Road metro station.' },
        89: { type: 'burglary', head: 'BURGLARY', desc: 'House break-in during night in Indiranagar.' },
        201: { type: 'assault', head: 'ASSAULT', desc: 'Physical altercation in parking lot.' },
        156: { type: 'theft', head: 'THEFT', desc: 'Mobile phone snatched from pedestrian.' },
        234: { type: 'fraud', head: 'FRAUD', desc: 'Online phishing scam costing Rs. 50,000.' },
        301: { type: 'robbery', head: 'ROBBERY', desc: 'Armed robbery at jewelry store.' },
        267: { type: 'burglary', head: 'BURGLARY', desc: 'Burglary of locked commercial office.' },
        333: { type: 'assault', head: 'ASSAULT', desc: 'Scuffle between two groups near college.' },
        359: { type: 'theft', head: 'THEFT', desc: 'Bicycle stolen from residential porch.' },
        388: { type: 'fraud', head: 'FRAUD', desc: 'Investment scheme fraud.' }
      };
      
      const mapping = crimeTypeMap[cleanNum] || { type: 'theft', head: 'THEFT', desc: 'Theft of property.' };
      const isCanonicalCase = cleanNum === 142 && String(year) === '2026';
      const incidentDate = isCanonicalCase ? '2026-03-15' : `${year}-03-${String((cleanNum % 28) + 1).padStart(2, '0')}`;
      
      return [{
        FIRNo: `KSP-${year}-${String(cleanNum).padStart(4, '0')}`,
        FIRYear: parseInt(year),
        DistrictID: isCanonicalCase ? 1 : (cleanNum % 5) + 1,
        DistrictName: isCanonicalCase ? 'Bengaluru Urban' : ['Bengaluru City', 'Mysuru City', 'Mangaluru City', 'Hubballi-Dharwad City', 'Belagavi City'][cleanNum % 5],
        PoliceStationID: (cleanNum % 3) + 1,
        UnitName: ['Cubbon Park PS', 'Brigade Road PS', 'Malleswaram PS'][cleanNum % 3],
        complainantName: 'Rajesh Kumar',
        accusedCount: isCanonicalCase ? 2 : cleanNum % 3,
        hasWitnesses: cleanNum % 2 === 0,
        delayReason: cleanNum % 4 === 0 ? 'Hospitalization of victim' : '',
        propertyValue: cleanNum * 150,
        Narrative: isCanonicalCase
          ? 'On 2026-03-15 at approximately 8:30 PM, a robbery was reported near the SH-9 junction in the Brigade Road corridor. The complainant reported that two persons used a sharp object to demand valuables and left on a two-wheeler. Two bystanders were identified. Junction CCTV is referenced in the case diary, but acquisition, hash verification, and the BSA Section 63 certificate remain pending.'
          : `On ${incidentDate} at approximately 8:30 PM, the incident occurred. ${mapping.desc} The suspect pointed a sharp object at the victim and demanded valuables. Two bystanders were identified for follow-up.`,
        CrimeGroup_Name: mapping.type,
        CrimeHead_Name: mapping.head,
        fir_stage: cleanNum % 3 === 0 ? 'Case Closed' : 'Under Investigation',
        Fir_Date: incidentDate,
        complainantMobile: '98XXXXXX10',
        complainantAadhaar: 'XXXX-XXXX-9012',
        accusedName: isCanonicalCase ? 'Mohan Kumar, Kiran Joseph' : cleanNum % 3 > 0 ? 'Mohan Kumar, Kiran Joseph' : 'Unknown',
        victimName: 'Rajesh Kumar',
        location: isCanonicalCase ? 'SH-9 junction, Brigade Road corridor' : 'MG Road',
        filingDeadline: isCanonicalCase ? '2026-08-09' : null,
        filingDaysRemaining: isCanonicalCase ? 18 : null,
        dataMode: 'synthetic-demo',
      }];
    },

    // === Agentic Cross Check Mock ===
    'POST /server/agentic_police/agentic/cross-check/:id/demo': () => {
      return {
        demoMode: true,
        alertsStored: 1,
        findings: [
          {
            linkedFirId: 301,
            firNo: `KSP-2026-0301`,
            score: 84,
            matchedDimensions: ['MO (Motorcycle theft)', 'Geographic proximity (150m)', 'Suspect description (Scar on left cheek)'],
            filedDate: '2026-05-10T12:00:00Z'
          }
        ]
      };
    },

    // === Co-Accused Network Graph Mock (REMOVED - duplicate of line 556 above) ===


    // === Network Analysis / Entity Graph Mock (REMOVED - duplicate of line 277 above) ===


    // === Person 360 API Mock ===
    'GET /server/fir_api/person/:id': ({ params }) => {
      const name = decodeURIComponent(params.id).replace(/_/g, ' ');
      const isKiran = name.toLowerCase().includes('kiran');
      return {
        name,
        aliases: isKiran ? ['KJ'] : ['Mohan K.'],
        legalStatus: isKiran ? 'warrant_verification_pending' : 'in_custody',
        age: isKiran ? 29 : 32,
        gender: 'Male',
        primaryPhone: '9845012345',
        aadhaarId: 'XXXX-XXXX-9182',
        lastKnownAddress: isKiran ? 'Last confirmed: Shivajinagar, Bengaluru' : '7th Main, Malleshwaram, Bengaluru',
        associationReview: 'One shared-FIR association is recorded; no organized-group finding is established.',
        riskCategory: 'Human review required',
        FIRs: [
          { firNo: 'KSP-2026-0142', role: 'Accused', crimeType: 'robbery', date: '2026-03-15', stage: 'Under Investigation' },
          ...(isKiran ? [] : [{ firNo: 'KSP-2026-0301', role: 'Accused', crimeType: 'robbery', date: '2026-05-10', stage: 'Under Investigation' }])
        ],
        coAccused: isKiran ? ['Mohan Kumar'] : ['Kiran Joseph'],
        mode: 'synthetic-demo',
        piiAuditRequired: true,
      };
    },

    // === Crime Genome Intelligence: ZIA Case Intelligence Brief ===
    'GET /server/zia/case_brief/:firId': ({ params }) => ({
      firId: params.firId || 'KSP-2026-0142',
      generatedAt: new Date().toISOString(),
      confidence: 0.82,
      summary: `FIR ${params.firId || 'KSP-2026-0142'} remains 67% investigation-ready. Mohan Kumar and Kiran Joseph are listed as accused; Kiran has no matching arrest or surrender event. The SH-9 junction CCTV source is identified, but acquisition, hash registration, and the BSA Section 63 certificate remain pending. Similar-case results describe record overlap only and require officer verification.\n\nEstimated review time: 4 minutes.`,
      keyFindings: [
        { finding: 'Two-wheeler robbery attributes overlap with two open Bengaluru reports', confidence: 0.72, source: 'Recorded classification and MO fields' },
        { finding: 'Mohan Kumar and Kiran Joseph share one FIR association', confidence: 0.98, source: 'Accused records for KSP-2026-0142' },
        { finding: 'SH-9 CCTV is referenced but not yet acquired or hashed', confidence: 0.96, source: 'Case evidence checklist' },
        { finding: 'Kiran Joseph has no matching arrest or surrender event', confidence: 0.91, source: 'ArrestSurrender records' }
      ],
      recommendations: [
        { priority: 'HIGH', action: 'Retrieve CCTV from SH-9 junction and record its hash', deadline: '2026-07-23T09:00:00+05:30' },
        { priority: 'HIGH', action: 'Verify Kiran Joseph warrant and last confirmed location', deadline: '2026-07-23T18:00:00+05:30' },
        { priority: 'MEDIUM', action: 'Complete witness and electronic-record documentation review', deadline: '2026-07-25T18:00:00+05:30' },
        { priority: 'LOW', action: 'Review BNS 304, 309 and 3(5) with the legal officer', deadline: '2026-08-02T18:00:00+05:30' }
      ],
      sources: ['CaseMaster #142', 'Accused records for case #142', 'ArrestSurrender records', 'Case evidence checklist'],
      orchestrationSteps: [
        { step: 1, agent: 'Record Matcher', status: 'complete', result: '2 similar records surfaced for review' },
        { step: 2, agent: 'Association Mapper', status: 'complete', result: '1 shared-FIR association recorded' },
        { step: 3, agent: 'Evidence Reviewer', status: 'complete', result: '3 CCTV documentation gaps identified' },
        { step: 4, agent: 'Legal Reference', status: 'complete', result: 'BNS and BSA references attached for officer review' }
      ]
    }),

    // === Crime Genome Intelligence: Theory Board ===
    'GET /server/zia/theories/:firId': ({ params }) => ({
      firId: params.firId || 'KSP-2026-0142',
      theories: [
        {
          id: 'T1',
          title: 'Two-person coordinated robbery',
          description: 'Working hypothesis based on the complainant account, two accused records, and the recorded two-wheeler escape. It is not an established finding.',
          confidence: 0.67,
          status: 'working',
          reviewedBy: null,
          supporting: [
            { id: 'E1', text: 'Complainant account records two persons and a two-wheeler escape', type: 'intelligence' },
            { id: 'E2', text: 'Mohan Kumar and Kiran Joseph are both named in the accused records', type: 'pattern' }
          ],
          contradicting: [
            { id: 'C1', text: 'Referenced CCTV has not been acquired or verified', type: 'absence' }
          ]
        },
        {
          id: 'T2',
          title: 'Vehicle link to nearby robberies',
          description: 'Working hypothesis based on similar two-wheeler MO fields in nearby reports. No vehicle, phone, or digital identifier has been verified across cases.',
          confidence: 0.42,
          status: 'weak',
          reviewedBy: null,
          supporting: [
            { id: 'E3', text: 'Two open reports share a two-wheeler robbery classification', type: 'pattern' }
          ],
          contradicting: [
            { id: 'C2', text: 'No verified vehicle registration link is recorded', type: 'absence' },
            { id: 'C3', text: 'No cross-case phone or digital evidence is recorded', type: 'absence' }
          ]
        }
      ]
    }),
    'POST /server/zia/theories/:firId/confirm': ({ params, body }) => ({
      success: true,
      theoryId: body?.theoryId || 'T1',
      firId: params.firId,
      reviewedBy: 'PI Dharmendra',
      reviewedAt: new Date().toISOString(),
      newConfidence: body?.currentConfidence || 0.5
    }),
    'POST /server/zia/theories/:firId/add': ({ body }) => ({
      success: true,
      theory: {
        id: `T${Date.now()}`,
        title: body?.title || 'New Theory',
        description: body?.description || '',
        confidence: 0.5,
        status: 'working',
        reviewedBy: null,
        supporting: [],
        contradicting: []
      }
    }),

    // === Crime Genome Intelligence: Case Strength Meter ===
    'GET /server/zia/case_strength/:firId': ({ params }) => ({
      firId: params.firId || 'KSP-2026-0142',
      overallScore: 68,
      grade: 'B',
      chargeableSections: ['BNS 304', 'BNS 309', 'BNS 3(5) - legal officer review required'],
      factors: [
        { factor: 'Witness Statements', score: 75, weight: 0.25, explanation: '2 eyewitness statements recorded; victim statement corroborated by bystander.' },
        { factor: 'Physical Evidence', score: 45, weight: 0.20, explanation: 'Stolen property and weapon recovery are not recorded.' },
        { factor: 'Digital Evidence', score: 30, weight: 0.20, explanation: 'CCTV source is identified, but footage, hash, and BSA Section 63 certificate are pending.' },
        { factor: 'MO Documentation', score: 70, weight: 0.15, explanation: 'Two-wheeler escape and weapon threat are recorded; cross-case matches require verification.' },
        { factor: 'Accused Records', score: 65, weight: 0.15, explanation: 'Two accused are named; Kiran Joseph has no matching arrest or surrender event.' },
        { factor: 'Legal Completeness', score: 55, weight: 0.05, explanation: 'BNSS 180 witness examinations and electronic-record documentation require review.' }
      ],
      trend: [
        { date: '2026-07-01', score: 42 },
        { date: '2026-07-04', score: 55 },
        { date: '2026-07-07', score: 62 },
        { date: '2026-07-10', score: 68 }
      ],
      gaps: [
        'Record the current recovery status of the stolen property and reported weapon',
        'Complete pending witness examinations under BNSS 180',
        'Verify and execute the current warrant process for Kiran Joseph'
      ]
    }),

    // === Crime Genome Intelligence: Ambient Memory (contextual suggestions) ===
    'GET /server/zia/memory': ({ query }) => {
      const context = query.context || 'general';
      const suggestions = {
        general: [
          { type: 'related_case', firNo: 'KSP-2026-0301', summary: 'Similar two-wheeler robbery MO; Mohan Kumar appears in both records.', relevance: 0.91 },
          { type: 'wanted', name: 'Kiran Joseph', reason: 'No matching arrest or surrender event for KSP-2026-0142', relevance: 0.88 },
          { type: 'deadline', event: 'Chargesheet due — KSP-2026-0142', daysRemaining: 18, relevance: 0.95 },
          { type: 'alert', text: 'New snatch incident reported in same grid 6 hours ago — KSP-2026-0522', relevance: 0.85 }
        ],
        investigation: [
          { type: 'evidence_gap', text: 'No BSA Section 63 certificate is recorded for the CCTV evidence. Review before submission.', relevance: 0.97 },
          { type: 'related_case', firNo: 'KSP-2026-0255', summary: 'Similar recorded MO fields; no shared person or digital identifier is verified.', relevance: 0.58 }
        ]
      };
      return {
        context,
        suggestions: suggestions[context] || suggestions.general,
        generatedAt: new Date().toISOString()
      };
    },

    // === Case Management (expiring cases — unique route not defined above) ===
    'GET /server/case_management/cases/expiring': () => ({
      cases: [
        { id: 2, firNo: 'KSP-2026-0089', stage: 'chargesheet', severity: 'misdemeanour', io: 'PI Maruti', dateRegistered: '2026-02-28', nextHearing: '2026-07-28', expiringSoon: true, daysRemaining: 6 },
        { id: 5, firNo: 'KSP-2026-0234', stage: 'chargesheet', severity: 'misdemeanour', io: 'PI Dharmendra', dateRegistered: '2026-03-20', nextHearing: '2026-08-03', expiringSoon: true, daysRemaining: 12 },
      ],
      total: 2,
    }),

    // === ZIA Synthesis Brief ===
    'POST /server/zia_brief/zia_brief': ({ body }) => {
      const requestedCase = String(body?.caseId || '142');
      const caseId = requestedCase.match(/(\d+)$/)?.[1] || '142';
      const firNo = requestedCase.startsWith('KSP-') ? requestedCase : `KSP-2026-${String(caseId).padStart(4, '0')}`;
      return {
        caseId,
        narrative: `FIR ${firNo} concerns a robbery reported near the SH-9 junction in the Brigade Road corridor on 2026-03-15. Two witness records are present. Junction CCTV is referenced, but acquisition, hash verification, and the BSA Section 63 certificate remain pending. The narrative documentation signal is 84%; it measures specificity, not truth or guilt. Mohan Kumar and Kiran Joseph are recorded as accused, with no matching arrest or surrender event for Kiran. The current case-order filing date is 18 days away.`,
        solvability: {
          firNo,
          score: 0.67,
          label: 'HUMAN REVIEW REQUIRED',
          factors: [
            { name: 'Witness availability', weight: 0.85, value: '2 witnesses identified' },
            { name: 'Digital evidence', weight: 0.30, value: 'CCTV source identified; acquisition, hash, and certificate pending' },
            { name: 'Accused records', weight: 0.65, value: 'Mohan Kumar and Kiran Joseph are named; identity findings require officer review' },
            { name: 'Time to report', weight: 0.92, value: 'Reported within 4 hours' },
            { name: 'Location specificity', weight: 0.88, value: 'Exact location identified' },
          ],
          recommendation: 'Acquire the referenced CCTV lawfully, record its hash, obtain the BSA Section 63 certificate, and verify the at-large status.',
        },
        veracity: {
          score: 0.84,
          label: 'MORE COMPLETE',
          flags: [
            { type: 'specificity', weight: 0.8, description: 'Narrative contains specific temporal and spatial details' },
            { type: 'coherence', weight: 0.7, description: 'Event sequence is logically ordered and internally consistent' },
            { type: 'complainant_detail', weight: 0.9, description: 'Complainant identified by name' },
            { type: 'delay_indicator', weight: 0.9, description: 'No delay in reporting' },
            { type: 'property_claim', weight: 0.7, description: 'Property value within expected range' },
          ],
          ziaAssessment: 'Narrative quality review completed. Documentation signal: 84%. Specific temporal and location markers were found. This does not assess truthfulness or guilt.',
          methodology: 'Synthetic narrative-completeness heuristic; not validated for truth classification',
        },
        similarCases: [
          { caseId: 89, similarity: 0.78, reason: 'Same MO — chain snatching with 2-wheeler getaway in nearby area' },
          { caseId: 301, similarity: 0.65, reason: 'Mohan Kumar appears in both records; the linkage requires officer verification' },
          { caseId: 255, similarity: 0.52, reason: 'Geographic proximity, similar time-of-day pattern' },
        ],
        entityLinks: [
          { source: 'N1', target: 'N2', weight: 1, relation: 'named in same FIR' },
          { source: 'N1', target: 'N3', weight: 1, relation: 'record similarity for review' },
          { source: 'N2', target: 'N6', weight: 1, relation: 'recorded contact requiring verification' },
          { source: 'N1', target: 'N4', weight: 1, relation: 'accused-victim record link' },
        ],
        recommendations: [
          { priority: 'HIGH', action: 'Retrieve CCTV from SH-9 junction and record its hash', deadline: '2026-07-23T09:00:00+05:30' },
          { priority: 'HIGH', action: 'Verify Kiran Joseph warrant and last confirmed location', deadline: '2026-07-23T18:00:00+05:30' },
          { priority: 'MEDIUM', action: 'Complete witness and electronic-record documentation review', deadline: '2026-07-25T18:00:00+05:30' },
          { priority: 'LOW', action: 'Review BNS 304, 309 and 3(5) with the legal officer', deadline: '2026-08-02T18:00:00+05:30' },
        ],
        confidence: 0.82,
        provenance: [
          { function: 'case_readiness', methodology: 'Deterministic evidence-completeness checklist', validationStatus: 'human-review-required' },
          { function: 'narrative_quality', methodology: 'Synthetic documentation-completeness heuristic', validationStatus: 'human-review-required' },
          { function: 'network_analysis', methodology: 'Shared-FIR record graph', validationStatus: 'human-review-required' },
          { function: 'daily_brief', methodology: 'Aggregate synthetic district statistics', validationStatus: 'synthetic-demo' },
          { function: 'agentic_police', methodology: 'Deterministic orchestration demonstration', validationStatus: 'synthetic-demo' },
        ],
      };
    },
  };
}



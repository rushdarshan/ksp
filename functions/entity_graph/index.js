const express = require('express');
const app = express();
app.use(express.json());

const CROSS_FIR_GRAPHS = {
  'KSP-2026-0142': {
    nodes: [
      { id: 'fir-142', type: 'case', label: 'KSP-2026-0142' },
      { id: 'fir-89', type: 'case', label: 'KSP-2026-0089' },
      { id: 'fir-301', type: 'case', label: 'KSP-2026-0301' },
      { id: 'person-mohan', type: 'person', label: 'Mohan Kumar' },
      { id: 'person-kiran', type: 'person', label: 'Kiran Joseph' },
      { id: 'person-ravi', type: 'person', label: 'Ravi Shetty' },
      { id: 'person-ajay', type: 'person', label: 'Ajay Rao' },
      { id: 'phone-9845', type: 'phone', label: '9845012345' },
      { id: 'vehicle-ka01', type: 'vehicle', label: 'KA-01-MN-1234' },
      { id: 'location-brigade', type: 'location', label: 'Brigade Road' },
      { id: 'location-sh9', type: 'location', label: 'SH-9 junction' },
    ],
    links: [
      { source: 'fir-142', target: 'person-mohan', label: 'accused' },
      { source: 'fir-142', target: 'person-kiran', label: 'accused' },
      { source: 'fir-142', target: 'location-sh9', label: 'occurred at' },
      { source: 'fir-89', target: 'person-ravi', label: 'accused' },
      { source: 'fir-301', target: 'person-mohan', label: 'accused' },
      { source: 'fir-301', target: 'person-ajay', label: 'accused' },
      { source: 'person-mohan', target: 'phone-9845', label: 'known number' },
      { source: 'person-ravi', target: 'phone-9845', label: 'known number' },
      { source: 'person-mohan', target: 'vehicle-ka01', label: 'linked vehicle' },
      { source: 'person-ajay', target: 'vehicle-ka01', label: 'linked vehicle' },
      { source: 'fir-89', target: 'location-brigade', label: 'occurred at' },
      { source: 'fir-301', target: 'location-brigade', label: 'occurred near' },
      { source: 'fir-142', target: 'fir-89', label: 'shared phone 9845012345' },
      { source: 'fir-142', target: 'fir-301', label: 'shared accused Mohan Kumar' },
      { source: 'fir-89', target: 'fir-301', label: 'shared vehicle KA-01-MN-1234' },
    ],
  },
  'KSP-2026-0089': {
    nodes: [
      { id: 'fir-89', type: 'case', label: 'KSP-2026-0089' },
      { id: 'fir-142', type: 'case', label: 'KSP-2026-0142' },
      { id: 'person-ravi', type: 'person', label: 'Ravi Shetty' },
      { id: 'person-arun', type: 'person', label: 'Arun Nair' },
      { id: 'person-mohan', type: 'person', label: 'Mohan Kumar' },
      { id: 'phone-9845', type: 'phone', label: '9845012345' },
      { id: 'vehicle-ka01', type: 'vehicle', label: 'KA-01-MN-1234' },
      { id: 'location-brigade', type: 'location', label: 'Brigade Road' },
    ],
    links: [
      { source: 'fir-89', target: 'person-ravi', label: 'accused' },
      { source: 'fir-89', target: 'person-arun', label: 'accused' },
      { source: 'fir-89', target: 'location-brigade', label: 'occurred at' },
      { source: 'person-ravi', target: 'phone-9845', label: 'known number' },
      { source: 'fir-89', target: 'vehicle-ka01', label: 'suspect vehicle' },
      { source: 'fir-142', target: 'person-mohan', label: 'accused' },
      { source: 'fir-142', target: 'fir-89', label: 'shared phone 9845012345' },
      { source: 'person-mohan', target: 'phone-9845', label: 'known number' },
    ],
  },
  'KSP-2026-0301': {
    nodes: [
      { id: 'fir-301', type: 'case', label: 'KSP-2026-0301' },
      { id: 'fir-142', type: 'case', label: 'KSP-2026-0142' },
      { id: 'person-mohan', type: 'person', label: 'Mohan Kumar' },
      { id: 'person-ajay', type: 'person', label: 'Ajay Rao' },
      { id: 'vehicle-ka01', type: 'vehicle', label: 'KA-01-MN-1234' },
      { id: 'location-brigade', type: 'location', label: 'Brigade Road' },
    ],
    links: [
      { source: 'fir-301', target: 'person-mohan', label: 'accused' },
      { source: 'fir-301', target: 'person-ajay', label: 'accused' },
      { source: 'fir-301', target: 'location-brigade', label: 'occurred near' },
      { source: 'person-mohan', target: 'vehicle-ka01', label: 'linked vehicle' },
      { source: 'person-ajay', target: 'vehicle-ka01', label: 'linked vehicle' },
      { source: 'fir-142', target: 'fir-301', label: 'shared accused Mohan Kumar' },
      { source: 'fir-142', target: 'person-mohan', label: 'accused' },
      { source: 'fir-142', target: 'vehicle-ka01', label: 'suspect vehicle' },
    ],
  },
};

const DEFAULT_GRAPH = {
  nodes: [
    { id: 'case-master', type: 'case', label: 'Case record' },
    { id: 'status-at-large', type: 'status', label: 'At large' },
  ],
  links: [],
};

app.post('/cross-ref', (req, res) => {
  try {
    const { caseId } = req.body || {};
    const graph = CROSS_FIR_GRAPHS[caseId] || DEFAULT_GRAPH;
    res.status(200).json({
      caseId,
      nodes: graph.nodes,
      links: graph.links,
      metadata: {
        mode: 'mock',
        method: 'Cross-FIR entity matching by shared phone numbers, vehicle IDs, and person names',
        note: 'Synthetic cross-reference data for demonstration.',
      },
    });
  } catch (error) {
    console.error('Entity graph cross-ref failed:', error);
    res.status(500).json({ error: 'Unable to build entity graph' });
  }
});

module.exports = app;

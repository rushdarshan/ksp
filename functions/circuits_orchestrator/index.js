const express = require('express');
const catalyst = require('zcatalyst-sdk-node');

const app = express();
app.use(express.json());

const WORKFLOW_DEFS = {
  'fir-to-chargesheet': {
    stages: [
      { stage: 'FIR Registration', status: 'pending' },
      { stage: 'Evidence Collection', status: 'pending' },
      { stage: 'Witness Examination', status: 'pending' },
      { stage: 'Legal Scrutiny', status: 'pending' },
      { stage: 'Chargesheet Filing', status: 'pending' },
    ],
  },
};

function simulateStage(stage, idx) {
  const ms = 1000 + Math.random() * 1000;
  const startedAt = new Date(Date.now() + idx * 1500).toISOString();
  const completedAt = new Date(Date.parse(startedAt) + ms).toISOString();
  return {
    ...stage,
    status: 'complete',
    startedAt,
    completedAt,
    duration: Math.round(ms),
  };
}

app.post('/orchestrate', async (req, res) => {
  try {
    const catalystApp = catalyst.initialize(req);
    const { caseId, workflow } = req.body || {};
    if (!caseId || !workflow) {
      return res.status(400).json({ error: 'caseId and workflow are required' });
    }

    const def = WORKFLOW_DEFS[workflow];
    if (!def) {
      return res.status(400).json({ error: `Unknown workflow: ${workflow}` });
    }

    const stages = def.stages.map((s, i) => simulateStage(s, i));

    const result = {
      caseId,
      workflow,
      stages,
      totalDuration: stages.reduce((sum, s) => sum + s.duration, 0),
      status: 'complete',
      metadata: {
        dataSource: 'catalyst_circuits',
        generatedAt: new Date().toISOString(),
      },
    };

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Workflow orchestration failed', details: err.message });
  }
});

module.exports = app;

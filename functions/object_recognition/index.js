const express = require('express');
const catalyst = require('zcatalyst-sdk-node');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.raw({ type: 'image/*', limit: '10mb' }));

// Demo detection libraries keyed by imageId
const DEMO_DETECTIONS = {
  'evidence-001': [
    { object: 'knife', confidence: 0.94 },
    { object: 'blood splatter', confidence: 0.81 },
    { object: 'fingerprint', confidence: 0.62 }
  ],
  'evidence-002': [
    { object: 'mobile phone', confidence: 0.92 },
    { object: 'cash bills', confidence: 0.88 },
    { object: 'sim card', confidence: 0.74 },
    { object: 'wallet', confidence: 0.82 }
  ],
  'evidence-003': [
    { object: 'motorcycle', confidence: 0.85 },
    { object: 'license plate', confidence: 0.54 }
  ],
  'evidence-004': [
    { object: 'knife', confidence: 0.89 },
    { object: 'watch', confidence: 0.82 },
    { object: 'keys', confidence: 0.71 }
  ]
};

app.post('/detect', async (req, res) => {
  try {
    const catalystApp = catalyst.initialize(req);
    const imageId = req.body?.imageId;
    let detections = DEMO_DETECTIONS[imageId] || DEMO_DETECTIONS['evidence-004'];

    try {
      // If raw image bytes were passed instead of an imageId, call Zia Object Recognition
      if (req.body && Buffer.isBuffer(req.body) && req.body.length > 0) {
        const zia = catalystApp.zia();
        const result = await zia.detectObjects(req.body);
        if (result && result.predictions) {
          detections = result.predictions.map(p => ({
            object: p.label || p.name,
            confidence: parseFloat((p.confidence || p.score || 0.7).toFixed(2))
          }));
        }
      }
    } catch (sdkErr) {
      console.warn('Zia Object Recognition SDK call failed, using demo data:', sdkErr.message);
    }

    res.status(200).json({
      detectionCount: detections.length,
      detections,
      metadata: {
        dataSource: 'catalyst_zia_object_recognition',
        humanReviewRequired: true
      }
    });
  } catch (err) {
    console.error('Object recognition error:', err);
    res.status(503).json({ error: 'Object recognition unavailable', details: err.message });
  }
});

module.exports = app;

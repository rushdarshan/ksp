const express = require('express');
const catalyst = require('zcatalyst-sdk-node');

const app = express();
app.use(express.json({ limit: '5mb' }));

const DETECTION_CATALOG = {
  'evidence-001': [
    { object: 'knife', confidence: 0.92, boundingBox: { left: 0.1, top: 0.25, width: 0.3, height: 0.15 } },
    { object: 'bloodstain', confidence: 0.87, boundingBox: { left: 0.5, top: 0.4, width: 0.2, height: 0.12 } },
    { object: 'mobile phone', confidence: 0.31, boundingBox: { left: 0.7, top: 0.6, width: 0.15, height: 0.2 } },
  ],
  'evidence-002': [
    { object: 'firearm', confidence: 0.95, boundingBox: { left: 0.15, top: 0.3, width: 0.4, height: 0.18 } },
    { object: 'ammunition', confidence: 0.88, boundingBox: { left: 0.6, top: 0.5, width: 0.1, height: 0.08 } },
    { object: 'wallet', confidence: 0.42, boundingBox: { left: 0.3, top: 0.7, width: 0.2, height: 0.15 } },
  ],
  'evidence-003': [
    { object: 'vehicle', confidence: 0.96, boundingBox: { left: 0.05, top: 0.1, width: 0.9, height: 0.5 } },
    { object: 'CCTV camera', confidence: 0.78, boundingBox: { left: 0.8, top: 0.05, width: 0.12, height: 0.15 } },
  ],
  'evidence-004': [
    { object: 'ID card', confidence: 0.93, boundingBox: { left: 0.2, top: 0.3, width: 0.3, height: 0.2 } },
    { object: 'narcotics', confidence: 0.84, boundingBox: { left: 0.55, top: 0.6, width: 0.25, height: 0.15 } },
    { object: 'mobile phone', confidence: 0.76, boundingBox: { left: 0.1, top: 0.7, width: 0.15, height: 0.2 } },
  ],
};

app.post('/detect', async (req, res) => {
  try {
    const catalystApp = catalyst.initialize(req);
    const zia = catalystApp.zia();
    const imageId = req.body?.imageId || 'evidence-001';
    const imageUrl = req.body?.imageUrl;

    let detections;
    if (imageUrl) {
      const ziaResult = await zia.objectRecognition({ url: imageUrl });
      detections = ziaResult?.detections || [];
    } else {
      detections = DETECTION_CATALOG[imageId] || DETECTION_CATALOG['evidence-001'];
    }

    res.status(200).json({
      imageId,
      detections,
      detectionCount: detections.length,
      metadata: {
        dataSource: imageUrl ? 'catalyst_zia_object_recognition' : 'synthetic_demo',
        humanReviewRequired: true,
      },
    });
  } catch (err) {
    console.error('Object recognition failed:', err);
    res.status(503).json({ error: 'Object recognition unavailable', details: err.message });
  }
});

module.exports = app;

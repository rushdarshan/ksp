const express = require('express');
const catalyst = require('zcatalyst-sdk-node');

const app = express();
app.use(express.json({ limit: '5mb' }));

const DEMO_FACES = [
    { imageId: 'suspect-001', age: 34, gender: 'Male', emotion: 'Neutral', confidence: 0.87 },
    { imageId: 'suspect-002', age: 28, gender: 'Female', emotion: 'Anger', confidence: 0.76 },
    { imageId: 'suspect-003', age: 45, gender: 'Male', emotion: 'Fear', confidence: 0.91 },
    { imageId: 'victim-001', age: 52, gender: 'Female', emotion: 'Sadness', confidence: 0.83 },
    { imageId: 'witness-001', age: 31, gender: 'Male', emotion: 'Neutral', confidence: 0.79 },
    { imageId: 'suspect-004', age: 22, gender: 'Male', emotion: 'Surprise', confidence: 0.88 },
];

app.post('/analyze', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const zia = catalystApp.zia();
        const imageId = req.body?.imageId || 'suspect-001';
        const imageUrl = req.body?.imageUrl;

        let result;
        if (imageUrl) {
            result = await zia.faceAnalytics({ url: imageUrl });
        } else {
            const demo = DEMO_FACES.find(f => f.imageId === imageId) || DEMO_FACES[0];
            result = {
                faces: [{
                    age: { min: demo.age - 3, max: demo.age + 3, confidence: demo.confidence },
                    gender: { value: demo.gender, confidence: demo.confidence },
                    emotion: { value: demo.emotion, confidence: demo.confidence },
                    boundingBox: { left: 0.25, top: 0.15, width: 0.5, height: 0.6 },
                }],
                faceCount: 1,
            };
        }

        res.status(200).json({
            imageId,
            ...result,
            metadata: {
                dataSource: imageUrl ? 'catalyst_zia_face_analytics' : 'synthetic_demo',
                humanReviewRequired: true,
            },
        });
    } catch (err) {
        console.error('Face analytics failed:', err);
        res.status(503).json({ error: 'Face analysis unavailable', details: err.message });
    }
});

module.exports = app;

const express = require('express');
const catalyst = require('zcatalyst-sdk-node');
const { analyzeFIR } = require('../shared/analyzer');

const app = express();
app.use(express.json({ limit: '1mb' }));

const CRIME_VOCAB = {
    murder: ['murder', 'homicide', 'kill', 'stab', 'shoot', 'strangle', 'dead body', 'death', 'murdered', 'killed'],
    theft: ['theft', 'stolen', 'steal', 'thief', 'snatch', 'pickpocket', 'chain', 'missing', 'took'],
    assault: ['assault', 'beat', 'hit', 'punched', 'slapped', 'attacked', 'fight', 'hurt', 'injured', 'abused'],
    rape: ['rape', 'sexual', 'assaulted', 'molest', 'outraged', 'modesty', 'forced'],
    fraud: ['fraud', 'scam', 'cheat', 'fake', 'impersonate', 'bank', 'otp', 'account', 'loan', 'investment'],
    robbery: ['robbery', 'dacoity', 'armed', 'weapon', 'gun', 'knife', 'held up', 'loot'],
    burglary: ['burglary', 'break', 'house', 'lock', 'entered', 'broke', 'window', 'door'],
    cyber: ['cyber', 'hack', 'email', 'facebook', 'whatsapp', 'instagram', 'online', 'social media', 'digital'],
    accident: ['accident', 'road', 'vehicle', 'car', 'bike', 'crash', 'hit and run', 'collision', 'died']
};

app.post('/analyze', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const { narrative, complainantName, accusedCount, hasWitnesses, delayReason, propertyValue, crimetype } = req.body;

        if (!narrative || narrative.trim().length < 5) {
            return res.status(400).json({ error: 'Narrative text is required (minimum 5 characters)' });
        }

        const result = analyzeFIR({
            narrative,
            complainantName,
            accusedCount: parseInt(accusedCount || 0),
            hasWitnesses: !!hasWitnesses,
            delayReason,
            propertyValue
        });

        let predictedCrimeType = null;
        if (crimetype && CRIME_VOCAB[crimetype]) {
            const expectedWords = CRIME_VOCAB[crimetype];
            const narrativeLower = narrative.toLowerCase();
            const matchCount = expectedWords.filter(w => narrativeLower.includes(w)).length;
            if (matchCount === 0) {
                result.flags.push(`Narrative missing expected vocabulary for "${crimetype}" — possible type mismatch`);
                result.veracityScore = Math.max(0, result.veracityScore - 0.1);
            }
        }

        try {
            const zia = catalystApp.zia();
            const ziaResult = await zia.generateContent({
                prompt: `Analyze this FIR narrative for consistency, coherence, and indicators of truthfulness. Provide a brief assessment: "${narrative.substring(0, 2000)}"`
            });
            result.ziaAssessment = ziaResult?.text || ziaResult?.output || null;
        } catch (e) {
            result.ziaAssessment = null;
        }

        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Veracity analysis failed', details: err.message });
    }
});

module.exports = app;

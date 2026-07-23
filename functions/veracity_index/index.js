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

        if (crimetype && CRIME_VOCAB[crimetype]) {
            const expectedWords = CRIME_VOCAB[crimetype];
            const narrativeLower = narrative.toLowerCase();
            const matchCount = expectedWords.filter(w => narrativeLower.includes(w)).length;
            if (matchCount === 0) {
                result.flags.push(`The narrative does not contain common terms for the recorded "${crimetype}" classification; an officer should verify coding.`);
            }
        }

        try {
            const zia = catalystApp.zia();
            const ziaResult = await zia.generateContent({
                prompt: `Review this FIR narrative only for documentation completeness. Identify missing dates, times, locations, people, event sequence, and evidence references. Do not assess truthfulness, deception, guilt, or legal sufficiency. Return a concise officer review note: "${narrative.substring(0, 2000)}"`
            });
            result.ziaAssessment = ziaResult?.text || ziaResult?.output || null;
        } catch (e) {
            result.ziaAssessment = null;
        }

        res.status(200).json({
            ...result,
            methodology: result.methodology || 'Documentation-completeness review',
            humanReviewRequired: true,
            prohibitedUses: ['credibility scoring', 'guilt assessment', 'automated enforcement action']
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Narrative quality analysis failed', details: err.message });
    }
});

module.exports = app;

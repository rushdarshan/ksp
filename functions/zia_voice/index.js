const express = require('express');

const app = express();
app.use(express.json({ limit: '256kb' }));
app.use(express.raw({ type: 'audio/*', limit: '10mb' }));

app.get('/capabilities', (_req, res) => {
    res.status(200).json({
        serverStt: Boolean(process.env.SPEECH_STT_URL),
        serverTts: Boolean(process.env.SPEECH_TTS_URL),
        browserFallback: true,
        language: 'kn-IN',
        note: 'Catalyst Zia does not provide STT, TTS, or translation APIs. Configure an approved speech provider or use browser speech capabilities.',
    });
});

app.post('/stt', async (req, res) => {
    if (!process.env.SPEECH_STT_URL) {
        return res.status(501).json({
            code: 'SERVER_STT_NOT_CONFIGURED',
            message: 'Use browser Kannada speech recognition or configure SPEECH_STT_URL.',
        });
    }

    try {
        const response = await fetch(process.env.SPEECH_STT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': req.headers['content-type'] || 'audio/webm',
                'X-API-Key': process.env.SPEECH_API_KEY || '',
                'X-Language': 'kn-IN',
            },
            body: req.body,
        });
        const payload = await response.json();
        return res.status(response.status).json(payload);
    } catch (error) {
        console.error('Configured STT provider failed:', error);
        return res.status(502).json({ code: 'STT_PROVIDER_FAILED', message: error.message });
    }
});

app.post('/tts', async (req, res) => {
    if (!process.env.SPEECH_TTS_URL) {
        return res.status(501).json({
            code: 'SERVER_TTS_NOT_CONFIGURED',
            message: 'Use browser Kannada speech synthesis or configure SPEECH_TTS_URL.',
        });
    }

    try {
        const response = await fetch(process.env.SPEECH_TTS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': process.env.SPEECH_API_KEY || '',
            },
            body: JSON.stringify({ text: req.body?.text || '', language: 'kn-IN' }),
        });
        const audio = Buffer.from(await response.arrayBuffer());
        res.set('Content-Type', response.headers.get('content-type') || 'audio/mpeg');
        return res.status(response.status).send(audio);
    } catch (error) {
        console.error('Configured TTS provider failed:', error);
        return res.status(502).json({ code: 'TTS_PROVIDER_FAILED', message: error.message });
    }
});

module.exports = app;

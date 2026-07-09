const express = require('express');
const catalyst = require('zcatalyst-sdk-node');

const app = express();
app.use(express.json());
app.use(express.raw({ type: 'audio/*', limit: '10mb' }));

app.post('/stt', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const zia = catalystApp.zia();
        
        const audioBuffer = req.body;
        
        // 1. Kannada STT
        const sttResult = await zia.speechToText(audioBuffer, { language: 'kn-IN' });
        const kannadaText = sttResult.text;
        
        // 2. Translate to English for query
        const translation = await zia.translate(kannadaText, 'kn', 'en');
        const englishText = translation.translated_text;
        
        res.status(200).json({ text: englishText, original: kannadaText });
    } catch (err) {
        console.error(err);
        res.status(500).send("Zia STT Error");
    }
});

app.post('/tts', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const zia = catalystApp.zia();
        
        const { text } = req.body;
        
        // 1. Translate English answer to Kannada
        const translation = await zia.translate(text, 'en', 'kn');
        const kannadaText = translation.translated_text;
        
        // 2. Kannada TTS
        const audioStream = await zia.textToSpeech(kannadaText, { language: 'kn-IN' });
        
        res.status(200).send(audioStream);
    } catch (err) {
        console.error(err);
        res.status(500).send("Zia TTS Error");
    }
});

module.exports = app;

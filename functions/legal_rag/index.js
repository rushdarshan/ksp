const express = require('express');
const catalyst = require('zcatalyst-sdk-node');

const app = express();
app.use(express.json());

const INDIA_CODE_BNS = 'https://www.indiacode.nic.in/handle/123456789/20062';

// Curated from the official India Code BNS text. Keep this list narrow and verified.
const BNS_SECTIONS = [
    { code: 'BNS 75', text: 'Sexual harassment. Depending on the conduct, punishment may extend to three years, or to one year for sexually coloured remarks, with fine or both.', keywords: ['sexual harassment', 'unwanted touch', 'sexual advance', 'sexual favour', 'pornography', 'sexually coloured remarks'] },
    { code: 'BNS 103', text: 'Punishment for murder: death or imprisonment for life, and fine.', keywords: ['murder', 'homicide', 'kill', 'killed', 'death caused'] },
    { code: 'BNS 109', text: 'Attempt to murder: imprisonment may extend to ten years and fine; if hurt is caused, liability may extend to imprisonment for life.', keywords: ['attempt murder', 'attempt to kill', 'attempted murder', 'murder attempt'] },
    { code: 'BNS 303', text: 'Theft. Punishment may extend to three years, or fine, or both; the section also contains enhanced and first-offence provisions.', keywords: ['theft', 'steal', 'stolen', 'thief', 'pickpocket'] },
    { code: 'BNS 304', text: 'Snatching: suddenly, quickly, or forcibly seizing movable property from a person or their possession. Punishment may extend to three years and fine.', keywords: ['snatching', 'snatch', 'chain snatching', 'chain theft', 'phone snatching'] },
    { code: 'BNS 309', text: 'Robbery. Punishment depends on the facts and may extend to ten years and fine, fourteen years for specified highway robbery, or life where hurt is caused.', keywords: ['robbery', 'armed robbery', 'highway robbery', 'force theft', 'instant hurt'] },
    { code: 'BNS 318', text: 'Cheating. Punishment ranges by subsection and may extend from three to seven years, with fine, depending on duty, loss, and delivery of property.', keywords: ['cheating', 'fraud', 'deception', 'scam', 'phishing', 'induce delivery', 'investment fraud'] },
    { code: 'BNS 351', text: 'Criminal intimidation. Punishment may extend to two years, or seven years for specified serious threats, with additional punishment for anonymous communications.', keywords: ['criminal intimidation', 'threaten', 'death threat', 'anonymous threat', 'threat letter'] },
];

function tokenize(text) {
    return text.toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(t => t.length > 2);
}

function computeTF(text) {
    const tokens = tokenize(text);
    const freq = {};
    const stopWords = new Set(['the', 'and', 'for', 'was', 'are', 'has', 'had', 'but', 'not', 'all', 'any', 'can', 'its', 'may', 'per', 'his', 'her', 'who', 'with', 'from', 'been', 'were', 'also', 'some', 'such', 'than', 'that', 'this', 'which', 'about', 'shall', 'have', 'into', 'made', 'case', 'what', 'being', 'does', 'down', 'each', 'more', 'most', 'much', 'only', 'over', 'same', 'them', 'then', 'when', 'very']);
    for (const t of tokens) {
        if (!stopWords.has(t)) freq[t] = (freq[t] || 0) + 1;
    }
    return freq;
}

function scoreSection(query, section) {
    const qTF = computeTF(query);
    const kTF = computeTF(section.keywords.join(' '));
    let score = 0;
    for (const [word, count] of Object.entries(qTF)) {
        if (kTF[word]) score += count * kTF[word] * 2;
        if (section.text.toLowerCase().includes(word)) score += count;
        if (section.keywords.some(k => k.includes(word))) score += count * 3;
    }
    return score;
}

app.post('/query', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const { query } = req.body;

        if (!query || !query.trim()) {
            return res.status(400).json({ answer: 'Please provide a legal query.', sources: [], method: 'none' });
        }

        const scored = BNS_SECTIONS.map(s => ({
            ...s,
            score: scoreSection(query.toLowerCase(), s)
        }))
            .filter(s => s.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);

        if (scored.length === 0) {
            try {
                const zia = catalystApp.zia();
                const genResult = await zia.generateContent({
                    prompt: `You are a legal assistant for Karnataka Police. Answer this query about Indian criminal law (BNS/Bharatiya Nyaya Sanhita): "${query}". Be concise and cite relevant sections.`
                });
                return res.status(200).json({
                    answer: genResult?.text || genResult?.output || 'Could not find specific BNS sections for your query. Please consult a legal officer.',
                    sources: ['Zia AI Generated — officer verification required'],
                    citations: [{ label: 'Official BNS text', url: INDIA_CODE_BNS }],
                    method: 'zia'
                });
            } catch (ziaErr) {
                return res.status(200).json({
                    answer: 'No matching BNS section found for your query. Please consult a legal officer or try rephrasing.',
                    sources: [],
                    citations: [{ label: 'Official BNS text', url: INDIA_CODE_BNS }],
                    method: 'zia'
                });
            }
        }

        try {
            const quickml = catalystApp.quickML();
            const ragResult = await quickml.queryRAG({
                knowledgeBaseId: process.env.QUICKML_KB_ID || 'ksp-bns-kb',
                query: query,
                topK: 3
            });

            if (ragResult && ragResult.answer) {
                return res.status(200).json({
                    answer: ragResult.answer,
                    sources: ragResult.citations?.map(c => c.section || 'RAG').slice(0, 3) || ['QuickML RAG'],
                    method: 'rag',
                    citations: [{ label: 'Official BNS text', url: INDIA_CODE_BNS }]
                });
            }
        } catch (ragErr) {
            console.warn('QuickML RAG query failed, falling back to keyword match:', ragErr.message);
        }

        const answer = scored.map((s) =>
            `Based on ${s.code}: ${s.text}`
        ).join('\n\n') + '\n\nVerify the facts and subsection against the official text before filing or advising on charges.';

        const sources = scored.map(s => s.code);

        res.status(200).json({
            answer,
            sources,
            method: 'verified-keyword-retrieval',
            citations: [{ label: 'Official India Code — Bharatiya Nyaya Sanhita, 2023', url: INDIA_CODE_BNS }]
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Legal RAG Error");
    }
});

module.exports = app;

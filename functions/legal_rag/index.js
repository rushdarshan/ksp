const express = require('express');
const catalyst = require('zcatalyst-sdk-node');

const app = express();
app.use(express.json());

const BNS_SECTIONS = [
    { code: 'BNS 302', text: 'Punishment for murder — death or imprisonment for life, and fine.', keywords: ['murder', 'homicide', 'kill', 'death caused', 'murdered', 'killed', 'homicidal'] },
    { code: 'BNS 304', text: 'Punishment for culpable homicide not amounting to murder — imprisonment up to 10 years or life, and fine.', keywords: ['culpable homicide', 'death by negligence', 'rash driving death', 'accidental death'] },
    { code: 'BNS 307', text: 'Attempt to murder — imprisonment up to 10 years if hurt caused, otherwise up to 7 years, and fine.', keywords: ['attempt murder', 'attempt to kill', 'attempted murder', 'murder attempt', 'attempt to murder'] },
    { code: 'BNS 308', text: 'Attempt to commit culpable homicide — imprisonment up to 3 years or fine, or both.', keywords: ['attempt culpable homicide', 'attempted culpable homicide'] },
    { code: 'BNS 319', text: 'Voluntarily causing hurt — imprisonment up to 1 year or fine up to Rs. 5,000, or both.', keywords: ['hurt', 'assault', 'beating', 'beaten', 'injured', 'physical harm', 'voluntarily causing hurt'] },
    { code: 'BNS 320', text: 'Voluntarily causing grievous hurt — imprisonment up to 7 years and fine.', keywords: ['grievous hurt', 'serious injury', 'fracture', 'bone broken', 'grievous injury', 'permanent injury'] },
    { code: 'BNS 351', text: 'Criminal force and assault — imprisonment up to 3 months or fine up to Rs. 500, or both.', keywords: ['criminal force', 'assault', 'criminal intimidation', 'threaten', 'threatened'] },
    { code: 'BNS 352', text: 'Assault or use of criminal force to woman with intent to outrage her modesty — imprisonment up to 3 years and fine.', keywords: ['outraging modesty', 'molest', 'molestation', 'eve teasing', 'harass woman', 'outrage modesty'] },
    { code: 'BNS 354', text: 'Sexual harassment and punishment — imprisonment up to 3 years or fine, or both.', keywords: ['sexual harassment', 'sexual assault', 'unwanted touch', 'sexual advance'] },
    { code: 'BNS 376', text: 'Punishment for rape — rigorous imprisonment not less than 10 years but may extend to life, and fine.', keywords: ['rape', 'sexual assault intercourse', 'forced intercourse', 'sexual violence', 'gang rape', 'raped'] },
    { code: 'BNS 376(2)', text: 'Punishment for rape by police officer, public servant, or during custody — rigorous imprisonment not less than 10 years extendable to life, and fine.', keywords: ['custodial rape', 'police rape', 'public servant rape', 'rape by authority'] },
    { code: 'BNS 379', text: 'Theft — imprisonment up to 3 years or fine, or both.', keywords: ['theft', 'steal', 'stolen', 'thief', 'pickpocket', 'snatching', 'snatch', 'chain snatching'] },
    { code: 'BNS 380', text: 'Theft in dwelling house — imprisonment up to 7 years and fine.', keywords: ['house theft', 'dwelling theft', 'home theft', 'housebreak theft', 'burglary'] },
    { code: 'BNS 381', text: 'Theft by clerk or servant of property in possession of master — imprisonment up to 7 years and fine.', keywords: ['servant theft', 'employee theft', 'clerk theft', 'breach of trust theft'] },
    { code: 'BNS 382', text: 'Theft after preparation made for causing death, hurt or restraint — imprisonment up to 10 years and fine.', keywords: ['robbery', 'dacoity', 'armed robbery', 'highway robbery', 'dacoit'] },
    { code: 'BNS 384', text: 'Extortion — imprisonment up to 3 years or fine, or both.', keywords: ['extortion', 'blackmail', 'threaten property', 'demand money threat', 'ransom'] },
    { code: 'BNS 385', text: 'Putting person in fear of death or grievous hurt in order to commit extortion — imprisonment up to 7 years and fine.', keywords: ['fear extortion', 'threat to kill extortion'] },
    { code: 'BNS 403', text: 'Dishonest misappropriation of property — imprisonment up to 2 years or fine, or both.', keywords: ['misappropriation', 'embezzlement', 'dishonest appropriation', 'misuse of property'] },
    { code: 'BNS 406', text: 'Criminal breach of trust — imprisonment up to 3 years or fine, or both.', keywords: ['breach of trust', 'criminal breach of trust', 'entrusted property', 'misappropriation of trust'] },
    { code: 'BNS 408', text: 'Criminal breach of trust by clerk or servant — imprisonment up to 7 years and fine.', keywords: ['employee trust breach', 'servant trust breach', 'office trust breach'] },
    { code: 'BNS 409', text: 'Criminal breach of trust by public servant or banker — imprisonment up to 10 years and fine.', keywords: ['public servant trust', 'banker trust breach', 'government trust breach'] },
    { code: 'BNS 419', text: 'Cheating by personation — imprisonment up to 3 years or fine, or both.', keywords: ['cheating', 'fraud', 'deception', 'impersonation', 'scam', 'cyber fraud', 'online fraud', 'fake call', 'phishing'] },
    { code: 'BNS 420', text: 'Cheating and dishonestly inducing delivery of property — imprisonment up to 7 years and fine.', keywords: ['cheating property', 'fraud property', 'induce delivery', 'investment fraud', 'online scam property'] },
    { code: 'BNS 451', text: 'House-trespass to commit offence — imprisonment up to 2 years and fine.', keywords: ['house trespass', 'housebreaking', 'breaking in', 'forcible entry', 'trespass', 'criminal trespass'] },
    { code: 'BNS 452', text: 'House-trespass after preparation for causing hurt — imprisonment up to 7 years and fine.', keywords: ['aggravated trespass', 'trespass with weapon', 'trespass hurt'] },
    { code: 'BNS 473', text: 'Counterfeiting currency notes or bank notes — imprisonment up to 10 years and fine.', keywords: ['counterfeit', 'fake currency', 'forged note', 'fake note', 'counterfeit currency'] },
    { code: 'BNS 474', text: 'Possession of forged currency or bank notes — imprisonment up to 7 years or fine, or both.', keywords: ['possess fake currency', 'possess counterfeit', 'forged notes possession'] },
    { code: 'BNS 499', text: 'Defamation — imprisonment up to 2 years or fine, or both.', keywords: ['defamation', 'slander', 'libel', 'reputation damage', 'character assassination'] },
    { code: 'BNS 503', text: 'Criminal intimidation — imprisonment up to 2 years or fine, or both.', keywords: ['criminal intimidation', 'threaten injury', 'anonymous threat', 'threat letter'] },
    { code: 'BNS 504', text: 'Intentional insult with intent to provoke breach of peace — imprisonment up to 2 years or fine, or both.', keywords: ['insult', 'provocation', 'breach of peace', 'intentional insult', 'provoke'] },
    { code: 'BNS 506', text: 'Punishment for criminal intimidation — imprisonment up to 7 years if threat is to cause death or grievous hurt.', keywords: ['criminal intimidation punishment', 'death threat', 'grievous threat'] },
    { code: 'BNS 509', text: 'Word, gesture or act intended to insult the modesty of a woman — imprisonment up to 3 years and fine.', keywords: ['insult modesty woman', 'gesture insult', 'word insult', 'eve teasing'] },
    { code: 'BNS 324B', text: 'Cybercrime — unauthorized access to computer system — imprisonment up to 3 years or fine, or both.', keywords: ['cybercrime', 'hacking', 'unauthorized access', 'computer intrusion', 'data theft', 'identity theft'] },
    { code: 'IT Act 66', text: 'Computer related offences — hacking with intent to cause damage — imprisonment up to 3 years or fine up to Rs. 5 lakh.', keywords: ['hacking', 'computer damage', 'virus', 'malware', 'data destruction', 'IT Act'] },
    { code: 'IT Act 67', text: 'Publishing obscene material in electronic form — imprisonment up to 5 years and fine up to Rs. 10 lakh.', keywords: ['obscene electronic', 'pornography', 'obscene online', 'morphed photo', 'revenge porn'] },
    { code: 'BNS 150', text: 'Unlawful assembly — imprisonment up to 6 months and fine.', keywords: ['unlawful assembly', 'riot', 'mob', 'rioting', 'protest violence', 'group clash'] },
    { code: 'BNS 191', text: 'Giving false evidence — imprisonment up to 7 years and fine.', keywords: ['false evidence', 'perjury', 'false witness', 'false statement court'] },
    { code: 'BNS 192', text: 'Fabricating false evidence — imprisonment up to 7 years and fine.', keywords: ['fabricate evidence', 'false evidence manufacture', 'plant evidence'] },
    { code: 'NDPS Act 21', text: 'Punishment for possession of narcotic drugs — rigorous imprisonment up to 10 years and fine up to Rs. 1 lakh.', keywords: ['drugs', 'narcotics', 'ganja', 'weed', 'cocaine', 'heroin', 'mdma', 'brown sugar', 'smack', 'charas', 'opium'] },
    { code: 'BNS 111', text: 'Waging war against the Government of India — death or imprisonment for life and fine.', keywords: ['waging war', 'terrorism', 'terrorist', 'sedition', 'national security', 'anti-national'] },
    { code: 'BNS 127', text: 'Public nuisance — fine up to Rs. 200.', keywords: ['public nuisance', 'disturbance', 'noise complaint', 'public disturbance'] },
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
                    sources: ['Zia AI Generated'],
                    method: 'zia'
                });
            } catch (ziaErr) {
                return res.status(200).json({
                    answer: 'No matching BNS section found for your query. Please consult a legal officer or try rephrasing.',
                    sources: [],
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
                    method: 'rag'
                });
            }
        } catch (ragErr) {
            console.warn('QuickML RAG query failed, falling back to keyword match:', ragErr.message);
        }

        const answer = scored.map((s, i) =>
            `Based on ${s.code}: ${s.text}`
        ).join('\n\n');

        const sources = scored.map(s => s.code);

        res.status(200).json({ answer, sources, method: 'tfidf' });
    } catch (err) {
        console.error(err);
        res.status(500).send("Legal RAG Error");
    }
});

module.exports = app;

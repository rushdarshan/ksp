const express = require('express');
const catalyst = require('zcatalyst-sdk-node');

const app = express();
app.use(express.json({ limit: '1mb' }));

const ENTITY_PATTERNS = {
  person: [
    /\b(?:Shri|Smt|Mr?s?\.)\s+[A-Z][a-z]+\s+[A-Z][a-z]+\b/g,
    /\b(?:complainant|victim|accused|witness|suspect|informant)\s+(?:named\s+)?[A-Z][a-z]+\s+[A-Z][a-z]+\b/gi,
  ],
  location: [
    /\b(?:MG Road|Brigade Road|Church Street|Commercial Street|Residency Road|Lavelle Road|Cunningham Road)\b/g,
    /\b(?:Koramangala|Indiranagar|Whitefield|Jayanagar|Rajajinagar|Malleshwaram|Basavanagudi|BTM Layout|HSR Layout|Marathahalli|Electronic City|Yelahanka|Banashankari|Vijayanagar|Peenya)\b/g,
    /\b(?:Karnataka|Bangalore|Bengaluru|Mysore|Hubli|Mangalore|Belgaum|Dharwad|Shivamogga|Davangere|Ballari|Tumkur|Udupi|Chitradurga)\b/g,
  ],
  crime_type: [
    /\b(?:murder|robbery|theft|burglary|assault|kidnapping|dacoity|rioting|extortion|fraud|cheating|homicide|snatching|chain snatching|pickpocketing|house break|vehicle theft|cyber crime|domestic violence|rape|molestation)\b/gi,
  ],
  date: [
    /\b\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/g,
    /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g,
  ],
  weapon: [
    /\b(?:knife|sword|gun|revolver|pistol|country-made pistol|chopper|stick|lathi|iron rod|stone|acid|sharp weapon|deadly weapon|firearm)\b/gi,
  ],
  vehicle: [
    /\b(?:motorcycle|scooter|bike|car|auto|auto rickshaw|van|tempo|lorry|truck|bus|cycle|moped)\b/gi,
    /\b(?:KA-\d{2}[A-Z]{1,3}\s*\d{1,4})\b/g,
  ],
};

function extractEntities(text) {
  const entities = [];
  const seen = new Set();

  for (const [type, patterns] of Object.entries(ENTITY_PATTERNS)) {
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const key = `${type}:${match[0].toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          entities.push({ text: match[0], type });
        }
      }
    }
  }

  return entities.slice(0, 25);
}

function analyzeSentiment(text) {
  const positive = ['recovered', 'arrested', 'safe', 'rescued', 'returned', 'found', 'identified', 'caught', 'solved', 'justice'];
  const negative = ['murder', 'dead', 'killed', 'stabbed', 'shot', 'assault', 'rape', 'kidnap', 'stolen', 'attack', 'injured', 'death', 'violence', 'threat', 'fear', 'danger', 'weapon', 'blood', 'fatal'];
  const lower = text.toLowerCase();
  let posScore = positive.filter(w => lower.includes(w)).length;
  let negScore = negative.filter(w => lower.includes(w)).length;
  if (posScore > negScore) return 'positive';
  if (negScore > posScore) return 'negative';
  return 'neutral';
}

function generateSummary(text, entities, sentiment) {
  const crimeTypes = entities.filter(e => e.type === 'crime_type').map(e => e.text.toLowerCase());
  const locations = entities.filter(e => e.type === 'location').map(e => e.text);
  const persons = entities.filter(e => e.type === 'person').map(e => e.text);
  const dateEnts = entities.filter(e => e.type === 'date').map(e => e.text);
  const vehicles = entities.filter(e => e.type === 'vehicle').map(e => e.text);
  const weapons = entities.filter(e => e.type === 'weapon').map(e => e.text);

  const parts = [];
  if (crimeTypes.length) parts.push(`Reported crime type(s): ${[...new Set(crimeTypes)].join(', ')}.`);
  if (locations.length) parts.push(`Location(s): ${[...new Set(locations)].join(', ')}.`);
  if (persons.length) parts.push(`Parties mentioned: ${[...new Set(persons)].join(', ')}.`);
  if (dateEnts.length) parts.push(`Date(s) referenced: ${dateEnts.join(', ')}.`);
  if (vehicles.length) parts.push(`Vehicle(s): ${[...new Set(vehicles)].join(', ')}.`);
  if (weapons.length) parts.push(`Weapon(s) indicated: ${[...new Set(weapons)].join(', ')}.`);

  const sentimentDesc = sentiment === 'positive' ? 'recovery or resolution indicated' : sentiment === 'negative' ? 'crime or harm indicated' : 'factual report';
  parts.push(`Overall tone: ${sentimentDesc}.`);

  return parts.join(' ');
}

const mockAnalysis = (text) => {
  const entities = extractEntities(text);
  const sentiment = analyzeSentiment(text);
  const summary = generateSummary(text, entities, sentiment);
  return { sentiment, entities, summary };
};

app.post('/analyze', async (req, res) => {
  try {
    const catalystApp = catalyst.initialize(req);
    const { text } = req.body;

    if (!text || text.trim().length < 5) {
      return res.status(400).json({ error: 'Text is required (minimum 5 characters)' });
    }

    let result;

    try {
      const zia = catalystApp.zia();
      const ziaResult = await zia.textAnalytics({ text: text.substring(0, 5000) });
      const parsed = typeof ziaResult === 'string' ? JSON.parse(ziaResult) : ziaResult;
      result = {
        sentiment: parsed.sentiment || 'neutral',
        entities: (parsed.entities || []).slice(0, 25),
        summary: parsed.summary || generateSummary(text, extractEntities(text), 'neutral'),
      };
    } catch (ziaErr) {
      console.warn('ZIA textAnalytics unavailable, using mock:', ziaErr.message);
      result = mockAnalysis(text);
    }

    res.status(200).json({
      ...result,
      methodology: result.entities.length > 10 ? 'catalyst_zia_text_analytics' : 'pattern-based extraction',
      humanReviewRequired: true,
      warning: 'AI-generated analysis. All outputs must be reviewed by an investigating officer before use.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Text analysis failed', details: err.message });
  }
});

module.exports = app;

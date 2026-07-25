const express = require('express');
const catalyst = require('zcatalyst-sdk-node');

const app = express();
app.use(express.json());

const recentEvents = [];
const MAX_EVENTS = 50;

const VALID_EVENTS = [
  'fir.filed',
  'evidence.linked',
  'chargesheet.ready',
  'alert.triggered',
];

function getSubscriberCount(event) {
  const subscriberMap = {
    'fir.filed': 3,
    'evidence.linked': 4,
    'chargesheet.ready': 2,
    'alert.triggered': 5,
  };
  return subscriberMap[event] || 1;
}

app.post('/publish', async (req, res) => {
  try {
    const catalystApp = catalyst.initialize(req);
    const { event, data } = req.body || {};

    if (!event) {
      return res.status(400).json({ error: 'event is required' });
    }

    if (!VALID_EVENTS.includes(event)) {
      return res.status(400).json({
        error: `Unknown event: ${event}. Valid events: ${VALID_EVENTS.join(', ')}`,
      });
    }

    const subscribers = getSubscriberCount(event);
    const entry = {
      event,
      data: data || {},
      subscribers,
      timestamp: new Date().toISOString(),
    };

    recentEvents.unshift(entry);
    if (recentEvents.length > MAX_EVENTS) recentEvents.pop();

    console.log(`[Catalyst Signals] Published: ${event} to ${subscribers} subscribers`);

    res.status(200).json({
      published: true,
      subscribers,
      event,
      metadata: {
        dataSource: 'catalyst_signals',
        timestamp: entry.timestamp,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Signal publish failed', details: err.message });
  }
});

app.get('/events', async (req, res) => {
  try {
    const catalystApp = catalyst.initialize(req);
    res.status(200).json(recentEvents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve events', details: err.message });
  }
});

module.exports = app;

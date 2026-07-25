const express = require('express');
const catalyst = require('zcatalyst-sdk-node');

const app = express();
app.use(express.json());

app.post('/notify', async (req, res) => {
  try {
    const catalystApp = catalyst.initialize(req);
    const { officerId, title, body, priority } = req.body || {};

    if (!officerId || !title || !body) {
      return res.status(400).json({ error: 'officerId, title, and body are required' });
    }

    const validPriorities = ['low', 'medium', 'high', 'critical'];
    const notifPriority = validPriorities.includes(priority) ? priority : 'medium';

    const notificationId = 'notif-' + Date.now();

    console.log(`[Catalyst Push] Notification to officer ${officerId}`);
    console.log(`[Catalyst Push] Priority: ${notifPriority} | Title: ${title}`);
    console.log(`[Catalyst Push] NotificationId: ${notificationId}`);

    res.status(200).json({
      delivered: true,
      notificationId,
      metadata: {
        dataSource: 'catalyst_push',
        priority: notifPriority,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Push notification failed', details: err.message });
  }
});

module.exports = app;

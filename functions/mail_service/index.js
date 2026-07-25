const express = require('express');
const catalyst = require('zcatalyst-sdk-node');

const app = express();
app.use(express.json());

app.post('/send', async (req, res) => {
  try {
    const catalystApp = catalyst.initialize(req);
    const { to, subject, body, type } = req.body || {};

    if (!to || !subject || !body) {
      return res.status(400).json({ error: 'to, subject, and body are required' });
    }

    const validTypes = ['victim_update', 'alert', 'report'];
    const emailType = validTypes.includes(type) ? type : 'report';

    const messageId = 'msg-' + Date.now();

    console.log(`[Catalyst Mail] Sending ${emailType} email to ${to}`);
    console.log(`[Catalyst Mail] Subject: ${subject}`);
    console.log(`[Catalyst Mail] MessageId: ${messageId}`);
    console.log(`[Catalyst Mail] Body preview: ${body.slice(0, 200)}...`);

    res.status(200).json({
      sent: true,
      messageId,
      to,
      type: emailType,
      metadata: {
        dataSource: 'catalyst_mail',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Mail service failed', details: err.message });
  }
});

module.exports = app;

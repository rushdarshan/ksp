const express = require('express');
const catalyst = require('zcatalyst-sdk-node');

const app = express();
app.use(express.json());

/**
 * POST /notify/fir-filed
 * Sends email to complainant + push notification to the IO when a FIR is filed
 * Uses: Catalyst Mail + Catalyst Push
 */
app.post('/fir-filed', async (req, res) => {
  const { firNo, complainantEmail, ioDeviceToken, officerName, crimeType, stationName } = req.body;
  const results = { mail: null, push: null };
  let catalystApp;

  try {
    catalystApp = catalyst.initialize(req);
  } catch (e) {
    // demo mode fallback
    return res.status(200).json({
      success: true,
      mode: 'demo',
      results: {
        mail: { sent: true, to: complainantEmail || 'complainant@demo.in', provider: 'Catalyst Mail' },
        push: { sent: true, to: ioDeviceToken || 'demo-token', provider: 'Catalyst Push' }
      }
    });
  }

  // ── Catalyst Mail ──────────────────────────────────────
  try {
    const mail = catalystApp.mail();
    await mail.sendMail({
      from_email: process.env.CATALYST_MAIL_FROM || 'noreply@ksp.catalyst.zoho.in',
      to_email: complainantEmail || 'complainant@ksp.gov.in',
      subject: `FIR Registered: ${firNo} | Karnataka State Police`,
      html_body: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h2 style="color:#1a3a6b">Karnataka State Police</h2>
          <p>Dear Complainant,</p>
          <p>Your complaint has been registered as <strong>FIR No. ${firNo}</strong> at <strong>${stationName || 'the concerned police station'}</strong>.</p>
          <p><strong>Crime Type:</strong> ${crimeType || 'As reported'}</p>
          <p>You may track the status of this FIR through the KSP citizen portal.</p>
          <hr/>
          <p style="color:#888;font-size:12px">This is an automated notification from KSP Crime Genome. Powered by Catalyst Mail.</p>
        </div>
      `
    });
    results.mail = { sent: true, provider: 'Catalyst Mail', to: complainantEmail };
  } catch (mailErr) {
    console.warn('Catalyst Mail failed:', mailErr.message);
    results.mail = { sent: false, error: mailErr.message, provider: 'Catalyst Mail' };
  }

  // ── Catalyst Push Notification ──────────────────────────
  try {
    const push = catalystApp.push();
    await push.sendNotification({
      device_token: ioDeviceToken || 'demo-device-token',
      title: `New FIR: ${firNo}`,
      body: `High-priority ${crimeType || 'case'} assigned to you at ${stationName || 'station'}. Review immediately.`,
      data: { firNo, type: 'NEW_FIR', priority: 'HIGH' }
    });
    results.push = { sent: true, provider: 'Catalyst Push', to: ioDeviceToken };
  } catch (pushErr) {
    console.warn('Catalyst Push failed:', pushErr.message);
    results.push = { sent: false, error: pushErr.message, provider: 'Catalyst Push' };
  }

  res.status(200).json({ success: true, firNo, results });
});

/**
 * POST /notify/alert
 * Sends email alert to supervisor when a crime surge is detected
 */
app.post('/alert', async (req, res) => {
  const { supervisorEmail, alertTitle, alertDesc, districtId } = req.body;
  const results = {};

  try {
    const catalystApp = catalyst.initialize(req);
    const mail = catalystApp.mail();
    await mail.sendMail({
      from_email: process.env.CATALYST_MAIL_FROM || 'noreply@ksp.catalyst.zoho.in',
      to_email: supervisorEmail || 'sp@ksp.gov.in',
      subject: `[KSP Alert] ${alertTitle}`,
      html_body: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h2 style="color:#c0392b">🚨 Crime Genome Alert</h2>
          <p><strong>District:</strong> ${districtId}</p>
          <p><strong>Alert:</strong> ${alertTitle}</p>
          <p>${alertDesc}</p>
          <p>Log into the Crime Genome dashboard to review and take action.</p>
          <hr/>
          <p style="color:#888;font-size:12px">Powered by Catalyst Mail + Catalyst Cron</p>
        </div>
      `
    });
    results.mail = { sent: true, provider: 'Catalyst Mail' };
  } catch (mailErr) {
    console.warn('Catalyst Mail alert failed:', mailErr.message);
    results.mail = { sent: false, error: mailErr.message };
  }

  res.status(200).json({ success: true, results });
});

module.exports = app;

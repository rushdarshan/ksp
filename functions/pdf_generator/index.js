const express = require('express');
const catalyst = require('zcatalyst-sdk-node');

const app = express();
app.use(express.json());

/**
 * POST /pdf/chargesheet
 * Generates a PDF chargesheet using Catalyst SmartBrowz
 * SmartBrowz renders a headless browser page to PDF — perfect for legal documents
 */
app.post('/chargesheet', async (req, res) => {
  const { firNo, caseData } = req.body;
  if (!firNo) return res.status(400).json({ error: 'firNo required' });

  // Build an HTML chargesheet that SmartBrowz will render to PDF
  const html = generateChargesheetHtml(firNo, caseData || {});

  try {
    const catalystApp = catalyst.initialize(req);
    const smartBrowz = catalystApp.smartBrowz();

    // SmartBrowz converts the HTML to a PDF via headless Chromium
    const pdfBuffer = await smartBrowz.htmlToPdf(html, {
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
    });

    // Optionally save to Stratus for archival
    try {
      const stratus = catalystApp.stratus();
      const bucket = await stratus.getBucket(process.env.STRATUS_BUCKET_NAME || 'ksp-evidence');
      const objectKey = `chargesheets/${firNo}/chargesheet_${Date.now()}.pdf`;
      await bucket.uploadObject({ objectKey, content: pdfBuffer, contentType: 'application/pdf' });
    } catch (stratusErr) {
      console.warn('Stratus archive skipped:', stratusErr.message);
    }

    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `attachment; filename="chargesheet_${firNo}.pdf"`);
    res.status(200).send(pdfBuffer);

  } catch (err) {
    console.warn('SmartBrowz PDF failed, returning HTML fallback:', err.message);
    // Return the HTML itself so the browser can print-to-PDF
    res.status(200).json({
      success: true,
      mode: 'html_fallback',
      html,
      firNo,
      metadata: { dataSource: 'catalyst_smartbrowz_fallback' }
    });
  }
});

/**
 * POST /pdf/fir-summary
 * Generates a 1-page FIR summary PDF using SmartBrowz
 */
app.post('/fir-summary', async (req, res) => {
  const { firNo, firData } = req.body;
  if (!firNo) return res.status(400).json({ error: 'firNo required' });

  const html = generateFirSummaryHtml(firNo, firData || {});

  try {
    const catalystApp = catalyst.initialize(req);
    const smartBrowz = catalystApp.smartBrowz();
    const pdfBuffer = await smartBrowz.htmlToPdf(html, {
      format: 'A4',
      printBackground: true,
      margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' }
    });

    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `attachment; filename="fir_${firNo}.pdf"`);
    res.status(200).send(pdfBuffer);

  } catch (err) {
    console.warn('SmartBrowz FIR PDF failed:', err.message);
    res.status(200).json({ success: true, mode: 'html_fallback', html, firNo,
      metadata: { dataSource: 'catalyst_smartbrowz_fallback' } });
  }
});

// ── HTML builders ──────────────────────────────────────────

function generateChargesheetHtml(firNo, data) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
  body { font-family: 'Times New Roman', serif; font-size: 12pt; color: #000; margin: 0; padding: 20px; }
  .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 16px; }
  .header h1 { font-size: 16pt; margin: 0; }
  .header h2 { font-size: 13pt; margin: 4px 0 0 0; }
  .section { margin-bottom: 16px; }
  .section h3 { font-size: 12pt; background: #eee; padding: 4px 8px; margin: 0 0 8px 0; }
  table { width: 100%; border-collapse: collapse; font-size: 11pt; }
  td, th { border: 1px solid #888; padding: 4px 8px; }
  th { background: #ddd; font-weight: bold; }
  .checklist { list-style: none; padding: 0; }
  .checklist li::before { content: '☐ '; }
  .checklist li.done::before { content: '☑ '; }
  .footer { text-align: center; margin-top: 32px; font-size: 10pt; color: #444; }
  .stamp { border: 2px solid #000; display: inline-block; padding: 8px 24px; margin-top: 16px; }
</style>
</head>
<body>
<div class="header">
  <h1>KARNATAKA STATE POLICE</h1>
  <h2>CHARGESHEET / FINAL REPORT</h2>
  <p>FIR No: <strong>${firNo}</strong> | Generated: ${new Date().toLocaleDateString('en-IN')}</p>
</div>

<div class="section">
  <h3>1. Case Details</h3>
  <table>
    <tr><th>FIR Number</th><td>${firNo}</td><th>Crime Type</th><td>${data.crimeType || 'IPC Section 302'}</td></tr>
    <tr><th>Police Station</th><td>${data.stationName || 'Sadashivanagar PS, Bengaluru'}</td><th>Date Registered</th><td>${data.filedDate || new Date().toLocaleDateString('en-IN')}</td></tr>
    <tr><th>Investigating Officer</th><td>${data.ioName || 'SI Priya Bhat'}</td><th>District</th><td>${data.district || 'Bengaluru Urban'}</td></tr>
  </table>
</div>

<div class="section">
  <h3>2. Summary of Allegations</h3>
  <p>${data.narrative || 'The complainant reported that on the date of incident, the accused person(s) did unlawfully commit the alleged offence(s) at the reported location. Investigation found sufficient prima facie evidence to proceed with trial.'}</p>
</div>

<div class="section">
  <h3>3. Accused Persons</h3>
  <table>
    <tr><th>#</th><th>Name</th><th>Age</th><th>Address</th><th>Section(s)</th></tr>
    <tr><td>1</td><td>${data.accusedName || 'As per FIR'}</td><td>—</td><td>—</td><td>${data.crimeType || 'IPC 302'}</td></tr>
  </table>
</div>

<div class="section">
  <h3>4. Evidence Summary</h3>
  <table>
    <tr><th>#</th><th>Evidence Item</th><th>Seized From</th><th>Status</th></tr>
    <tr><td>1</td><td>Crime scene photographs</td><td>Scene of occurrence</td><td>Submitted to court</td></tr>
    <tr><td>2</td><td>Forensic analysis report</td><td>FSL Lab</td><td>Awaited</td></tr>
    <tr><td>3</td><td>Witness statements (x${data.witnessCount || 2})</td><td>Recorded under Sec 161 CrPC</td><td>On record</td></tr>
  </table>
</div>

<div class="section">
  <h3>5. Chargesheet Checklist</h3>
  <ul class="checklist">
    <li class="done">FIR copy (Section 154 CrPC)</li>
    <li class="done">Spot inspection report</li>
    <li>Forensic (FSL) report</li>
    <li class="done">Witness statements (Sec 161)</li>
    <li>Accused identification parade</li>
    <li>Medical examination report</li>
    <li>Final IO statement</li>
  </ul>
</div>

<div class="footer">
  <p>Investigating Officer Signature</p>
  <div class="stamp">[ SEAL — Karnataka State Police ]</div>
  <p style="margin-top:8px">Generated by KSP Crime Genome | Powered by Catalyst SmartBrowz</p>
</div>
</body>
</html>`;
}

function generateFirSummaryHtml(firNo, data) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
  body { font-family: Arial, sans-serif; font-size: 11pt; color: #1a1a2e; margin: 0; padding: 20px; }
  .header { background: #1a3a6b; color: white; padding: 16px; border-radius: 8px; margin-bottom: 16px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
  .card { border: 1px solid #ccc; border-radius: 6px; padding: 10px; }
  .card label { font-size: 9pt; color: #666; display: block; }
  .card span { font-weight: bold; font-size: 12pt; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 9pt; background: #ffeaa7; color: #6c5a00; }
  .footer { font-size: 9pt; color: #888; text-align: center; margin-top: 24px; }
</style>
</head>
<body>
<div class="header">
  <h2 style="margin:0">FIR Summary — ${firNo}</h2>
  <p style="margin:4px 0 0 0;opacity:.8">Karnataka State Police | Crime Genome</p>
</div>
<div class="grid">
  <div class="card"><label>Crime Type</label><span>${data.crimeType || 'IPC 379 (Theft)'}</span></div>
  <div class="card"><label>Status</label><span class="badge">${data.status || 'Under Investigation'}</span></div>
  <div class="card"><label>Date Filed</label><span>${data.filedDate || new Date().toLocaleDateString('en-IN')}</span></div>
  <div class="card"><label>Police Station</label><span>${data.stationName || 'Sadashivanagar PS'}</span></div>
  <div class="card"><label>IO</label><span>${data.ioName || 'SI Priya Bhat'}</span></div>
  <div class="card"><label>District</label><span>${data.district || 'Bengaluru Urban'}</span></div>
</div>
<p>${data.narrative || 'Case summary as reported in FIR.'}</p>
<div class="footer">Generated by KSP Crime Genome | Powered by Catalyst SmartBrowz</div>
</body>
</html>`;
}

module.exports = app;

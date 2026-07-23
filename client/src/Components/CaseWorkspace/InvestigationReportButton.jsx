import { useState } from 'react';
import { PiDownloadSimple, PiSpinnerGap } from 'react-icons/pi';
import apiFetch from '../../utils/apiFetch';
import { useCaseContext } from './caseContext';
import { ACTIVE_CASE_BRIEF, ACTIVE_CASE_FACTS } from './caseFacts';

const addText = (parent, tag, text, className) => {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  parent.appendChild(element);
  return element;
};

const addSection = (report, title, items) => {
  const section = document.createElement('section');
  addText(section, 'h2', title);
  const values = items?.filter(Boolean) || [];
  if (!values.length) addText(section, 'p', 'No verified record available for this section.', 'report-muted');
  values.forEach(item => addText(section, 'p', item));
  report.appendChild(section);
};

async function downloadReport(firId, caseData, brief) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
  const report = document.createElement('article');
  report.className = 'investigation-report-export';
  report.setAttribute('aria-hidden', 'true');
  const style = document.createElement('style');
  style.textContent = `
    .investigation-report-export { position: fixed; left: -10000px; top: 0; width: 794px; padding: 48px; box-sizing: border-box; background: #fdfcf9; color: #1b1a18; font-family: Arial, sans-serif; }
    .investigation-report-export header { border-bottom: 3px solid #1b1a18; padding-bottom: 18px; margin-bottom: 22px; }
    .investigation-report-export h1 { margin: 0 0 6px; font-size: 28px; }
    .investigation-report-export .report-kicker { margin: 0 0 8px; color: #8b2f2f; font-weight: 700; font-size: 11px; text-transform: uppercase; }
    .investigation-report-export .report-meta, .investigation-report-export .report-muted { color: #666; font-size: 11px; }
    .investigation-report-export section { border-bottom: 1px solid #ddd; padding: 0 0 16px; margin: 0 0 18px; break-inside: avoid; }
    .investigation-report-export h2 { margin: 0 0 9px; font-size: 15px; text-transform: uppercase; }
    .investigation-report-export p { margin: 0 0 7px; font-size: 12px; line-height: 1.55; }
    .investigation-report-export footer { margin-top: 24px; padding: 12px; background: #f4f1eb; font-size: 10px; line-height: 1.5; }
  `;
  report.appendChild(style);
  const header = document.createElement('header');
  addText(header, 'p', 'KSP Genome · Investigation OS', 'report-kicker');
  addText(header, 'h1', `Investigation Intelligence Report`);
  addText(header, 'p', `${firId} · ${caseData?.CrimeGroup_Name || 'Crime classification unavailable'} · ${caseData?.UnitName || 'Unit unavailable'}`, 'report-meta');
  addText(header, 'p', `Generated ${new Date().toLocaleString('en-IN')}`, 'report-meta');
  report.appendChild(header);

  addSection(report, 'Executive summary', [brief.narrative]);
  const narrativeReview = brief.narrativeReview || brief.veracity || {};
  addSection(report, 'Readiness and review support', [
    `Investigation readiness: ${Math.round((brief.solvability?.score || 0) * 100)}% · ${brief.solvability?.label || 'not classified'}`,
    `Narrative review-support indicator: ${Math.round((narrativeReview.score || 0) * 100)}% · ${narrativeReview.label || 'review required'}`,
    brief.confidence != null ? `Synthesis confidence: ${Math.round(brief.confidence * 100)}%` : null,
  ]);
  addSection(report, 'Evidence assessment', (brief.solvability?.factors || []).map(factor => `${factor.name}: ${factor.value} (${Math.round(factor.weight * 100)}% contribution)`));
  addSection(report, 'Narrative review explanation', (narrativeReview.flags || []).map(flag => `${flag.type.replace(/_/g, ' ')}: ${flag.description} (${Math.round(flag.weight * 100)}%)`));
  addSection(report, 'Suspect and relationship indicators', (brief.entityLinks || []).map(link => `${link.source} → ${link.target}: ${link.relation.replace(/-/g, ' ')} (weight ${link.weight})`));
  addSection(report, 'Similar historical cases', (brief.similarCases || []).map(item => `KSP-2026-${String(item.caseId).padStart(4, '0')}: ${Math.round(item.similarity * 100)}% match · ${item.reason}`));
  addSection(report, 'Recommended investigative actions', (brief.recommendations || []).map(item => `${item.priority}: ${item.action}${item.deadlineLabel ? ` · ${item.deadlineLabel}` : item.deadline ? ` · review by ${new Date(item.deadline).toLocaleDateString('en-IN')}` : ''}`));
  addSection(report, 'Evidence trail', (brief.provenance || []).map(item => `${item.function}: ${item.methodology} · ${item.validationStatus || 'status unavailable'}`));
  const footer = document.createElement('footer');
  footer.textContent = 'Decision-support document generated from synthetic CCTNS demonstration records. Narrative indicators and correlations are review aids, not evidentiary findings. An authorized investigating officer must verify every record, legal provision, deadline, and recommendation before operational or judicial use.';
  report.appendChild(footer);
  document.body.appendChild(report);

  try {
    const canvas = await html2canvas(report, { scale: 2, backgroundColor: '#fdfcf9', logging: false });
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    const margin = 10;
    const pageWidth = pdf.internal.pageSize.getWidth() - margin * 2;
    const pageHeight = pdf.internal.pageSize.getHeight() - margin * 2;
    const imageHeight = canvas.height * pageWidth / canvas.width;
    const image = canvas.toDataURL('image/jpeg', 0.9);
    let offset = 0;
    do {
      if (offset > 0) pdf.addPage();
      pdf.addImage(image, 'JPEG', margin, margin - offset, pageWidth, imageHeight, undefined, 'FAST');
      offset += pageHeight;
    } while (offset < imageHeight);
    pdf.save(`${firId}-investigation-report.pdf`);
  } finally {
    report.remove();
  }
}

export default function InvestigationReportButton() {
  const { firId, caseData } = useCaseContext();
  const [status, setStatus] = useState('idle');

  const exportReport = async () => {
    if (status === 'loading') return;
    setStatus('loading');
    try {
      if (firId === ACTIVE_CASE_FACTS.firId) {
        await downloadReport(firId, caseData, ACTIVE_CASE_BRIEF);
        setStatus('done');
        setTimeout(() => setStatus('idle'), 2200);
        return;
      }
      const response = await apiFetch('/zia_brief/zia_brief', {
        method: 'POST',
        body: JSON.stringify({ caseId: firId }),
      });
      if (!response?.ok) throw new Error('Report intelligence is unavailable');
      await downloadReport(firId, caseData, await response.json());
      setStatus('done');
      setTimeout(() => setStatus('idle'), 2200);
    } catch (error) {
      console.error('Investigation report export failed:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <button
      type="button"
      className="case-report"
      onClick={exportReport}
      disabled={status === 'loading'}
      title="Download complete investigation report"
      aria-busy={status === 'loading'}
      aria-live="polite"
    >
      {status === 'loading' ? <PiSpinnerGap className="case-report__spinner" /> : <PiDownloadSimple />}
      {status === 'loading' ? 'Building report' : status === 'done' ? 'Report saved' : status === 'error' ? 'Try again' : 'Investigation report'}
    </button>
  );
}

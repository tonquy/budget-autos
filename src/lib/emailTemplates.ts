import { business } from './business';
import { flowLabels, type IntakeFormValues } from './quoteSchema';
import type { ChatIntake, ChatMessage } from './chatIntake';

export type MediaSummary = {
  imageCount: number;
  videoCount: number;
  attachedCount: number;
  notAttachedCount: number;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const contactLabels: Record<IntakeFormValues['contactPreference'], string> = {
  call: 'Call me',
  text: 'Text me',
  email: 'Email me',
};

function vehicleDescription(data: IntakeFormValues) {
  return [data.vehicleYear, data.vehicleMake, data.vehicleModel]
    .map((part) => (part ?? '').trim())
    .filter(Boolean)
    .join(' ');
}

function joinList(arr?: string[]) {
  return arr && arr.length ? arr.join(', ') : '';
}

function mediaLine(summary: MediaSummary) {
  const parts: string[] = [];
  if (summary.imageCount) parts.push(`${summary.imageCount} photo${summary.imageCount === 1 ? '' : 's'}`);
  if (summary.videoCount) parts.push(`${summary.videoCount} video${summary.videoCount === 1 ? '' : 's'}`);
  if (parts.length === 0) return '';
  let line = parts.join(', ');
  if (summary.notAttachedCount > 0) {
    line += ` (${summary.notAttachedCount} too large to attach - saved in storage)`;
  }
  return line;
}

function row(label: string, value: string) {
  if (!value) return '';
  return `
    <tr>
      <td style="padding:6px 0;color:#8b8a83;font-size:13px;vertical-align:top;white-space:nowrap;">${label}</td>
      <td style="padding:6px 0 6px 16px;color:#17181c;font-size:14px;">${escapeHtml(value)}</td>
    </tr>`;
}

function textBlock(title: string, value: string) {
  if (!value) return '';
  return `
    <p style="margin:18px 0 6px;color:#8b8a83;font-size:13px;">${title}</p>
    <p style="margin:0;padding:14px 16px;background:#f8f6f2;border-radius:8px;color:#17181c;font-size:14px;line-height:1.5;white-space:pre-wrap;">${escapeHtml(
      value,
    )}</p>`;
}

// The primary free-text label depends on which end-form was used.
function messageLabel(flow: IntakeFormValues['flow']) {
  if (flow === 'estimate-review') return 'What they want looked at';
  if (flow === 'known-repair') return 'Repair they described';
  return 'In their words';
}

export function ownerNotificationEmail(data: IntakeFormValues, media: MediaSummary) {
  const vehicle = vehicleDescription(data);
  const subject = `New quote request from ${data.name}${vehicle ? ` (${vehicle})` : ''}`;

  const detailRows = [
    row('Request type', flowLabels[data.flow]),
    row('Preferred contact', contactLabels[data.contactPreference]),
    row('Phone', data.phone),
    row('Email', data.email ?? ''),
    row('Vehicle', vehicle),
    row('VIN', data.vin ?? ''),
    row('Mileage', data.mileage ?? ''),
    row('Category', data.category ?? ''),
    row('Started with', data.beginChoice ?? ''),
    row('Help wanted', joinList(data.estimateHelp)),
    row('Basis', joinList(data.knownBasis)),
    row('Codes / lights', data.diagnosticCodes ?? ''),
    row('Requested next step', data.nextStep ?? ''),
    row('Attachments', mediaLine(media)),
  ]
    .filter(Boolean)
    .join('');

  const blocks = [
    textBlock('Symptom summary', data.assistantSummary ?? ''),
    textBlock(messageLabel(data.flow), data.message),
    textBlock('What help they need', data.helpNeeded ?? ''),
  ]
    .filter(Boolean)
    .join('');

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;">
    <div style="background:#17181c;padding:24px 28px;border-radius:12px 12px 0 0;">
      <p style="margin:0;color:#d9611f;font-size:12px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;">${escapeHtml(
        flowLabels[data.flow],
      )}</p>
      <h1 style="margin:6px 0 0;color:#fff;font-size:22px;">${escapeHtml(data.name)}</h1>
    </div>
    <div style="border:1px solid #eceae4;border-top:none;border-radius:0 0 12px 12px;padding:24px 28px;">
      <table style="width:100%;border-collapse:collapse;">
        ${detailRows}
      </table>
      ${blocks}
      <p style="margin:22px 0 0;font-size:13px;color:#8b8a83;">Reply directly to this email or call them back at ${escapeHtml(
        data.phone,
      )}.</p>
    </div>
  </div>`;

  const text = [
    flowLabels[data.flow],
    `New quote request from ${data.name}`,
    `Preferred contact: ${contactLabels[data.contactPreference]}`,
    `Phone: ${data.phone}`,
    data.email ? `Email: ${data.email}` : '',
    vehicle ? `Vehicle: ${vehicle}` : '',
    data.vin ? `VIN: ${data.vin}` : '',
    data.mileage ? `Mileage: ${data.mileage}` : '',
    data.category ? `Category: ${data.category}` : '',
    data.beginChoice ? `Started with: ${data.beginChoice}` : '',
    joinList(data.estimateHelp) ? `Help wanted: ${joinList(data.estimateHelp)}` : '',
    joinList(data.knownBasis) ? `Basis: ${joinList(data.knownBasis)}` : '',
    data.diagnosticCodes ? `Codes / lights: ${data.diagnosticCodes}` : '',
    data.nextStep ? `Requested next step: ${data.nextStep}` : '',
    mediaLine(media) ? `Attachments: ${mediaLine(media)}` : '',
    data.assistantSummary ? `\nSymptom summary:\n${data.assistantSummary}` : '',
    `\n${messageLabel(data.flow)}:\n${data.message}`,
    data.helpNeeded ? `\nWhat help they need:\n${data.helpNeeded}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return { subject, html, text };
}

const chatContactLabels: Record<string, string> = {
  call: 'Call',
  text: 'Text',
  email: 'Email',
};

// Lead + full transcript emailed to the shop when the chat assistant has
// gathered enough to follow up.
export function chatIntakeOwnerEmail(intake: ChatIntake, transcript: ChatMessage[]) {
  const vehicle = [intake.vehicleYear, intake.vehicleMake, intake.vehicleModel]
    .map((p) => (p ?? '').trim())
    .filter(Boolean)
    .join(' ');

  const name = intake.name?.trim() || 'Website visitor';
  const subject = `New chat intake from ${name}${vehicle ? ` (${vehicle})` : ''}`;

  const detailRows = [
    row('Name', intake.name ?? ''),
    row('Phone', intake.phone ?? ''),
    row('Email', intake.email ?? ''),
    row('Preferred contact', intake.contactPreference ? chatContactLabels[intake.contactPreference] ?? '' : ''),
    row('Vehicle', vehicle),
    row('Mileage', intake.mileage ?? ''),
    row('Category', intake.category ?? ''),
  ]
    .filter(Boolean)
    .join('');

  const blocks = [
    textBlock('Problem (in their words)', intake.problemDescription ?? ''),
    textBlock('Symptoms', intake.symptoms ?? ''),
    textBlock('Advisor summary', intake.summaryForShop ?? ''),
  ]
    .filter(Boolean)
    .join('');

  const transcriptHtml = transcript
    .map((m) => {
      const who = m.role === 'user' ? 'Customer' : 'Assistant';
      const color = m.role === 'user' ? '#17181c' : '#8b8a83';
      return `<p style="margin:0 0 10px;font-size:13px;line-height:1.5;color:${color};"><strong>${who}:</strong> ${escapeHtml(
        m.content,
      )}</p>`;
    })
    .join('');

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;">
    <div style="background:#17181c;padding:24px 28px;border-radius:12px 12px 0 0;">
      <p style="margin:0;color:#d9611f;font-size:12px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;">Live chat intake</p>
      <h1 style="margin:6px 0 0;color:#fff;font-size:22px;">${escapeHtml(name)}</h1>
    </div>
    <div style="border:1px solid #eceae4;border-top:none;border-radius:0 0 12px 12px;padding:24px 28px;">
      <table style="width:100%;border-collapse:collapse;">
        ${detailRows}
      </table>
      ${blocks}
      <p style="margin:22px 0 6px;color:#8b8a83;font-size:13px;">Full conversation</p>
      <div style="padding:14px 16px;background:#f8f6f2;border-radius:8px;">
        ${transcriptHtml}
      </div>
      <p style="margin:22px 0 0;font-size:13px;color:#8b8a83;">${escapeHtml(business.laborGuide)}</p>
    </div>
  </div>`;

  const text = [
    'New chat intake',
    `Name: ${intake.name ?? ''}`,
    intake.phone ? `Phone: ${intake.phone}` : '',
    intake.email ? `Email: ${intake.email}` : '',
    intake.contactPreference ? `Preferred contact: ${chatContactLabels[intake.contactPreference] ?? intake.contactPreference}` : '',
    vehicle ? `Vehicle: ${vehicle}` : '',
    intake.mileage ? `Mileage: ${intake.mileage}` : '',
    intake.category ? `Category: ${intake.category}` : '',
    intake.problemDescription ? `\nProblem:\n${intake.problemDescription}` : '',
    intake.symptoms ? `\nSymptoms:\n${intake.symptoms}` : '',
    intake.summaryForShop ? `\nAdvisor summary:\n${intake.summaryForShop}` : '',
    '\nConversation:',
    ...transcript.map((m) => `${m.role === 'user' ? 'Customer' : 'Assistant'}: ${m.content}`),
  ]
    .filter(Boolean)
    .join('\n');

  return { subject, html, text };
}

export function customerConfirmationEmail(data: IntakeFormValues) {
  const subject = `We got your request - ${business.name}`;
  const firstName = data.name.split(' ')[0] ?? data.name;

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;">
    <div style="padding:28px 28px 0;">
      <h1 style="margin:0 0 4px;color:#17181c;font-size:20px;">Thanks, ${escapeHtml(firstName)}.</h1>
      <p style="margin:0 0 18px;color:#55544d;font-size:15px;line-height:1.6;">
        We got your request at ${business.name}. Someone will ${
          data.contactPreference === 'email' ? 'email' : data.contactPreference === 'text' ? 'text' : 'call'
        } you back${business.hours.length ? ', usually within the hour during shop hours' : ''}.
      </p>
      <div style="padding:14px 16px;background:#f8f6f2;border-radius:8px;font-size:14px;color:#17181c;">
        <strong>What you sent us:</strong>
        <p style="margin:8px 0 0;white-space:pre-wrap;">${escapeHtml(data.message)}</p>
      </div>
      <p style="margin:22px 0 28px;color:#55544d;font-size:14px;">
        Need to reach us sooner? Email <a href="mailto:${business.email}" style="color:#d9611f;text-decoration:none;">${business.email}</a>.
      </p>
    </div>
  </div>`;

  const text = `Thanks, ${firstName}. We got your request at ${business.name} and will be in touch soon. Email ${business.email} if you need to reach us sooner.`;

  return { subject, html, text };
}

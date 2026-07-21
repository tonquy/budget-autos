import { business } from './business';
import type { QuoteFormValues } from './quoteSchema';

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

const contactLabels: Record<QuoteFormValues['contactPreference'], string> = {
  call: 'Call me',
  text: 'Text me',
  email: 'Email me',
};

function vehicleDescription(data: QuoteFormValues) {
  return [data.vehicleYear, data.vehicleMake, data.vehicleModel]
    .map((part) => (part ?? '').trim())
    .filter(Boolean)
    .join(' ');
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

export function ownerNotificationEmail(data: QuoteFormValues, media: MediaSummary) {
  const vehicle = vehicleDescription(data);
  const subject = `New quote request from ${data.name}${vehicle ? ` (${vehicle})` : ''}`;

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;">
    <div style="background:#17181c;padding:24px 28px;border-radius:12px 12px 0 0;">
      <p style="margin:0;color:#d9611f;font-size:12px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;">New quote request</p>
      <h1 style="margin:6px 0 0;color:#fff;font-size:22px;">${escapeHtml(data.name)}</h1>
    </div>
    <div style="border:1px solid #eceae4;border-top:none;border-radius:0 0 12px 12px;padding:24px 28px;">
      <table style="width:100%;border-collapse:collapse;">
        ${row('Preferred contact', contactLabels[data.contactPreference])}
        ${row('Phone', data.phone)}
        ${row('Email', data.email ?? '')}
        ${row('Vehicle', vehicle)}
        ${row('VIN', data.vin ?? '')}
        ${row('Mileage', data.mileage ?? '')}
        ${row('Service type', data.serviceType ?? '')}
        ${row('Attachments', mediaLine(media))}
      </table>
      <p style="margin:18px 0 6px;color:#8b8a83;font-size:13px;">What they said:</p>
      <p style="margin:0;padding:14px 16px;background:#f8f6f2;border-radius:8px;color:#17181c;font-size:14px;line-height:1.5;white-space:pre-wrap;">${escapeHtml(
        data.message,
      )}</p>
      <p style="margin:22px 0 0;font-size:13px;color:#8b8a83;">Reply directly to this email or call them back at ${escapeHtml(
        data.phone,
      )}.</p>
    </div>
  </div>`;

  const text = [
    `New quote request from ${data.name}`,
    `Preferred contact: ${contactLabels[data.contactPreference]}`,
    `Phone: ${data.phone}`,
    data.email ? `Email: ${data.email}` : '',
    vehicle ? `Vehicle: ${vehicle}` : '',
    data.vin ? `VIN: ${data.vin}` : '',
    data.mileage ? `Mileage: ${data.mileage}` : '',
    data.serviceType ? `Service type: ${data.serviceType}` : '',
    mediaLine(media) ? `Attachments: ${mediaLine(media)}` : '',
    '',
    'Message:',
    data.message,
  ]
    .filter(Boolean)
    .join('\n');

  return { subject, html, text };
}

export function customerConfirmationEmail(data: QuoteFormValues) {
  const subject = `We got your request - ${business.name}`;

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;">
    <div style="padding:28px 28px 0;">
      <h1 style="margin:0 0 4px;color:#17181c;font-size:20px;">Thanks, ${escapeHtml(data.name.split(' ')[0] ?? data.name)}.</h1>
      <p style="margin:0 0 18px;color:#55544d;font-size:15px;line-height:1.6;">
        We got your quote request at ${business.name}. Someone will ${
          data.contactPreference === 'email' ? 'email' : data.contactPreference === 'text' ? 'text' : 'call'
        } you back${business.hours.length ? ', usually within the hour during shop hours' : ''}.
      </p>
      <div style="padding:14px 16px;background:#f8f6f2;border-radius:8px;font-size:14px;color:#17181c;">
        <strong>What you sent us:</strong>
        <p style="margin:8px 0 0;white-space:pre-wrap;">${escapeHtml(data.message)}</p>
      </div>
      <p style="margin:22px 0 28px;color:#55544d;font-size:14px;">
        Need to reach us sooner? Call <a href="${business.phoneHref}" style="color:#d9611f;text-decoration:none;">${business.phoneDisplay}</a>.
      </p>
    </div>
  </div>`;

  const text = `Thanks, ${data.name}. We got your quote request at ${business.name} and will be in touch soon. Call ${business.phoneDisplay} if you need to reach us sooner.`;

  return { subject, html, text };
}

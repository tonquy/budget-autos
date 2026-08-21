import { business } from './business';
import { formatAppointmentForShop, formatDateForShop, formatTimeForShop } from './booking';
import { flowLabels, type IntakeFormValues } from './quoteSchema';
import type { ChatIntake, ChatMessage } from './chatIntake';
import type { RentalFormValues } from './rentalSchema';

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
export function chatIntakeOwnerEmail(
  intake: ChatIntake,
  transcript: ChatMessage[],
  media?: { photoCount?: number },
) {
  const vehicle = [intake.vehicleYear, intake.vehicleMake, intake.vehicleModel]
    .map((p) => (p ?? '').trim())
    .filter(Boolean)
    .join(' ');

  const name = intake.name?.trim() || 'Website visitor';
  const subject = `New chat intake from ${name}${vehicle ? ` (${vehicle})` : ''}`;
  const photoCount = media?.photoCount ?? 0;

  const detailRows = [
    row('Name', intake.name ?? ''),
    row('Phone', intake.phone ?? ''),
    row('Email', intake.email ?? ''),
    row('Preferred contact', intake.contactPreference ? chatContactLabels[intake.contactPreference] ?? '' : ''),
    row('Vehicle', vehicle),
    row('Mileage', intake.mileage ?? ''),
    row('Category', intake.category ?? ''),
    photoCount > 0 ? row('Photos attached', String(photoCount)) : '',
  ]
    .filter(Boolean)
    .join('');

  const blocks = [
    textBlock('Problem (in their words)', intake.problemDescription ?? ''),
    textBlock('Symptoms', intake.symptoms ?? ''),
    textBlock('What the advisor saw in photos', intake.visualFindings ?? ''),
    textBlock('Advisor summary', intake.summaryForShop ?? ''),
  ]
    .filter(Boolean)
    .join('');

  const transcriptHtml = transcript
    .map((m) => {
      const who = m.role === 'user' ? 'Customer' : 'Assistant';
      const color = m.role === 'user' ? '#17181c' : '#8b8a83';
      const photoNote =
        m.role === 'user' && (m.images?.length ?? 0) > 0
          ? ` <em style="color:#8b8a83;">[${m.images!.length} photo${m.images!.length === 1 ? '' : 's'}]</em>`
          : '';
      return `<p style="margin:0 0 10px;font-size:13px;line-height:1.5;color:${color};"><strong>${who}:</strong>${photoNote} ${escapeHtml(
        m.content || '(photo only)',
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
      ${
        photoCount > 0
          ? `<p style="margin:16px 0 0;font-size:13px;color:#8b8a83;">Customer photos are attached to this email when size allows.</p>`
          : ''
      }
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
    photoCount > 0 ? `Photos attached: ${photoCount}` : '',
    intake.problemDescription ? `\nProblem:\n${intake.problemDescription}` : '',
    intake.symptoms ? `\nSymptoms:\n${intake.symptoms}` : '',
    intake.visualFindings ? `\nPhoto findings:\n${intake.visualFindings}` : '',
    intake.summaryForShop ? `\nAdvisor summary:\n${intake.summaryForShop}` : '',
    '\nConversation:',
    ...transcript.map((m) => {
      const photos =
        m.role === 'user' && (m.images?.length ?? 0) > 0 ? ` [${m.images!.length} photo(s)]` : '';
      return `${m.role === 'user' ? 'Customer' : 'Assistant'}${photos}: ${m.content || '(photo only)'}`;
    }),
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

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

const yesNoLabels: Record<'yes' | 'no', string> = { yes: 'Yes', no: 'No' };

export type RentalAttachmentSummary = {
  licenseAttached: boolean;
  insuranceCardAttached: boolean;
};

export function ownerRentalNotificationEmail(data: RentalFormValues, attachments: RentalAttachmentSummary) {
  const vehicle = [data.vehicleYear, data.vehicleMake, data.vehicleModel]
    .map((part) => (part ?? '').trim())
    .filter(Boolean)
    .join(' ');
  const subject = `Rental request from ${data.name}${vehicle ? ` (${vehicle})` : ''}`;

  const detailRows = [
    row('Phone', data.phone),
    row('Email', data.email ?? ''),
    row('Vehicle being repaired', vehicle),
    row('Pickup date', formatDate(data.pickupDate)),
    row('Return date', formatDate(data.returnDate)),
    row('Valid driver’s license', yesNoLabels[data.hasLicense]),
    row('Active NY auto insurance', yesNoLabels[data.hasInsurance]),
    row('Insurance company', data.insuranceCompany ?? ''),
    row('Policy number', data.policyNumber ?? ''),
    row(
      'Attachments',
      [attachments.licenseAttached && 'license photo', attachments.insuranceCardAttached && 'insurance card']
        .filter(Boolean)
        .join(', '),
    ),
  ]
    .filter(Boolean)
    .join('');

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;">
    <div style="background:#17181c;padding:24px 28px;border-radius:12px 12px 0 0;">
      <p style="margin:0;color:#d9611f;font-size:12px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;">Rental request</p>
      <h1 style="margin:6px 0 0;color:#fff;font-size:22px;">${escapeHtml(data.name)}</h1>
    </div>
    <div style="border:1px solid #eceae4;border-top:none;border-radius:0 0 12px 12px;padding:24px 28px;">
      <table style="width:100%;border-collapse:collapse;">
        ${detailRows}
      </table>
      <p style="margin:22px 0 0;font-size:13px;color:#8b8a83;">Reply directly to this email or call them back at ${escapeHtml(
        data.phone,
      )}. Confirm insurance and license before handing over a vehicle.</p>
    </div>
  </div>`;

  const text = [
    'Rental request',
    `From: ${data.name}`,
    `Phone: ${data.phone}`,
    data.email ? `Email: ${data.email}` : '',
    vehicle ? `Vehicle being repaired: ${vehicle}` : '',
    `Pickup date: ${formatDate(data.pickupDate)}`,
    `Return date: ${formatDate(data.returnDate)}`,
    `Valid driver's license: ${yesNoLabels[data.hasLicense]}`,
    `Active NY auto insurance: ${yesNoLabels[data.hasInsurance]}`,
    data.insuranceCompany ? `Insurance company: ${data.insuranceCompany}` : '',
    data.policyNumber ? `Policy number: ${data.policyNumber}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return { subject, html, text };
}

export function customerRentalConfirmationEmail(data: RentalFormValues) {
  const subject = `We got your rental request - ${business.name}`;
  const firstName = data.name.split(' ')[0] ?? data.name;

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;">
    <div style="padding:28px 28px 0;">
      <h1 style="margin:0 0 4px;color:#17181c;font-size:20px;">Thanks, ${escapeHtml(firstName)}.</h1>
      <p style="margin:0 0 18px;color:#55544d;font-size:15px;line-height:1.6;">
        We got your rental request for ${formatDate(data.pickupDate)} through ${formatDate(
          data.returnDate,
        )} at ${business.name}. We'll confirm availability and reach out before your drop-off.
      </p>
      <div style="padding:14px 16px;background:#f8f6f2;border-radius:8px;font-size:13px;color:#55544d;line-height:1.5;">
        Submitting this request does not guarantee a rental vehicle. Rental is subject to insurance verification,
        customer eligibility, and vehicle availability. We will contact you to confirm.
      </div>
      <p style="margin:22px 0 28px;color:#55544d;font-size:14px;">
        Need to reach us sooner? Email <a href="mailto:${business.email}" style="color:#d9611f;text-decoration:none;">${business.email}</a>
        or call ${business.phoneDisplay}.
      </p>
    </div>
  </div>`;

  const text = `Thanks, ${firstName}. We got your rental request for ${formatDate(data.pickupDate)} through ${formatDate(
    data.returnDate,
  )} at ${business.name}. Submitting this request does not guarantee a rental vehicle - it is subject to insurance verification, customer eligibility, and vehicle availability. We will contact you to confirm. Email ${business.email} or call ${business.phoneDisplay} if you need to reach us sooner.`;

  return { subject, html, text };
}

// --- Appointment booking ------------------------------------------------------

export type BookingEmailPayload = {
  appointmentName: string;
  durationMinutes: number;
  /** Start of the appointment. Always rendered in the shop's timezone. */
  start: Date;
  name: string;
  phone: string;
  email: string;
  vehicle: string;
  mileage: string;
  notes: string;
  /** Cal.com booking reference, when the slot was reserved on the real calendar. */
  bookingRef: string | null;
  /**
   * False when Cal.com was not configured, so the slot is not actually held.
   * The owner email says so plainly rather than implying a confirmed booking.
   */
  reserved: boolean;
};

const shopAddress = `${business.address.line1}, ${business.address.city}, ${business.address.state} ${business.address.zip}`;

export function ownerBookingNotificationEmail(data: BookingEmailPayload) {
  const when = formatAppointmentForShop(data.start);
  const subject = `${data.reserved ? 'New appointment' : 'Appointment request'}: ${data.name} - ${when}`;

  const detailRows = [
    row('When', when),
    row('Service', data.appointmentName),
    row('Length', `${data.durationMinutes} minutes`),
    row('Phone', data.phone),
    row('Email', data.email),
    row('Vehicle', data.vehicle),
    row('Mileage', data.mileage),
    row('Booking ref', data.bookingRef ?? ''),
  ]
    .filter(Boolean)
    .join('');

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;">
    <div style="background:#17181c;padding:24px 28px;border-radius:12px 12px 0 0;">
      <p style="margin:0;color:#d9611f;font-size:12px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;">${
        data.reserved ? 'Booked online' : 'Appointment request'
      }</p>
      <h1 style="margin:6px 0 0;color:#fff;font-size:22px;">${escapeHtml(data.name)}</h1>
      <p style="margin:6px 0 0;color:#c9c6bd;font-size:14px;">${escapeHtml(when)}</p>
    </div>
    <div style="border:1px solid #eceae4;border-top:none;border-radius:0 0 12px 12px;padding:24px 28px;">
      <table style="width:100%;border-collapse:collapse;">
        ${detailRows}
      </table>
      ${textBlock('What they told us', data.notes)}
      ${
        data.reserved
          ? `<p style="margin:22px 0 0;font-size:13px;color:#8b8a83;">This slot is held on the calendar. Reply to this email or call ${escapeHtml(
              data.phone,
            )} to reach them.</p>`
          : `<p style="margin:22px 0 0;padding:14px 16px;background:#fdf2e6;border-radius:8px;font-size:13px;color:#7a340a;">Heads up: the scheduling calendar is not connected, so this time is <strong>not</strong> reserved. Confirm with the customer before relying on it.</p>`
      }
    </div>
  </div>`;

  const text = [
    data.reserved ? 'New appointment booked online' : 'Appointment request (calendar not connected)',
    `Name: ${data.name}`,
    `When: ${when}`,
    `Service: ${data.appointmentName} (${data.durationMinutes} minutes)`,
    `Phone: ${data.phone}`,
    `Email: ${data.email}`,
    data.vehicle ? `Vehicle: ${data.vehicle}` : '',
    data.mileage ? `Mileage: ${data.mileage}` : '',
    data.bookingRef ? `Booking ref: ${data.bookingRef}` : '',
    data.notes ? `\nWhat they told us:\n${data.notes}` : '',
    data.reserved ? '' : '\nThis time is NOT reserved - the scheduling calendar is not connected.',
  ]
    .filter(Boolean)
    .join('\n');

  return { subject, html, text };
}

export function customerBookingConfirmationEmail(data: BookingEmailPayload) {
  const firstName = data.name.split(' ')[0] ?? data.name;
  const dateLine = formatDateForShop(data.start);
  const timeLine = formatTimeForShop(data.start);
  const subject = `Appointment confirmed - ${dateLine} at ${timeLine}`;

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;">
    <div style="padding:28px 28px 0;">
      <h1 style="margin:0 0 4px;color:#17181c;font-size:20px;">You&rsquo;re booked, ${escapeHtml(firstName)}.</h1>
      <p style="margin:0 0 18px;color:#55544d;font-size:15px;line-height:1.6;">
        We&rsquo;ve got you down for ${escapeHtml(data.appointmentName.toLowerCase())} at ${business.name}.
      </p>

      <div style="padding:18px 20px;background:#17181c;border-radius:12px;color:#fff;">
        <p style="margin:0;color:#d9611f;font-size:12px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;">Your appointment</p>
        <p style="margin:8px 0 0;font-size:18px;font-weight:600;">${escapeHtml(dateLine)}</p>
        <p style="margin:2px 0 0;font-size:18px;font-weight:600;">${escapeHtml(timeLine)}</p>
        <p style="margin:10px 0 0;color:#c9c6bd;font-size:13px;">Plan on about ${data.durationMinutes} minutes.</p>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-top:18px;">
        ${row('Service', data.appointmentName)}
        ${row('Vehicle', data.vehicle)}
        ${row('Where', shopAddress)}
      </table>

      <div style="margin-top:18px;padding:14px 16px;background:#f8f6f2;border-radius:8px;font-size:14px;color:#17181c;line-height:1.55;">
        <strong>Bringing your vehicle in</strong>
        <p style="margin:8px 0 0;color:#55544d;">
          Come a few minutes early so we can get your keys and details. Bring anything that helps -
          a previous estimate, or the codes if you&rsquo;ve had it scanned.
        </p>
      </div>

      <p style="margin:20px 0 0;color:#55544d;font-size:14px;line-height:1.6;">
        Need to change or cancel, or need us sooner than this? Call
        <a href="${business.phoneHref}" style="color:#d9611f;text-decoration:none;font-weight:600;">${business.phoneDisplay}</a>
        or reply to this email. We keep room for urgent and safety work.
      </p>
      <p style="margin:22px 0 28px;color:#8b8a83;font-size:12px;line-height:1.6;">${escapeHtml(business.laborGuide)}</p>
    </div>
  </div>`;

  const text = [
    `You're booked, ${firstName}.`,
    `${dateLine} at ${timeLine} (about ${data.durationMinutes} minutes)`,
    `Service: ${data.appointmentName}`,
    data.vehicle ? `Vehicle: ${data.vehicle}` : '',
    `Where: ${shopAddress}`,
    '',
    'Come a few minutes early so we can get your keys and details.',
    `Need to change or cancel, or need us sooner? Call ${business.phoneDisplay} or reply to this email. We keep room for urgent and safety work.`,
    '',
    business.laborGuide,
  ]
    .filter(Boolean)
    .join('\n');

  return { subject, html, text };
}

const nodemailer = require('nodemailer');

const PRODUCER_EMAIL = process.env.PRODUCER_EMAIL || 'nitin2911.in@gmail.com';

/**
 * Check if real SMTP credentials are provided in environment
 */
const isRealSmtpConfigured = () => {
  const user = process.env.SMTP_USER?.trim();
  const pass = (process.env.SMTP_PASSWORD || process.env.SMTP_PASS)?.trim();
  return Boolean(user && pass);
};

/**
 * Check if email service is active.
 * In development, returns true (automatic fallback to Ethereal / test transporter).
 * In production, requires real SMTP credentials.
 */
const isEmailConfigured = () => {
  if (process.env.NODE_ENV === 'production') {
    return isRealSmtpConfigured();
  }
  return true;
};

let devTransporter = null;
let devAccount = null;

/**
 * Initialize or retrieve cached development Ethereal test transporter
 */
const getDevTransporter = async () => {
  if (devTransporter) return devTransporter;

  try {
    devAccount = await nodemailer.createTestAccount();
    devTransporter = nodemailer.createTransport({
      host: devAccount.smtp.host,
      port: devAccount.smtp.port,
      secure: devAccount.smtp.secure,
      auth: {
        user: devAccount.user,
        pass: devAccount.pass
      }
    });
    console.log(`[EMAIL SERVICE] Development Ethereal test account ready: ${devAccount.user}`);
  } catch (err) {
    console.warn('[EMAIL SERVICE] Ethereal unavailable, using local stream mailer:', err.message);
    devTransporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'windows'
    });
  }

  return devTransporter;
};

/**
 * Retrieve appropriate mail transporter (Real SMTP or Development Ethereal)
 */
const getTransporter = async () => {
  if (isRealSmtpConfigured()) {
    const host = process.env.SMTP_HOST?.trim() || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER?.trim();
    const pass = (process.env.SMTP_PASSWORD || process.env.SMTP_PASS)?.trim();

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass
      }
    });
  }

  return await getDevTransporter();
};

/**
 * Mask email address for security display (e.g. nitin2911.in@gmail.com -> n****1@gmail.com)
 */
const maskEmail = (email) => {
  if (!email || !email.includes('@')) return email;
  const [name, domain] = email.split('@');
  if (name.length <= 2) return `${name.charAt(0)}*@${domain}`;
  const first = name.charAt(0);
  const last = name.charAt(name.length - 1);
  return `${first}${'*'.repeat(Math.min(name.length - 2, 4))}${last}@${domain}`;
};

/**
 * Send Professional Verification Code Email
 */
const sendVerificationEmail = async ({ to, otp, isProducerAdmin = false }) => {
  const recipient = isProducerAdmin ? PRODUCER_EMAIL : to;
  let mailer = await getTransporter();
  let isDevFallback = !isRealSmtpConfigured();

  const from = process.env.SMTP_FROM || `"CareerForge Security Team" <security@careerforge.io>`;
  const subject = 'Your Verification Code';

  const text = `Hello,

Your verification code is:

${otp}

This code will expire in 5 minutes.
If you did not request this code, please ignore this email.

Regards,
CareerForge Security Team`;

  const html = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 32px 24px; background: #0b1120; color: #e2e8f0; border-radius: 16px; border: 1px solid #1e293b;">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0 0 6px 0;">CareerForge Security</h1>
      <p style="color: #94a3b8; font-size: 13px; margin: 0;">${isProducerAdmin ? 'Platform Producer Authorization' : 'Identity Verification'}</p>
    </div>
    <div style="background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
      <p style="font-size: 15px; color: #f1f5f9; margin: 0 0 12px 0;">Hello,</p>
      <p style="font-size: 14px; color: #94a3b8; margin: 0 0 20px 0; line-height: 1.5;">
        Your verification code is:
      </p>
      <div style="text-align: center; margin: 24px 0;">
        <div style="display: inline-block; background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 14px 32px;">
          <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #38bdf8;">${otp}</span>
        </div>
      </div>
      <p style="font-size: 13px; color: #94a3b8; margin: 0 0 8px 0; line-height: 1.5;">
        This code will expire in <strong>5 minutes</strong>.
      </p>
      <p style="font-size: 13px; color: #64748b; margin: 0; line-height: 1.5;">
        If you did not request this code, please ignore this email.
      </p>
    </div>
    <div style="text-align: center; font-size: 12px; color: #64748b; line-height: 1.6;">
      Regards,<br/>
      <strong>CareerForge Security Team</strong>
    </div>
  </div>
  `;

  let info;
  try {
    info = await mailer.sendMail({
      from,
      to: recipient,
      subject,
      text,
      html
    });
  } catch (sendErr) {
    if (!isDevFallback && process.env.NODE_ENV !== 'production') {
      console.warn(`[EMAIL SERVICE] Real SMTP delivery failed (${sendErr.message}). Retrying with development test mailer...`);
      mailer = await getDevTransporter();
      isDevFallback = true;
      info = await mailer.sendMail({
        from,
        to: recipient,
        subject,
        text,
        html
      });
    } else {
      throw sendErr;
    }
  }

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`\n============================================================`);
    console.log(`📧 [EMAIL SERVICE - ETHEREAL TEST INBOX]`);
    console.log(`To: ${recipient}`);
    console.log(`Subject: ${subject}`);
    console.log(`🔗 Click to Preview Email in Browser: ${previewUrl}`);
    console.log(`🔑 Verification Code: ${otp}`);
    console.log(`============================================================\n`);
  } else if (isDevFallback) {
    console.log(`\n============================================================`);
    console.log(`📧 [EMAIL SERVICE - LOCAL CONSOLE DISPATCH]`);
    console.log(`To: ${recipient}`);
    console.log(`Subject: ${subject}`);
    console.log(`🔑 Verification Code: ${otp}`);
    console.log(`============================================================\n`);
  } else {
    console.log(`[EMAIL SERVICE] Real email successfully delivered to ${recipient}`);
  }

  return { success: true, messageId: info?.messageId, recipient, previewUrl };
};

/**
 * Notify Producer of an Analytics Access Request
 */
const notifyProducerOfAnalyticsRequest = async ({ requesterName, requesterEmail, requesterRole, organization, purpose }) => {
  if (!isEmailConfigured()) return { success: false, skipped: true };
  try {
    const mailer = await getTransporter();
    const from = process.env.SMTP_FROM || `"CareerForge Alerts" <alerts@careerforge.io>`;
    const subject = `📊 [Placement Analytics Request] New Request from ${requesterName}`;

    const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
      <h2 style="color: #ffffff; margin-top: 0;">New Placement Analytics Request</h2>
      <p style="font-size: 14px; color: #cbd5e1;">A user has requested access to the placement analytics dossier:</p>
      <div style="background: #1e293b; padding: 16px; border-radius: 8px; font-size: 13px; line-height: 1.8;">
        <div><strong>Requester:</strong> ${requesterName} (${requesterEmail})</div>
        <div><strong>Role:</strong> ${requesterRole}</div>
        <div><strong>Organization:</strong> ${organization || 'Not provided'}</div>
        <div><strong>Purpose:</strong> ${purpose}</div>
      </div>
    </div>`;

    await mailer.sendMail({ from, to: PRODUCER_EMAIL, subject, html });
    return { success: true };
  } catch (err) {
    console.warn('[EMAIL SERVICE] notifyProducerOfAnalyticsRequest error:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Send Full Placement Analytics Dossier Email to Requester
 */
const sendAnalyticsDossierEmail = async ({ requesterEmail, requesterName, stats, producerNotes }) => {
  if (!isEmailConfigured()) return { success: false, skipped: true };
  try {
    const mailer = await getTransporter();
    const from = process.env.SMTP_FROM || `"CareerForge Placements" <placements@careerforge.io>`;
    const subject = `📈 [CareerForge Placement Dossier] Complete Institutional Placement Analytics`;

    const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
      <h2 style="color: #ffffff; margin-top: 0;">Official Placement Analytics Dossier</h2>
      <p style="font-size: 14px; color: #cbd5e1;">Dear ${requesterName}, your request for campus placement analytics has been authorized by Platform Producer.</p>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 16px 0;">
        <div style="background: #1e293b; padding: 12px; border-radius: 8px;">Placement Rate: <strong>${stats?.placementRate || '0%'}</strong></div>
        <div style="background: #1e293b; padding: 12px; border-radius: 8px;">Avg Package: <strong>${stats?.avgSalary || 'Not Disclosed'}</strong></div>
        <div style="background: #1e293b; padding: 12px; border-radius: 8px;">Highest Package: <strong>${stats?.highestSalary || 'Not Disclosed'}</strong></div>
        <div style="background: #1e293b; padding: 12px; border-radius: 8px;">Active Openings: <strong>${stats?.activeJobs ?? stats?.totalJobs ?? 0}</strong></div>
      </div>
      ${producerNotes ? `<div style="background: #1e1b4b; padding: 12px; border-radius: 8px; font-size: 13px; color: #ddd6fe;"><strong>Producer Note:</strong> ${producerNotes}</div>` : ''}
    </div>`;

    await mailer.sendMail({ from, to: requesterEmail, subject, html });
    return { success: true };
  } catch (err) {
    console.warn('[EMAIL SERVICE] sendAnalyticsDossierEmail error:', err.message);
    return { success: false, error: err.message };
  }
};

module.exports = {
  PRODUCER_EMAIL,
  isRealSmtpConfigured,
  isEmailConfigured,
  maskEmail,
  sendVerificationEmail,
  notifyProducerOfAnalyticsRequest,
  sendAnalyticsDossierEmail
};

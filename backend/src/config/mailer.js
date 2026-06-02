const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Lazy-init transporter so env vars are guaranteed to be loaded
let transporter = null;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return transporter;
}

function loadTemplate(name) {
  const filePath = path.join(__dirname, '../templates', `${name}.html`);
  return fs.readFileSync(filePath, 'utf8');
}

function interpolate(html, vars) {
  return html.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');
}

async function sendEmail({ to, subject, template, vars }) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('[mailer] GMAIL_USER or GMAIL_APP_PASSWORD not set — skipping email:', subject);
    return;
  }
  try {
    const raw = loadTemplate(template);
    const html = interpolate(raw, { ...vars, appUrl: process.env.CLIENT_URL });
    await getTransporter().sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log(`[mailer] Sent "${subject}" to ${to}`);
  } catch (err) {
    console.error(`[mailer] Failed to send "${subject}" to ${to}:`, err.message);
    // Don't throw — email failure should never crash the request
  }
}

module.exports = { sendEmail };

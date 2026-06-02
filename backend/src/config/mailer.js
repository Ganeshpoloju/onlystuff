const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

function loadTemplate(name) {
  const filePath = path.join(__dirname, '../templates', `${name}.html`);
  return fs.readFileSync(filePath, 'utf8');
}

function interpolate(html, vars) {
  return html.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');
}

async function sendEmail({ to, subject, template, vars }) {
  const raw = loadTemplate(template);
  const html = interpolate(raw, vars);
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
}

module.exports = { sendEmail };

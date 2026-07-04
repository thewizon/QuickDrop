const nodemailer = require("nodemailer");

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
};

/**
 * Sends an email. Never throws - logs and swallows errors so a failed
 * notification never breaks the underlying order/status-update request.
 * If SMTP env vars aren't configured (e.g. local dev), it just logs the
 * email to the console instead of sending it.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailer = getTransporter();

    if (!mailer) {
      console.log(`✉️  [sendEmail:noop - SMTP not configured] To: ${to} | Subject: ${subject}`);
      return { sent: false, reason: "SMTP not configured" };
    }

    await mailer.sendMail({
      from: process.env.SMTP_FROM || `"QuickDrop" <no-reply@quickdrop.com>`,
      to,
      subject,
      text,
      html,
    });

    return { sent: true };
  } catch (error) {
    console.error("sendEmail error:", error.message);
    return { sent: false, reason: error.message };
  }
};

module.exports = sendEmail;

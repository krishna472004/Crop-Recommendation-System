import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

let transporter;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  return transporter;
}

export async function sendNDVIReportEmail({ to, plantationName, locationName, report }) {
  const mailer = getTransporter();

  if (!mailer || !to) {
    return false;
  }

  await mailer.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: `Daily NDVI report for ${plantationName} - ${report.reportDate}`,
    text: [
      `Location: ${locationName}`,
      `Plantation: ${plantationName}`,
      `Date: ${report.reportDate}`,
      `NDVI: ${report.ndviValue.toFixed(3)}`,
      `Status: ${report.status}`,
      `Trend: ${report.trend}`,
      "",
      report.summary
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#f7f6ef;color:#1d2a1f">
        <h2 style="margin:0 0 12px;color:#254d32">Daily NDVI Report</h2>
        <p style="margin:0 0 16px">${plantationName} • ${locationName}</p>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:18px">
          <div style="background:#fff;padding:14px;border-radius:12px"><strong>Date</strong><br/>${report.reportDate}</div>
          <div style="background:#fff;padding:14px;border-radius:12px"><strong>NDVI</strong><br/>${report.ndviValue.toFixed(3)}</div>
          <div style="background:#fff;padding:14px;border-radius:12px"><strong>Status</strong><br/>${report.status}</div>
        </div>
        <p style="background:#fff;padding:16px;border-radius:12px;line-height:1.6">${report.summary}</p>
      </div>
    `
  });

  return true;
}

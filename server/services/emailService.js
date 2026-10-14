import nodemailer from "nodemailer";

let transporter = null;

const getTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

// Sends an email if SMTP credentials are configured; otherwise just logs it.
// This mirrors the AI service's mock-fallback pattern so the whole app stays
// runnable out of the box without any third-party credentials.
export const sendEmail = async ({ to, subject, text }) => {
  const t = getTransporter();

  if (!t) {
    console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}\n${text}\n`);
    return { mocked: true };
  }

  try {
    await t.sendMail({
      from: `"MediAI Pro" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });
    return { mocked: false };
  } catch (error) {
    // Email failures should never crash the request that triggered them
    // (e.g. booking an appointment shouldn't fail just because the email didn't send)
    console.error("Email send failed:", error.message);
    return { mocked: false, error: error.message };
  }
};

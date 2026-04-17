import nodemailer from "nodemailer";

const FROM = process.env.EMAIL_FROM ?? "noreply@quwahmarket-saas.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const SMTP_URL = process.env.SMTP_URL;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 587);
const SMTP_SECURE = process.env.SMTP_SECURE
  ? process.env.SMTP_SECURE === "true"
  : SMTP_PORT === 465;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  if (SMTP_URL) {
    transporter = nodemailer.createTransport(SMTP_URL);
    return transporter;
  }

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return transporter;
}

async function sendEmail({
  email,
  subject,
  html,
  fallbackLabel,
  fallbackUrl,
}: {
  email: string;
  subject: string;
  html: string;
  fallbackLabel: string;
  fallbackUrl: string;
}) {
  const mailer = getTransporter();

  if (!mailer) {
    console.warn(
      `[email] SMTP config not set - skipping "${subject}" email to ${email}.\n` +
        `  ${fallbackLabel}: ${fallbackUrl}`
    );
    return;
  }

  await mailer.sendMail({
    from: FROM,
    to: email,
    subject,
    html,
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${APP_URL}/auth/verify-email?token=${token}`;

  await sendEmail({
    email,
    subject: "Verify your email address",
    fallbackLabel: "Verification URL",
    fallbackUrl: verificationUrl,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">
          Verify your email
        </h1>
        <p style="color: #64748b; font-size: 16px; margin-bottom: 32px;">
          Click the button below to verify your email address and activate your account.
        </p>
        <a href="${verificationUrl}"
           style="display: inline-block; background: #2d63ff; color: white; padding: 12px 24px;
                  border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
          Verify Email Address
        </a>
        <p style="color: #94a3b8; font-size: 14px; margin-top: 32px;">
          This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/auth/reset-password?token=${token}`;

  await sendEmail({
    email,
    subject: "Reset your password",
    fallbackLabel: "Reset URL",
    fallbackUrl: resetUrl,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">
          Reset your password
        </h1>
        <p style="color: #64748b; font-size: 16px; margin-bottom: 32px;">
          You requested a password reset. Click the button below to set a new password.
        </p>
        <a href="${resetUrl}"
           style="display: inline-block; background: #2d63ff; color: white; padding: 12px 24px;
                  border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
          Reset Password
        </a>
        <p style="color: #94a3b8; font-size: 14px; margin-top: 32px;">
          This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

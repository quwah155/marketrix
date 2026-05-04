import nodemailer from "nodemailer";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

let transporter: nodemailer.Transporter | null = null;
let transporterConfigKey: string | null = null;

function getMailConfig() {
  const smtpUrl = process.env.SMTP_URL;
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT ?? 587);
  const smtpSecure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === "true"
    : smtpPort === 465;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  return {
    smtpUrl,
    smtpHost,
    smtpPort,
    smtpSecure,
    smtpUser,
    smtpPass,
  };
}

function getTransporter() {
  const config = getMailConfig();
  const configKey = JSON.stringify(config);

  if (transporter && transporterConfigKey === configKey) {
    return transporter;
  }

  if (config.smtpUrl) {
    transporter = nodemailer.createTransport(config.smtpUrl);
    transporterConfigKey = configKey;
    return transporter;
  }

  if (!config.smtpHost || !config.smtpPort || !config.smtpUser || !config.smtpPass) {
    transporter = null;
    transporterConfigKey = null;
    return null;
  }

  transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  });
  transporterConfigKey = configKey;

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

  try {
    await mailer.sendMail({
      from: process.env.EMAIL_FROM ?? "noreply@marketrix.com",
      to: email,
      subject,
      html,
    });
  } catch (error) {
    console.error("[Email] sendMail failed", {
      to: email,
      from: process.env.EMAIL_FROM ?? "noreply@marketrix.com",
      subject,
      smtpHost: process.env.SMTP_HOST ?? null,
      smtpPort: process.env.SMTP_PORT ?? null,
      smtpSecure: process.env.SMTP_SECURE ?? null,
      error,
    });
    throw error;
  }
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

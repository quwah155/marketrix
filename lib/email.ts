import nodemailer from "nodemailer";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const BRAND_COLOR = "#e1ff51";
const BRAND_DARK = "#00272c";

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
      <div style="margin:0; padding:32px 16px; background:#f4f8f8; font-family:Inter,Arial,sans-serif; color:#0f172a;">
        <div style="max-width:640px; margin:0 auto; overflow:hidden; border-radius:28px; border:1px solid rgba(0,39,44,0.08); background:#ffffff; box-shadow:0 18px 50px rgba(0,39,44,0.08);">
          <div style="padding:32px; background:linear-gradient(135deg, ${BRAND_DARK} 0%, #083b44 100%); color:#ffffff;">
            <div style="display:inline-flex; align-items:center; gap:12px; margin-bottom:24px;">
              <div style="display:inline-flex; width:44px; height:44px; align-items:center; justify-content:center; border-radius:16px; background:rgba(225,255,81,0.12); border:1px solid rgba(225,255,81,0.24);">
                <span style="font-size:18px; font-weight:700; color:${BRAND_COLOR};">M</span>
              </div>
              <div style="font-size:20px; font-weight:700; letter-spacing:-0.02em;">Marketrix</div>
            </div>
            <div style="display:inline-block; margin-bottom:18px; padding:6px 12px; border-radius:999px; background:rgba(225,255,81,0.12); color:${BRAND_COLOR}; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em;">
              Verify your account
            </div>
            <h1 style="margin:0 0 12px; font-size:32px; line-height:1.1; font-weight:800;">
              Welcome to a cleaner digital marketplace.
            </h1>
            <p style="margin:0; max-width:500px; color:rgba(255,255,255,0.78); font-size:16px; line-height:1.7;">
              Confirm your email to activate your Marketrix account and unlock buying, selling, and secure product delivery.
            </p>
          </div>

          <div style="padding:32px;">
            <div style="margin-bottom:24px; border-radius:20px; background:#f8fbfb; border:1px solid rgba(0,39,44,0.08); padding:20px;">
              <p style="margin:0 0 8px; font-size:15px; font-weight:700; color:${BRAND_DARK};">What happens next</p>
              <p style="margin:0; color:#49616a; font-size:15px; line-height:1.7;">
                Use the button below to verify your email. The link stays active for 24 hours, and once it is confirmed you can sign in immediately.
              </p>
            </div>

            <div style="margin:28px 0; text-align:center;">
              <a href="${verificationUrl}"
                style="display:inline-block; padding:15px 28px; border-radius:14px; background:${BRAND_COLOR}; color:${BRAND_DARK}; text-decoration:none; font-weight:800; font-size:16px; box-shadow:0 12px 30px rgba(225,255,81,0.28);">
                Verify Email Address
              </a>
            </div>

            <div style="margin-bottom:24px; border-left:4px solid ${BRAND_COLOR}; padding:4px 0 4px 16px;">
              <p style="margin:0 0 6px; font-size:14px; font-weight:700; color:${BRAND_DARK};">Button not working?</p>
              <p style="margin:0; font-size:14px; line-height:1.7; color:#64748b; word-break:break-word;">
                Copy and paste this link into your browser: <a href="${verificationUrl}" style="color:${BRAND_DARK};">${verificationUrl}</a>
              </p>
            </div>

            <p style="margin:0; color:#94a3b8; font-size:13px; line-height:1.7;">
              If you didn&apos;t create a Marketrix account, you can safely ignore this message.
            </p>
          </div>
        </div>
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

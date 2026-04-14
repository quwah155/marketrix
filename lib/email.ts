import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const FROM = process.env.EMAIL_FROM ?? "noreply@quwahmarket-saas.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${APP_URL}/auth/verify-email?token=${token}`;

  if (!resend) {
    console.warn( 
      `[email] RESEND_API_KEY not set — skipping verification email to ${email}.\n` +
        `  Verification URL: ${verificationUrl}`
    );
    return;
  }

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Verify your email address",
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

  if (!resend) {
    console.warn(
      `[email] RESEND_API_KEY not set — skipping password reset email to ${email}.\n` +
        `  Reset URL: ${resetUrl}`
    );
    return;
  }

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Reset your password",
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

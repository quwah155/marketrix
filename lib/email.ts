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
    const error = new Error(
      `[email] SMTP config not set for "${subject}" email.\n` +
        `  ${fallbackLabel}: ${fallbackUrl}`
    );
    console.error(error.message, { to: email });
    throw error;
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

/* ─────────────────────────────────────────────
   SHARED EMAIL LAYOUT
───────────────────────────────────────────── */
function emailLayout({
  preheader,
  badge,
  heading,
  subheading,
  body,
  ctaUrl,
  ctaLabel,
  footerNote,
}: {
  preheader: string;
  badge: string;
  heading: string;
  subheading: string;
  body: string;
  ctaUrl: string;
  ctaLabel: string;
  footerNote: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${heading}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0; padding:0; background:#f0f4f4; font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; -webkit-font-smoothing:antialiased;">

  <!-- Preheader (hidden preview text) -->
  <div style="display:none; max-height:0; overflow:hidden; mso-hide:all;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f4;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; border-radius:24px; overflow:hidden; background:#ffffff; box-shadow:0 20px 60px rgba(0,39,44,0.07), 0 1px 3px rgba(0,39,44,0.04);">

          <!-- ═══════ HEADER ═══════ -->
          <tr>
            <td style="padding:40px 40px 36px; background:linear-gradient(145deg, ${BRAND_DARK} 0%, #05353d 50%, #0a4550 100%);">
              <!-- Logo -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="width:42px; height:42px; border-radius:14px; background:rgba(225,255,81,0.1); border:1px solid rgba(225,255,81,0.2); text-align:center; vertical-align:middle;">
                    <span style="font-size:18px; font-weight:800; color:${BRAND_COLOR}; line-height:42px;">M</span>
                  </td>
                  <td style="padding-left:12px; font-size:20px; font-weight:700; color:#ffffff; letter-spacing:-0.03em;">
                    Marketrix
                  </td>
                </tr>
              </table>

              <!-- Badge -->
              <div style="display:inline-block; margin-bottom:20px; padding:5px 14px; border-radius:999px; background:rgba(225,255,81,0.1); border:1px solid rgba(225,255,81,0.18); color:${BRAND_COLOR}; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em;">
                ${badge}
              </div>

              <!-- Heading -->
              <h1 style="margin:0 0 12px; font-size:28px; line-height:1.15; font-weight:800; color:#ffffff; letter-spacing:-0.02em;">
                ${heading}
              </h1>
              <p style="margin:0; max-width:460px; color:rgba(255,255,255,0.7); font-size:15px; line-height:1.7;">
                ${subheading}
              </p>
            </td>
          </tr>

          <!-- ═══════ BODY ═══════ -->
          <tr>
            <td style="padding:36px 40px 12px;">
              ${body}

              <!-- CTA Button -->
              <div style="margin:32px 0; text-align:center;">
                <a href="${ctaUrl}"
                   style="display:inline-block; padding:16px 36px; border-radius:14px; background:${BRAND_COLOR}; color:${BRAND_DARK}; text-decoration:none; font-weight:800; font-size:15px; letter-spacing:-0.01em; box-shadow:0 8px 24px rgba(225,255,81,0.25); mso-padding-alt:0;">
                  <!--[if mso]><i style="letter-spacing:36px;mso-font-width:-100%;mso-text-raise:24pt">&nbsp;</i><![endif]-->
                  <span style="mso-text-raise:12pt;">${ctaLabel}</span>
                  <!--[if mso]><i style="letter-spacing:36px;mso-font-width:-100%">&nbsp;</i><![endif]-->
                </a>
              </div>

              <!-- Fallback URL -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
                <tr>
                  <td style="border-left:3px solid ${BRAND_COLOR}; padding:12px 0 12px 16px;">
                    <p style="margin:0 0 4px; font-size:12px; font-weight:700; color:${BRAND_DARK}; text-transform:uppercase; letter-spacing:0.06em;">Button not working?</p>
                    <p style="margin:0; font-size:13px; line-height:1.6; color:#64748b; word-break:break-all;">
                      <a href="${ctaUrl}" style="color:#0e7490; text-decoration:underline;">${ctaUrl}</a>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Footer note -->
              <p style="margin:0 0 8px; color:#94a3b8; font-size:12px; line-height:1.7;">
                ${footerNote}
              </p>
            </td>
          </tr>

          <!-- ═══════ DIVIDER ═══════ -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px; background:linear-gradient(90deg, transparent, #e2e8f0, transparent);"></div>
            </td>
          </tr>

          <!-- ═══════ FOOTER ═══════ -->
          <tr>
            <td style="padding:24px 40px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="vertical-align:middle;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:28px; height:28px; border-radius:8px; background:${BRAND_DARK}; text-align:center; vertical-align:middle;">
                          <span style="font-size:12px; font-weight:800; color:${BRAND_COLOR}; line-height:28px;">M</span>
                        </td>
                        <td style="padding-left:10px; font-size:13px; font-weight:600; color:#475569; letter-spacing:-0.01em;">
                          Marketrix
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="text-align:right; vertical-align:middle;">
                    <span style="font-size:11px; color:#94a3b8;">Premium Digital Marketplace</span>
                  </td>
                </tr>
              </table>
              <p style="margin:16px 0 0; font-size:11px; color:#cbd5e1; line-height:1.6; text-align:center;">
                &copy; ${new Date().getFullYear()} Marketrix. All rights reserved.<br/>
                You're receiving this email because an account action was initiated with this address.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}


/* ─────────────────────────────────────────────
   VERIFICATION EMAIL
───────────────────────────────────────────── */
export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${APP_URL}/auth/verify-email?token=${token}`;

  await sendEmail({
    email,
    subject: "Verify your Marketrix account",
    fallbackLabel: "Verification URL",
    fallbackUrl: verificationUrl,
    html: emailLayout({
      preheader: "Confirm your email to activate your Marketrix account",
      badge: "Account Verification",
      heading: "Welcome to Marketrix.",
      subheading: "One quick step to activate your account — confirm your email address and you're ready to explore the marketplace.",
      ctaUrl: verificationUrl,
      ctaLabel: "Verify Email Address →",
      footerNote: "This link expires in 24 hours. If you didn't create a Marketrix account, you can safely ignore this email — no action is needed.",
      body: `
        <!-- Steps -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:8px;">
          <tr>
            <td style="padding:16px 20px; border-radius:16px; background:#f8fafa; border:1px solid #eef2f2;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="width:36px; vertical-align:top; padding-top:2px;">
                    <div style="width:28px; height:28px; border-radius:50%; background:${BRAND_DARK}; color:${BRAND_COLOR}; font-size:12px; font-weight:800; line-height:28px; text-align:center;">1</div>
                  </td>
                  <td style="padding-left:12px; padding-bottom:16px;">
                    <p style="margin:0 0 2px; font-size:13px; font-weight:700; color:${BRAND_DARK};">Click the button below</p>
                    <p style="margin:0; font-size:13px; color:#64748b; line-height:1.5;">Verify your email to activate your account.</p>
                  </td>
                </tr>
                <tr>
                  <td style="width:36px; vertical-align:top; padding-top:2px;">
                    <div style="width:28px; height:28px; border-radius:50%; background:#f0f4f4; border:1.5px solid #d1d9d9; color:${BRAND_DARK}; font-size:12px; font-weight:800; line-height:28px; text-align:center;">2</div>
                  </td>
                  <td style="padding-left:12px; padding-bottom:16px;">
                    <p style="margin:0 0 2px; font-size:13px; font-weight:700; color:${BRAND_DARK};">Sign in to your account</p>
                    <p style="margin:0; font-size:13px; color:#64748b; line-height:1.5;">Use your credentials to access the dashboard.</p>
                  </td>
                </tr>
                <tr>
                  <td style="width:36px; vertical-align:top; padding-top:2px;">
                    <div style="width:28px; height:28px; border-radius:50%; background:#f0f4f4; border:1.5px solid #d1d9d9; color:${BRAND_DARK}; font-size:12px; font-weight:800; line-height:28px; text-align:center;">3</div>
                  </td>
                  <td style="padding-left:12px;">
                    <p style="margin:0 0 2px; font-size:13px; font-weight:700; color:${BRAND_DARK};">Start buying or selling</p>
                    <p style="margin:0; font-size:13px; color:#64748b; line-height:1.5;">Browse products or list your own on the marketplace.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `,
    }),
  });
}


/* ─────────────────────────────────────────────
   PASSWORD RESET EMAIL
───────────────────────────────────────────── */
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/auth/reset-password?token=${token}`;

  await sendEmail({
    email,
    subject: "Reset your Marketrix password",
    fallbackLabel: "Reset URL",
    fallbackUrl: resetUrl,
    html: emailLayout({
      preheader: "You requested a password reset for your Marketrix account",
      badge: "Password Reset",
      heading: "Reset your password.",
      subheading: "We received a request to reset the password for the Marketrix account associated with this email address.",
      ctaUrl: resetUrl,
      ctaLabel: "Reset Password →",
      footerNote: "This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.",
      body: `
        <!-- Security info card -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:8px;">
          <tr>
            <td style="padding:20px; border-radius:16px; background:#fffef5; border:1px solid #fde68a;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:24px; vertical-align:top; padding-top:1px;">
                    <span style="font-size:16px;">🔒</span>
                  </td>
                  <td style="padding-left:10px;">
                    <p style="margin:0 0 4px; font-size:13px; font-weight:700; color:#92400e;">Security Notice</p>
                    <p style="margin:0; font-size:13px; color:#a16207; line-height:1.6;">
                      For your protection, this link can only be used once and expires in 1 hour. After resetting, you'll need to sign in with your new password.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Tips -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:16px; margin-bottom:8px;">
          <tr>
            <td style="padding:16px 20px; border-radius:16px; background:#f8fafa; border:1px solid #eef2f2;">
              <p style="margin:0 0 10px; font-size:12px; font-weight:700; color:${BRAND_DARK}; text-transform:uppercase; letter-spacing:0.06em;">Password tips</p>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding-bottom:6px;">
                    <span style="font-size:13px; color:#64748b; line-height:1.5;">✓&nbsp;&nbsp;Use at least 8 characters</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:6px;">
                    <span style="font-size:13px; color:#64748b; line-height:1.5;">✓&nbsp;&nbsp;Include an uppercase letter and a number</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span style="font-size:13px; color:#64748b; line-height:1.5;">✓&nbsp;&nbsp;Avoid reusing passwords from other sites</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `,
    }),
  });
}


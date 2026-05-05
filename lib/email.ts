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
   SHARED EMAIL LAYOUT — DARK THEME
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
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>${heading}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0; padding:0; background:${BRAND_DARK}; font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; -webkit-font-smoothing:antialiased;">

  <!-- Preheader (hidden preview text) -->
  <div style="display:none; max-height:0; overflow:hidden; mso-hide:all;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_DARK};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">

          <!-- ═══════ HEADER ═══════ -->
          <tr>
            <td style="padding:0 0 32px;">
              <!-- Logo -->
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:40px; height:40px; border-radius:12px; background:rgba(225,255,81,0.08); border:1px solid rgba(225,255,81,0.2); text-align:center; vertical-align:middle;">
                    <span style="font-size:18px; font-weight:800; color:${BRAND_COLOR}; line-height:40px;">M</span>
                  </td>
                  <td style="padding-left:12px; font-size:18px; font-weight:700; color:#ffffff; letter-spacing:-0.03em;">
                    market<span style="color:${BRAND_COLOR};">rix</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══════ MAIN CARD ═══════ -->
          <tr>
            <td style="border-radius:20px; overflow:hidden; border:1px solid rgba(225,255,81,0.12); background:linear-gradient(145deg, #003338 0%, #002428 100%);">

              <!-- Card Header -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding:40px 40px 32px;">
                    <!-- Badge -->
                    <div style="display:inline-block; margin-bottom:20px; padding:5px 14px; border-radius:999px; background:rgba(225,255,81,0.08); border:1px solid rgba(225,255,81,0.18); color:${BRAND_COLOR}; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em;">
                      ${badge}
                    </div>

                    <!-- Heading -->
                    <h1 style="margin:0 0 12px; font-size:26px; line-height:1.2; font-weight:800; color:#ffffff; letter-spacing:-0.02em;">
                      ${heading}
                    </h1>
                    <p style="margin:0; max-width:460px; color:rgba(255,255,255,0.6); font-size:15px; line-height:1.7;">
                      ${subheading}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding:0 40px;">
                    <div style="height:1px; background:linear-gradient(90deg, transparent, rgba(225,255,81,0.15), transparent);"></div>
                  </td>
                </tr>
              </table>

              <!-- Card Body -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding:32px 40px 12px;">
                    ${body}

                    <!-- CTA Button -->
                    <div style="margin:32px 0; text-align:center;">
                      <a href="${ctaUrl}"
                         style="display:inline-block; padding:16px 40px; border-radius:12px; background:${BRAND_COLOR}; color:${BRAND_DARK}; text-decoration:none; font-weight:800; font-size:15px; letter-spacing:-0.01em; box-shadow:0 8px 24px rgba(225,255,81,0.2), 0 2px 4px rgba(225,255,81,0.1); mso-padding-alt:0;">
                        <!--[if mso]><i style="letter-spacing:40px;mso-font-width:-100%;mso-text-raise:24pt">&nbsp;</i><![endif]-->
                        <span style="mso-text-raise:12pt;">${ctaLabel}</span>
                        <!--[if mso]><i style="letter-spacing:40px;mso-font-width:-100%">&nbsp;</i><![endif]-->
                      </a>
                    </div>

                    <!-- Fallback URL -->
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
                      <tr>
                        <td style="border-left:3px solid rgba(225,255,81,0.3); padding:12px 0 12px 16px;">
                          <p style="margin:0 0 4px; font-size:11px; font-weight:700; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:0.06em;">Button not working?</p>
                          <p style="margin:0; font-size:13px; line-height:1.6; color:rgba(255,255,255,0.5); word-break:break-all;">
                            <a href="${ctaUrl}" style="color:${BRAND_COLOR}; text-decoration:underline;">${ctaUrl}</a>
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Footer note -->
                    <p style="margin:0 0 8px; color:rgba(255,255,255,0.35); font-size:12px; line-height:1.7;">
                      ${footerNote}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══════ FOOTER ═══════ -->
          <tr>
            <td style="padding:28px 0 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="text-align:center;">
                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                      <tr>
                        <td style="width:24px; height:24px; border-radius:6px; background:rgba(225,255,81,0.08); text-align:center; vertical-align:middle;">
                          <span style="font-size:10px; font-weight:800; color:${BRAND_COLOR}; line-height:24px;">M</span>
                        </td>
                        <td style="padding-left:8px; font-size:12px; font-weight:600; color:rgba(255,255,255,0.4); letter-spacing:-0.01em;">
                          Marketrix
                        </td>
                      </tr>
                    </table>
                    <p style="margin:12px 0 0; font-size:11px; color:rgba(255,255,255,0.2); line-height:1.6;">
                      &copy; ${new Date().getFullYear()} Marketrix. All rights reserved.<br/>
                      You're receiving this email because an account action was initiated with this address.
                    </p>
                  </td>
                </tr>
              </table>
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
            <td style="padding:20px; border-radius:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06);">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="width:36px; vertical-align:top; padding-top:2px;">
                    <div style="width:28px; height:28px; border-radius:50%; background:rgba(225,255,81,0.12); border:1px solid rgba(225,255,81,0.25); color:${BRAND_COLOR}; font-size:12px; font-weight:800; line-height:28px; text-align:center;">1</div>
                  </td>
                  <td style="padding-left:12px; padding-bottom:18px;">
                    <p style="margin:0 0 2px; font-size:13px; font-weight:700; color:#ffffff;">Click the button below</p>
                    <p style="margin:0; font-size:13px; color:rgba(255,255,255,0.5); line-height:1.5;">Verify your email to activate your account.</p>
                  </td>
                </tr>
                <tr>
                  <td style="width:36px; vertical-align:top; padding-top:2px;">
                    <div style="width:28px; height:28px; border-radius:50%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); color:rgba(255,255,255,0.5); font-size:12px; font-weight:800; line-height:28px; text-align:center;">2</div>
                  </td>
                  <td style="padding-left:12px; padding-bottom:18px;">
                    <p style="margin:0 0 2px; font-size:13px; font-weight:700; color:#ffffff;">Sign in to your account</p>
                    <p style="margin:0; font-size:13px; color:rgba(255,255,255,0.5); line-height:1.5;">Use your credentials to access the dashboard.</p>
                  </td>
                </tr>
                <tr>
                  <td style="width:36px; vertical-align:top; padding-top:2px;">
                    <div style="width:28px; height:28px; border-radius:50%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); color:rgba(255,255,255,0.5); font-size:12px; font-weight:800; line-height:28px; text-align:center;">3</div>
                  </td>
                  <td style="padding-left:12px;">
                    <p style="margin:0 0 2px; font-size:13px; font-weight:700; color:#ffffff;">Start buying or selling</p>
                    <p style="margin:0; font-size:13px; color:rgba(255,255,255,0.5); line-height:1.5;">Browse products or list your own on the marketplace.</p>
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
            <td style="padding:20px; border-radius:14px; background:rgba(250,204,21,0.06); border:1px solid rgba(250,204,21,0.15);">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:24px; vertical-align:top; padding-top:1px;">
                    <span style="font-size:16px;">🔒</span>
                  </td>
                  <td style="padding-left:10px;">
                    <p style="margin:0 0 4px; font-size:13px; font-weight:700; color:#facc15;">Security Notice</p>
                    <p style="margin:0; font-size:13px; color:rgba(255,255,255,0.55); line-height:1.6;">
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
            <td style="padding:18px 20px; border-radius:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0 0 12px; font-size:11px; font-weight:700; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:0.06em;">Password tips</p>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding-bottom:6px;">
                    <span style="font-size:13px; color:rgba(255,255,255,0.55); line-height:1.5;"><span style="color:${BRAND_COLOR};">✓</span>&nbsp;&nbsp;Use at least 8 characters</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:6px;">
                    <span style="font-size:13px; color:rgba(255,255,255,0.55); line-height:1.5;"><span style="color:${BRAND_COLOR};">✓</span>&nbsp;&nbsp;Include an uppercase letter and a number</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span style="font-size:13px; color:rgba(255,255,255,0.55); line-height:1.5;"><span style="color:${BRAND_COLOR};">✓</span>&nbsp;&nbsp;Avoid reusing passwords from other sites</span>
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


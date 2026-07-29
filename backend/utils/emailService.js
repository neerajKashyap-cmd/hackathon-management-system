const nodemailer = require("nodemailer");

// Sanitize App Password (remove spaces if any)
const rawUser = process.env.EMAIL_USER || "lpuuniversitycertificate@gmail.com";
const rawPass = process.env.EMAIL_PASS || "kxjr eltk vbqa vwot";
const cleanPass = rawPass.replace(/\s+/g, "");

// Transporter configured with forced IPv4 family (family: 4) and Port 587 STARTTLS for Render/Cloud hosts
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: rawUser,
    pass: cleanPass,
  },
  family: 4, // FORCE IPv4 resolution to eliminate ENETUNREACH IPv6 error on Render
  connectionTimeout: 10000,
  greetingTimeout: 5000,
  socketTimeout: 10000,
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Send OTP Verification Email to User
 * @param {string} toEmail - Recipient Email
 * @param {string} otpCode - 6-Digit OTP Code
 * @param {string} userName - User Name
 */
const sendOTPEmail = async (toEmail, otpCode, userName = "Developer") => {
  const mailSender = process.env.EMAIL_USER || "lpuuniversitycertificate@gmail.com";
  const mailOptions = {
    from: `"HackSphere Security" <${mailSender}>`,
    to: toEmail,
    subject: `Your HackSphere Verification Code: ${otpCode}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #06080d; color: #f8fafc; padding: 40px 20px; border-radius: 16px; max-width: 520px; margin: 0 auto; border: 1px solid rgba(139, 92, 246, 0.3);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.02em;">
            HACK<span style="color: #06b6d4;">SPHERE</span>
          </h1>
          <p style="color: #8b5cf6; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px;">
            Account Email Verification
          </p>
        </div>

        <div style="background-color: #0e131f; border-radius: 12px; padding: 24px; border: 1px solid rgba(255, 255, 255, 0.08); text-align: center;">
          <p style="color: #cbd5e1; font-size: 15px; margin-bottom: 16px;">
            Hello <strong>${userName}</strong>, welcome to HackSphere! Use the One-Time Password (OTP) below to complete your registration:
          </p>

          <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.2)); border: 1px dashed #8b5cf6; padding: 16px; border-radius: 12px; display: inline-block; margin: 12px 0;">
            <span style="font-family: monospace; font-size: 32px; font-weight: 800; color: #38bdf8; letter-spacing: 0.25em;">${otpCode}</span>
          </div>

          <p style="color: #94a3b8; font-size: 13px; margin-top: 16px;">
            This code will expire in <strong>10 minutes</strong>. Please do not share this code with anyone.
          </p>
        </div>

        <div style="text-align: center; margin-top: 24px; color: #64748b; font-size: 12px;">
          &copy; 2026 HackSphere Enterprise Platform. All rights reserved.
        </div>
      </div>
    `,
  };

  try {
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Email SMTP connection timeout")), 10000)
    );

    const info = await Promise.race([sendPromise, timeoutPromise]);
    console.log(`[Email Service] OTP Email sent to ${toEmail}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[Email Service Warning] Failed to send OTP email:", error.message);
    console.log(`[FALLBACK OTP CODE] For ${toEmail}: ${otpCode}`);
    return { success: false, error: error.message };
  }
};

/**
 * Send Platform Announcement Broadcast Email to Registered Users
 * @param {Array<string>} recipientEmails - List of user emails
 * @param {string} subject - Email Subject Line
 * @param {string} title - Announcement Heading
 * @param {string} messageContent - Body text or HTML
 */
const sendAnnouncementEmail = async (recipientEmails, subject, title, messageContent) => {
  if (!recipientEmails || recipientEmails.length === 0) return;

  const mailSender = process.env.EMAIL_USER || "lpuuniversitycertificate@gmail.com";
  const mailOptions = {
    from: `"HackSphere Platform Broadcast" <${mailSender}>`,
    bcc: recipientEmails,
    subject: `📢 ${subject}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #06080d; color: #f8fafc; padding: 40px 20px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(6, 182, 212, 0.3);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.02em;">
            HACK<span style="color: #06b6d4;">SPHERE</span>
          </h1>
          <p style="color: #06b6d4; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px;">
            Official Platform Announcement
          </p>
        </div>

        <div style="background-color: #0e131f; border-radius: 12px; padding: 24px; border: 1px solid rgba(255, 255, 255, 0.08);">
          <h2 style="color: #38bdf8; margin-top: 0; font-size: 20px; font-weight: 700;">${title}</h2>
          <div style="color: #cbd5e1; font-size: 15px; line-height: 1.6;">
            ${messageContent}
          </div>
        </div>

        <div style="text-align: center; margin-top: 24px; color: #64748b; font-size: 12px;">
          You are receiving this email because you are a registered developer on HackSphere Platform.
        </div>
      </div>
    `,
  };

  try {
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Email SMTP broadcast timeout")), 10000)
    );

    const info = await Promise.race([sendPromise, timeoutPromise]);
    console.log(`[Email Announcement] Sent to ${recipientEmails.length} recipients. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[Email Announcement Error] Failed to send broadcast:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendOTPEmail, sendAnnouncementEmail };

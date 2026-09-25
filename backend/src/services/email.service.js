const nodemailer = require("nodemailer");

// Create transporter if SMTP credentials are provided
const createTransporter = () => {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SERVICE } = process.env;

    if (SMTP_SERVICE) {
        return nodemailer.createTransport({
            service: SMTP_SERVICE,
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS
            }
        });
    }

    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
        return nodemailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT) || 587,
            secure: Number(SMTP_PORT) === 465,
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS
            }
        });
    }

    return null;
};

// Generate random 6-digit numeric OTP
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Branded VYŪHA HTML email template
const buildEmailTemplate = ({ title, subtitle, name, otp, footerNote }) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { margin: 0; padding: 0; background-color: #03040a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        .wrapper { max-width: 540px; margin: 40px auto; background-color: #080c16; border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 102, 255, 0.15); }
        .header { background: linear-gradient(135deg, #03040a 0%, #0d1627 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid rgba(13, 32, 64, 0.8); }
        .logo { font-size: 26px; font-weight: 900; letter-spacing: 4px; color: #e8f4ff; margin: 0; }
        .logo span { color: #00d4ff; text-shadow: 0 0 16px #00d4ff; }
        .sublogo { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #4a6080; margin-top: 6px; }
        .body { padding: 36px 32px; color: #e8f4ff; }
        .greeting { font-size: 18px; font-weight: 700; margin-bottom: 12px; }
        .message { font-size: 14px; line-height: 1.6; color: #8fa3bf; margin-bottom: 28px; }
        .otp-container { text-align: center; margin: 28px 0; }
        .otp-box { display: inline-block; padding: 18px 36px; background-color: #03040a; border: 2px solid #00d4ff; border-radius: 12px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #00d4ff; box-shadow: 0 0 24px rgba(0, 212, 255, 0.25); text-shadow: 0 0 10px rgba(0, 212, 255, 0.5); }
        .expiry { font-size: 12px; color: #f59e0b; text-align: center; margin-top: 14px; }
        .footer { padding: 24px 32px; background-color: #03040a; text-align: center; border-top: 1px solid #0d2040; font-size: 11px; color: #4a6080; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1 class="logo">VY<span>Ū</span>HA</h1>
          <div class="sublogo">Secure · Multi-Tenant · AI Project Intelligence</div>
        </div>
        <div class="body">
          <div class="greeting">Hello ${name || 'there'},</div>
          <div class="message">${subtitle}</div>
          <div class="otp-container">
            <div class="otp-box">${otp}</div>
            <div class="expiry">⏱️ This code will expire in 15 minutes.</div>
          </div>
          <p style="font-size: 12px; color: #4a6080; line-height: 1.5; margin-top: 24px;">
            ${footerNote || 'If you did not request this, no action is needed and your account remains secure.'}
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} VYŪHA Enterprise Project Intelligence. All rights reserved.
        </div>
      </div>
    </body>
    </html>
    `;
};

// Send email verification OTP
const sendVerificationEmail = async ({ email, name, otp }) => {
    const transporter = createTransporter();

    console.log(`\n==================================================`);
    console.log(`🔑 [EMAIL VERIFICATION OTP]`);
    console.log(`📧 To: ${email} (${name || 'User'})`);
    console.log(`🔒 Code: ${otp}`);
    console.log(`⏱️ Expires in: 15 minutes`);
    console.log(`==================================================\n`);

    if (!transporter) {
        return { success: true, simulated: true, otp };
    }

    try {
        const fromAddress = process.env.SMTP_FROM || `"VYŪHA Security" <${process.env.SMTP_USER}>`;
        await transporter.sendMail({
            from: fromAddress,
            to: email,
            subject: `${otp} is your VYŪHA Verification Code`,
            html: buildEmailTemplate({
                title: "Verify Your Email",
                subtitle: "Thank you for registering with VYŪHA. Please enter the following 6-digit verification code to activate your account and verify your organization email.",
                name,
                otp,
                footerNote: "Never share this code with anyone. VYŪHA will never ask for your verification code."
            })
        });

        return { success: true, simulated: false };
    } catch (err) {
        console.warn("⚠️ SMTP sending failed, falling back to simulated verification:", err.message);
        return { success: true, simulated: true, otp };
    }
};

// Send password reset OTP
const sendPasswordResetEmail = async ({ email, name, otp }) => {
    const transporter = createTransporter();

    console.log(`\n==================================================`);
    console.log(`🔒 [PASSWORD RESET OTP]`);
    console.log(`📧 To: ${email} (${name || 'User'})`);
    console.log(`🔑 Code: ${otp}`);
    console.log(`⏱️ Expires in: 15 minutes`);
    console.log(`==================================================\n`);

    if (!transporter) {
        return { success: true, simulated: true, otp };
    }

    try {
        const fromAddress = process.env.SMTP_FROM || `"VYŪHA Security" <${process.env.SMTP_USER}>`;
        await transporter.sendMail({
            from: fromAddress,
            to: email,
            subject: `${otp} is your VYŪHA Password Reset Code`,
            html: buildEmailTemplate({
                title: "Reset Your Password",
                subtitle: "We received a request to reset the password for your VYŪHA account. Please enter the following 6-digit code to choose a new password.",
                name,
                otp,
                footerNote: "If you did not request a password reset, you can safely ignore this email. Your password will not change."
            })
        });

        return { success: true, simulated: false };
    } catch (err) {
        console.warn("⚠️ SMTP sending failed, falling back to simulated reset:", err.message);
        return { success: true, simulated: true, otp };
    }
};

module.exports = {
    generateOtp,
    sendVerificationEmail,
    sendPasswordResetEmail
};

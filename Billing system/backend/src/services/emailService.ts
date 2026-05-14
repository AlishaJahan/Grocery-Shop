const SibApiV3Sdk = require('sib-api-v3-sdk');
import dotenv from 'dotenv';

dotenv.config();

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

export const sendOTP = async (email: string, otp: string) => {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = "FreshMart - Your Verification OTP";
    sendSmtpEmail.htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #f8fafc;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #10b981;">FreshMart</h1>
            </div>
            <h2 style="color: #1e293b;">Verify Your Account</h2>
            <p style="color: #64748b; font-size: 16px;">Welcome to FreshMart! Please use the following OTP to verify your email address. This OTP is valid for 10 minutes.</p>
            <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #ffffff; border-radius: 12px; border: 2px dashed #10b981;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #10b981;">${otp}</span>
            </div>
            <p style="color: #64748b; font-size: 14px;">If you didn't request this, please ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="text-align: center; color: #94a3b8; font-size: 12px;">&copy; 2026 FreshMart Grocery Store. All rights reserved.</p>
        </div>
    `;
    sendSmtpEmail.sender = { "name": "FreshMart Support", "email": process.env.BREVO_SENDER_EMAIL || "no-reply@freshmart.com" };
    sendSmtpEmail.to = [{ "email": email }];

    try {
        if (!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY === 'your_brevo_api_key_here') {
            console.log("------------------------------------------");
            console.log(`[TEST MODE] OTP for ${email}: ${otp}`);
            console.log("------------------------------------------");
            return;
        }

        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`OTP sent to ${email}`);
    } catch (error) {
        console.error("Error sending OTP email:", error);
        // Fallback to console if email fails
        console.log("------------------------------------------");
        console.log(`[FALLBACK] OTP for ${email}: ${otp}`);
        console.log("------------------------------------------");
    }
};

export const sendResetPasswordOTP = async (email: string, otp: string) => {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = "FreshMart - Password Reset OTP";
    sendSmtpEmail.htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #f8fafc;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #10b981;">FreshMart</h1>
            </div>
            <h2 style="color: #1e293b;">Reset Your Password</h2>
            <p style="color: #64748b; font-size: 16px;">We received a request to reset your password. Please use the following OTP to proceed. This OTP is valid for 10 minutes.</p>
            <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #ffffff; border-radius: 12px; border: 2px dashed #10b981;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #10b981;">${otp}</span>
            </div>
            <p style="color: #64748b; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="text-align: center; color: #94a3b8; font-size: 12px;">&copy; 2026 FreshMart Grocery Store. All rights reserved.</p>
        </div>
    `;
    sendSmtpEmail.sender = { "name": "FreshMart Support", "email": process.env.BREVO_SENDER_EMAIL || "no-reply@freshmart.com" };
    sendSmtpEmail.to = [{ "email": email }];

    try {
        if (!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY === 'your_brevo_api_key_here') {
            console.log("------------------------------------------");
            console.log(`[TEST MODE] Reset OTP for ${email}: ${otp}`);
            console.log("------------------------------------------");
            return;
        }

        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`Reset OTP sent to ${email}`);
    } catch (error) {
        console.error("Error sending reset OTP email:", error);
        console.log("------------------------------------------");
        console.log(`[FALLBACK] Reset OTP for ${email}: ${otp}`);
        console.log("------------------------------------------");
    }
};

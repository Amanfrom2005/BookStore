import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({service: "gmail",auth: {user: process.env.EMAIL_USER,pass: process.env.EMAIL_PASS},});

transporter.verify((error, success) => {
    if(error){console.log('gmail service is not ready to send the email please check the email configuration')}
    else{console.log('gmail service is ready to send the email ')}
})

const sendEmail = async (to: string, subject: string, body: string) => {
    await transporter.sendMail({ from: `"your BookKart" <${process.env.EMAIL_USER}>`, to, subject, html: body })
}

export const sendVerificationToEmail = async (to: string, token: string) => {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`
    const html = `
        <h1>Welcome to your BookKart!</h1>
        <p>Thank you for registering with us!</p>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 22px; background: #007bff; color: #fff; border-radius: 4px; text-decoration: none; font-weight: bold;">Verify Email</a>
         <p style="margin-top: 20px; color: #666; font-size: 13px;">If you did not request this, please ignore this email.</p>
    `
    await sendEmail(to, 'please varify your email to acces your bookkart', html)
}

export const sendResetPasswordToEmail = async (to: string, token: string) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    const html = `
        <h1>Reset Your BookKart Password</h1>
        <p>We received a request to reset your password.</p>
        <p>Please click the link below to set a new password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 22px; background: #007bff; color: #fff; border-radius: 4px; text-decoration: none; font-weight: bold;">Reset Password</a>
        <p style="margin-top: 20px; color: #666; font-size: 13px;">If you did not request a password reset, you can ignore this email.</p>
    `;
    await sendEmail(to, 'Reset your BookKart password', html);
};

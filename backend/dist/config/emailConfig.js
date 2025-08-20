"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResetPasswordToEmail = exports.sendVerificationToEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
transporter.verify((error, success) => {
    if (error) {
        console.log('gmail service is not ready to send the email please check the email configuration');
    }
    else {
        console.log('gmail service is ready to send the email ');
    }
});
const sendEmail = (to, subject, body) => __awaiter(void 0, void 0, void 0, function* () {
    yield transporter.sendMail({
        from: `"your BookKart" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: body,
    });
});
const sendVerificationToEmail = (to, token) => __awaiter(void 0, void 0, void 0, function* () {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
    const html = `
        <h1>Welcome to your BookKart!</h1>
        <p>Thank you for registering with us!</p>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 22px; background: #007bff; color: #fff; border-radius: 4px; text-decoration: none; font-weight: bold;">Verify Email</a>
         <p style="margin-top: 20px; color: #666; font-size: 13px;">If you did not request this, please ignore this email.</p>
    `;
    yield sendEmail(to, 'please varify your email to acces your bookkart', html);
});
exports.sendVerificationToEmail = sendVerificationToEmail;
const sendResetPasswordToEmail = (to, token) => __awaiter(void 0, void 0, void 0, function* () {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    const html = `
        <h1>Reset Your BookKart Password</h1>
        <p>We received a request to reset your password.</p>
        <p>Please click the link below to set a new password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 22px; background: #007bff; color: #fff; border-radius: 4px; text-decoration: none; font-weight: bold;">Reset Password</a>
        <p style="margin-top: 20px; color: #666; font-size: 13px;">If you did not request a password reset, you can ignore this email.</p>
    `;
    yield sendEmail(to, 'Reset your BookKart password', html);
});
exports.sendResetPasswordToEmail = sendResetPasswordToEmail;

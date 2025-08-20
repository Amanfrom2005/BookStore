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
exports.checkUserAuth = exports.logout = exports.resetPassword = exports.forgotPassword = exports.login = exports.verifyEmail = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const responseHandler_1 = require("../utils/responseHandler");
const crypto_1 = __importDefault(require("crypto"));
const emailConfig_1 = require("../config/emailConfig");
const generateToken_1 = require("../utils/generateToken");
// Register a new user
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, agreeTerms } = req.body;
        const emailExists = yield User_1.default.findOne({ email });
        if (emailExists) {
            return (0, responseHandler_1.response)(res, 400, "A user with this email already exists.", null);
        }
        const verificationToken = crypto_1.default.randomBytes(20).toString("hex");
        const user = new User_1.default({
            name,
            email,
            password,
            agreeTerms,
            verificationToken,
        });
        yield user.save();
        yield (0, emailConfig_1.sendVerificationToEmail)(user.email, verificationToken);
        return (0, responseHandler_1.response)(res, 200, "Registration successful! Please check your email for the verification link.", null);
    }
    catch (error) {
        console.error(error);
        return (0, responseHandler_1.response)(res, 500, "Internal server error. Please try again later.", null);
    }
});
exports.register = register;
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params; // Should destruct token from params
        const user = yield User_1.default.findOne({ verificationToken: token });
        if (!user) {
            return (0, responseHandler_1.response)(res, 400, "Invalid or expired verification token.", null);
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        yield user.save();
        const accessToken = (0, generateToken_1.generateToken)(user);
        res.cookie("access_token", accessToken, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
        });
        return (0, responseHandler_1.response)(res, 200, "Your email has been successfully verified. You can now use our services.", null);
    }
    catch (error) {
        console.error(error);
        return (0, responseHandler_1.response)(res, 500, "Internal server error. Please try again later.", null);
    }
});
exports.verifyEmail = verifyEmail;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield User_1.default.findOne({ email });
        if (!user || !(yield user.comparePassword(password))) {
            return (0, responseHandler_1.response)(res, 400, "Incorrect email or password.", null);
        }
        if (!user.isVerified) {
            return (0, responseHandler_1.response)(res, 400, "Please verify your email before logging in. Check your inbox for the verification link.", null);
        }
        const accessToken = (0, generateToken_1.generateToken)(user);
        res.cookie("access_token", accessToken, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
        });
        return (0, responseHandler_1.response)(res, 200, "Login successful.", {
            user: { name: user.name, email: user.email },
        });
    }
    catch (error) {
        console.error(error);
        return (0, responseHandler_1.response)(res, 500, "Internal server error. Please try again later.", null);
    }
});
exports.login = login;
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            return (0, responseHandler_1.response)(res, 404, "No account found associated with this email address.", null);
        }
        const resetPasswordToken = crypto_1.default.randomBytes(20).toString("hex");
        user.resetPasswordToken = resetPasswordToken; // <--- Add this line! It was missing from your version
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
        yield user.save();
        yield (0, emailConfig_1.sendResetPasswordToEmail)(user.email, resetPasswordToken);
        return (0, responseHandler_1.response)(res, 200, "A password reset link has been sent to your email address.", null);
    }
    catch (error) {
        console.error(error);
        return (0, responseHandler_1.response)(res, 500, "Internal server error. Please try again later.", null);
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params; // Should destruct token from params
        const { newPassword } = req.body;
        const user = yield User_1.default.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });
        if (!user) {
            return (0, responseHandler_1.response)(res, 400, "Invalid or expired reset password token.", null);
        }
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        yield user.save();
        return (0, responseHandler_1.response)(res, 200, "Password reset successful! You may now log in with your new password.", null);
    }
    catch (error) {
        console.error(error);
        return (0, responseHandler_1.response)(res, 500, "Internal server error. Please try again later.", null);
    }
});
exports.resetPassword = resetPassword;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.clearCookie("access_token", {
            httpOnly: true,
            sameSite: "none",
            secure: true,
        });
        return (0, responseHandler_1.response)(res, 200, "Logout successful.", null);
    }
    catch (error) {
        console.error(error);
        return (0, responseHandler_1.response)(res, 500, "Internal server error. Please try again later.", null);
    }
});
exports.logout = logout;
const checkUserAuth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req === null || req === void 0 ? void 0 : req.id;
        if (!userId) {
            return (0, responseHandler_1.response)(res, 400, "user not authenticated please login to access our services", null);
        }
        const user = yield User_1.default.findById(userId).select("-password -verificationToken -resetPasswordToken -resetPasswordExpires");
        if (!user) {
            return (0, responseHandler_1.response)(res, 403, "user not found", null);
        }
        return (0, responseHandler_1.response)(res, 201, "user retrived successfuly", user);
    }
    catch (error) {
        console.error(error);
        return (0, responseHandler_1.response)(res, 500, "Internal server error. Please try again later.", null);
    }
});
exports.checkUserAuth = checkUserAuth;

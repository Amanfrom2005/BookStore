import { Request, Response } from "express";
import User from "../models/User";
import { response } from "../utils/responseHandler";
import crypto from "crypto";
import {
  sendResetPasswordToEmail,
  sendVerificationToEmail, // Consider renaming to sendVerificationToEmail
} from "../config/emailConfig";
import { generateToken } from "../utils/generateToken";

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, agreeTerms } = req.body;

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return response(res, 400, "A user with this email already exists.", null);
    }

    const verificationToken = crypto.randomBytes(20).toString("hex");
    const user = new User({
      name,
      email,
      password,
      agreeTerms,
      verificationToken,
    });
    await user.save();

    await sendVerificationToEmail(user.email, verificationToken);

    return response(
      res,
      200,
      "Registration successful! Please check your email for the verification link.",
      null
    );
  } catch (error) {
    console.error(error);
    return response(
      res,
      500,
      "Internal server error. Please try again later.",
      null
    );
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params; // Should destruct token from params
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return response(res, 400, "Invalid or expired verification token.", null);
    }

    user.isVerified = true;
    user.verificationToken = undefined;

    await user.save();

    const accessToken = generateToken(user);
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return response(
      res,
      200,
      "Your email has been successfully verified. You can now use our services.",
      null
    );
  } catch (error) {
    console.error(error);
    return response(
      res,
      500,
      "Internal server error. Please try again later.",
      null
    );
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return response(res, 400, "Incorrect email or password.", null);
    }

    if (!user.isVerified) {
      return response(
        res,
        400,
        "Please verify your email before logging in. Check your inbox for the verification link.",
        null
      );
    }

    const accessToken = generateToken(user);
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return response(res, 200, "Login successful.", {
      user: { name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    return response(
      res,
      500,
      "Internal server error. Please try again later.",
      null
    );
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return response(
        res,
        404,
        "No account found associated with this email address.",
        null
      );
    }

    const resetPasswordToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetPasswordToken; // <--- Add this line! It was missing from your version
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

    await user.save();

    await sendResetPasswordToEmail(user.email, resetPasswordToken);

    return response(
      res,
      200,
      "A password reset link has been sent to your email address.",
      null
    );
  } catch (error) {
    console.error(error);
    return response(
      res,
      500,
      "Internal server error. Please try again later.",
      null
    );
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params; // Should destruct token from params
    const { newPassword } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return response(
        res,
        400,
        "Invalid or expired reset password token.",
        null
      );
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return response(
      res,
      200,
      "Password reset successful! You may now log in with your new password.",
      null
    );
  } catch (error) {
    console.error(error);
    return response(
      res,
      500,
      "Internal server error. Please try again later.",
      null
    );
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("access_token", {
      httpOnly: true,
    });

    return response(res, 200, "Logout successful.", null);
  } catch (error) {
    console.error(error);
    return response(
      res,
      500,
      "Internal server error. Please try again later.",
      null
    );
  }
};

export const checkUserAuth = async (req: Request, res: Response) => {
  try {
    const userId = req?.id;
    if (!userId) {
      return response(
        res,
        400,
        "user not authenticated please login to access our services",
        null
      );
    }

    const user = await User.findById(userId).select(
      "-password -verificationToken -resetPasswordToken -resetPasswordExpires"
    );

    if (!user) {
      return response(res, 403, "user not found", null);
    }

    return response(res, 201, "user retrived successfuly", user);
  } catch (error) {
    console.error(error);
    return response(
      res,
      500,
      "Internal server error. Please try again later.",
      null
    );
  }
};

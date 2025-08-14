import e, { Request, Response } from "express";
import { response } from "../utils/responseHandler";
import User from "../models/User";

export const updateUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return response(res, 400, "User not found, please login", null);
    }

    const { name, email, phoneNumber } = req.body;

    const updateUser = await User.findByIdAndUpdate(
      userId,
      { name, email, phoneNumber },
      { new: true, runValidators: true }
    ).select(
      "-password -verificationToken -resetPasswordToken -resetPasswordExpires"
    );

    if (!updateUser) {
      return response(res, 404, "User not found", null);
    }

    return response(res, 200, "User updated successfully", updateUser);
  } catch (error) {
    console.error(error);
    response(res, 500, "Internal server error", null);
  }
};

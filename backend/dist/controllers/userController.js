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
exports.updateUserProfile = void 0;
const responseHandler_1 = require("../utils/responseHandler");
const User_1 = __importDefault(require("../models/User"));
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        if (!userId) {
            return (0, responseHandler_1.response)(res, 400, "User not found, please login", null);
        }
        const { name, email, phoneNumber } = req.body;
        const updateUser = yield User_1.default.findByIdAndUpdate(userId, { name, email, phoneNumber }, { new: true, runValidators: true }).select("-password -verificationToken -resetPasswordToken -resetPasswordExpires");
        if (!updateUser) {
            return (0, responseHandler_1.response)(res, 404, "User not found", null);
        }
        return (0, responseHandler_1.response)(res, 200, "User updated successfully", updateUser);
    }
    catch (error) {
        console.error(error);
        (0, responseHandler_1.response)(res, 500, "Internal server error", null);
    }
});
exports.updateUserProfile = updateUserProfile;

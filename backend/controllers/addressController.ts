import { Request, Response } from "express";
import { response } from "../utils/responseHandler";
import Address from "../models/Address";
import User from "../models/User";

export const createOrUpdateAddressByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.id;
    const {addressLine1,addressLine2,phoneNumber,city,state,pincode,addressId,} = req.body;
    if (!userId) {return response(res, 400, "User not found, please login");}
    if (!addressLine1 || !phoneNumber || !city || !state || !pincode) {return response(res, 400, "All fields are required");}

    if (addressId) {
      const existingAddress = await Address.findById(addressId);
      if (!existingAddress) {
        return response(res, 404, "Address not found", null);
      }
      existingAddress.addressLine1 = addressLine1;
      existingAddress.addressLine2 = addressLine2;
      existingAddress.phoneNumber = phoneNumber;
      existingAddress.city = city;
      existingAddress.state = state;
      existingAddress.pincode = pincode;
      await existingAddress.save();
      return response(res,200,"Address updated successfully",existingAddress);
    } else {
      const newAddress = new Address({user: userId,addressLine1,addressLine2,phoneNumber,city,state,pincode});
      await newAddress.save();
      await User.findByIdAndUpdate(userId,{ $push: { addresses: newAddress._id } },{ new: true });
      return response(res, 201, "Address created successfully", newAddress);
    }
  } catch (error) {
    console.error(error);
    response(res, 500, "Internal server error");
  }
};

export const getAddressByUserId = async ( req: Request, res: Response) => {
  try {
    const userId = req.id;
    if (!userId) {return response(res, 400, "User not found, please login");}
    const address = await User.findById(userId).populate("addresses");
    if (!address) {return response(res, 404, "Addresses not found");}
    return response(res, 200, "Addresses fetched successfully", address);
  } catch (error) {
    console.error(error);
    response(res, 500, "Internal server error");
  }
};

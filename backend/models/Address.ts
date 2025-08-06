import mongoose, { Document, Schema, Model } from "mongoose";

export interface IAddress extends Document {
  user: mongoose.Types.ObjectId; // Reference to the User
  addressLine1: string;
  addressLine2?: string; // Optional
  phoneNumber: string;
  city: string;
  state: string;
  pincode: string;
}

const addressSchema = new Schema<IAddress>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, default: null }, // optional by default
    phoneNumber: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  { timestamps: true }
);

const Address: Model<IAddress> = mongoose.model<IAddress>(
  "Address",
  addressSchema
);

export default Address;

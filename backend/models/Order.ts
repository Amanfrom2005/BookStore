import mongoose, { Document, Schema } from "mongoose";
import { IAddress } from "./Address";


export interface IOrderItem extends Document{
    product: mongoose.Types.ObjectId;
    quantity: number;
}

export interface IOrder extends Document {
    _id: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    items: IOrderItem[];
    totalAmount: number;
    shippingAddress: mongoose.Types.ObjectId | IAddress;
    paymentStatus: 'pending' | 'completed' | 'failed';
    paymentMathod: string;
    paymentDetails: {
        razorpay_order_id?: string,
        razorpay_payment_id?: string,
        razorpay_signature?: string,
    };
    status: "processing" | "shipped" | "delivered" | "cancelled";
}

const orderItemsSchema = new Schema<IOrderItem>({
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true }
})

const orderSchema = new Schema<IOrder>({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemsSchema], required: true },
    totalAmount: { type: Number, required: true },
    shippingAddress: { type: Schema.Types.ObjectId, ref: "Address", required: true },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending', required: true },
    paymentMathod: { type: String, required: true },
    paymentDetails: {
        razorpay_order_id: { type: String },
        razorpay_payment_id: { type: String },
        razorpay_signature: { type: String },
    },
    status: { type: String, enum: ["processing", "shipped", "delivered", "cancelled"], default: null, required: true },
}, {timestamps: true});
 
export default mongoose.model<IOrder>('Order', orderSchema);
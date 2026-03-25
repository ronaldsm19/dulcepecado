import mongoose, { Schema } from "mongoose";

export interface IOrder {
  _id: string;
  customerName: string;
  phone: string;
  productId: string;
  productName: string;
  options: string[];
  quantity: number;
  total: number;
  paid: boolean;
  orderedAt: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema(
  {
    customerName: { type: String, required: true, trim: true },
    phone:        { type: String, required: true, trim: true },
    productId:    { type: String, required: true },
    productName:  { type: String, required: true },
    options:      { type: [String], default: [] },
    quantity:     { type: Number, default: 1, min: 1 },
    total:        { type: Number, required: true, min: 0 },
    paid:         { type: Boolean, default: false },
    orderedAt:    { type: Date, default: Date.now },
    notes:        { type: String },
  },
  { timestamps: true }
);

export const Order =
  mongoose.models.Order || mongoose.model("Order", OrderSchema);

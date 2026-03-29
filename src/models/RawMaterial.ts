import mongoose, { Schema } from "mongoose";

export interface IRawMaterial {
  _id: string;
  name: string;
  type: "ingrediente" | "empaque" | "otro";
  unit: "unidad" | "kg" | "g" | "L" | "ml";
  quantity: number;
  unitCost: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const RawMaterialSchema = new Schema(
  {
    name:     { type: String, required: true, trim: true },
    type:     { type: String, enum: ["ingrediente", "empaque", "otro"], default: "ingrediente" },
    unit:     { type: String, enum: ["unidad", "kg", "g", "L", "ml"], default: "unidad" },
    quantity: { type: Number, default: 0, min: 0 },
    unitCost: { type: Number, default: 0, min: 0 },
    notes:    { type: String, default: "" },
  },
  { timestamps: true }
);

export const RawMaterial =
  mongoose.models.RawMaterial || mongoose.model("RawMaterial", RawMaterialSchema);

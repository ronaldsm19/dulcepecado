import mongoose, { Schema } from "mongoose";

export interface ICategory {
  _id: string;
  label: string;
  createdAt: Date;
}

const CategorySchema = new Schema(
  {
    label: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

export const Category =
  mongoose.models.Category || mongoose.model("Category", CategorySchema);

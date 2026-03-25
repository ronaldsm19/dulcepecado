import mongoose, { Schema } from "mongoose";

export interface IUser {
  _id: string;
  email: string;
  password: string; // bcrypt hash
  role: "admin";
  createdAt: Date;
}

const UserSchema = new Schema(
  {
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role:     { type: String, enum: ["admin"], default: "admin" },
  },
  { timestamps: true }
);

export const User =
  mongoose.models.User || mongoose.model("User", UserSchema);

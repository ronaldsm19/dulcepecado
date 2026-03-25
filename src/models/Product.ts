import mongoose, { Schema } from "mongoose";

// Plain interface for use across the app (API responses, components)
export interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  toppings: string[];
  image: string;
  category: "gelatina" | "apretado" | "especial";
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es requerido"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "La descripción es requerida"],
    },
    price: {
      type: Number,
      required: [true, "El precio es requerido"],
      min: [0, "El precio no puede ser negativo"],
    },
    toppings: {
      type: [String],
      default: [],
    },
    image: {
      type: String,
      required: [true, "La imagen es requerida"],
    },
    category: {
      type: String,
      enum: ["gelatina", "apretado", "especial"],
      required: [true, "La categoría es requerida"],
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

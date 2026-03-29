import mongoose, { Schema } from "mongoose";

export interface IRecipeIngredient {
  rawMaterialId: string;
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
}

export interface IRecipe {
  _id: string;
  name: string;
  description: string;
  ingredients: IRecipeIngredient[];
  yield: number;
  salePrice: number;
  createdAt: Date;
  updatedAt: Date;
}

const RecipeIngredientSchema = new Schema(
  {
    rawMaterialId: { type: Schema.Types.ObjectId, ref: "RawMaterial", required: true },
    name:          { type: String, required: true },
    quantity:      { type: Number, required: true, min: 0 },
    unit:          { type: String, required: true },
    unitCost:      { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const RecipeSchema = new Schema(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    ingredients: { type: [RecipeIngredientSchema], default: [] },
    yield:       { type: Number, default: 1, min: 1 },
    salePrice:   { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export const Recipe =
  mongoose.models.Recipe || mongoose.model("Recipe", RecipeSchema);

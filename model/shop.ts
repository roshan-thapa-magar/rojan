import mongoose, { Schema, Document } from "mongoose";

export interface IShop extends Document {
  shopStatus: string;
  openingTime?: string;
  closingTime?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ShopSchema = new Schema<IShop>(
  {
    shopStatus: { type: String, default: "closed" },
    openingTime: { type: String },
    closingTime: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Shop ||
  mongoose.model<IShop>("Shop", ShopSchema);

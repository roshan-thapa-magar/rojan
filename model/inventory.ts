import mongoose, { Schema, models } from "mongoose";

export const InventoryStatus = {
  IN_STOCK: "in-stock",
  LOW_STOCK: "low-stock",
  OUT_OF_STOCK: "out-of-stock",
} as const;

type InventoryStatusType =
  (typeof InventoryStatus)[keyof typeof InventoryStatus];

const inventorySchema = new Schema(
  {
    name: { type: String, required: [true, "Item name is required"] },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    status: {
      type: String,
      enum: Object.values(InventoryStatus),
      default: InventoryStatus.IN_STOCK,
    },
  },
  { timestamps: true }
);

const InventoryModel =
  models.Inventory || mongoose.model("Inventory", inventorySchema);

export default InventoryModel;
export type { InventoryStatusType };

import mongoose, { Schema, models } from "mongoose";

const salesSchema = new Schema(
  {
    inventoryId: {
      type: Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

const SalesModel = models.Sales || mongoose.model("Sales", salesSchema);

export default SalesModel;

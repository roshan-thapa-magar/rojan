import mongoose, { Schema, models } from "mongoose";

const serviceSchema = new Schema({
  type: {
    type: String,
    required: [true, "Service type is required"],
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
  },
  status: {
    type: String,
    default: "available",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ServiceModel = models.Service || mongoose.model("Service", serviceSchema);
export default ServiceModel;

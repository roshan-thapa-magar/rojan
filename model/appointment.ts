import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAppointment {
  name: string;
  email: string;
  phone: string;
  barber: string;
  service: {
    type: string;
    price: number;
  };
  schedule: string;
  customerType?: "regular" | "VIP" | "new";
  ageGroup?: "student" | "adult" | "child" | "young" | "other";
  paymentMethod?: "cash" | "online";
  paymentStatus?: "pending" | "paid" | "cancelled";
  status?: "scheduled" | "pending" | "completed" | "cancelled";
  myId?: string;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    barber: { type: String, required: true },
    service: {
      type: { type: String, required: true },
      price: { type: Number, required: true },
    },
    schedule: { type: String, required: true },
    customerType: { type: String, default: "new", required: false },
    ageGroup: { type: String, default: "adult", required: false },
    paymentMethod: { type: String, default: "cash", required: false },
    paymentStatus: { type: String, default: "pending", required: false },
    status: { type: String, default: "scheduled", required: false },
    myId: { type: String, required: false },
  },
  { timestamps: true }
);

const AppointmentModel: Model<IAppointment> =
  mongoose.models.Appointment ||
  mongoose.model("Appointment", AppointmentSchema);

export default AppointmentModel;

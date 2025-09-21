import mongoose, { Schema, models } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, default: "" },
  password: { type: String, minlength: 6, select: false },
  role: { type: String, enum: ["admin", "barber", "user"], default: "user" },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  image: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  position: { type: String },
  experience: { type: String },

  ageGroup: {
    type: String,
    enum: ["adult", "student", "old", "child"],
  },
  customerType: {
    type: String,
    enum: ["regular", "VIP", "new"],
    default: "new",
  },

  // OAuth fields
  oauthProvider: { type: String, enum: ["google", "credentials"], default: "credentials" },
  oauthId: { type: String },
  
  // Activity tracking
  lastLoginAt: { type: Date, default: Date.now },
  loginCount: { type: Number, default: 0 },
  
  // Password reset fields
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpires: { type: Date, select: false },
});

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Update login count and last login
userSchema.pre("save", function (next) {
  if (this.isModified("lastLoginAt")) {
    this.loginCount = (this.loginCount || 0) + 1;
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidate: string) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

const UserModel = models.User || mongoose.model("User", userSchema);
export default UserModel;

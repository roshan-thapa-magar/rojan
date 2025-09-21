import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import UserModel from "@/model/user";
import { resetPasswordSchema } from "@/lib/validation-schemas";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    // Validate input with Zod schema
    const validationResult = resetPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err) => err.message);
      return NextResponse.json({ error: errors.join(", ") }, { status: 400 });
    }

    const { token, newPassword } = validationResult.data;

    // Find user by reset token and check expiry
    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Update user password and clear reset token
    console.log("Before save - password:", newPassword);

    // Set the password directly (it will be hashed by the pre-save hook)
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Mark password as modified to ensure the pre-save hook runs
    user.markModified("password");
    await user.save();

    console.log(`Password reset successful for user: ${user.email}`);

    // Verify the password was saved correctly
    const updatedUser = await UserModel.findById(user._id).select("+password");
    console.log("After save - password length:", updatedUser?.password?.length);

    return NextResponse.json(
      { message: "Password has been reset successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}

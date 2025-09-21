import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import UserModel from "@/model/user";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter required" },
        { status: 400 }
      );
    }

    console.log("Looking for user with email:", email);
    
    // Find user by email
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    console.log("User found:", {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hasResetFields: {
        resetPasswordToken: !!user.resetPasswordToken,
        resetPasswordExpires: !!user.resetPasswordExpires
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasResetFields: {
          resetPasswordToken: !!user.resetPasswordToken,
          resetPasswordExpires: !!user.resetPasswordExpires
        }
      }
    });

  } catch (error: unknown) {
    console.error("Test user error:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

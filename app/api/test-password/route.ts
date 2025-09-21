import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import UserModel from "@/model/user";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    console.log("Testing password for email:", email);
    
    // Find user by email with password included
    const user = await UserModel.findOne({ email: email.toLowerCase() }).select("+password");
    
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
      hasPassword: !!user.password,
      passwordLength: user.password?.length
    });

    // Test password comparison
    const isValid = await bcrypt.compare(password, user.password);
    
    console.log("Password comparison result:", isValid);

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hasPassword: !!user.password,
        passwordLength: user.password?.length,
        passwordValid: isValid
      }
    });

  } catch (error: unknown) {
    console.error("Test password error:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

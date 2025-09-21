import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";

export async function GET() {
  try {
    console.log("Testing database connection...");
    console.log("MONGODB_URL:", process.env.MONGODB_URL ? "Set" : "Not set");

    await dbConnect();
    console.log("Database connected successfully");

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      mongodbUrl: process.env.MONGODB_URL ? "Configured" : "Not configured",
    });
  } catch (error: unknown) {
    console.error("Database connection failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        mongodbUrl: process.env.MONGODB_URL ? "Configured" : "Not configured",
      },
      { status: 500 }
    );
  }
}

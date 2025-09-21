import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import SalesModel from "@/model/sales";

export async function GET() {
  await dbConnect();
  try {
    const sales = await SalesModel.find().sort({ createdAt: -1 });
    return NextResponse.json(sales, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}

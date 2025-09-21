import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import InventoryModel from "@/model/inventory";

// Declare global io for TypeScript
declare global {
  var io: import("socket.io").Server;
}

await dbConnect();

// GET all inventory (optional status filter)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  try {
    const query: Record<string, unknown> = {};
    if (status) query.status = status;

    const items = await InventoryModel.find(query).sort({ createdAt: -1 });
    return NextResponse.json(items, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch inventory";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST new inventory item
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newItem = await InventoryModel.create(body);
    
    // Emit socket event for inventory item creation
    if (global.io) {
      global.io.emit("inventory:update", newItem);
    }
    
    return NextResponse.json(newItem, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to add item";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

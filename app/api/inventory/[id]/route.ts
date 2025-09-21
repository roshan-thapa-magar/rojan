import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import InventoryModel from "@/model/inventory";

// Declare global io for TypeScript
declare global {
  var io: import("socket.io").Server;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  try {
    const { id } = await params;
    const item = await InventoryModel.findById(id);
    if (!item)
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    return NextResponse.json(item, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch item" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await InventoryModel.findByIdAndUpdate(id, body, {
      new: true,
    });
    if (!updated)
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    
    // Emit socket event for inventory item update
    if (global.io) {
      global.io.emit("inventory:update", updated);
    }
    
    return NextResponse.json(updated, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  try {
    const { id } = await params;
    const deleted = await InventoryModel.findByIdAndDelete(id);
    if (!deleted)
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    
    // Emit socket event for inventory item deletion
    if (global.io) {
      global.io.emit("inventory:deleted", { id, item: deleted });
    }
    
    return NextResponse.json({ message: "Item deleted successfully" });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}

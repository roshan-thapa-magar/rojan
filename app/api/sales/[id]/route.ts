import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import InventoryModel from "@/model/inventory";
import SalesModel from "@/model/sales";

// Declare global io for TypeScript
declare global {
  var io: import("socket.io").Server;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  try {
    const { id } = await params;
    const body: { quantity?: number } = await req.json();

    if (!body.quantity || body.quantity <= 0) {
      return NextResponse.json(
        { error: "Quantity must be > 0" },
        { status: 400 }
      );
    }

    const item = await InventoryModel.findById(id);
    if (!item)
      return NextResponse.json({ error: "Item not found" }, { status: 404 });

    if (item.quantity < body.quantity)
      return NextResponse.json(
        { error: "Insufficient stock" },
        { status: 400 }
      );

    item.quantity -= body.quantity;
    if (item.quantity === 0) item.status = "out-of-stock";
    else if (item.quantity < 5) item.status = "low-stock";
    else item.status = "in-stock";

    await item.save();

    const sale = await SalesModel.create({
      name: item.name,
      quantity: body.quantity,
      price: item.price,
      inventoryId: item._id,
    });

    // Emit socket events for sale creation and inventory update
    if (global.io) {
      global.io.emit("sale:update", sale);
      global.io.emit("inventory:update", item);
    }

    return NextResponse.json({ item, sale }, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to process sale";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  try {
    const { id } = await params;
    const sale = await SalesModel.findByIdAndDelete(id);
    if (!sale)
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });

    // Emit socket event for sale deletion
    if (global.io) {
      global.io.emit("sale:deleted", { id, sale });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to delete sale";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

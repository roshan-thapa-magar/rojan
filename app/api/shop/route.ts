import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import ShopModel, { IShop } from "@/model/shop"; // make sure your model exports an interface IShop

// Declare global io for TypeScript
declare global {
  var io: import("socket.io").Server;
}

// Helper to safely extract error messages
const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "An unknown error occurred";

// GET: fetch latest shop status
export async function GET() {
  try {
    await dbConnect();
    const shop = await ShopModel.findOne().sort({ createdAt: -1 });

    return NextResponse.json({
      shopStatus: shop?.shopStatus || "closed",
      openingTime: shop?.openingTime || null,
      closingTime: shop?.closingTime || null,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

// POST: create a new shop entry
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body: Partial<IShop> = await req.json();

    const shop = new ShopModel(body);
    await shop.save();

    // Emit socket event for shop status creation
    if (global.io) {
      global.io.emit("shop:update", shop);
    }

    return NextResponse.json(shop, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 400 }
    );
  }
}

// PUT: update latest shop record
export async function PUT(req: Request) {
  try {
    await dbConnect();
    const body: Partial<IShop> = await req.json();

    let shop = await ShopModel.findOne().sort({ createdAt: -1 });

    if (!shop) {
      shop = new ShopModel(body);
    } else {
      Object.assign(shop, body);
    }

    await shop.save();

    // Emit socket event for shop status update
    if (global.io) {
      global.io.emit("shop:update", {
        shopStatus: shop.shopStatus,
        openingTime: shop.openingTime,
        closingTime: shop.closingTime,
      });
    }

    return NextResponse.json({
      shopStatus: shop.shopStatus,
      openingTime: shop.openingTime,
      closingTime: shop.closingTime,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 400 }
    );
  }
}

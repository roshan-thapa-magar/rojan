import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import ServiceModel from "@/model/service";

// Declare global io for TypeScript
declare global {
  var io: import("socket.io").Server;
}

interface ServiceBody {
  type: string;
  description?: string;
  price: number;
  duration?: number;
  status?: string;
}

// GET all services (optional status filter)
export async function GET(request: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // e.g., ?status=active

    const query: Partial<ServiceBody> = {};
    if (status) query.status = status;

    const services = await ServiceModel.find(query);
    return NextResponse.json(services, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST create new service
export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const body: ServiceBody = await request.json();

    if (!body.type || body.price == null) {
      return NextResponse.json(
        { error: "Type and price are required" },
        { status: 400 }
      );
    }

    const service = await ServiceModel.create(body);
    
    // Emit socket event for service creation
    if (global.io) {
      global.io.emit("service:update", service);
    }
    
    return NextResponse.json(service, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import AppointmentModel from "@/model/appointment";

// Declare global io for TypeScript
declare global {
  var io: import("socket.io").Server;
}

await dbConnect();

// Helper to extract error message safely
const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "An unknown error occurred";

// GET single appointment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const appointment = await AppointmentModel.findById(id);
    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(appointment);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

// PUT update appointment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updatedAppointment = await AppointmentModel.findByIdAndUpdate(
      id,
      body,
      { new: true }
    );

    if (!updatedAppointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Emit socket event for appointment update
    if (global.io) {
      global.io.emit("appointment:update", updatedAppointment);
    }

    return NextResponse.json(updatedAppointment);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

// DELETE appointment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deletedAppointment = await AppointmentModel.findByIdAndDelete(
      id
    );
    if (!deletedAppointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Emit socket event for appointment deletion
    if (global.io) {
      global.io.emit("appointment:deleted", { id, appointment: deletedAppointment });
    }

    return NextResponse.json({ message: "Appointment deleted successfully" });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

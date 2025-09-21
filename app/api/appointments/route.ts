import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import AppointmentModel, { IAppointment } from "@/model/appointment";
import { FilterQuery } from "mongoose";
import { sendAppointmentNotificationToBarbers } from "@/lib/email";

// Declare global io for TypeScript
declare global {
  var io: import("socket.io").Server;
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "An unknown error occurred";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const myIdParam = searchParams.get("myId");

    // Use FilterQuery for MongoDB operators
    const filter: FilterQuery<IAppointment> = {};

    if (statusParam) {
      const statuses = statusParam.split(",") as IAppointment["status"][];
      filter.status = { $in: statuses };
    }

    if (myIdParam) {
      filter.myId = myIdParam;
    }

    const appointments = await AppointmentModel.find(filter);
    return NextResponse.json(appointments, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

// POST new appointment
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body: Partial<IAppointment> = await request.json();
    console.log("=== APPOINTMENT CREATION DEBUG ===");
    console.log("Raw request body:", body);
    console.log("Body type:", typeof body);
    console.log("Body keys:", Object.keys(body));

    // Validate required fields
    const requiredFields = [
      "name",
      "email",
      "phone",
      "barber",
      "service",
      "schedule",
    ];
    const missingFields = requiredFields.filter(
      (field) => !body[field as keyof IAppointment]
    );

    if (missingFields.length > 0) {
      console.log("Missing required fields:", missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate service structure
    if (
      !body.service ||
      typeof body.service !== "object" ||
      !body.service.type ||
      !body.service.price
    ) {
      console.log("Invalid service structure:", body.service);
      return NextResponse.json(
        { error: "Service must have type and price" },
        { status: 400 }
      );
    }

    console.log("All validations passed, creating appointment...");

    const newAppointment = await AppointmentModel.create(body);
    console.log("Appointment created successfully:", newAppointment._id);

    // Send email notification to all barbers (optional - won't fail appointment creation)
    try {
      // Check if email credentials are configured
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log(
          "Email credentials not configured, skipping email notification"
        );
      } else {
        await sendAppointmentNotificationToBarbers({
          clientName: body.name || "Unknown",
          clientEmail: body.email || "No email provided",
          clientPhone: body.phone || "No phone provided",
          service: body.service?.type || "Unknown service",
          date: body.schedule
            ? new Date(body.schedule).toLocaleDateString()
            : "Unknown date",
          time: body.schedule
            ? new Date(body.schedule).toLocaleTimeString()
            : "Unknown time",
          barberName: body.barber || undefined,
        });
        console.log("Email notification sent successfully");
      }
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
      // Don't fail the appointment creation if email fails
    }
    // Emit socket event if io is available
    if (global.io) {
      global.io.emit("appointment:update", newAppointment);
    }

    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error: unknown) {
    console.error("=== APPOINTMENT CREATION ERROR ===");
    console.error("Error type:", typeof error);
    console.error(
      "Error message:",
      error instanceof Error ? error.message : "Unknown error"
    );
    console.error("Full error:", error);

    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

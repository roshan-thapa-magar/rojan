import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import AppointmentModel from "@/model/appointment";

await dbConnect();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Test appointment data:', body);
    
    // Create appointment without email
    const newAppointment = await AppointmentModel.create(body);
    console.log('Test appointment created:', newAppointment._id);
    
    return NextResponse.json({ 
      success: true, 
      appointment: newAppointment,
      message: 'Appointment created successfully (no email sent)'
    }, { status: 201 });
    
  } catch (error: unknown) {
    console.error('Test appointment error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

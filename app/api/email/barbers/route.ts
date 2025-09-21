import { NextRequest, NextResponse } from "next/server";
import { getAllBarberEmails, sendEmail } from "@/lib/email";

// GET - Get all barber emails
export async function GET() {
  try {
    const barberEmails = await getAllBarberEmails();
    return NextResponse.json({ 
      barberEmails, 
      count: barberEmails.length 
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching barber emails:', error);
    return NextResponse.json(
      { error: "Failed to fetch barber emails" },
      { status: 500 }
    );
  }
}

// POST - Send test email to all barbers
export async function POST(request: NextRequest) {
  try {
    const { subject, message } = await request.json();
    
    if (!subject || !message) {
      return NextResponse.json(
        { error: "Subject and message are required" },
        { status: 400 }
      );
    }

    const barberEmails = await getAllBarberEmails();
    
    if (barberEmails.length === 0) {
      return NextResponse.json(
        { error: "No active barbers found" },
        { status: 404 }
      );
    }

    // Send test email to all barbers
    const emailPromises = barberEmails.map(email => 
      sendEmail(email, subject, message)
    );

    await Promise.all(emailPromises);

    return NextResponse.json({ 
      message: `Test email sent to ${barberEmails.length} barbers`,
      barberEmails 
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error sending test emails:', error);
    return NextResponse.json(
      { error: "Failed to send test emails" },
      { status: 500 }
    );
  }
}

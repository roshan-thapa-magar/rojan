import nodemailer from "nodemailer";
import UserModel from "@/model/user";

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASSWORD, // Your Gmail app password
  },
});

// Function to get all barber emails
export async function getAllBarberEmails(): Promise<string[]> {
  try {
    // Check if we can connect to the database
    const barbers = await UserModel.find({ role: "barber", status: "active" });
    console.log(`Found ${barbers.length} active barbers`);
    return barbers.map((barber) => barber.email);
  } catch (error) {
    console.error("Error fetching barber emails:", error);
    return [];
  }
}

// Function to send appointment notification to all barbers
export async function sendAppointmentNotificationToBarbers(appointmentData: {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  service: string;
  date: string;
  time: string;
  barberName?: string;
}) {
  try {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log(
        "Email credentials not configured, skipping email notification"
      );
      return;
    }

    const barberEmails = await getAllBarberEmails();

    if (barberEmails.length === 0) {
      console.log("No active barbers found to send email to");
      return;
    }

    const emailSubject = "New Appointment Booking";
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Appointment Booking</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">Appointment Details</h3>
          <p><strong>Client Name:</strong> ${appointmentData.clientName}</p>
          <p><strong>Client Email:</strong> ${appointmentData.clientEmail}</p>
          <p><strong>Client Phone:</strong> ${appointmentData.clientPhone}</p>
          <p><strong>Service:</strong> ${appointmentData.service}</p>
          <p><strong>Date:</strong> ${appointmentData.date}</p>
          <p><strong>Time:</strong> ${appointmentData.time}</p>
          ${
            appointmentData.barberName
              ? `<p><strong>Assigned Barber:</strong> ${appointmentData.barberName}</p>`
              : ""
          }
        </div>
        <p style="color: #666; font-size: 14px;">
          This is an automated notification. Please check your appointment schedule.
        </p>
      </div>
    `;

    const emailText = `
New Appointment Booking

Appointment Details:
- Client Name: ${appointmentData.clientName}
- Client Email: ${appointmentData.clientEmail}
- Client Phone: ${appointmentData.clientPhone}
- Service: ${appointmentData.service}
- Date: ${appointmentData.date}
- Time: ${appointmentData.time}
${
  appointmentData.barberName
    ? `- Assigned Barber: ${appointmentData.barberName}`
    : ""
}

This is an automated notification. Please check your appointment schedule.
    `;

    // Send email to all barbers
    const emailPromises = barberEmails.map((email) =>
      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: emailSubject,
        html: emailHtml,
        text: emailText,
      })
    );

    await Promise.all(emailPromises);
    console.log(
      `Appointment notification sent to ${barberEmails.length} barbers`
    );
  } catch (error) {
    console.error("Error sending appointment notification emails:", error);
    throw error;
  }
}

// Function to send individual email (for testing or specific cases)
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML tags for text version
    });

    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

// Function to send password reset email
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  userName: string
) {
  try {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error("Email credentials not configured");
    }

    const resetUrl = `${
      process.env.NEXTAUTH_URL || "https://rojan-three.onrender.com"
    }/reset-password?token=${resetToken}`;

    const emailSubject = "Password Reset Request - Barber Shop";
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello ${userName},</p>
        <p>You recently requested to reset your password for your Barber Shop account. Click the button below to reset it.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p>This password reset link will expire in 1 hour.</p>
        
        <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        
        <p>Thanks,<br>The Barber Shop Team</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          If the button above doesn't work, copy and paste this link into your browser:<br>
          <a href="${resetUrl}" style="color: #007bff;">${resetUrl}</a>
        </p>
      </div>
    `;

    const emailText = `
Password Reset Request - Barber Shop

Hello ${userName},

You recently requested to reset your password for your Barber Shop account. Click the link below to reset it:

${resetUrl}

This password reset link will expire in 1 hour.

If you did not request a password reset, please ignore this email or contact support if you have concerns.

Thanks,
The Barber Shop Team
    `;

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
    });

    console.log("Password reset email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}

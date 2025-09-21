import React from "react";
import BookingForm from "@/components/hero/booking-form";
import AppointmentDetails from "@/components/hero/appointment-details";
export default function page() {
  return (
    <div>
      {" "}
      <BookingForm />
      <AppointmentDetails />
    </div>
  );
}

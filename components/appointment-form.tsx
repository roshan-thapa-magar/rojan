"use client";

import type React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  _id: string;
  name: string;
}

interface Service {
  _id: string;
  type: string;
  price: number;
}

interface PopulatedAppointment {
  _id: string;
  name: string;
  email: string;
  phone: string;
  barber: string;
  service: { type: string; price: number };
  schedule: string;
  customerType: "regular" | "VIP" | "new";
  ageGroup: "student" | "adult" | "child" | "young" | "other";
  paymentMethod: "cash" | "online";
  paymentStatus: "pending" | "paid" | "cancelled";
  status: "scheduled" | "pending" | "completed" | "cancelled";
}

interface AppointmentFormData {
  name: string;
  email: string;
  phone: string;
  barber: string;
  service: { type: string; price: number };
  schedule: string;
  customerType: "regular" | "VIP" | "new";
  ageGroup: "student" | "adult" | "child" | "young" | "other";
  paymentMethod: "cash" | "online";
  paymentStatus: "pending" | "paid" | "cancelled";
  status: "scheduled" | "pending" | "completed" | "cancelled";
}

interface AppointmentFormProps {
  appointment?: PopulatedAppointment;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (appointment: AppointmentFormData) => void;
}

export function AppointmentForm({
  appointment,
  isOpen,
  onClose,
  onSubmit,
}: AppointmentFormProps) {
  const [barbers, setBarbers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  const [formData, setFormData] = useState<AppointmentFormData>({
    name: "",
    email: "",
    phone: "",
    barber: "",
    service: { type: "", price: 0 },
    schedule: "",
    customerType: "regular",
    ageGroup: "adult",
    paymentMethod: "cash",
    paymentStatus: "pending",
    status: "pending",
  });

  // Fetch barbers and services
  useEffect(() => {
    if (isOpen) {
      const fetchOptions = async () => {
        setIsLoadingOptions(true);
        try {
          const [barbersResponse, servicesResponse] = await Promise.all([
            axios.get("/api/users?role=barber&status=active"),
            axios.get("/api/services?status=active"),
          ]);
          setBarbers(barbersResponse.data);
          setServices(servicesResponse.data);
        } catch (error) {
          toast.error("Failed to load barbers and services");
          console.error(error);
        } finally {
          setIsLoadingOptions(false);
        }
      };
      fetchOptions();
    }
  }, [isOpen]);

  // Prefill form if editing
  useEffect(() => {
    if (appointment) {
      setFormData({
        name: appointment.name,
        email: appointment.email,
        phone: appointment.phone,
        barber: appointment.barber, // string
        service: appointment.service, // { type, price }
        schedule: moment(appointment.schedule).format("YYYY-MM-DDTHH:mm"),
        customerType: appointment.customerType,
        ageGroup: appointment.ageGroup,
        paymentMethod: appointment.paymentMethod,
        paymentStatus: appointment.paymentStatus,
        status: appointment.status,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        barber: "",
        service: { type: "", price: 0 },
        schedule: "",
        customerType: "regular",
        ageGroup: "adult",
        paymentMethod: "cash",
        paymentStatus: "pending",
        status: "pending",
      });
    }
  }, [appointment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Customer name is required");
      return;
    }
    if (!formData.barber) {
      toast.error("Please select a barber");
      return;
    }
    if (!formData.service.type) {
      toast.error("Please select a service");
      return;
    }
    if (!formData.schedule) {
      toast.error("Please select a schedule");
      return;
    }

    onSubmit(formData); // barber is string, service is {type,price}
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {appointment ? "Edit Appointment" : "Add New Appointment"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Customer Name *</Label>
              <Input
              readOnly
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter customer name"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
              readOnly
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter email (optional)"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
              readOnly
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Enter phone number (optional)"
              />
            </div>

            {/* Barber */}
            <div className="space-y-2">
              <Label htmlFor="barber">Barber *</Label>
              <Select
                value={formData.barber}
                onValueChange={(name) =>
                  setFormData({ ...formData, barber: name })
                }
                disabled={isLoadingOptions}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      isLoadingOptions ? "Loading..." : "Select a barber"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {barbers.map((barber) => (
                    <SelectItem key={barber._id} value={barber.name}>
                      {barber.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Service */}
            <div className="space-y-2">
              <Label htmlFor="service">Service *</Label>
              <Select
                value={formData.service.type}
                onValueChange={(type) => {
                  const selected = services.find((s) => s.type === type);
                  if (selected) {
                    setFormData({
                      ...formData,
                      service: { type: selected.type, price: selected.price },
                    });
                  }
                }}
                disabled={isLoadingOptions}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      isLoadingOptions ? "Loading..." : "Select a service"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {services.map((service) => (
                    <SelectItem
                      key={service._id}
                      value={service.type}
                      className="w-full"
                    >
                      <div className="flex justify-between items-center w-full gap-4">
                        <span>{service.type}</span>
                        <span className="text-sm text-muted-foreground">
                          ( रु {service.price})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Schedule */}
            <div className="space-y-2">
              <Label htmlFor="schedule">Schedule *</Label>
              <Input
                id="schedule"
                type="datetime-local"
                value={formData.schedule}
                onChange={(e) =>
                  setFormData({ ...formData, schedule: e.target.value })
                }
                required
              />
            </div>

            {/* Customer Type */}
            <div className="space-y-2">
              <Label htmlFor="customerType">Customer Type</Label>
              <Select
                value={formData.customerType}
                onValueChange={(value: "regular" | "VIP" | "new") =>
                  setFormData({ ...formData, customerType: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select customer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Age Group */}
            <div className="space-y-2">
              <Label htmlFor="ageGroup">Age Group</Label>
              <Select
                value={formData.ageGroup}
                onValueChange={(
                  value: "student" | "adult" | "child" | "young" | "other"
                ) => setFormData({ ...formData, ageGroup: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select age group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="adult">Adult</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                  <SelectItem value="young">Young</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value: "cash" | "online") =>
                  setFormData({ ...formData, paymentMethod: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Status */}
            <div className="space-y-2">
              <Label htmlFor="paymentStatus">Payment Status</Label>
              <Select
                value={formData.paymentStatus}
                onValueChange={(value: "pending" | "paid" | "cancelled") =>
                  setFormData({ ...formData, paymentStatus: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(
                  value: "scheduled" | "pending" | "completed" | "cancelled"
                ) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoadingOptions}>
              {appointment ? "Update Appointment" : "Create Appointment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

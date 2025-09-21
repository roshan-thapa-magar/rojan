"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Search, Filter, Printer } from "lucide-react";
import { AppointmentForm } from "@/components/appointment-form";
import { io, Socket } from "socket.io-client";
interface ServiceDetails {
  type: string;
  price: number;
}

interface Appointment {
  _id: string;
  name: string;
  email: string;
  phone: string;
  barber: string;
  service: ServiceDetails;
  schedule: string;
  customerType: "regular" | "VIP" | "new";
  ageGroup: "student" | "adult" | "child" | "young" | "other";
  paymentMethod: "cash" | "online";
  paymentStatus: "pending" | "paid" | "cancelled";
  status: "scheduled" | "pending" | "completed" | "cancelled";
}

// Form data without _id
interface AppointmentFormData {
  name: string;
  email: string;
  phone: string;
  barber: string;
  service: ServiceDetails;
  schedule: string;
  customerType: "regular" | "VIP" | "new";
  ageGroup: "student" | "adult" | "child" | "young" | "other";
  paymentMethod: "cash" | "online";
  paymentStatus: "pending" | "paid" | "cancelled";
  status: "scheduled" | "pending" | "completed" | "cancelled";
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAppointment, setSelectedAppointment] = useState<
    Appointment | undefined
  >(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(
          "/api/appointments?status=scheduled,pending"
        );
        if (!Array.isArray(data)) {
          toast.error("Invalid data received from server");
          setAppointments([]);
          return;
        }
        setAppointments(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch appointments");
        setAppointments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();

    // Initialize socket connection
    const socket: Socket = io({
      path: "/socket.io/",
      transports: ["websocket", "polling"]
    });

    socket.on("connect", () => {
      console.log("Connected to socket server:", socket.id);
    });

    socket.on("appointment:update", (newAppointment: Appointment) => {
      console.log("Received appointment update:", newAppointment);
      setAppointments((prev) => {
        // Check if this is an update to existing appointment or new appointment
        const existingIndex = prev.findIndex((a) => a._id === newAppointment._id);
        if (existingIndex !== -1) {
          // Update existing appointment
          const updated = [...prev];
          updated[existingIndex] = newAppointment;
          return updated;
        } else {
          // Add new appointment (avoid duplicates)
          if (prev.find((a) => a._id === newAppointment._id)) return prev;
          return [...prev, newAppointment];
        }
      });
    });

    socket.on("appointment:deleted", (data: { id: string; appointment: Appointment }) => {
      console.log("Received appointment deletion:", data);
      setAppointments((prev) => prev.filter((a) => a._id !== data.id));
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // Cleanup function
    return () => {
      socket.disconnect();
    };
  }, []);

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.barber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || appointment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData: AppointmentFormData) => {
    try {
      if (selectedAppointment) {
        await axios.put(
          `/api/appointments/${selectedAppointment._id}`,
          formData
        );
        // refetch appointments to ensure table syncs with server
        const { data } = await axios.get(
          "/api/appointments?status=scheduled,pending"
        );
        setAppointments(data);
        toast.success("Appointment updated successfully");
      } else {
        const response = await axios.post("/api/appointments", formData);
        setAppointments((prev) => [...prev, response.data]);
        toast.success("Appointment added successfully");
      }
      setSelectedAppointment(undefined);
      setIsFormOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save appointment");
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedAppointment(undefined);
  };

  const handleDeleteAppointment = async (id: string) => {
    try {
      await axios.delete(`/api/appointments/${id}`);
      setAppointments((prev) => prev.filter((a) => a._id !== id));
      toast.success("Appointment deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete appointment");
    }
  };

  const handlePrintAppointment = (appointment: Appointment) => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const currentDate = moment().format("MMMM Do, YYYY");
      const appointmentDate = moment(appointment.schedule).format(
        "MMMM Do, YYYY"
      );
      const appointmentTime = moment(appointment.schedule).format("h:mm A");

      printWindow.document.write(`
        <html>
          <head>
            <title>Service Bill</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                padding: 20px; 
                max-width: 600px; 
                margin: 0 auto;
                line-height: 1.6;
              }
              .header { 
                text-align: center; 
                margin-bottom: 30px; 
                border-bottom: 2px solid #333;
                padding-bottom: 20px;
              }
              .company-name {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 5px;
              }
              .bill-title {
                font-size: 18px;
                color: #666;
                margin-top: 10px;
              }
              .bill-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
                padding: 15px;
                background-color: #f8f9fa;
                border-radius: 5px;
              }
              .customer-details {
                margin-bottom: 30px;
              }
              .service-details {
                margin-bottom: 30px;
              }
              .detail-row { 
                margin-bottom: 8px;
                display: flex;
                justify-content: space-between;
              }
              .label { 
                font-weight: bold; 
                color: #333;
              }
              .value {
                color: #666;
              }
              .service-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
              }
              .service-table th,
              .service-table td {
                border: 1px solid #ddd;
                padding: 12px;
                text-align: left;
              }
              .service-table th {
                background-color: #f8f9fa;
                font-weight: bold;
              }
              .total-section {
                border-top: 2px solid #333;
                padding-top: 15px;
                margin-top: 20px;
              }
              .total-row {
                display: flex;
                justify-content: space-between;
                font-size: 18px;
                font-weight: bold;
                margin-top: 10px;
              }
              .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                color: #666;
                font-size: 14px;
              }
              .status-badge {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
                text-transform: uppercase;
              }
              .status-scheduled {
                background-color: #e3f2fd;
                color: #1976d2;
              }
              .status-pending {
                background-color: #fff3e0;
                color: #f57c00;
              }
              .payment-pending {
                background-color: #fff3e0;
                color: #f57c00;
              }
              .payment-paid {
                background-color: #e8f5e8;
                color: #2e7d32;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-name">Barber Shop</div>
              <div class="bill-title">Service Bill</div>
            </div>
            
            <div class="bill-info">
              <div>
                <strong>Bill Date:</strong> ${currentDate}<br>
                <strong>Bill ID:</strong> #${appointment._id
                  .slice(-8)
                  .toUpperCase()}
              </div>
              <div>
                <strong>Appointment Date:</strong> ${appointmentDate}<br>
                <strong>Appointment Time:</strong> ${appointmentTime}
              </div>
            </div>

            <div class="customer-details">
              <h3>Customer Details</h3>
              <div class="detail-row">
                <span class="label">Name:</span>
                <span class="value">${appointment.name}</span>
              </div>
              <div class="detail-row">
                <span class="label">Customer Type:</span>
                <span class="value">${
                  appointment.customerType.charAt(0).toUpperCase() +
                  appointment.customerType.slice(1)
                }</span>
              </div>
              <div class="detail-row">
                <span class="label">Age Group:</span>
                <span class="value">${
                  appointment.ageGroup.charAt(0).toUpperCase() +
                  appointment.ageGroup.slice(1)
                }</span>
              </div>
            </div>

            <div class="service-details">
              <h3>Service Details</h3>
              <table class="service-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Barber</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${appointment.service.type}</td>
                    <td>${appointment.barber}</td>
                    <td>$${appointment.service.price.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="total-section">
              <div class="detail-row">
                <span class="label">Subtotal:</span>
                <span class="value">$${appointment.service.price.toFixed(
                  2
                )}</span>
              </div>
              <div class="detail-row">
                <span class="label">Tax (0%):</span>
                <span class="value">$0.00</span>
              </div>
              <div class="total-row">
                <span>Total Amount:</span>
                <span>$${appointment.service.price.toFixed(2)}</span>
              </div>
            </div>

            <div style="margin-top: 30px;">
              <div class="detail-row">
                <span class="label">Payment Method:</span>
                <span class="value">${
                  appointment.paymentMethod.charAt(0).toUpperCase() +
                  appointment.paymentMethod.slice(1)
                }</span>
              </div>
              <div class="detail-row">
                <span class="label">Payment Status:</span>
                <span class="status-badge payment-${
                  appointment.paymentStatus
                }">${
        appointment.paymentStatus.charAt(0).toUpperCase() +
        appointment.paymentStatus.slice(1)
      }</span>
              </div>
              <div class="detail-row">
                <span class="label">Appointment Status:</span>
                <span class="status-badge status-${appointment.status}">${
        appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)
      }</span>
              </div>
            </div>

            <div class="footer">
              <p>Thank you for choosing our services!</p>
              <p>For any queries, please contact us.</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getBadge = (
    value: string,
    type: "status" | "paymentMethod" | "paymentStatus" | "ageGroup"
  ) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > =
      type === "status"
        ? {
            scheduled: "default",
            pending: "outline",
            completed: "secondary",
            cancelled: "destructive",
          }
        : type === "paymentMethod"
        ? { cash: "outline", online: "secondary" }
        : type === "paymentStatus"
        ? { paid: "secondary", pending: "default", cancelled: "destructive" }
        : type === "ageGroup"
        ? {
            student: "secondary",
            adult: "default",
            child: "outline",
            young: "secondary",
            other: "outline",
          }
        : {};

    return (
      <Badge variant={variants[value] || "default"}>
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-none mb-6 border-b bg-background">
        <div className="flex flex-col mb-6 sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
            <p className="text-muted-foreground">
              Manage and track all appointments
            </p>
          </div>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="w-full sm:w-auto"
          >
            Add Appointment
          </Button>
        </div>
      </div>
      <div className="border rounded-lg p-4 bg-muted/50 ">
        <div className="flex md:flex-none md:justify-start ">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto border rounded-lg">
          {isLoading ? (
            <p className="p-6 text-center text-muted-foreground">Loading...</p>
          ) : (
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Name</TableHead>
                  {/* <TableHead>Email</TableHead> */}
                  <TableHead>Phone</TableHead>
                  <TableHead>Barber</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Customer Type</TableHead>
                  <TableHead>Age Group</TableHead>
                  <TableHead>Payment Method</TableHead>
                  {/* <TableHead>Payment Status</TableHead> */}
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appointment) => (
                  <TableRow key={appointment._id}>
                    <TableCell>{appointment.name}</TableCell>
                    <TableCell className="hidden">
                      {appointment.email}
                    </TableCell>
                    <TableCell>{appointment.phone}</TableCell>
                    <TableCell>{appointment.barber}</TableCell>
                    <TableCell>
                      {appointment.service.type} ( रु{" "}
                      {appointment.service.price})
                    </TableCell>
                    <TableCell>
                      {moment(appointment.schedule).format("YYYY-MM-DD h:mm A")}
                    </TableCell>
                    <TableCell>{appointment.customerType}</TableCell>
                    <TableCell>
                      {getBadge(appointment.ageGroup, "ageGroup")}
                    </TableCell>
                    <TableCell>
                      {getBadge(appointment.paymentMethod, "paymentMethod")}
                    </TableCell>
                    <TableCell className="hidden">
                      {getBadge(appointment.paymentStatus, "paymentStatus")}
                    </TableCell>
                    <TableCell>
                      {getBadge(appointment.status, "status")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEditAppointment(appointment)}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handlePrintAppointment(appointment)}
                          >
                            <Printer className="mr-2 h-4 w-4" /> Print Bill
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleDeleteAppointment(appointment._id)
                            }
                            className="text-destructive"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <AppointmentForm
        appointment={selectedAppointment}
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}

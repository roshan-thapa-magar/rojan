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
import { MoreHorizontal, Filter, Printer, Search } from "lucide-react";
import { AdminOnly } from "@/components/role-guard";

// Types
interface ServiceDetails {
  type: string;
  price: number;
}

export type AppointmentStatus =
  | "scheduled"
  | "pending"
  | "completed"
  | "cancelled";
export type CustomerType = "regular" | "VIP" | "new";
export type AgeGroup = "student" | "adult" | "child" | "young" | "other";
export type PaymentMethod = "cash" | "online";
export type PaymentStatus = "pending" | "paid" | "cancelled";

export interface Appointment {
  _id: string;
  name: string;
  email: string;
  phone: string;
  barber: string;
  service: ServiceDetails;
  schedule: string;
  customerType: CustomerType;
  ageGroup: AgeGroup;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: AppointmentStatus;
}

export type DateFilterType = "all" | "daily" | "weekly" | "monthly" | "custom";

export default function AppointmentsPage() {
  return (
    <AdminOnly>
      <AppointmentsPageContent />
    </AdminOnly>
  );
}

function AppointmentsPageContent() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">(
    "all"
  );
  console.log(setStatusFilter);
  const [dateFilter, setDateFilter] = useState<DateFilterType>("all");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch appointments (completed + cancelled)
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get<Appointment[]>(
          "/api/appointments?status=completed,cancelled"
        );
        setAppointments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch appointments");
        setAppointments([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  // Filtered appointments
  const filteredAppointments = appointments.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.barber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || a.status === statusFilter;

    const schedule = moment(a.schedule);
    let matchesDate = true;

    if (dateFilter === "daily") matchesDate = schedule.isSame(moment(), "day");
    else if (dateFilter === "weekly")
      matchesDate = schedule.isSame(moment(), "week");
    else if (dateFilter === "monthly")
      matchesDate = schedule.isSame(moment(), "month");
    else if (dateFilter === "custom" && customStartDate && customEndDate) {
      matchesDate =
        schedule.isSameOrAfter(moment(customStartDate)) &&
        schedule.isSameOrBefore(moment(customEndDate));
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalCompletedAmount = filteredAppointments
    .filter((a) => a.status === "completed")
    .reduce((sum, a) => sum + a.service.price, 0);

  const totalCancelledAmount = filteredAppointments
    .filter((a) => a.status === "cancelled")
    .reduce((sum, a) => sum + a.service.price, 0);

  // Actions
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
    if (!printWindow) return;
    const currentDate = moment().format("MMMM Do, YYYY");
    const appointmentDate = moment(appointment.schedule).format(
      "MMMM Do, YYYY"
    );
    const appointmentTime = moment(appointment.schedule).format("h:mm A");

    printWindow.document.write(`
      <html>
        <head><title>Service Bill</title></head>
        <body>
          <h2>Barber Shop - Service Bill</h2>
          <p>Bill Date: ${currentDate}</p>
          <p>Bill ID: #${appointment._id.slice(-8).toUpperCase()}</p>
          <p>Appointment Date: ${appointmentDate}</p>
          <p>Appointment Time: ${appointmentTime}</p>
          <p>Customer: ${appointment.name}</p>
          <p>Service: ${appointment.service.type}</p>
          <p>Barber: ${appointment.barber}</p>
          <p>Price: रु ${appointment.service.price}</p>
          <p>Status: ${appointment.status}</p>
          <p>Payment Method: ${appointment.paymentMethod}</p>
          <p>Payment Status: ${appointment.paymentStatus}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
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
        ? { completed: "secondary", cancelled: "destructive" }
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
      {/* Header */}
      <div className="flex-none mb-6 bg-background">
        <h1 className="text-2xl font-bold">Appointments Report</h1>
      </div>

      {/* Filters */}
      <div className="flex-none mb-6 bg-muted/50 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={dateFilter}
            onValueChange={(value) => setDateFilter(value as DateFilterType)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>

          {dateFilter === "custom" && (
            <div className="flex gap-2 flex-wrap">
              <Input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
              />
              <Input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto ¸">
        {isLoading ? (
          <p className="p-6 text-center text-muted-foreground">Loading...</p>
        ) : filteredAppointments.length === 0 ? (
          <p className="p-6 text-center text-muted-foreground">No data found</p>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Barber</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Customer Type</TableHead>
                  <TableHead>Age Group</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appointment) => (
                  <TableRow key={appointment._id}>
                    <TableCell>{appointment.name}</TableCell>
                    <TableCell>{appointment.email}</TableCell>
                    <TableCell>{appointment.phone}</TableCell>
                    <TableCell>{appointment.barber}</TableCell>
                    <TableCell>
                      {appointment.service.type} (रु {appointment.service.price}
                      )
                    </TableCell>
                    <TableCell>
                      {moment(appointment.schedule).format("MMMM Do, h:mm A")}
                    </TableCell>
                    <TableCell>{appointment.customerType}</TableCell>
                    <TableCell>
                      {getBadge(appointment.ageGroup, "ageGroup")}
                    </TableCell>
                    <TableCell>
                      {getBadge(appointment.paymentMethod, "paymentMethod")}
                    </TableCell>
                    <TableCell>
                      {getBadge(appointment.paymentStatus, "paymentStatus")}
                    </TableCell>
                    <TableCell>
                      {getBadge(appointment.status, "status")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
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
                <TableRow>
                  <TableCell colSpan={12} className="text-right py-4 font-bold">
                    Total Completed: रु {totalCompletedAmount} | Total
                    Cancelled: रु {totalCancelledAmount}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useUserContext } from "@/context/UserContext";
import moment from "moment";
import { io, Socket } from "socket.io-client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Service {
  _id: string;
  type: string;
  price: number;
}

interface Barber {
  _id: string;
  name: string;
}

interface Appointment {
  _id: string;
  ageGroup: string;
  schedule: string;
  service: Service;
  barber: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
  myId?: string; // Add myId field for user identification
}

type FormData = {
  barber: string;
  service: Service | null;
  ageGroup: string;
  schedule: string;
  status: string;
};

export default function AppointmentDetails() {
  const { user } = useUserContext();
  const myId = user?._id;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  const [formData, setFormData] = useState<FormData>({
    barber: "",
    service: null,
    ageGroup: "",
    schedule: "",
    status: "",
  });

  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);

  // Fetch appointments
  useEffect(() => {
    if (!myId) return;
    const fetchAppointments = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/appointments?myId=${myId}`);
        if (!res.ok) throw new Error("Failed to fetch appointments");
        const data: Appointment[] = await res.json();
        setAppointments(data);
      } catch (err: unknown) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();

    // Initialize socket connection for real-time updates
    const socket: Socket = io({
      path: "/socket.io/",
      transports: ["websocket", "polling"]
    });

    socket.on("connect", () => {
      console.log("Connected to socket server:", socket.id);
    });

    socket.on("appointment:update", (updatedAppointment: Appointment) => {
      console.log("Received appointment update:", updatedAppointment);
      setAppointments((prev) => {
        // Check if this appointment belongs to the current user
        if (updatedAppointment.myId !== myId) return prev;
        
        // Check if this is an update to existing appointment or new appointment
        const existingIndex = prev.findIndex((a) => a._id === updatedAppointment._id);
        if (existingIndex !== -1) {
          // Update existing appointment
          const updated = [...prev];
          updated[existingIndex] = updatedAppointment;
          return updated;
        } else {
          // Add new appointment (avoid duplicates)
          if (prev.find((a) => a._id === updatedAppointment._id)) return prev;
          return [...prev, updatedAppointment];
        }
      });
    });

    socket.on("appointment:deleted", (data: { id: string; appointment: Appointment }) => {
      console.log("Received appointment deletion:", data);
      // Only remove if it belongs to the current user
      if (data.appointment.myId === myId) {
        setAppointments((prev) => prev.filter((a) => a._id !== data.id));
      }
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
  }, [myId]);

  // Fetch services and barbers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, barbersRes] = await Promise.all([
          fetch("/api/services?status=active"),
          fetch("/api/users?role=barber&status=active"),
        ]);
        if (!servicesRes.ok || !barbersRes.ok)
          throw new Error("Failed to fetch barbers/services");
        setServices(await servicesRes.json());
        setBarbers(await barbersRes.json());
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch barbers/services");
      }
    };
    fetchData();
  }, []);

  const handleEdit = (appt: Appointment) => {
    setEditingAppointment(appt);
    setFormData({
      barber: appt.barber,
      service: appt.service,
      ageGroup: appt.ageGroup,
      schedule: appt.schedule,
      status: appt.status,
    });
  };

  const handleChange = <K extends keyof FormData>(
    key: K,
    value: FormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpdate = async () => {
    if (!editingAppointment || !formData.service) return;

    try {
      const payload = {
        barber: formData.barber,
        service: formData.service,
        ageGroup: formData.ageGroup,
        schedule: formData.schedule,
        status: formData.status,
      };

      const res = await fetch(`/api/appointments/${editingAppointment._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Update failed");

      const updated: Appointment = await res.json();
      setAppointments((prev) =>
        prev.map((a) => (a._id === updated._id ? updated : a))
      );
      setEditingAppointment(null);
      toast.success("Appointment updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "Failed to update appointment");
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      default:
        return "";
    }
  };

  const totalExpenses = useMemo(
    () =>
      appointments.reduce((sum, appt) => sum + (appt.service?.price || 0), 0),
    [appointments]
  );

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">My Appointments</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && appointments.length === 0 && <p>No appointments found.</p>}

      {appointments.length > 0 && (
        <>
          <Table className="text-center">
            <TableHeader>
              <TableRow>
                <TableHead>Barber</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Age Group</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appt) => (
                <TableRow key={appt._id}>
                  <TableCell>{appt.barber}</TableCell>
                  <TableCell>{appt.service.type}</TableCell>
                  <TableCell> रु {appt.service.price}</TableCell>
                  <TableCell>
                    {moment(appt.schedule).format("YYYY-MM-DD HH:mm A")}
                  </TableCell>
                  <TableCell>{appt.ageGroup}</TableCell>
                  <TableCell>{appt.paymentMethod}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      className={`${getStatusClass(
                        appt.status
                      )} px-2 py-1 rounded`}
                    >
                      {appt.status}
                    </Button>
                  </TableCell>
                  <TableCell>
                    {moment(appt.createdAt).format("YYYY-MM-DD HH:mm")}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => handleEdit(appt)}
                      disabled={
                        appt.status === "completed" ||
                        appt.status === "scheduled"
                      }
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={2} className="font-semibold">
                  Total Expenses
                </TableCell>
                <TableCell colSpan={7} className="font-semibold text-left">
                  रु {totalExpenses}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </>
      )}

      {/* Edit Modal */}
      {editingAppointment && (
        <Dialog
          open={!!editingAppointment}
          onOpenChange={() => setEditingAppointment(null)}
        >
          <DialogTrigger />
          <DialogContent className="bg-white p-6 rounded w-full max-w-md">
            <DialogTitle>Edit Appointment</DialogTitle>
            <div className="space-y-3 mt-2">
              <Select
                value={formData.barber}
                onValueChange={(val) => handleChange("barber", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Barber" />
                </SelectTrigger>
                <SelectContent>
                  {barbers.map((b) => (
                    <SelectItem key={b._id} value={b.name}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={formData.service?.type || ""}
                onValueChange={(val) => {
                  const selected = services.find((s) => s.type === val);
                  if (selected) handleChange("service", selected);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s._id} value={s.type}>
                      {s.type} ( रु {s.price})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={formData.ageGroup}
                onValueChange={(val) => handleChange("ageGroup", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Age Group" />
                </SelectTrigger>
                <SelectContent>
                  {["student", "adult", "child", "young", "other"].map((ag) => (
                    <SelectItem key={ag} value={ag}>
                      {ag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={formData.status}
                onValueChange={(val) => handleChange("status", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  {["pending", "cancelled"].map((st) => (
                    <SelectItem key={st} value={st}>
                      {st}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <input
                type="datetime-local"
                value={
                  formData.schedule
                    ? moment(formData.schedule).format("YYYY-MM-DDTHH:mm")
                    : ""
                }
                onChange={(e) => handleChange("schedule", e.target.value)}
                className="border px-2 py-2 w-full rounded"
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setEditingAppointment(null)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdate}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BarberForm } from "@/components/barber-form";
import { toast } from "sonner";
import type { Barber } from "@/types/barber";
import { apiFetch } from "@/lib/fetcher";
import { AdminOnly } from "@/components/role-guard";
import { io, Socket } from "socket.io-client";

export default function BarbersPage() {
  return (
    <AdminOnly>
      <BarbersPageContent />
    </AdminOnly>
  );
}

function BarbersPageContent() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(false);

  // --- Helpers to safely read unknown objects ---
  const toStringSafe = (v: unknown): string =>
    typeof v === "string" ? v : typeof v === "number" ? String(v) : "";

  const isObject = (v: unknown): v is Record<string, unknown> =>
    typeof v === "object" && v !== null && !Array.isArray(v);

  // Fetch barbers (stable reference with useCallback so it can be used in useEffect deps)
  const fetchBarbers = useCallback(async () => {
    const normalizeStatus = (raw: unknown): Barber["status"] => {
      const s = toStringSafe(raw).toLowerCase();
      return s === "inactive" ? "inactive" : "active";
    };

    setLoading(true);
    try {
      // treat raw API response as unknown and validate
      const data = await apiFetch<unknown>("/api/users?role=barber");

      const arr = Array.isArray(data) ? data : [];

      const normalized: Barber[] = arr.filter(isObject).map((obj) => {
        const rawId = obj["id"] ?? obj["_id"];
        const _id = toStringSafe(obj["_id"] ?? obj["id"] ?? rawId);
        const id = toStringSafe(obj["id"] ?? obj["_id"] ?? _id);

        const name = toStringSafe(obj["name"]);
        const email = toStringSafe(obj["email"]);
        const phone = toStringSafe(obj["phone"]);
        const image = toStringSafe(obj["image"]);
        const position = toStringSafe(obj["position"]);
        const experience = typeof obj["experience"] === "number" ? obj["experience"] : parseInt(toStringSafe(obj["experience"])) || 0;
        const status = normalizeStatus(obj["status"]);

        return {
          _id,
          id,
          name,
          email,
          phone,
          image,
          position,
          experience,
          status,
        } as Barber;
      });

      setBarbers(normalized);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(`Failed to load barbers: ${err.message}`);
      } else {
        toast.error("Failed to load barbers");
      }
    } finally {
      setLoading(false);
    }
  }, []); // no external dependencies needed

  useEffect(() => {
    fetchBarbers();
  }, [fetchBarbers]); // now quiet for eslint

  // Initialize socket connection for real-time updates
  useEffect(() => {
    const socket: Socket = io({
      path: "/socket.io/",
      transports: ["websocket", "polling"]
    });

    socket.on("connect", () => {
      console.log("Connected to socket server:", socket.id);
    });

    // Handle barber updates
    socket.on("user:update", (updatedUser: Barber) => {
      console.log("Received user update:", updatedUser);
      // Only update if it's a barber
      if (updatedUser.role === "barber") {
        setBarbers((prev) => {
          const existingIndex = prev.findIndex((b) => b._id === updatedUser._id || b.id === updatedUser.id);
          if (existingIndex !== -1) {
            // Update existing barber
            const updated = [...prev];
            updated[existingIndex] = updatedUser;
            return updated;
          } else {
            // Add new barber (avoid duplicates)
            if (prev.find((b) => b._id === updatedUser._id || b.id === updatedUser.id)) return prev;
            return [...prev, updatedUser];
          }
        });
      }
    });

    socket.on("user:deleted", (data: { id: string; user: Barber }) => {
      console.log("Received user deletion:", data);
      setBarbers((prev) => prev.filter((b) => b._id !== data.id && b.id !== data.id));
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

  const filteredBarbers = useMemo(
    () =>
      barbers.filter((b) =>
        [b.name, b.email, b.phone, b.position, b.experience.toString()]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      ),
    [barbers, searchTerm]
  );

  // Add barber
  const handleAddBarber = async (
    payload: Omit<Barber, "id" | "_id"> & { id?: string; _id?: string; password?: string }
  ) => {
    console.log("Adding barber with payload:", { ...payload, role: "barber" });
    await apiFetch<Barber>("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, role: "barber" }),
    });
    toast.success("Barber added successfully");
    // Real-time updates will handle UI updates via socket
  };

  // Edit barber
  const handleEditBarber = async (
    payload: Omit<Barber, "id" | "_id"> & { id?: string; _id?: string; password?: string }
  ) => {
    const barberId = payload._id || payload.id;
    if (!barberId) throw new Error("Barber ID missing");

    console.log("Editing barber with ID:", barberId, "Payload:", payload);
    await apiFetch<Barber>(`/api/users/${barberId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    toast.success("Barber updated successfully");
    setEditingBarber(undefined);
    // Real-time updates will handle UI updates via socket
  };

  // Delete barber
  const handleDeleteBarber = async (barber: Barber) => {
    const barberId = barber._id || barber.id;
    if (!barberId) return toast.error("Barber ID missing");
    
    if (!confirm("Delete this barber? This cannot be undone.")) return;

    try {
      console.log("Deleting barber with ID:", barberId);
      await apiFetch(`/api/users/${barberId}`, { method: "DELETE" });
      toast.success("Barber deleted successfully");
      // Real-time updates will handle UI updates via socket
    } catch (err: unknown) {
      console.error("Delete barber error:", err);
      if (err instanceof Error) toast.error(`Delete failed: ${err.message}`);
      else toast.error("Delete failed");
    }
  };

  const openAddForm = () => {
    setEditingBarber(undefined);
    setIsFormOpen(true);
  };

  const openEditForm = (b: Barber) => {
    setEditingBarber(b);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header + Add Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Barber Management</h1>
          <p className="text-muted-foreground">
            Manage your barber team efficiently
          </p>
        </div>
        <Button onClick={openAddForm} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Barber
        </Button>
      </div>

      {/* Card with Search + Table */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <CardTitle>Barbers</CardTitle>
            <CardDescription>List of barbers</CardDescription>
          </div>

          {/* Search input */}
          <div className="relative max-w-sm w-full mt-2 md:mt-0">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Search barbers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto w-full rounded-md border">
            <Table className="min-w-[700px]">
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[20%]">Name</TableHead>
                  <TableHead className="w-[20%]">Email</TableHead>
                  <TableHead className="w-[15%]">Phone</TableHead>
                  <TableHead className="w-[15%]">Position</TableHead>
                  <TableHead className="w-[10%]">Experience</TableHead>
                  <TableHead className="w-[8%]">Image</TableHead>
                  <TableHead className="w-[7%]">Status</TableHead>
                  <TableHead className="w-[5%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                )}

                {!loading && filteredBarbers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No barbers found
                    </TableCell>
                  </TableRow>
                )}

                {filteredBarbers.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell>{b.email}</TableCell>
                    <TableCell>{b.phone}</TableCell>
                    <TableCell>{b.position}</TableCell>
                    <TableCell>{b.experience} years</TableCell>
                    <TableCell>
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={b.image || ""}
                          alt={b.name}
                        />
                        <AvatarFallback>{b.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          b.status === "active" ? "default" : "secondary"
                        }
                      >
                        {b.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditForm(b)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => handleDeleteBarber(b)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card Layout */}
          <div className="md:hidden space-y-2">
            {loading && <p className="text-center py-4">Loading...</p>}
            {!loading && filteredBarbers.length === 0 && (
              <p className="text-center py-4">No barbers found</p>
            )}

            {filteredBarbers.map((b) => (
              <div
                key={b.id}
                className="p-4 border rounded-md space-y-2 bg-background"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">{b.name}</p>
                  <Badge
                    variant={b.status === "active" ? "default" : "secondary"}
                  >
                    {b.status}
                  </Badge>
                </div>
                <p>Email: {b.email}</p>
                <p>Phone: {b.phone}</p>
                <p>Position: {b.position}</p>
                <p>Experience: {b.experience} years</p>
                <div className="flex items-center justify-between mt-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={b.image || ""}
                      alt={b.name}
                    />
                    <AvatarFallback>{b.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => openEditForm(b)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteBarber(b)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Barber Form Dialog */}
      <BarberForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        barber={editingBarber}
        onSubmit={editingBarber ? handleEditBarber : handleAddBarber}
      />
    </div>
  );
}

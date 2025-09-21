"use client";

import { useState, useEffect } from "react";
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
import { MoreHorizontal, Search, Filter } from "lucide-react";
import { ClientForm } from "@/components/client-form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/UserContext";
interface Client {
  id?: string;
  name: string;
  email: string;
  phone: string;
  ageGroup: "adult" | "student" | "old" | "child";
  customerType: "regular" | "VIP" | "new";
}

interface ClientApiResponse {
  _id: string;
  name: string;
  email: string;
  phone: string;
  ageGroup: string;
  customerType: "regular" | "VIP" | "new";
}

const mapAgeGroupFromApi = (ageGroup: string): Client["ageGroup"] => {
  switch (ageGroup) {
    case "child":
      return "child";
    case "student":
      return "student";
    case "old":
      return "old";
    case "adult":
    default:
      return "adult";
  }
};

const mapAgeGroupToApi = (ageGroup: Client["ageGroup"]): string => ageGroup;

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerTypeFilter, setCustomerTypeFilter] = useState<
    "all" | "regular" | "VIP" | "new"
  >("all");
  const [editingClient, setEditingClient] = useState<Client | undefined>();
  const { user } = useUserContext();

  useEffect(() => {
    async function fetchClients() {
      try {
        const res = await fetch("/api/users?role=user");
        if (!res.ok) throw new Error("Failed to fetch clients");
        const data: ClientApiResponse[] = await res.json();
        const clientsData: Client[] = data.map((c) => ({
          id: c._id,
          name: c.name || "",
          email: c.email || "",
          phone: c.phone || "",
          ageGroup: mapAgeGroupFromApi(c.ageGroup),
          customerType: c.customerType || "new",
        }));
        setClients(clientsData);
      } catch (err: unknown) {
        if (err instanceof Error) toast.error(err.message);
      }
    }
    fetchClients();
  }, []);

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm);
    const matchesCustomerType =
      customerTypeFilter === "all" ||
      client.customerType === customerTypeFilter;
    return matchesSearch && matchesCustomerType;
  });

  const handleSaveClient = async (clientData: Client) => {
    if (!clientData.id) return; // Only editing
    try {
      const payload = {
        ...clientData,
        ageGroup: mapAgeGroupToApi(clientData.ageGroup),
      };

      const res = await fetch(`/api/users/${clientData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update client");

      const updatedClient: ClientApiResponse = await res.json();
      setClients((prev) =>
        prev.map((c) =>
          c.id === updatedClient._id
            ? {
                ...updatedClient,
                id: updatedClient._id,
                ageGroup: mapAgeGroupFromApi(updatedClient.ageGroup),
              }
            : c
        )
      );
      toast.success("Client updated successfully!");
      setEditingClient(undefined);
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
    }
  };

  const handleDeleteClient = async (id?: string) => {
    if (!id) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete client");
      setClients((prev) => prev.filter((c) => c.id !== id));
      toast.success("Client deleted successfully!");
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
    }
  };

  const getAgeGroupBadge = (ageGroup: Client["ageGroup"]) => {
    const labels: Record<Client["ageGroup"], string> = {
      child: "Child",
      student: "Student",
      adult: "Adult",
      old: "Old",
    };
    return <Badge variant="outline">{labels[ageGroup]}</Badge>;
  };

  const getCustomerTypeBadge = (customerType: Client["customerType"]) => {
    const variants: Record<
      Client["customerType"],
      "default" | "secondary" | "outline"
    > = {
      regular: "secondary",
      VIP: "default",
      new: "outline",
    };
    return <Badge variant={variants[customerType]}>{customerType}</Badge>;
  };

  return (
    <div className="flex flex-col h-full min-h-screen space-y-6 ">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Client Management</h1>
          <p className="text-muted-foreground">Manage and view your clients</p>
        </div>
      </div>
      <div className="border rounded-lg p-4 bg-muted/50 ">
      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2 items-center">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={customerTypeFilter}
            onValueChange={(value) =>
              setCustomerTypeFilter(value as "all" | "regular" | "VIP" | "new")
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="VIP">VIP</SelectItem>
              <SelectItem value="new">New</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border">
        {filteredClients.length === 0 ? (
          <p className="text-center py-6 text-muted-foreground">
            No clients found.
          </p>
        ) : (
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Age Group</TableHead>
                <TableHead>Customer Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>{getAgeGroupBadge(client.ageGroup)}</TableCell>
                  <TableCell>
                    {getCustomerTypeBadge(client.customerType)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setEditingClient(client)}
                        >
                          Edit
                        </DropdownMenuItem>
                        {user?.role === "admin" && (
                          <DropdownMenuItem
                            onClick={() => handleDeleteClient(client.id)}
                            className="text-destructive"
                          >
                            Delete
                          </DropdownMenuItem>
                        )}
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
      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredClients.length === 0 ? (
          <p className="text-center py-6 text-muted-foreground">
            No clients found.
          </p>
        ) : (
          filteredClients.map((client) => (
            <div
              key={client.id}
              className="border rounded-lg p-4 space-y-2 bg-background"
            >
              <div className="flex justify-between items-center">
                <p className="font-medium">{client.name}</p>
                {getCustomerTypeBadge(client.customerType)}
              </div>
              <p>Email: {client.email}</p>
              <p>Phone: {client.phone}</p>
              <div className="flex justify-between items-center mt-2">
                {getAgeGroupBadge(client.ageGroup)}
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setEditingClient(client)}>
                    Edit
                  </Button>
                  {user?.role === "admin" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteClient(client.id)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {editingClient && (
        <ClientForm
          client={editingClient}
          isOpen={!!editingClient}
          onClose={() => setEditingClient(undefined)}
          onSave={handleSaveClient}
        />
      )}
    </div>
  );
}

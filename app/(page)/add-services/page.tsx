"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceForm, type Service } from "@/components/service-form";
import { Plus, Search, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminOnly } from "@/components/role-guard";
// Define the type for API response
interface ServiceResponse {
  _id: string;
  type: string;
  price: number;
  status?: "active" | "inactive";
}

export default function ServicesPage() {
  return (
    <AdminOnly>
      <ServicesPageContent />
    </AdminOnly>
  );
}

function ServicesPageContent() {
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>();
  const [formMode, setFormMode] = useState<"add" | "edit">("add");

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services");
      const data: ServiceResponse[] = await res.json();

      const mapped: Service[] = data.map((s) => ({
        id: s._id,
        service: s.type,
        price: s.price,
        status: s.status || "active",
      }));

      setServices(mapped);
    } catch (err) {
      // _err is intentionally unused
      console.log(err);
      toast.error("Failed to fetch services");
    }
  };

  const filteredServices = services.filter((service) =>
    service.service?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddService = () => {
    setEditingService(undefined);
    setFormMode("add");
    setIsFormOpen(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      await fetch(`/api/services/${id}`, { method: "DELETE" });
      setServices(services.filter((s) => s.id !== id));
      toast.success("Service deleted successfully");
    } catch {
      toast.error("Failed to delete service");
    }
  };

  const handleFormSubmit = async (
    serviceData: Service | Omit<Service, "id">
  ) => {
    try {
      if (formMode === "add") {
        const res = await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: (serviceData as Omit<Service, "id">).service,
            price: (serviceData as Omit<Service, "id">).price,
            status: (serviceData as Omit<Service, "id">).status,
          }),
        });
        const newServiceData = await res.json();
        setServices([
          ...services,
          {
            id: newServiceData._id,
            service: newServiceData.type,
            price: newServiceData.price,
            status: newServiceData.status,
          },
        ]);
        toast.success("Service added successfully");
      } else if (editingService) {
        const res = await fetch(`/api/services/${editingService.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: (serviceData as Service).service,
            price: (serviceData as Service).price,
            status: (serviceData as Service).status,
          }),
        });
        const updatedService = await res.json();
        setServices(
          services.map((s) =>
            s.id === updatedService._id
              ? {
                  id: updatedService._id,
                  service: updatedService.type,
                  price: updatedService.price,
                  status: updatedService.status,
                }
              : s
          )
        );
        toast.success("Service updated successfully");
      }
      setIsFormOpen(false);
    } catch {
      toast.error("Failed to save service");
    }
  };

  const getStatusBadge = (status: Service["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "inactive":
        return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold">Services</h1>
        <div className="flex gap-2">
          <Button onClick={handleAddService}>
            <Plus className="mr-2 h-4 w-4" /> Add Service
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <CardTitle>Service Management</CardTitle>
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>{service.service}</TableCell>
                    <TableCell> रु {service.price.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(service.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEditService(service)}
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteService(service.id)}
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

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="border rounded-lg p-4 bg-background space-y-2"
              >
                <div className="flex justify-between items-center">
                  <p className="font-medium">{service.service}</p>
                  {getStatusBadge(service.status)}
                </div>
                <p>Price: रु {service.price.toFixed(2)}</p>
                <div className="flex justify-end gap-2">
                  <Button size="sm" onClick={() => handleEditService(service)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteService(service.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ServiceForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        service={editingService}
        mode={formMode}
      />
    </div>
  );
}

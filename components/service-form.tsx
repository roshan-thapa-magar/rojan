"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export interface Service {
  id: string;
  service: string;
  price: number;
  status: "active" | "inactive";
}

interface ServiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (service: Omit<Service, "id"> | Service) => void;
  service?: Service;
  mode: "add" | "edit";
}

export function ServiceForm({
  isOpen,
  onClose,
  onSubmit,
  service,
  mode,
}: ServiceFormProps) {
  const [formData, setFormData] = useState({
    service: service?.service || "",
    price: service?.price ?? 0,
    status: service?.status || "active",
  });

  useEffect(() => {
    setFormData({
      service: service?.service || "",
      price: service?.price ?? 0,
      status: service?.status || "active",
    });
  }, [service, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData });
    setFormData({ service: "", price: 0, status: "active" });
    onClose();
  };

  const handleClose = () => {
    setFormData({
      service: service?.service || "",
      price: service?.price ?? 0,
      status: service?.status || "active",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add Service" : "Edit Service"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="service">Service Name</Label>
            <Input
              id="service"
              value={formData.service}
              onChange={(e) =>
                setFormData({ ...formData, service: e.target.value })
              }
              placeholder="Enter service name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price ( रु )</Label>
            <Input
              id="price"
              type="number"
              min={0}
              step={0.01}
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: parseFloat(e.target.value) })
              }
              placeholder="Enter price"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: "active" | "inactive") =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                </SelectItem>
                <SelectItem value="inactive">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === "add" ? "Add Service" : "Update Service"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import React, { useEffect, useState } from "react";
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from "lucide-react";
import type { Barber } from "@/types/barber";
import { barberFormSchema, barberEditFormSchema } from "@/lib/validation-schemas";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  barber?: Barber | undefined;
  onSubmit: (
    payload: Omit<Barber, "id" | "_id"> & { id?: string; _id?: string; password?: string }
  ) => Promise<void>;
}

export function BarberForm({ open, onOpenChange, barber, onSubmit }: Props) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    image: "",
    position: "",
    experience: "0",
    status: "active" as "active" | "inactive",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (barber) {
      setFormData({
        name: barber.name,
        email: barber.email,
        phone: barber.phone,
        password: "",
        image: barber.image || "",
        position: barber.position || "",
        experience: String(barber.experience || 0),
        status: barber.status || "active",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        image: "",
        position: "",
        experience: "0",
        status: "active",
      });
    }
  }, [barber, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormData((s) => ({ ...s, image: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});

    // Use appropriate schema based on whether we're editing or creating
    const schema = barber ? barberEditFormSchema : barberFormSchema;
    
    try {
      // Validate the form data
      const validatedData = schema.parse(formData);
      
      console.log("Form validation passed:", { 
        password: validatedData.password, 
        passwordLength: validatedData.password?.length,
        isEditing: !!barber,
        formData: formData
      });
      
      // Create payload - only include _id when editing, not when creating
      const payload: Omit<Barber, "id" | "_id"> & { id?: string; _id?: string; password?: string } = {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        image: validatedData.image || "",
        position: validatedData.position,
        experience: typeof validatedData.experience === "string" ? parseInt(validatedData.experience) || 0 : validatedData.experience,
        status: validatedData.status,
        // Include both id and _id when editing for compatibility
        ...(barber && { 
          id: barber.id || barber._id, 
          _id: barber._id || barber.id 
        }),
        // Only include password if it's not empty (for editing) or if it's a new barber
        ...(validatedData.password && validatedData.password.trim() !== "" && { password: validatedData.password }),
      };
      
      console.log("Final payload:", payload);

      // Call onSubmit and handle any errors
      try {
        await onSubmit(payload);
        onOpenChange(false);

        if (!barber) {
          setFormData({
            name: "",
            email: "",
            phone: "",
            password: "",
            image: "",
            position: "",
            experience: "0",
            status: "active",
          });
        }
      } catch (error) {
        // Handle API errors (like email already exists)
        if (error instanceof Error) {
          if (error.message.includes("email already exists")) {
            setErrors({ email: "A barber with this email already exists" });
          } else {
            setErrors({ general: error.message });
          }
        } else {
          setErrors({ general: "An error occurred. Please try again." });
        }
      }
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        // Zod validation error
        const fieldErrors: Record<string, string> = {};
        (error as { issues: Array<{ path: string[]; message: string }> }).issues.forEach((issue) => {
          if (issue.path && issue.path.length > 0) {
            fieldErrors[issue.path[0]] = issue.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        console.error("Form validation error:", error);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{barber ? "Edit Barber" : "Add New Barber"}</DialogTitle>
          <DialogDescription>
            {barber
              ? "Update barber information"
              : "Fill in the details to add a new barber"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* General Error Display */}
          {errors.general && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {errors.general}
            </div>
          )}

          {/* Profile Image */}
          <div className="space-y-2">
            <Label htmlFor="image">Profile Image</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={formData.image || ""}
                  alt="profile"
                />
                <AvatarFallback>
                  <Upload className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="flex-1"
              />
            </div>
          </div>

          {/* Name, Email, Phone */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter barber name"
              required
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    value={formData.email}
    onChange={(e) => {
      setFormData({ ...formData, email: e.target.value });

      // Clear email error when user types
      if (errors.email) {
        setErrors((prev) => ({ ...prev, email: "" }));
      }
    }}
    onFocus={() => {
      // Also clear email error on focus
      if (errors.email) {
        setErrors((prev) => ({ ...prev, email: "" }));
      }
    }}
    placeholder="name@example.com"
    required
  />
  {errors.email && (
    <p className="text-sm text-red-500">{errors.email}</p>
  )}
</div>


          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="+1 (555) 123-4567"
              required
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) =>
                setFormData({ ...formData, position: e.target.value })
              }
              placeholder="e.g., Senior Barber, Master Barber"
              required
            />
            {errors.position && (
              <p className="text-sm text-red-500">{errors.position}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Experience (Years)</Label>
            <Input
              id="experience"
              type="text"
              value={formData.experience}
              onChange={(e) => {
                const value = e.target.value;
                // Allow only numbers and empty string
                if (value === "" || /^\d+$/.test(value)) {
                  setFormData({ ...formData, experience: value });
                }
              }}
              placeholder="0"
              required
            />
            {errors.experience && (
              <p className="text-sm text-red-500">{errors.experience}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder={
                barber ? "Leave blank to keep current" : "Enter password"
              }
              required={!barber}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(v: "active" | "inactive") =>
                setFormData({ ...formData, status: v })
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-red-500">{errors.status}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">{barber ? "Update" : "Add"} Barber</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

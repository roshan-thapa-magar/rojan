"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InventoryItem, InventoryStatus } from "@/app/(page)/inventory/page";

interface InventoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: InventoryItem) => void;
  initialData?: InventoryItem;
  mode: "add" | "edit";
}

export function InventoryForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: InventoryFormProps) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [status, setStatus] = useState<InventoryStatus>("in-stock");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setQuantity(initialData.quantity);
      setPrice(initialData.price);
      setStatus(initialData.status);
    } else {
      setName("");
      setQuantity(0);
      setPrice(0);
      setStatus("in-stock");
    }
  }, [initialData, isOpen]);

  const handleSubmit = () => {
    if (!name) return;
    onSubmit({
      id: initialData?.id || "",
      name,
      quantity,
      price,
      status,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add Item" : "Edit Item"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
          <Input
            type="text"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as InventoryStatus)}
            className="border rounded px-2 py-1 w-full"
          >
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {mode === "add" ? "Add" : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

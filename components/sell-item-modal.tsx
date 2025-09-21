"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { InventoryItem } from "@/types/inventory";

interface SellItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem;
  onSubmit: (quantity: number) => void;
}

export function SellItemModal({
  isOpen,
  onClose,
  item,
  onSubmit,
}: SellItemModalProps) {
  const [quantity, setQuantity] = useState<number>(1);

  const handleSubmit = () => {
    if (quantity <= 0) return toast.error("Quantity must be greater than 0");
    if (quantity > item.quantity) return toast.error("Insufficient stock");
    onSubmit(quantity);
    setQuantity(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Sell {item.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p>Available Quantity: {item.quantity}</p>
          </div>
          <Input
            type="number"
            min={1}
            max={item.quantity}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Sell</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

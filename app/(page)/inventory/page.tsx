"use client";

import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, MoreHorizontal, Edit, Trash2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useUserContext } from "@/context/UserContext";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// -----------------------
// Types
// -----------------------
export type InventoryStatus = "in-stock" | "low-stock" | "out-of-stock";

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  status: InventoryStatus;
}

export interface SaleItem {
  id: string;
  inventoryId?: string;
  name: string;
  quantity: number;
  price: number;
  createdAt?: string;
}

// API response types
interface InventoryApiResponse {
  _id: string;
  name: string;
  quantity: number;
  price: number;
  status: InventoryStatus;
}

interface SaleApiResponse {
  _id: string;
  inventoryId?: string;
  name: string;
  quantity: number;
  price: number;
  createdAt?: string;
}

interface SalePostResponse {
  sale: SaleApiResponse;
  item: InventoryApiResponse;
}

// -----------------------
// Status display map
// -----------------------
const displayStatus: Record<InventoryStatus, string> = {
  "in-stock": "In Stock",
  "low-stock": "Low Stock",
  "out-of-stock": "Out of Stock",
};

// -----------------------
// Inventory Form Component
// -----------------------
interface InventoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: InventoryItem) => void;
  initialData?: InventoryItem;
  mode: "add" | "edit";
}

function InventoryForm({
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
    if (!name) return toast.error("Name is required");
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
            type="text"
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
        <DialogFooter className="flex justify-end gap-2">
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

// -----------------------
// Sell Item Modal Component
// -----------------------
interface SellItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem;
  onSubmit: (quantity: number) => void;
}

function SellItemModal({
  isOpen,
  onClose,
  item,
  onSubmit,
}: SellItemModalProps) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (item) setQuantity(1);
  }, [item]);

  const handleSubmit = () => {
    if (quantity <= 0 || quantity > item.quantity) {
      return toast.error("Invalid quantity");
    }
    onSubmit(quantity);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sell Item: {item.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="number"
            min={1}
            max={item.quantity}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
          <p>Available: {item.quantity}</p>
        </div>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Sell</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// -----------------------
// Inventory Page Component
// -----------------------
export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editingItem, setEditingItem] = useState<InventoryItem | undefined>();
  const [sellingItem, setSellingItem] = useState<InventoryItem | null>(null);
  const [salesFilter, setSalesFilter] = useState<
    "all" | "today" | "week" | "month" | "custom"
  >("all");
  const [customFilter, setCustomFilter] = useState<{
    from: string;
    to: string;
  }>({ from: "", to: "" });

  const { user } = useUserContext();

  // -----------------------
  // Fetch Inventory
  // -----------------------
  const fetchInventory = useCallback(async () => {
    try {
      const res = await fetch("/api/inventory");
      if (!res.ok) throw new Error("Failed to fetch inventory");
      const data: InventoryApiResponse[] = await res.json();
      setInventory(
        data.map((i) => ({
          id: i._id,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          status: i.status,
        }))
      );
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
    }
  }, []);

  // -----------------------
  // Fetch Sales
  // -----------------------
  const fetchSales = useCallback(async () => {
    try {
      let url = "/api/sales";
      if (salesFilter !== "all") {
        const params = new URLSearchParams();
        params.append("filter", salesFilter);
        if (salesFilter === "custom" && customFilter.from && customFilter.to) {
          params.append("from", customFilter.from);
          params.append("to", customFilter.to);
        }
        url += `?${params.toString()}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch sales");
      const data: SaleApiResponse[] = await res.json();
      setSales(
        data.map((s) => ({
          id: s._id,
          inventoryId: s.inventoryId,
          name: s.name,
          quantity: s.quantity,
          price: s.price,
          createdAt: s.createdAt,
        }))
      );
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
    }
  }, [salesFilter, customFilter]);

  useEffect(() => {
    fetchInventory();
    fetchSales();
  }, [fetchInventory, fetchSales]);

  useEffect(() => {
    if (salesFilter !== "custom") fetchSales();
  }, [salesFilter, fetchSales]);

  // -----------------------
  // Form handlers
  // -----------------------
  const openAddForm = () => {
    setFormMode("add");
    setEditingItem(undefined);
    setFormOpen(true);
  };
  const openEditForm = (item: InventoryItem) => {
    setFormMode("edit");
    setEditingItem(item);
    setFormOpen(true);
  };

  const submitForm = async (item: InventoryItem) => {
    try {
      const res = await fetch(
        item.id && formMode === "edit"
          ? `/api/inventory/${item.id}`
          : "/api/inventory",
        {
          method: formMode === "add" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        }
      );
      if (!res.ok) throw new Error("Failed to save item");
      const data: InventoryApiResponse = await res.json();
      const updatedItem: InventoryItem = {
        id: data._id,
        name: data.name,
        quantity: data.quantity,
        price: data.price,
        status: data.status,
      };
      setInventory((prev) =>
        formMode === "add"
          ? [...prev, updatedItem]
          : prev.map((i) => (i.id === data._id ? updatedItem : i))
      );
      setFormOpen(false);
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setInventory((prev) => prev.filter((i) => i.id !== id));
      toast.success("Deleted successfully");
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
    }
  };

  const confirmSale = async (quantity: number) => {
    if (!sellingItem) return;
    try {
      const res = await fetch(`/api/sales/${sellingItem.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) throw new Error("Failed to sell item");
      const data: SalePostResponse = await res.json();
      setInventory((prev) =>
        prev.map((i) =>
          i.id === sellingItem.id
            ? { ...i, quantity: data.item.quantity, status: data.item.status }
            : i
        )
      );
      setSales((prev) => [
        ...prev,
        {
          id: data.sale._id,
          name: data.sale.name,
          quantity: data.sale.quantity,
          price: data.sale.price,
          createdAt: data.sale.createdAt,
        },
      ]);
      toast.success("Sold successfully");
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
    } finally {
      setSellingItem(null);
    }
  };

  const deleteSale = async (id?: string) => {
    if (!id) return;
    try {
      const res = await fetch(`/api/sales/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete sale");
      setSales((prev) => prev.filter((s) => s.id !== id));
      toast.success("Sale deleted");
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
    }
  };

  // -----------------------
  // Render helpers
  // -----------------------
  const filteredInventory = inventory.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: InventoryStatus) => {
    switch (status) {
      case "in-stock":
        return "bg-green-100 text-green-800";
      case "low-stock":
        return "bg-yellow-100 text-yellow-800";
      case "out-of-stock":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate total inventory price
  const totalInventoryPrice = inventory.reduce(
    (acc, i) => acc + i.price * i.quantity,
    0
  );

  // Calculate total sales amount
  const totalSalesAmount = sales.reduce(
    (acc, s) => acc + s.price * s.quantity,
    0
  );

  // -----------------------
  // Render
  // -----------------------
  return (
    <div className="space-y-6 p-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Manage inventory and sales</p>
        </div>
        {user?.role === "admin" && (
          <Button onClick={openAddForm} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        )}
      </div>

      {/* Summary */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Card className="flex-1">
          <CardContent>
            <h2 className="text-lg font-medium">Total Inventory Value</h2>
            <p className="text-2xl font-bold">
              रु {totalInventoryPrice.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent>
            <h2 className="text-lg font-medium">Total Sales Amount</h2>
            <p className="text-2xl font-bold">
              रु {totalSalesAmount.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <CardTitle>Inventory</CardTitle>
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>रु {item.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(item.status)}>
                      {displayStatus[item.status]}
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
                        {user?.role === "admin" && (
                          <DropdownMenuItem onClick={() => openEditForm(item)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => setSellingItem(item)}
                          className="text-blue-600"
                        >
                          <DollarSign className="mr-2 h-4 w-4" /> Sale
                        </DropdownMenuItem>
                        {user?.role === "admin" && (
                          <DropdownMenuItem
                            onClick={() => deleteItem(item.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <CardTitle>Sales</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <span>Filter:</span>
            <select
              value={salesFilter}
              onChange={(e) =>
                setSalesFilter(
                  e.target.value as
                    | "all"
                    | "today"
                    | "week"
                    | "month"
                    | "custom"
                )
              }
              className="border rounded px-2 py-1"
            >
              <option value="all">All</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom</option>
            </select>
            {salesFilter === "custom" && (
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  value={customFilter.from}
                  onChange={(e) =>
                    setCustomFilter((prev) => ({
                      ...prev,
                      from: e.target.value,
                    }))
                  }
                  className="border rounded px-2 py-1"
                />
                <input
                  type="date"
                  value={customFilter.to}
                  onChange={(e) =>
                    setCustomFilter((prev) => ({ ...prev, to: e.target.value }))
                  }
                  className="border rounded px-2 py-1"
                />
                <Button size="sm" onClick={fetchSales}>
                  Apply
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length ? (
                sales.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.quantity}</TableCell>
                    <TableCell>रु {s.price.toFixed(2)}</TableCell>
                    <TableCell>
                      {s.createdAt
                        ? new Date(s.createdAt).toLocaleString()
                        : "-"}
                    </TableCell>
                    {user?.role === "admin" && (
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteSale(s.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No sales found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modals */}
      <InventoryForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={submitForm}
        initialData={editingItem}
        mode={formMode}
      />
      {sellingItem && (
        <SellItemModal
          isOpen={!!sellingItem}
          onClose={() => setSellingItem(null)}
          item={sellingItem}
          onSubmit={confirmSale}
        />
      )}
    </div>
  );
}

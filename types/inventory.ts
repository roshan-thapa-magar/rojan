// ./types/inventory.ts

export type InventoryStatus = "in-stock" | "low-stock" | "out-of-stock";

/**
 * Canonical Inventory item type used throughout the app.
 * _id is provided by the backend (Mongo-style). `id` is optional
 * and can be used by frontend code if you prefer a different id field.
 */
export interface InventoryItem {
  _id: string;
  id?: string;
  name: string;
  quantity: number;
  price: number;
  status: InventoryStatus;
}

/**
 * Raw API response shape for inventory endpoints (if you need it separately).
 * Keeping both exported can be handy if you need to map API responses.
 */
export interface InventoryApiResponse {
  _id: string;
  name: string;
  quantity: number;
  price: number;
  status: InventoryStatus;
}

export interface SaleApiResponse {
  _id: string;
  inventoryId?: string;
  name: string;
  quantity: number;
  price: number;
  createdAt?: string;
}

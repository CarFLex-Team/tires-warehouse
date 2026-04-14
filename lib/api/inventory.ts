export interface InventoryProduct {
  id: string;
  name: string;
  size: string;
  brand: string;
  sku: string;
  price: number;
  cost: number;
  quantity: number;
  is_active: boolean;
  condition: "USED" | "NEW" | "SET";
  created_at: string;
  updated_at: string;
}
export interface InventorySummary {
  name: string;
  quantity: number;
}
export interface ProductMonthlySummary {
  name: string;
  turn_over: number;
}
export async function getInventory(): Promise<InventoryProduct[]> {
  const res = await fetch("/api/inventory");
  if (!res.ok) throw new Error("Failed to fetch inventory");
  return res.json();
}

export async function createInventoryProduct(data: {
  condition: "USED" | "NEW" | "SET" | "";
  size: string;
  brand: string;
  price: number;
  cost: number;
  quantity: number;
}) {
  const res = await fetch("/api/inventory", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok)
    throw new Error("Failed to create inventory product" + res.statusText);
  return res.json();
}

export async function deleteProduct(id: string) {
  const res = await fetch(`/api/inventory/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Failed to delete product");
}
export async function editInventoryProduct(data: {
  id: string;
  size: string;
  price: number;
  cost: number;
  is_active: boolean;
  quantity: number;
}) {
  const res = await fetch(`/api/inventory/${data.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to edit product");
}
export async function getInventorySummary(): Promise<InventorySummary[]> {
  const res = await fetch("/api/inventory/summary");
  if (!res.ok) throw new Error("Failed to fetch inventory summary");
  return res.json();
}
export async function getProductSummary(
  month: string,
): Promise<ProductMonthlySummary[]> {
  const res = await fetch(
    `/api/inventory/summary/product-monthly?month=${month}`,
  );
  if (!res.ok) throw new Error("Failed to fetch product monthly summary");
  return res.json();
}

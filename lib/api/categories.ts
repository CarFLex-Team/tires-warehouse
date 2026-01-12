export type CategoryType = "Sales" | "Expense";

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  created_at: string;
}

export async function getCategories(): Promise<Category[]> {
  const res = await fetch("/api/categories");
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function createCategory(data: {
  name: string;
  type: CategoryType;
}) {
  const res = await fetch("/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to create category");
  return res.json();
}

export async function deleteCategory(id: string) {
  const res = await fetch(`/api/categories/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Failed to delete category");
}

export type ServiceType = "Sales" | "Expense";

export interface Service {
  id: string;
  name: string;
  price: number;
  created_at: string;
}

export interface ServiceMonthlySummary {
  service: string;
  turn_over: string;
}

export async function getServices(): Promise<Service[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/services`,
  );
  if (!res.ok) throw new Error("Failed to fetch services");
  return res.json();
}
export async function getServicesMonthlySummary(
  month?: string,
): Promise<ServiceMonthlySummary[]> {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/services/summary/monthly?month=${month}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch services monthly summary");
  return res.json();
}
export async function createService(data: { name: string; price: number }) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/services`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  );

  if (!res.ok) throw new Error("Failed to create service");
  return res.json();
}

export async function deleteService(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/services/${id}`,
    {
      method: "DELETE",
    },
  );

  if (!res.ok) throw new Error("Failed to delete service");
}

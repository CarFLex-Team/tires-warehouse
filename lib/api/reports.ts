export interface MonthlySales {
  month: number;
  total_amount: number;
  total_tax: number;
}
export interface MonthDataCategory {
  month: number;
  expenses: number;

  newTiresQuantity: number;
  newTiresAmount: number;

  usedTiresQuantity: number;
  usedTiresAmount: number;

  servicesQuantity: number;
  servicesAmount: number;
}
export interface TopTire {
  month: number;
  name: string;
  units: number;
  condition: "NEW" | "USED" | "SET";
}
export async function getMonthlySales(year: number): Promise<MonthlySales[]> {
  const res = await fetch(`/api/reports/sales?year=${year}`);
  if (!res.ok) throw new Error("Failed to fetch monthly sales");
  return res.json();
}
export async function getMonthlySalesByCategory(
  year: number,
): Promise<MonthDataCategory[]> {
  const res = await fetch(`/api/reports/sales-category?year=${year}`);
  if (!res.ok) throw new Error("Failed to fetch monthly sales by category");
  return res.json();
}
export async function getTopTires(year: number): Promise<TopTire[]> {
  const res = await fetch(`/api/reports/top-tires?year=${year}`);
  if (!res.ok) throw new Error("Failed to fetch top tires data");
  return res.json();
}

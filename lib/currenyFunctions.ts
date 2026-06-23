export function fmt(n: number): string {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function fmtK(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(0)}k` : String(n);
}

export function pctChange(current: number, previous: number): string {
  if (previous === 0) return "—";
  const pct = ((current - previous) / previous) * 100;
  return (pct >= 0 ? "↑ " : "↓ ") + Math.abs(pct).toFixed(1) + "%";
}

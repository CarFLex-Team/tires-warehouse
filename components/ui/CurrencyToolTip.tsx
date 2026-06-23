import { fmt } from "@/lib/currenyFunctions";
import { TooltipProps } from "recharts";

export default function CurrencyTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string> & {
  payload?: any[];
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm min-w-40">
      <p className="font-medium text-slate-700 mb-2">{label}</p>
      {payload.map((entry) => (
        <div
          key={entry.name}
          className="flex items-center justify-between gap-4 py-0.5"
        >
          <span className="flex items-center gap-1.5 text-slate-500">
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm"
              style={{ background: entry.color }}
            />
            {entry.name}
          </span>
          <span className="font-medium text-slate-800">
            {typeof entry.value === "number" && entry.value > 1000
              ? fmt(entry.value)
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  icon: string;
  accentClass: string;
}

export default function KpiCard({
  label,
  value,
  delta,
  deltaPositive,
  icon,
  accentClass,
}: KpiCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        <span
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${accentClass}`}
        >
          {icon}
        </span>
      </div>
      <p className="text-2xl font-semibold text-slate-900 leading-none">
        {value}
      </p>
      {delta && (
        <p
          className={`text-xs font-medium ${deltaPositive ? "text-emerald-600" : "text-orange-500"}`}
        >
          {delta} vs prior Month
        </p>
      )}
    </div>
  );
}

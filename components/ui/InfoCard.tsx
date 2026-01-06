"use client";

type InfoCardProps = {
  title: string;
  subtitle?: string;
  meta?: string;
};

export function InfoCard({ title, subtitle, meta }: InfoCardProps) {
  //

  return (
    <div className="relative rounded-xl bg-white p-5 m-4 shadow-sm">
      {/* Content */}
      <div className="space-y-1">
        <p className="font-semibold text-gray-800">{title}</p>

        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}

        {meta && <p className="text-xs text-gray-400">{meta}</p>}
      </div>
    </div>
  );
}

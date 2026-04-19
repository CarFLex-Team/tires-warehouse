"use client";

import LoadingSkeleton from "./LoadingSkeleton";

type InfoCardProps = {
  title: string;
  subtitle?: string;
  extraSubtitle?: React.ReactNode;
  meta?: string;
  isLoading?: boolean;
};

export function InfoCard({
  title,
  subtitle,
  extraSubtitle,
  meta,
  isLoading,
}: InfoCardProps) {
  //

  return (
    <div className="relative rounded-xl bg-white p-5 m-4 shadow-sm">
      {/* Content */}
      <div className="space-y-1">
        {isLoading ? (
          <>
            <LoadingSkeleton />
          </>
        ) : (
          <>
            <p className="font-semibold text-gray-800">{title}</p>

            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}

            {extraSubtitle && <div>{extraSubtitle}</div>}

            {meta && <p className="text-xs text-gray-400">{meta}</p>}
          </>
        )}
      </div>
    </div>
  );
}

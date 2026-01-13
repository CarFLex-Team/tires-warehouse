import LoadingSkeleton from "../ui/LoadingSkeleton";

import { OverviewStat } from "./types";

type OverviewStatsProps = {
  title: string;
  stats: OverviewStat[];
  isLoading?: boolean;
  action?: React.ReactNode;
};

export function OverviewStats({
  title,
  stats,
  isLoading,
  action,
}: OverviewStatsProps) {
  return (
    <div className="rounded-xl bg-white p-5 m-4 shadow-sm">
      <div className="flex justify-between">
        <h2 className="mb-3 text-lg font-semibold text-gray-800">{title}</h2>
        {action}
      </div>

      <div className="grid grid-cols-1 divide-y md:grid-cols-4 md:divide-x divide-gray-200 md:divide-y-0">
        {stats.map((stat, index) => (
          <div key={index} className="px-4 py-3">
            <p
              className={`text-sm font-medium ${stat.color ?? "text-gray-500"}`}
            >
              {stat.label}
            </p>
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <div className="mt-1 px-1 flex items-center justify-between ">
                <span className="text-xl font-semibold text-gray-900">
                  {stat.value}
                </span>

                {stat.subValue && (
                  <span className="text-sm font-medium text-gray-600">
                    {stat.subValue}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

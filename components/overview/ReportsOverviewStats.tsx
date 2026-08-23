import type { ReactNode } from "react";
import LoadingSkeleton from "../ui/LoadingSkeleton";
import KpiCard from "../ui/KpiCard";
import type { OverviewStat } from "./types";

type ReportsOverviewStatsProps = {
  title: string;
  stats: OverviewStat[];
  isLoading?: boolean;
  action?: ReactNode;
};

/** A report-page-specific stats panel; the shared OverviewStats remains unchanged. */
export function ReportsOverviewStats({
  title,
  stats,
  isLoading,
  action,
}: ReportsOverviewStatsProps) {
  return (
    <section className="  mx-auto mt-6 py-2 px-4  bg-white rounded-2xl border border-slate-100 ">
      <div className="flex flex-col gap-4 ">
        <h2 className="text-slate-800 font-semibold  tracking-wider">
          {title}
        </h2>
        {action}
      </div>
      <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) =>
          isLoading ? (
            <div
              key={index}
              className="bg-white rounded-2xl border border-slate-100 p-5"
            >
              <LoadingSkeleton />
            </div>
          ) : (
            <KpiCard
              key={index}
              label={stat.label}
              value={String(stat.value)}
              delta={stat.subValue ? String(stat.subValue) : undefined}
              deltaPositive
              icon=""
              accentClass={stat.color ?? ""}
            />
          ),
        )}
      </div>
    </section>
  );
}

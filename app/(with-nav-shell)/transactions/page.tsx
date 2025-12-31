import { OverviewStats } from "@/components/overview/Overview-stats";

export default async function transactions() {
  const dailyTransactionStats = [
    {
      label: "Total Transactions",
      value: 7,
      color: "text-primary-500",
    },
    {
      label: "Total Sales",
      value: 6,
      subValue: "$2500",
      color: "text-orange-400",
    },
    {
      label: "Cash Sales",
      value: 1,
      subValue: "$500",
      color: "text-red-400",
    },
    {
      label: "Debit Sales",
      value: 5,
      subValue: "$2000",
      color: "text-purple-400",
    },
  ];
  return (
    <div className=" ">
      <OverviewStats title="Daily Overview" stats={dailyTransactionStats} />
    </div>
  );
}

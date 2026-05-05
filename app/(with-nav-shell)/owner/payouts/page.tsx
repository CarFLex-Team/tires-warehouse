"use client";
import PayoutTransactions from "@/components/ClientRender/PayoutTransactions";
import { OverviewStats } from "@/components/overview/Overview-stats";
import {
  getTransactionsMonthlySummary,
  TransactionSummary,
} from "@/lib/api/transactions";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function payOuts() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(currentMonth);
  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
  } = useQuery<TransactionSummary>({
    queryKey: ["transactionSummary", month],
    queryFn: () => getTransactionsMonthlySummary(month),
  });
  const monthlyTransactionStats = [
    // {
    //   label: "Total Transactions",
    //   value: summaryData ? summaryData.total_expenses_count : 0,
    //   color: "text-primary-500",
    // },
    {
      label: "Total Payouts",
      value: summaryData ? summaryData.total_expenses_count : 0,
      subValue: `$${summaryData ? summaryData.total_expenses_amount : 0}`,
      color: "text-orange-400",
    },
  ];
  return (
    <>
      <OverviewStats
        title="Monthly Overview"
        stats={monthlyTransactionStats}
        isLoading={summaryLoading}
        action={
          <input
            type="month"
            max={currentMonth}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          />
        }
      />
      <PayoutTransactions month={month} />
    </>
  );
}

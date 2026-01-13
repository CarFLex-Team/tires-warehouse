"use client";
import { DataTable } from "@/components/Tables/DataTable";
import { TableColumn } from "@/components/Tables/Type";
import { OverviewStats } from "@/components/overview/Overview-stats";
import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import {
  getTransactions,
  getTransactionsDailySummary,
  Transaction,
  TransactionSummary,
} from "@/lib/api/transactions";
import formatDate from "@/lib/formatDate";
import formatTime from "@/lib/formatTime";

export default function dashboard() {
  const [page, setPage] = useState(1);

  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const pageSize = 6;

  const { data, isLoading, error } = useQuery<Transaction[]>({
    queryKey: ["transactions", date],
    queryFn: () => getTransactions({ date: date }),
  });
  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
  } = useQuery<TransactionSummary>({
    queryKey: ["transactionsSummary", date],
    queryFn: () => getTransactionsDailySummary(date),
  });

  const dailyTransactionStats = [
    {
      label: "Total Transactions",
      value: summaryData ? summaryData.total_transactions : 0,
      color: "text-primary-500",
    },
    {
      label: "Total Sales",
      value: summaryData ? summaryData.total_sales_count : 0,
      subValue: `$${summaryData ? summaryData.total_sales_amount : 0}`,
      color: "text-orange-400",
    },
    {
      label: "Cash Sales",
      value: summaryData ? summaryData.cash_sales_count : 0,
      subValue: `$${summaryData ? summaryData.cash_sales_amount : 0}`,
      color: "text-red-400",
    },
    {
      label: "Debit Sales",
      value: summaryData ? summaryData.debit_sales_count : 0,
      subValue: `$${summaryData ? summaryData.debit_sales_amount : 0}`,
      color: "text-purple-400",
    },
  ];

  const transactionColumns: TableColumn<Transaction>[] = [
    { header: "Category", accessor: "category_name" },
    { header: "Description", accessor: "description" },
    { header: "Type", accessor: "type" },
    { header: "Amount", accessor: "amount" },
    { header: "Payment Method", accessor: "payment_method" },
    {
      header: "Created At",
      accessor: (row) => (
        <div>
          <div>{formatDate(row.created_at)}</div>
          <div className="text-xs text-gray-400">
            at {formatTime(row.created_at)}
          </div>
        </div>
      ),
    },
    { header: "Created by", accessor: "created_by_name" },
  ];
  if (error) return <p>Error {error.message}</p>;
  if (summaryError) return <p>Error {summaryError.message}</p>;
  return (
    <>
      <div className=" ">
        <OverviewStats
          title="Daily Overview"
          stats={dailyTransactionStats}
          isLoading={summaryLoading}
          action={
            <input
              type="date"
              value={date}
              max={today}
              onChange={(e) => setDate(e.target.value)}
              className="rounded border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            />
          }
        />
        <DataTable
          title="Transactions"
          columns={transactionColumns}
          data={
            isLoading
              ? []
              : data
              ? data.slice((page - 1) * pageSize, page * pageSize)
              : []
          }
          isLoading={isLoading}
          pagination={{
            page,
            pageSize,
            total: data ? data.length : 1,
            onPageChange: setPage,
          }}
        />
      </div>
    </>
  );
}

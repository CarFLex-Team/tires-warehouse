"use client";
import { DataTable } from "@/components/Tables/DataTable";
import { TableColumn } from "@/components/Tables/Type";
import { OverviewStats } from "@/components/overview/Overview-stats";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getTransactions,
  getTransactionsMonthlySummary,
  Transaction,
  TransactionSummary,
} from "@/lib/api/transactions";
import { formatTime } from "@/lib/formatTime";
import formatDate from "@/lib/formatDate";
export default function dashboard() {
  const [page, setPage] = useState(1);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(currentMonth);
  const pageSize = 6;
  const { data, isLoading, error } = useQuery<Transaction[]>({
    queryKey: ["transactions", month],
    queryFn: () => getTransactions({ month: month }),
  });
  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
  } = useQuery<TransactionSummary>({
    queryKey: ["transactionsSummary", month],
    queryFn: () => getTransactionsMonthlySummary(month),
  });
  const mostSellingItems = [
    {
      category: "Tires",
      turnOver: 15000,
    },
    { category: "Batteries", turnOver: 10000 },
  ];
  const mostSpendingCustomers = [
    {
      Name: "Mazen Essam",
      turnOver: 15000,
    },
    { Name: "Jane Smith", turnOver: 10000 },
  ];
  const monthlyTransactionStats = [
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

  type Category = {
    category: string;

    turnOver: number;
  };
  type Customer = {
    Name: string;

    turnOver: number;
  };

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
  const CategoryColumn: TableColumn<Category>[] = [
    { header: "Category", accessor: "category" },
    { header: "Turn Over", accessor: "turnOver" },
  ];
  const CustomerColumn: TableColumn<Customer>[] = [
    { header: "Name", accessor: "Name" },
    { header: "Turn Over", accessor: "turnOver" },
  ];
  if (error) return <p>Error {error.message}</p>;
  if (summaryError) return <p>Error {summaryError.message}</p>;
  return (
    <>
      <div className=" ">
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
        <div className=" grid grid-cols-1 md:grid-cols-2 ">
          <DataTable
            title="Most Selling Categories"
            columns={CategoryColumn}
            data={isLoading ? [] : mostSellingItems}
            isLoading={isLoading}
          />
          <DataTable
            title="Most Spending Customers"
            columns={CustomerColumn}
            data={isLoading ? [] : mostSpendingCustomers}
            isLoading={isLoading}
          />
        </div>
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
          // action={
          //   <CustomButton
          //     onClick={() => {
          //       setOpen(true);
          //     }}
          //   >
          //     Add Transaction
          //   </CustomButton>
          // }
          // renderActions={(row) => (
          //   <button
          //     onClick={() => {
          //       setConfirmOpen(true);
          //     }}
          //     className="rounded p-1 border border-gray-400 bg-gray-100 text-gray-600 hover:bg-gray-200"
          //   >
          //     <Trash size={16} />
          //   </button>
          // )}
        />
      </div>

      {/* <ConfirmDialog
        isOpen={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {}}
        description="Do you want to Delete this transaction?"
        loading={confirmLoading}
      /> */}
    </>
  );
}

"use client";
import { DataTable } from "@/components/DataTable/DataTable";
import { TableColumn } from "@/components/DataTable/Type";
import { OverviewStats } from "@/components/overview/Overview-stats";
import CustomButton from "@/components/ui/CustomButton";
import { useEffect, useState } from "react";
import transactions from "../../../data/transactions.json";

export default function dashboard() {
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // 1.5 seconds

    return () => clearTimeout(timer);
  }, []);
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
  type Transaction = {
    category: string;
    description: string;
    type: string;
    amount: string;
    paymentMethod: string;
    date: string;
    time: string;
    createdBy: string;
  };

  const transactionColumns: TableColumn<Transaction>[] = [
    { header: "Category", accessor: "category" },
    { header: "Description", accessor: "description" },
    { header: "Type", accessor: "type" },
    { header: "Amount", accessor: "amount" },
    { header: "Payment Method", accessor: "paymentMethod" },
    {
      header: "Date",
      accessor: (row) => (
        <div>
          <div>{row.date}</div>
          <div className="text-xs text-gray-400">at {row.time}</div>
        </div>
      ),
    },
    { header: "Created by", accessor: "createdBy" },
  ];

  return (
    <div className=" ">
      <OverviewStats title="Daily Overview" stats={dailyTransactionStats} />
      <DataTable
        title="Transactions"
        columns={transactionColumns}
        data={
          isLoading
            ? []
            : transactions.slice((page - 1) * pageSize, page * pageSize)
        }
        isLoading={isLoading}
        pagination={{
          page,
          pageSize,
          total: transactions.length,
          onPageChange: setPage,
        }}
        action={<CustomButton onClick={() => {}}>Add Transaction</CustomButton>}
      />
    </div>
  );
}

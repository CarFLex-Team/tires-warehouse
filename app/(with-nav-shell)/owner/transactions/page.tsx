"use client";
import { DataTable } from "@/components/Tables/DataTable";
import { TableColumn } from "@/components/Tables/Type";
import { OverviewStats } from "@/components/overview/Overview-stats";
import CustomButton from "@/components/ui/CustomButton";
import { useEffect, useState } from "react";
import { is, tr } from "zod/locales";

export default function transactions() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
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
  const transactions = [
    {
      category: "Tires",
      description: "Change Tires",
      type: "Income",
      amount: "$500",
      paymentMethod: "Cash",
      date: "14 Apr 2022",
      time: "9:00 PM",
      createdBy: "Ahmed",
    },
    {
      category: "Tire Repair",
      description: "Repair 1 Tire",
      type: "Income",
      amount: "$300",
      paymentMethod: "Debit",
      date: "14 Apr 2022",
      time: "8:45 PM",
      createdBy: "Ahmed",
    },
    {
      category: "Battery",
      description: "Change Battery",
      type: "Income",
      amount: "$450",
      paymentMethod: "Debit",
      date: "14 Apr 2022",
      time: "8:30 PM",
      createdBy: "Sara",
    },
    {
      category: "Battery Fix",
      description: "Fix a Battery",
      type: "Income",
      amount: "$200",
      paymentMethod: "Debit",
      date: "13 Apr 2022",
      time: "11:00 AM",
      createdBy: "Mohamed",
    },
    {
      category: "Oil Change",
      description: "Full Oil Service",
      type: "Income",
      amount: "$150",
      paymentMethod: "Debit",
      date: "13 Apr 2022",
      time: "10:30 AM",
      createdBy: "Ahmed",
    },
    {
      category: "Oil Change",
      description: "Full Oil Service",
      type: "Income",
      amount: "$150",
      paymentMethod: "Debit",
      date: "13 Apr 2022",
      time: "10:00 AM",
      createdBy: "Ahmed",
    },
    {
      category: "Oil Change",
      description: "Full Oil Service",
      type: "Income",
      amount: "$150",
      paymentMethod: "Debit",
      date: "13 Apr 2022",
      time: "10:00 AM",
      createdBy: "Ahmed",
    },
    {
      category: "Oil Change",
      description: "Full Oil Service",
      type: "Income",
      amount: "$150",
      paymentMethod: "Debit",
      date: "13 Apr 2022",
      time: "10:00 AM",
      createdBy: "Ahmed",
    },
    {
      category: "Oil Change",
      description: "Full Oil Service",
      type: "Income",
      amount: "$150",
      paymentMethod: "Debit",
      date: "13 Apr 2022",
      time: "10:00 AM",
      createdBy: "Ahmed",
    },
    {
      category: "Oil Change",
      description: "Full Oil Service",
      type: "Income",
      amount: "$150",
      paymentMethod: "Debit",
      date: "13 Apr 2022",
      time: "10:00 AM",
      createdBy: "Ahmed",
    },
    {
      category: "Oil Change",
      description: "Full Oil Service",
      type: "Income",
      amount: "$150",
      paymentMethod: "Debit",
      date: "13 Apr 2022",
      time: "10:00 AM",
      createdBy: "Ahmed",
    },
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

"use client";
import { DataTable } from "@/components/Tables/DataTable";
import { TableColumn } from "@/components/Tables/Type";
import { OverviewStats } from "@/components/overview/Overview-stats";
import CustomButton from "@/components/ui/CustomButton";
import { useEffect, useState } from "react";

import Modal from "@/components/ui/Modal";
import { Trash } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { AddTransactionForm } from "@/components/Forms/addTransactionForm";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { getTransactions, Transaction } from "@/lib/api/transactions";
import formatDate from "@/lib/formatDate";
import { formatTime } from "@/lib/formatTime";

export default function dashboard() {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const pageSize = 6;

  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: getTransactions,
  });

  const dailyTransactionStats = [
    {
      label: "Total Transactions",
      value: data ? data.length : 0,
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
  return (
    <>
      {open && (
        <Modal
          isOpen={open}
          onClose={() => setOpen(false)}
          title="New Transaction"
        >
          <AddTransactionForm onSuccess={() => setOpen(false)} />
        </Modal>
      )}
      <div className=" ">
        <OverviewStats title="Daily Overview" stats={dailyTransactionStats} />
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
            total: data ? data.length : 0,
            onPageChange: setPage,
          }}
          action={
            <CustomButton
              onClick={() => {
                setOpen(true);
              }}
            >
              Add Transaction
            </CustomButton>
          }
          renderActions={(row) => (
            <button
              onClick={() => {
                setConfirmOpen(true);
              }}
              className="rounded p-1 border border-gray-400 bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              <Trash size={16} />
            </button>
          )}
        />
      </div>
      <ConfirmDialog
        isOpen={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {}}
        description="Do you want to Delete this transaction?"
        loading={confirmLoading}
      />
    </>
  );
}

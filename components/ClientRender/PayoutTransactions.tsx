"use client";
import { DataTable } from "@/components/Tables/DataTable";
import { TableColumn } from "@/components/Tables/Type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteTransaction,
  getTransactions,
  Transaction,
  // Transaction,
} from "@/lib/api/transactions";
import CustomButton from "@/components/ui/CustomButton";
import { useState } from "react";
import { AddTransactionForm } from "@/components/Forms/addTransactionForm";
import Modal from "@/components/ui/Modal";
import formatTime from "@/lib/formatTime";
import formatDate from "@/lib/formatDate";
import { Trash } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function payOutTransactions({
  date,
  month,
}: {
  date?: string;
  month?: string;
}) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const {
    data: transactions,
    isLoading,
    error,
  } = useQuery<Transaction[]>({
    queryKey: ["transactions", date ? date : month ? month : undefined],
    queryFn: () => getTransactions({ date, month }),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["transactions", date ? date : month ? month : undefined],
      });
      setSelectedId(null);
      setConfirmOpen(false);
    },
  });

  const transactionColumns: TableColumn<Transaction>[] = [
    { header: "Description", accessor: "description" },
    // { header: "Quantity", accessor: "quantity" },
    // { header: "Type", accessor: "type" },
    // { header: "Category", accessor: "category" },
    { header: "Amount", accessor: "amount" },
    { header: "Payment Method", accessor: "payment_method" },
    { header: "Created By", accessor: "created_by_name" },
    {
      header: "Created At",
      accessor: (transaction) => (
        <div>
          <div>{formatDate(transaction.created_at)}</div>
          <div className="text-xs text-gray-400">
            at {formatTime(transaction.created_at)}
          </div>
        </div>
      ),
    },
  ];
  if (error) return <p>Error {error.message}</p>;
  return (
    <>
      {open && (
        <Modal title="Add Expense" onClose={() => setOpen(false)} isOpen={open}>
          <AddTransactionForm onSuccess={() => setOpen(false)} />
        </Modal>
      )}
      <DataTable
        title="Payouts"
        columns={transactionColumns}
        data={isLoading ? [] : (transactions ?? [])}
        isLoading={isLoading}
        action={
          <CustomButton
            onClick={() => {
              setOpen(true);
            }}
          >
            Add Payout
          </CustomButton>
        }
        renderActions={(row) => (
          <button
            onClick={() => {
              setSelectedId(row.id);
              setConfirmOpen(true);
            }}
            className="rounded p-1 border border-gray-400 bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            <Trash size={16} />
          </button>
        )}
      />
      <ConfirmDialog
        isOpen={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (selectedId) {
            deleteMutation.mutate(selectedId);
          }
        }}
        description="Do you want to Delete this transaction?"
        loading={deleteMutation.isPending}
        error={deleteMutation.error?.message}
      />
    </>
  );
}

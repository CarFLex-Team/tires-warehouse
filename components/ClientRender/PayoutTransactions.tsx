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
import { useEffect, useRef, useState } from "react";
import { AddTransactionForm } from "@/components/Forms/addTransactionForm";
import Modal from "@/components/ui/Modal";
import formatTime from "@/lib/formatTime";
import formatDate from "@/lib/formatDate";
import { EllipsisVertical, Trash } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EditPayoutForm from "../Forms/editPayoutForm";
import ActionDropdown from "../ui/ActionDropdown";
export default function payOutTransactions({
  date,
  month,
}: {
  date?: string;
  month?: string;
}) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<Transaction>(
    {} as Transaction,
  );
  const [categoryFilter, setCategoryFilter] = useState<
    "ALL" | "Tire" | "Operational"
  >("ALL");
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
      queryClient.invalidateQueries({
        queryKey: ["transactionSummary", month ? month : undefined],
      });
      setSelectedId(null);
      setConfirmOpen(false);
    },
  });

  const transactionColumns: TableColumn<Transaction>[] = [
    { header: "Description", accessor: "description" },
    // { header: "Quantity", accessor: "quantity" },
    // { header: "Type", accessor: "type" },
    { header: "Category", accessor: "category" },
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
      <Modal title="Add Expense" onClose={() => setOpen(false)} isOpen={open}>
        <AddTransactionForm onSuccess={() => setOpen(false)} />
      </Modal>

      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Payout"
      >
        <EditPayoutForm
          payOutTransaction={selectedPayout}
          onSuccess={() => setEditOpen(false)}
        />
      </Modal>

      <DataTable
        title="Payouts"
        columns={transactionColumns}
        data={
          isLoading
            ? []
            : (transactions?.filter((t) => {
                if (categoryFilter === "ALL") return true;
                // if (invoice.payment_method === "Mix") return true;
                return t.category === categoryFilter;
              }) ?? [])
        }
        isLoading={isLoading}
        action={
          <div className="flex items-center gap-4">
            <div className="flex">
              <p className="p-2 text-sm">Category Filter:</p>
              <button
                className={`flex items-center gap-1.5 border-b border-gray-300 p-2  text-sm cursor-pointer  ${
                  categoryFilter === "Tire"
                    ? "bg-primary-600 text-white"
                    : "bg-white text-primary-600 hover:bg-gray-100"
                }`}
                onClick={() =>
                  categoryFilter === "Tire"
                    ? setCategoryFilter("ALL")
                    : setCategoryFilter("Tire")
                }
                type="button"
              >
                Tire Invoices
              </button>
              <button
                className={`flex items-center gap-1.5  border-b border-gray-300 border-l-0 p-2  text-sm cursor-pointer  ${
                  categoryFilter === "Operational"
                    ? "bg-primary-600 text-white"
                    : "bg-white text-primary-600 hover:bg-gray-100"
                }`}
                onClick={() =>
                  categoryFilter === "Operational"
                    ? setCategoryFilter("ALL")
                    : setCategoryFilter("Operational")
                }
                type="button"
              >
                Operational Invoices
              </button>
            </div>
            <CustomButton
              onClick={() => {
                setOpen(true);
              }}
            >
              Add Payout
            </CustomButton>
          </div>
        }
        // renderActions={(row) => (
        //   <button
        //     onClick={() => {
        //       setSelectedId(row.id);
        //       setConfirmOpen(true);
        //     }}
        //     className="rounded p-1 border border-gray-400 bg-gray-100 text-gray-600 hover:bg-gray-200"
        //   >
        //     <Trash size={16} />
        //   </button>
        // )}
        renderActions={(row) => (
          <ActionDropdown
            trigger={
              <button
                type="button"
                aria-label={`Actions for ${row.description}`}
                className="rounded border border-gray-400 bg-gray-100 p-1 text-gray-600 hover:bg-gray-200"
              >
                <EllipsisVertical size={16} />
              </button>
            }
            items={[
              {
                label: "Edit",
                onSelect: () => {
                  setSelectedId(row.id);
                  setSelectedPayout(row);
                  setEditOpen(true);
                },
              },
              {
                label: "Delete",
                destructive: true,
                onSelect: () => {
                  setSelectedId(row.id);
                  setConfirmOpen(true);
                },
              },
            ]}
          />
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

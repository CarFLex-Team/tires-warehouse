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
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<Transaction>(
    {} as Transaction,
  );
  const menuRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setSelectedMenuId(null); // Close the menu if the click is outside
      }
    };
    document.addEventListener("mousedown", handleClickOutside); // Add event listener

    return () => {
      document.removeEventListener("mousedown", handleClickOutside); // Cleanup event listener on component unmount
    };
  }, []);

  useEffect(() => {
    if (menuRef.current) {
      console.log("Menu ref:", menuRef.current);
      const rect = menuRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      setIsOverflowing(rect.bottom > viewportHeight); // true if it would overflow
    }
  }, [selectedMenuId]);
  const handleMenuToggle = (id: string) => {
    if (selectedMenuId === id) {
      // If the same product's menu is clicked, toggle it off
      setSelectedMenuId(null);
    } else {
      // Otherwise, open the menu for the clicked product
      setSelectedMenuId(id);
    }
  };
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
      {editOpen && (
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
          <div className="relative">
            <button
              onClick={() => handleMenuToggle(row.id)}
              className=" rounded p-1 border border-gray-400 bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              <EllipsisVertical size={16} />
            </button>

            {/* Dropdown menu */}
            {selectedMenuId === row.id && (
              <div
                ref={menuRef}
                className={`absolute right-5 z-20 w-25 rounded-md shadow-lg bg-white ring-1 ring-gray-400 ring-opacity-5 ${
                  isOverflowing ? "bottom-full mb-2" : "mt-2 top-full"
                }`}
              >
                <div
                  className=""
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="options-menu"
                >
                  <button
                    onClick={() => {
                      setSelectedMenuId(row.id);
                      setSelectedId(row.id);
                      setSelectedPayout(row);
                      setEditOpen(true);
                    }}
                    className="block px-4 py-2 text-sm rounded-t-md text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Edit
                  </button>

                  {/* Trash Option */}
                  <button
                    onClick={() => {
                      setSelectedMenuId(row.id);
                      setSelectedId(row.id);
                      setConfirmOpen(true);
                    }}
                    className=" block px-4 py-2 text-sm rounded-b-md text-gray-700 hover:bg-red-100 w-full text-left"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
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

"use client";
import CustomButton from "@/components/ui/CustomButton";
import { DataTable } from "@/components/Tables/DataTable";
import { TableColumn } from "@/components/Tables/Type";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import { Trash } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Customer, deleteCustomer, getCustomers } from "@/lib/api/customers";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { AddCustomerForm } from "@/components/Forms/addCustomerForm";
import formatDate from "@/lib/formatDate";
export default function customers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const router = useRouter();

  const pageSize = 10;
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: getCustomers,
    select: (customers) =>
      customers.map((customer) => ({
        ...customer,
        created_at: formatDate(customer.created_at),
      })),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setSelectedId(null);
      setConfirmOpen(false);
    },
  });
  const customerColumns: TableColumn<Customer>[] = [
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: "phone" },
    { header: "Added At", accessor: "created_at" },
  ];

  const filteredCustomers = data?.filter((customer) => {
    const value = search.toLowerCase();

    return (
      customer.name.toLowerCase().includes(value) ||
      customer.email.toLowerCase().includes(value) ||
      customer.phone.includes(value)
    );
  });
  if (error) return <p>Error {error.message}</p>;
  return (
    <>
      {open && (
        <Modal
          isOpen={open}
          onClose={() => setOpen(false)}
          title="New Customer"
        >
          <AddCustomerForm onSuccess={() => setOpen(false)} />
        </Modal>
      )}
      <div>
        <DataTable
          columns={customerColumns}
          data={
            isLoading
              ? []
              : filteredCustomers?.slice(
                  (page - 1) * pageSize,
                  page * pageSize,
                ) || []
          }
          onRowClick={(customer) =>
            router.push(`/customers/${customer.id}/invoices`)
          }
          isLoading={isLoading}
          pagination={{
            page,
            pageSize,
            total: filteredCustomers?.length || 1,
            onPageChange: setPage,
          }}
          action={
            <>
              <input
                type="text"
                placeholder="Search Customers"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className=" p-2 border-b border-gray-300 focus:outline-none min-w-25"
              />
              <CustomButton onClick={() => setOpen(true)}>
                Add Customer
              </CustomButton>
            </>
          }
          renderActions={(row) => (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(row.id);
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
        onConfirm={() => {
          if (selectedId) {
            deleteMutation.mutate(selectedId);
          }
        }}
        description="Do you want to Delete this Customer?"
        loading={deleteMutation.isPending}
      />
    </>
  );
}

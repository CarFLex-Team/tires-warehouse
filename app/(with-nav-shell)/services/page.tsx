"use client";
import { DataTable } from "@/components/Tables/DataTable";
import { TableColumn } from "@/components/Tables/Type";
import CustomButton from "@/components/ui/CustomButton";
import { useEffect, useState } from "react";

import Modal from "@/components/ui/Modal";
import { Trash } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getServices, deleteService, Service } from "@/lib/api/services";
import { AddServiceForm } from "@/components/Forms/addServiceForm";
import formatDate from "@/lib/formatDate";

export default function ServicePage() {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const pageSize = 10;

  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: getServices,
    select: (services) =>
      services.map((service) => ({
        ...service,
        created_at: formatDate(service.created_at),
      })),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setSelectedId(null);
      setConfirmOpen(false);
    },
  });

  const serviceColumns: TableColumn<Service>[] = [
    { header: "ID", accessor: "id" },
    { header: "Service", accessor: "name" },
    { header: "Price", accessor: "price" },
    { header: "Added At", accessor: "created_at" },
  ];
  if (error) return <p>Error {error.message}</p>;

  return (
    <>
      {open && (
        <Modal isOpen={open} onClose={() => setOpen(false)} title="New Service">
          <AddServiceForm onSuccess={() => setOpen(false)} />
        </Modal>
      )}
      <DataTable
        title="Services"
        columns={serviceColumns}
        data={
          isLoading
            ? []
            : data?.slice((page - 1) * pageSize, page * pageSize) || []
        }
        isLoading={isLoading}
        pagination={{
          page,
          pageSize,
          total: data?.length || 0,
          onPageChange: setPage,
        }}
        action={
          <CustomButton
            onClick={() => {
              setOpen(true);
            }}
          >
            Add Service
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
        description="Do you want to Delete this service?"
        loading={deleteMutation.isPending}
        error={deleteMutation.error?.message}
      />
    </>
  );
}

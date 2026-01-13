"use client";
import { DataTable } from "@/components/Tables/DataTable";
import { TableColumn } from "@/components/Tables/Type";
import CustomButton from "@/components/ui/CustomButton";
import { useEffect, useState } from "react";

import Modal from "@/components/ui/Modal";
import { Trash } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCategories,
  deleteCategory,
  Category,
  CategoryType,
  createCategory,
} from "@/lib/api/categories";
import { AddCategoryForm } from "@/components/Forms/addCategoryForm";
import formatDate from "@/lib/formatDate";

export default function category() {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const pageSize = 10;

  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: getCategories,
    select: (categories) =>
      categories.map((category) => ({
        ...category,
        created_at: formatDate(category.created_at),
      })),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setSelectedId(null);
      setConfirmOpen(false);
    },
  });

  const categoryColumns: TableColumn<Category>[] = [
    { header: "ID", accessor: "id" },
    { header: "Category", accessor: "name" },
    { header: "Type", accessor: "type" },
    { header: "Added At", accessor: "created_at" },
  ];
  if (error) return <p>Error {error.message}</p>;

  return (
    <>
      {open && (
        <Modal
          isOpen={open}
          onClose={() => setOpen(false)}
          title="New Category"
        >
          <AddCategoryForm onSuccess={() => setOpen(false)} />
        </Modal>
      )}
      <DataTable
        title="Category"
        columns={categoryColumns}
        data={
          isLoading
            ? []
            : data?.slice((page - 1) * pageSize, page * pageSize) || []
        }
        isLoading={isLoading}
        pagination={{
          page,
          pageSize,
          total: data?.length || 1,
          onPageChange: setPage,
        }}
        action={
          <CustomButton
            onClick={() => {
              setOpen(true);
            }}
          >
            Add Category
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
        description="Do you want to Delete this category?"
        loading={deleteMutation.isPending}
      />
    </>
  );
}

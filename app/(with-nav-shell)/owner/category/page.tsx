"use client";
import { DataTable } from "@/components/Tables/DataTable";
import { TableColumn } from "@/components/Tables/Type";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCategories, Category } from "@/lib/api/categories";
import formatDate from "@/lib/formatDate";

export default function category() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, error } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: getCategories,
    select: (categories) =>
      categories.map((category) => ({
        ...category,
        created_at: formatDate(category.created_at),
      })),
  });

  const categoryColumns: TableColumn<Category>[] = [
    { header: "ID", accessor: "id" },
    { header: "Category", accessor: "name" },
    { header: "Type", accessor: "type" },
    { header: "Added At", accessor: "created_at" },
  ];
  if (error) return <p>Error {error.message}</p>;

  return (
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
    />
  );
}

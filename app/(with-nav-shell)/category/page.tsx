"use client";
import { DataTable } from "@/components/DataTable/DataTable";
import { TableColumn } from "@/components/DataTable/Type";
import CustomButton from "@/components/ui/CustomButton";
import { useEffect, useState } from "react";
import categories from "@/data/categories.json";
export default function category() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // 1.5 seconds

    return () => clearTimeout(timer);
  }, []);

  type Category = {
    id: number;
    category: string;
    type: string;
    addedAt: string;
  };

  const categoryColumns: TableColumn<Category>[] = [
    { header: "ID", accessor: "id" },
    { header: "Category", accessor: "category" },
    { header: "Type", accessor: "type" },
    { header: "Added At", accessor: "addedAt" },
  ];

  return (
    <div className=" ">
      <DataTable
        title="Category"
        columns={categoryColumns}
        data={
          isLoading
            ? []
            : categories.slice((page - 1) * pageSize, page * pageSize)
        }
        isLoading={isLoading}
        pagination={{
          page,
          pageSize,
          total: categories.length,
          onPageChange: setPage,
        }}
        action={<CustomButton onClick={() => {}}>Add Category</CustomButton>}
      />
    </div>
  );
}

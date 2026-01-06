"use client";
import { DataTable } from "@/components/DataTable/DataTable";
import { TableColumn } from "@/components/DataTable/Type";
import CustomButton from "@/components/ui/CustomButton";
import { useEffect, useState } from "react";
import categories from "@/data/categories.json";
import Modal from "@/components/ui/Modal";
import { Trash } from "lucide-react";
export default function category() {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
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
    <>
      {open && (
        <Modal
          isOpen={open}
          onClose={() => setOpen(false)}
          title="New Category"
          buttonText="Add Category"
        >
          <div className="flex justify-between items-center gap-4">
            <label className=" flex-2">Category ID</label>
            <input
              type="text"
              className="p-2 border border-gray-300 rounded-lg flex-5"
              placeholder="Enter Category ID"
            />
          </div>
          <div className="flex justify-between items-center gap-4">
            <label className=" flex-2">Category</label>
            <input
              type="text"
              className="p-2 border border-gray-300 rounded-lg flex-5"
              placeholder="Enter Category Name"
            />
          </div>
          <div className="flex justify-between items-center gap-4">
            <label className=" flex-2">Type</label>
            <select
              name="categoryType"
              id="categoryType"
              className="p-2 border border-gray-300 rounded-lg flex-5 text-gray-700"
              defaultValue=""
            >
              <option disabled value="">
                Category Type
              </option>
              <option value="sale">Sales</option>
              <option value="expense">Expense</option>
            </select>
          </div>
        </Modal>
      )}
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
              // Handle delete action here
            }}
            className="rounded p-1 border border-gray-400 bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            <Trash size={16} />
          </button>
        )}
      />
    </>
  );
}

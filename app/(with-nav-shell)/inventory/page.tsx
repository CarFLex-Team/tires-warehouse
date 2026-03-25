"use client";
import { DataTable } from "@/components/Tables/DataTable";
import { TableColumn } from "@/components/Tables/Type";
import CustomButton from "@/components/ui/CustomButton";
import { useEffect, useRef, useState } from "react";

import Modal from "@/components/ui/Modal";
import { Trash, EllipsisVertical } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteProduct,
  getInventory,
  InventoryProduct,
} from "@/lib/api/inventory";
import formatDate from "@/lib/formatDate";
import { AddProductForm } from "@/components/Forms/addProductForm";
import { EditProductForm } from "@/components/Forms/editProductForm";
export default function Service() {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [condition, setCondition] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] =
    useState<InventoryProduct | null>(null);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const pageSize = 10;
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
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery<InventoryProduct[]>({
    queryKey: ["inventory"],
    queryFn: getInventory,
    select: (inventoryProducts) =>
      inventoryProducts.map((product) => ({
        ...product,
        created_at: formatDate(product.created_at),
        updated_at: formatDate(product.updated_at),
      })),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setSelectedId(null);
      setConfirmOpen(false);
    },
  });
  const handleMenuToggle = (id: string) => {
    if (selectedMenuId === id) {
      // If the same product's menu is clicked, toggle it off
      setSelectedMenuId(null);
    } else {
      // Otherwise, open the menu for the clicked product
      setSelectedMenuId(id);
    }
  };

  const productColumns: TableColumn<InventoryProduct>[] = [
    { header: "Condition", accessor: "condition" },
    // { header: "Conditi", accessor: "id" },
    { header: "Brand", accessor: "brand" },
    { header: "Size", accessor: "size" },
    // { header: "SKU", accessor: "sku" },
    { header: "Price", accessor: "price" },
    { header: "Cost", accessor: "cost" },
    { header: "Quantity (Tire)", accessor: "quantity" },
    // {
    //   header: "Status",
    //   accessor: (row) => (row.is_active ? "Active" : "Inactive"),
    // },
    // { header: "Added At", accessor: "created_at" },
    { header: "Last Update", accessor: "updated_at" },
    {
      header: "Status",
      accessor: (row) =>
        row.quantity <= 0 ? (
          <p className="bg-red-300 text-center px-2 py-1 rounded">
            Out of Stock
          </p>
        ) : row.quantity <= 10 ? (
          <p className="bg-yellow-300 text-center px-2 py-1 rounded">
            Low Stock
          </p>
        ) : (
          <p className="bg-green-300 text-center px-2 py-1 rounded">In Stock</p>
        ),
    },
  ];
  const filteredInventory = data?.filter((product) => {
    const value = search.toLowerCase();
    const matchesSearch =
      product.name.toLowerCase().includes(value) ||
      product.brand.toLowerCase().includes(value) ||
      product.size.includes(value) ||
      product.condition.toLowerCase().includes(value);

    // Check if the condition filter is applied
    const matchesCondition = condition ? product.condition === condition : true;

    return matchesSearch && matchesCondition;
  });
  if (error) return <p>Error {error.message}</p>;

  return (
    <>
      {open && (
        <Modal isOpen={open} onClose={() => setOpen(false)} title="New Product">
          <AddProductForm onSuccess={() => setOpen(false)} />
        </Modal>
      )}
      {editOpen && (
        <Modal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          title="Edit Product"
        >
          <EditProductForm
            product={selectedProduct}
            onSuccess={() => setEditOpen(false)}
          />
        </Modal>
      )}
      <DataTable
        columns={productColumns}
        data={
          isLoading
            ? []
            : filteredInventory?.slice(
                (page - 1) * pageSize,
                page * pageSize,
              ) || []
        }
        isLoading={isLoading}
        pagination={{
          page,
          pageSize,
          total: filteredInventory?.length || 1,
          onPageChange: setPage,
        }}
        action={
          <>
            <div className="flex">
              <div className="flex">
                <button
                  className={`flex items-center gap-1.5 border-b border-gray-300 p-2  text-sm cursor-pointer  ${
                    condition === "NEW"
                      ? "bg-primary-600 text-white"
                      : "bg-white text-primary-600 hover:bg-gray-100"
                  }`}
                  onClick={() =>
                    condition === "NEW" ? setCondition("") : setCondition("NEW")
                  }
                  type="button"
                >
                  New
                </button>
                <button
                  className={`flex items-center gap-1.5  border-b border-gray-300 border-l-0 p-2  text-sm cursor-pointer  ${
                    condition === "USED"
                      ? "bg-primary-600 text-white"
                      : "bg-white text-primary-600 hover:bg-gray-100"
                  }`}
                  onClick={() =>
                    condition === "USED"
                      ? setCondition("")
                      : setCondition("USED")
                  }
                  type="button"
                >
                  Used
                </button>
                <button
                  className={`flex items-center gap-1.5  border-b border-gray-300 border-l-0 p-2  text-sm cursor-pointer  ${
                    condition === "SET"
                      ? "bg-primary-600 text-white"
                      : "bg-white text-primary-600 hover:bg-gray-100"
                  }`}
                  onClick={() =>
                    condition === "SET"
                      ? setCondition("")
                      : setCondition("SET")
                  }
                  type="button"
                >
                  Used Set
                </button>
              </div>
              <input
                type="text"
                placeholder="Search Inventory"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className=" p-2 border-b border-gray-300 focus:outline-none min-w-25"
              />
            </div>
            <CustomButton
              onClick={() => {
                setOpen(true);
              }}
            >
              Add Product
            </CustomButton>
          </>
        }
        renderActions={(row) => (
          <>
            <button
              onClick={() => handleMenuToggle(row.id)}
              className="relative rounded p-1 border border-gray-400 bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              <EllipsisVertical size={16} />
            </button>

            {/* Dropdown menu */}
            {selectedMenuId === row.id && (
              <div
                ref={menuRef}
                className="absolute right-5 mt-2 w-25 rounded-md shadow-lg bg-white ring-1 ring-gray-400 ring-opacity-5 z-20"
              >
                <div
                  className=""
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="options-menu"
                >
                  {/* Edit Option */}
                  <button
                    onClick={() => {
                      setSelectedMenuId(row.id);
                      setSelectedId(row.id);
                      setSelectedProduct(row);
                      setEditOpen(true);
                    }}
                    className="block px-4 py-2 text-sm rounded-t-md text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Add New
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
          </>
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
        description="Do you want to Delete this product?"
        loading={deleteMutation.isPending}
      />
    </>
  );
}

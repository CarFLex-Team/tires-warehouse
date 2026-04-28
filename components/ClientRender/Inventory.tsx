"use client";
import { DataTable } from "@/components/Tables/DataTable";
import { TableColumn } from "@/components/Tables/Type";
import CustomButton from "@/components/ui/CustomButton";
import { useEffect, useRef, useState } from "react";

import Modal from "@/components/ui/Modal";
import { CircleX, EllipsisVertical, Loader2, Plus, X } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addProductImage,
  deleteProduct,
  deleteProductImage,
  getInventory,
  InventoryProduct,
} from "@/lib/api/inventory";
import formatDate from "@/lib/formatDate";
import { AddProductForm } from "@/components/Forms/addProductForm";
import { EditProductForm } from "@/components/Forms/editProductForm";
export default function Inventory({
  setError,
}: {
  setError: (error: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [widthFilter, setWidthFilter] = useState("");
  const [rimFilter, setRimFilter] = useState("");
  const [ratioFilter, setRatioFilter] = useState("");
  const [condition, setCondition] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmImageOpen, setConfirmImageOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] =
    useState<InventoryProduct | null>(null);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

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
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setPreviewImage(null);
    }

    if (previewImage) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [previewImage]);
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
  const addImageMutation = useMutation({
    mutationFn: addProductImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setSelectedId(null);
      setConfirmImageOpen(false);
    },
  });
  const deleteImageMutation = useMutation({
    mutationFn: deleteProductImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setSelectedId(null);
      setConfirmImageOpen(false);
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
  // console.log("Inventory data:", data?.[0]);
  const productColumns: TableColumn<InventoryProduct>[] = [
    {
      header: "Image",
      accessor: (row) => {
        return row.image_url ? (
          <div className="relative w-8 h-8 group">
            <img
              src={row.image_url}
              alt={row.name}
              className="w-8 h-8 object-cover rounded "
              onClick={() => setPreviewImage(row.image_url)}
            />
            <button
              className="absolute -top-1 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => {
                /* handle remove image or whatever */
                setSelectedId(row.id);
                setConfirmImageOpen(true);
              }}
            >
              <CircleX size={13} className="text-red-500 cursor-pointer" />
            </button>
          </div>
        ) : (
          <button
            className="relative rounded p-1 border border-gray-400 bg-gray-100 text-gray-600 hover:bg-gray-200"
            onClick={() => {
              setSelectedId(row.id);
            }}
          >
            {addImageMutation.isPending && row.id === selectedId ? (
              <Loader2
                size={16}
                className="text-gray-500 animate-spin cursor-not-allowed"
              />
            ) : (
              <Plus size={16} className="text-gray-500" />
            )}
            <input
              type="file"
              accept="image/*"
              className="opacity-0 absolute inset-0 cursor-pointer disabled:cursor-not-allowed"
              disabled={addImageMutation.isPending && row.id === selectedId}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  addImageMutation.mutate({ id: row.id, image: file });
                }
              }}
            />
          </button>
        );
      },
    },
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
        ) : row.quantity <= 4 ? (
          <p className="bg-yellow-300 text-center px-2 py-1 rounded">
            Low Stock
          </p>
        ) : (
          <p className="bg-green-300 text-center px-2 py-1 rounded">In Stock</p>
        ),
    },
  ];
  const value = search.toLowerCase();
  const widthValueNum = widthFilter ? Number(widthFilter) : null;
  const rimValueNum = rimFilter ? Number(rimFilter) : null;
  const ratioValueNum = ratioFilter ? Number(ratioFilter) : null;

  const filteredInventory = data
    ?.filter((product) => {
      // ---- Parse tire size ----
      const { width, height, rim } = parseSize(product.size);

      // ---- General search ----
      const matchesSearch =
        product.name.toLowerCase().includes(value) ||
        product.brand.toLowerCase().includes(value) ||
        product.condition.toLowerCase().includes(value);

      // ---- Specific size filters ----
      const matchesWidth = widthValueNum ? width === widthValueNum : true;
      const matchesRim = rimValueNum ? rim === rimValueNum : true;
      const matchesRatio = ratioValueNum ? height === ratioValueNum : true;

      // ---- Condition filter ----
      const matchesCondition = condition
        ? product.condition === condition
        : true;

      return (
        matchesSearch &&
        matchesWidth &&
        matchesRim &&
        matchesRatio &&
        matchesCondition
      );
    })
    // ---- Sort by your rules ----
    .sort((a, b) => {
      const { width: wA, rim: rA } = parseSize(a.size);
      const { width: wB, rim: rB } = parseSize(b.size);

      if (widthValueNum) return rA - rB;
      if (rimValueNum) return wA - wB;
      if (ratioValueNum) return wA - wB;
      return 0;
    });

  // Helper function to parse size
  function parseSize(size: string) {
    const [width, height, rim] = size.split("/").map(Number);
    return { width, height, rim };
  }
  if (error)
    setError(error.message || "An error occurred while fetching inventory");

  return (
    <>
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative bg-white flex items-center justify-center p-4 rounded-2xl">
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-[80vw] max-h-[80vh] rounded"
            />
            <button
              className="absolute top-2 right-2 text-black text-xl font-bold"
              onClick={() => setPreviewImage(null)}
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
      {open && (
        <Modal isOpen={open} onClose={() => setOpen(false)} title="New Product">
          <AddProductForm onSuccess={() => setOpen(false)} />
        </Modal>
      )}
      {addOpen && (
        <Modal
          isOpen={addOpen}
          onClose={() => setAddOpen(false)}
          title="Add Stock"
        >
          <EditProductForm
            product={selectedProduct}
            onSuccess={() => setAddOpen(false)}
            forAddNew={true}
          />
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
        data={isLoading ? [] : filteredInventory || []}
        isLoading={isLoading}
        action={
          <div className="w-full">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex">
                <div className="flex">
                  <button
                    className={`flex items-center gap-1.5 border-b border-gray-300 p-2  text-sm cursor-pointer  ${
                      condition === "NEW"
                        ? "bg-primary-600 text-white"
                        : "bg-white text-primary-600 hover:bg-gray-100"
                    }`}
                    onClick={() =>
                      condition === "NEW"
                        ? setCondition("")
                        : setCondition("NEW")
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
            </div>
            <div className="flex items-center gap-2 px-2">
              <p className="text-gray-500">Search by Size</p>
              <input
                type="text"
                value={widthFilter}
                onChange={(e) => setWidthFilter(e.target.value)}
                className=" p-1 border-b border-gray-300 focus:outline-none w-8"
              />
              <p>/</p>
              <input
                type="text"
                value={ratioFilter}
                onChange={(e) => setRatioFilter(e.target.value)}
                className=" p-1 border-b border-gray-300 focus:outline-none w-8"
              />

              <p>/</p>
              <input
                type="text"
                value={rimFilter}
                onChange={(e) => setRimFilter(e.target.value)}
                className=" p-1 border-b border-gray-300 focus:outline-none w-8"
              />
            </div>
          </div>
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
                      setAddOpen(true);
                    }}
                    className="block px-4 py-2 text-sm rounded-t-md text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Add New
                  </button>
                  <button
                    onClick={() => {
                      setSelectedMenuId(row.id);
                      setSelectedId(row.id);
                      setSelectedProduct(row);
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
          </>
        )}
      />
      <ConfirmDialog
        isOpen={confirmImageOpen}
        onCancel={() => setConfirmImageOpen(false)}
        onConfirm={() => {
          if (selectedId) {
            deleteImageMutation.mutate(selectedId);
          }
        }}
        description="Do you want to Delete this Image?"
        loading={deleteImageMutation.isPending}
        error={deleteImageMutation.error?.message}
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
        error={deleteMutation.error?.message}
      />
    </>
  );
}

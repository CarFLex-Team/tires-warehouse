"use client";

import { editInventoryProduct, InventoryProduct } from "@/lib/api/inventory";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useEffect, useState } from "react";

export function EditProductForm({
  onSuccess,
  product,
}: {
  onSuccess: () => void;
  product: InventoryProduct | null;
}) {
  const queryClient = useQueryClient();
  // const [name, setName] = useState("");
  const [size, setSize] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [oldCost, setOldCost] = useState("");
  const [cost, setCost] = useState("");
  const [quantity, setQuantity] = useState("");
  const [oldQuantity, setOldQuantity] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (product) {
      setSize(product.size);
      setBrand(product.brand);
      setPrice(product.price.toString());
      setOldCost(product.cost.toString());
      setCost(product.cost.toString());

      setOldQuantity(product.quantity.toString());
      setOldPrice(product.price.toString());
    }
  }, []);
  useEffect(() => {
    if (cost !== oldCost) {
      const newPrice =
        (Number(cost) / Number(oldCost)) * Number(oldPrice) || oldPrice;

      setPrice(Number(newPrice).toFixed(0));
    }
  }, [cost]);

  const mutation = useMutation({
    mutationFn: editInventoryProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setSize("");
      setBrand("");
      setPrice("");
      setCost("");
      setQuantity("");
      setOldCost("");
      setError(null);
      onSuccess();
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !size ||
      !brand ||
      !price ||
      !cost ||
      !quantity ||
      isNaN(Number(price)) ||
      isNaN(Number(cost)) ||
      isNaN(Number(quantity))
    )
      return setError("Please fill in fields with valid numbers");

    mutation.mutate({
      id: product!.id,
      price: Number(price),
      cost: Number(cost),
      is_active: product!.is_active,
      quantity: Number(quantity) + Number(oldQuantity),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div className="flex justify-between items-center gap-4">
        <label className="flex-2">Brand</label>
        <input
          className="p-2 border border-gray-300 rounded-lg flex-5 disabled:bg-gray-100"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="Enter Product Brand"
          required
          disabled
        />
      </div>
      <div className="flex justify-between items-center gap-4">
        <label className="flex-2">Size</label>
        <input
          className="p-2 border border-gray-300 rounded-lg flex-5 disabled:bg-gray-100"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          placeholder="Enter Product Size"
          required
          disabled
        />
      </div>
      <div className="flex justify-between items-center gap-4">
        <label className="flex-2">New Cost</label>
        <input
          className="p-2 border border-gray-300 rounded-lg flex-5 disabled:bg-gray-100"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          placeholder="Enter Cost"
          required
        />
      </div>

      <div className="flex justify-between items-center gap-4">
        <label className="flex-2">New Price</label>
        <input
          className="p-2 border border-gray-300 rounded-lg flex-5"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </div>
      <div className="flex justify-between items-center gap-4">
        <label className="flex-2">New Quantity (Tire)</label>
        <input
          className="p-2 border border-gray-300 rounded-lg flex-5"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          placeholder="Enter quantity to add to inventory"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50"
        >
          {mutation.isPending ? "Updating..." : "Update Product"}
        </button>
      </div>
      {mutation.isError && (
        <p className="text-sm text-red-500">
          Failed to update product {mutation.error.message}
        </p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </form>
  );
}

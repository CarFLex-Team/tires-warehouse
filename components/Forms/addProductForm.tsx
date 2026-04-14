"use client";

import { createInventoryProduct } from "@/lib/api/inventory";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useEffect, useState } from "react";

export function AddProductForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();
  // const [name, setName] = useState("");
  const [size1, setSize1] = useState("");
  const [size2, setSize2] = useState("");
  const [size3, setSize3] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [quantity, setQuantity] = useState("");
  const [condition, setCondition] = useState<"USED" | "NEW" | "SET" | "">("");
  const [isPercent, setIsPercent] = useState(false);
  const [markupPercent, setMarkupPercent] = useState("");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (isPercent) {
      const costNum = parseFloat(cost);
      const markupNum = parseFloat(markupPercent);
      if (!isNaN(costNum) && !isNaN(markupNum)) {
        const calculatedPrice = costNum + (costNum * markupNum) / 100;
        setPrice(calculatedPrice.toFixed(0));
      } else {
        setPrice("");
      }
    }
  }, [cost, markupPercent, isPercent]);
  const mutation = useMutation({
    mutationFn: createInventoryProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setSize1("");
      setSize2("");
      setSize3("");
      setBrand("");
      setPrice("");
      setCost("");
      setQuantity("");
      setCondition("");
      setIsPercent(false);
      setMarkupPercent("");
      setError(null);
      onSuccess();
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !condition ||
      !size1 ||
      !size2 ||
      !size3 ||
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
      condition,
      size: `${size1}/${size2}/${size3}`,
      brand,
      price: Number(price),
      cost: Number(cost),
      quantity: Number(quantity),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div className="flex justify-between items-center gap-4">
        <label className="flex-2">Condition</label>
        <div className="flex gap-2 flex-5">
          <button
            type="button"
            className={`flex items-center gap-1.5 rounded border border-primary-600 p-2  text-sm cursor-pointer  ${
              condition === "NEW"
                ? "bg-primary-600 text-white"
                : "bg-white text-primary-600 hover:bg-gray-100"
            }`}
            onClick={() => setCondition("NEW")}
          >
            New
          </button>

          <button
            className={`flex items-center gap-1.5 rounded border border-primary-600 p-2  text-sm cursor-pointer  ${
              condition === "USED"
                ? "bg-primary-600 text-white"
                : "bg-white text-primary-600 hover:bg-gray-100"
            }`}
            onClick={() => setCondition("USED")}
            type="button"
          >
            Used
          </button>
          <button
            className={`flex items-center gap-1.5 rounded border border-primary-600 p-2  text-sm cursor-pointer  ${
              condition === "SET"
                ? "bg-primary-600 text-white"
                : "bg-white text-primary-600 hover:bg-gray-100"
            }`}
            onClick={() => setCondition("SET")}
            type="button"
          >
            Used Set
          </button>
        </div>
      </div>
      <div className="flex justify-between items-center gap-4">
        <label className="flex-2">Brand</label>
        <input
          className="p-2 border border-gray-300 rounded-lg flex-5"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="Enter Product Brand"
          required
        />
      </div>
      <div className="flex justify-between items-center gap-4">
        <label className="flex-3">Size</label>
        <div className="flex items-center flex-8 gap-1 ">
          <input
            className="p-2 border border-gray-300 rounded-lg w-full "
            value={size1}
            onChange={(e) => setSize1(e.target.value)}
            required
          />
          <span>/</span>
          <input
            className="p-2 border border-gray-300 rounded-lg w-full "
            value={size2}
            onChange={(e) => setSize2(e.target.value)}
            required
          />
          <span>/</span>
          <input
            className=" p-2 border border-gray-300 rounded-lg w-full"
            value={size3}
            onChange={(e) => setSize3(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="">
        <div className="flex justify-between items-center gap-4">
          <label className="flex-2">Cost</label>
          <input
            className="p-2 border border-gray-300 rounded-lg flex-5"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="Enter Cost"
            required
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            className=""
            checked={isPercent}
            onChange={() => setIsPercent(!isPercent)}
          />
          <p className="text-gray-500">Price as percent</p>
        </div>
      </div>
      {isPercent && (
        <div className="flex justify-between items-center gap-4">
          <label className="flex-2">Markup %</label>
          <input
            className="p-2 border border-gray-300 rounded-lg flex-5"
            type="text"
            value={markupPercent}
            onChange={(e) => setMarkupPercent(e.target.value)}
            required
            placeholder="Enter Markup Percent"
          />
        </div>
      )}
      <div className="flex justify-between items-center gap-4">
        <label className="flex-2">Price</label>
        <input
          className="p-2 border border-gray-300 rounded-lg flex-5 disabled:bg-gray-100"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          disabled={isPercent}
          placeholder="Enter Price"
        />
      </div>
      <div className="flex justify-between items-center gap-4">
        <label className="flex-2">Quantity (Tire)</label>
        <input
          className="p-2 border border-gray-300 rounded-lg flex-5"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          placeholder="Enter Quantity"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50"
        >
          {mutation.isPending ? "Adding..." : "Add Product"}
        </button>
      </div>
      {mutation.isError && (
        <p className="text-sm text-red-500">
          Failed to add product {mutation.error.message}
        </p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </form>
  );
}

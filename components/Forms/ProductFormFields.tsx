"use client";

import { ProductForm } from "../../lib/Hooks/useProductForm";

export function ProductFormFields({ form }: { form: ProductForm }) {
  const { values, setters } = form;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <label className="flex-2">Condition</label>
        <div className="flex gap-2 flex-5">
          <button
            type="button"
            className={`flex items-center gap-1.5 rounded border border-primary-600 p-2 text-sm cursor-pointer ${
              values.condition === "NEW"
                ? "bg-primary-600 text-white"
                : "bg-white text-primary-600 hover:bg-gray-100"
            }`}
            onClick={() => setters.setCondition("NEW")}
          >
            New
          </button>
          <button
            type="button"
            className={`flex items-center gap-1.5 rounded border border-primary-600 p-2 text-sm cursor-pointer ${
              values.condition === "USED"
                ? "bg-primary-600 text-white"
                : "bg-white text-primary-600 hover:bg-gray-100"
            }`}
            onClick={() => setters.setCondition("USED")}
          >
            Used
          </button>
          <button
            type="button"
            className={`flex items-center gap-1.5 rounded border border-primary-600 p-2 text-sm cursor-pointer ${
              values.condition === "SET"
                ? "bg-primary-600 text-white"
                : "bg-white text-primary-600 hover:bg-gray-100"
            }`}
            onClick={() => setters.setCondition("SET")}
          >
            Used Set
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center gap-4">
        <label className="flex-2">Brand</label>
        <input
          className="p-2 border border-gray-300 rounded-lg flex-5"
          value={values.brand}
          onChange={(e) => setters.setBrand(e.target.value)}
          placeholder="Enter Product Brand"
          required
        />
      </div>

      <div className="flex justify-between items-center gap-4">
        <label className="flex-3">Size</label>
        <div className="flex items-center flex-8 gap-1">
          <input
            className="p-2 border border-gray-300 rounded-lg w-full"
            value={values.size1}
            onChange={(e) => setters.setSize1(e.target.value)}
            required
          />
          <span>/</span>
          <input
            className="p-2 border border-gray-300 rounded-lg w-full"
            value={values.size2}
            onChange={(e) => setters.setSize2(e.target.value)}
            required
          />
          <span>/</span>
          <input
            className="p-2 border border-gray-300 rounded-lg w-full"
            value={values.size3}
            onChange={(e) => setters.setSize3(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center gap-4">
          <label className="flex-2">Cost</label>
          <input
            className="p-2 border border-gray-300 rounded-lg flex-5"
            value={values.cost}
            onChange={(e) => setters.setCost(e.target.value)}
            placeholder="Enter Cost"
            required
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={values.isPercent}
            onChange={() => setters.setIsPercent(!values.isPercent)}
          />
          <p className="text-gray-500">Price as percent</p>
        </div>
      </div>

      {values.isPercent && (
        <div className="flex justify-between items-center gap-4">
          <label className="flex-2">Markup %</label>
          <input
            className="p-2 border border-gray-300 rounded-lg flex-5"
            type="text"
            value={values.markupPercent}
            onChange={(e) => setters.setMarkupPercent(e.target.value)}
            required
            placeholder="Enter Markup Percent"
          />
        </div>
      )}

      <div className="flex justify-between items-center gap-4">
        <label className="flex-2">Price</label>
        <input
          className="p-2 border border-gray-300 rounded-lg flex-5 disabled:bg-gray-100"
          value={values.price}
          onChange={(e) => setters.setPrice(e.target.value)}
          required
          disabled={values.isPercent}
          placeholder="Enter Price"
        />
      </div>

      <div className="flex justify-between items-center gap-4">
        <label className="flex-2">Quantity (Tire)</label>
        <input
          className="p-2 border border-gray-300 rounded-lg flex-5"
          value={values.quantity}
          onChange={(e) => setters.setQuantity(e.target.value)}
          required
          placeholder="Enter Quantity"
        />
      </div>
    </div>
  );
}

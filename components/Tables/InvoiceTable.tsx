import { Plus, Trash2 } from "lucide-react";
import { ComboBox } from "../ui/ComboBox";
import CustomButton from "../ui/CustomButton";
import { useQuery } from "@tanstack/react-query";
import { ServiceType, getServices } from "@/lib/api/services";
import { Transaction } from "@/lib/api/transactions";

type Props = {
  title?: string;
  rows: Transaction[];
  onAdd?: () => void;
  onUpdate: (
    id: string,
    field: keyof Transaction,
    value: string | number,
  ) => void;
  onRemove?: (id: string) => void;
  products?: any[];
};

export function InvoiceTable({
  title,
  rows,
  onAdd,
  onUpdate,
  onRemove,
  products,
}: Props) {
  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: getServices,
  });

  // const { data: products } = useQuery({
  //   queryKey: ["products"],
  //   queryFn: getInventory,
  // });
  // console.log("Products in InvoiceTable:", rows);
  // console.log("Products in InvoiceTable (products prop):", products);
  const recalculateAmount = (
    id: string,
    category: string,
    product_id: string | undefined,
    service_id: string | undefined,
    quantity: number,
    filteredProducts?: any[],
  ) => {
    let price = 0;
    let cost = 0;
    if (category === "Tire") {
      price =
        filteredProducts?.find((prod: any) => prod.id === product_id)?.price ||
        0;
      cost =
        filteredProducts?.find((prod: any) => prod.id === product_id)?.cost ||
        0;
    } else if (category === "Service") {
      price = services?.find((serv: any) => serv.id === service_id)?.price || 0;
    }

    const newAmount = quantity * price;
    const newCost = quantity * cost;
    onUpdate(id, "amount", newAmount);
    onUpdate(id, "cost", newCost);
  };
  return (
    <div className="rounded-xl bg-white p-5 m-4 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">{title || "Create Invoice"}</h2>
      </div>
      <div className="overflow-x-auto ">
        <table className="w-full border-collapse">
          <thead className="border-b text-left text-sm text-gray-500">
            <tr>
              <th className="p-2 min-w-17">Type</th>
              <th className="p-2 min-w-17">Category</th>
              <th className="p-2 min-w-17">Product/Service</th>
              {/* <th className="p-2 min-w-17">Description</th> */}
              <th className="p-2 min-w-17">Quantity (Tire)</th>
              <th className="p-2 min-w-17">Price</th>
              <th className="p-2 min-w-17">Cost</th>
              {onRemove && (
                <th className="p-2 min-w-17 text-center">Actions</th>
              )}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => {
              const filteredProducts = products?.filter(
                (p) => !row.condition || p.condition === row.condition,
              );
              return (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="py-3 px-2  align-top">
                    <p className="w-full  px-2 py-1">{row.type}</p>
                    {/* <select
                    className="w-full rounded border px-2 py-1"
                    value={row.type}
                    onChange={(e) =>
                      onUpdate(row.id, "type", e.target.value as ServiceType)
                    }
                    required
                  >
                    <option value="" disabled>
                      Transaction Type
                    </option>
                    <option value="Sales">Sales</option>
                    <option value="Expense">Expense</option>
                  </select> */}
                  </td>
                  <td className="py-3 px-2 text-sm align-top">
                    <select
                      className="w-full rounded border px-2 py-1"
                      value={row.category}
                      onChange={(e) => {
                        onUpdate(row.id, "category", e.target.value);
                        onUpdate(row.id, "product_id", "");
                        onUpdate(row.id, "service_id", "");
                        onUpdate(row.id, "service_name", "");
                        onUpdate(row.id, "product_name", "");
                        onUpdate(row.id, "amount", 0);
                        onUpdate(row.id, "condition", "");
                      }}
                      required
                    >
                      <option value="" disabled>
                        Category
                      </option>
                      <option value="Service">Service</option>
                      <option value="Tire">Tire</option>
                    </select>
                  </td>
                  <td className="py-3 px-2 text-sm align-top ">
                    {row.category === "Tire" ? (
                      <div className="flex items-center gap-2">
                        <ComboBox
                          value={row.product_id}
                          options={
                            filteredProducts?.map((prod: any) => ({
                              label: prod.name,
                              value: prod.id,
                            })) || []
                          }
                          placeholder="Tire"
                          onChange={(value) => {
                            onUpdate(row.id, "product_id", value);
                            onUpdate(
                              row.id,
                              "product_name",
                              filteredProducts?.find(
                                (prod) => prod.id === value,
                              )?.name || "",
                            );

                            recalculateAmount(
                              row.id,
                              row.category,
                              value,
                              row.service_id,
                              row.quantity,
                              filteredProducts,
                            );
                          }}
                        />
                        <div className="flex">
                          <button
                            className={`flex items-center gap-1.5 border border-gray-300 p-1.5 rounded rounded-r-none text-sm cursor-pointer  ${
                              row.condition === "NEW"
                                ? "bg-primary-600 text-white"
                                : "bg-white text-primary-600 hover:bg-gray-100"
                            }`}
                            onClick={() => {
                              onUpdate(
                                row.id,
                                "condition",
                                row.condition === "NEW" ? "" : "NEW",
                              );
                            }}
                            type="button"
                          >
                            New
                          </button>
                          <button
                            className={`flex items-center gap-1.5 border border-l-0 border-gray-300 p-1.5 rounded rounded-l-none text-sm cursor-pointer  ${
                              row.condition === "USED"
                                ? "bg-primary-600 text-white"
                                : "bg-white text-primary-600 hover:bg-gray-100"
                            }`}
                            onClick={() => {
                              onUpdate(
                                row.id,
                                "condition",
                                row.condition === "USED" ? "" : "USED",
                              );
                            }}
                            type="button"
                          >
                            Used
                          </button>
                          <button
                            className={`flex items-center gap-1.5 border border-l-0 border-gray-300 p-1.5 rounded rounded-l-none text-sm cursor-pointer  ${
                              row.condition === "SET"
                                ? "bg-primary-600 text-white"
                                : "bg-white text-primary-600 hover:bg-gray-100"
                            }`}
                            onClick={() => {
                              onUpdate(
                                row.id,
                                "condition",
                                row.condition === "SET" ? "" : "SET",
                              );
                            }}
                            type="button"
                          >
                            Set
                          </button>
                        </div>
                      </div>
                    ) : row.category === "Service" ? (
                      <ComboBox
                        value={row.service_id}
                        options={
                          services?.map((serv: any) => ({
                            label: serv.name,
                            value: serv.id,
                          })) || []
                        }
                        placeholder="Service"
                        onChange={(value) => {
                          onUpdate(row.id, "service_id", value);
                          onUpdate(
                            row.id,
                            "service_name",
                            services?.find((serv) => serv.id === value)?.name ||
                              "",
                          );

                          recalculateAmount(
                            row.id,
                            row.category,
                            row.product_id,
                            value,
                            row.quantity,
                            filteredProducts,
                          );
                        }}
                      />
                    ) : (
                      ""
                    )}
                  </td>
                  <td className="py-3 px-2 text-sm align-top">
                    <input
                      value={row.quantity}
                      onChange={(e) => {
                        onUpdate(row.id, "quantity", e.target.value);
                        recalculateAmount(
                          row.id,
                          row.category,
                          row.product_id,
                          row.service_id,
                          Number(e.target.value),
                          filteredProducts,
                        );
                      }}
                      placeholder="Enter quantity"
                      className="w-full rounded border px-2 py-1"
                    />
                  </td>

                  <td className="py-3 px-2 text-sm align-top">
                    <input
                      value={row.amount}
                      onChange={(e) =>
                        onUpdate(row.id, "amount", e.target.value)
                      }
                      className="w-full rounded border px-2 py-1"
                    />
                  </td>
                  <td className="py-3 px-2 text-sm align-top">
                    <input
                      disabled
                      value={row.cost || 0}
                      // onChange={(e) => onUpdate(row.id, "amount", e.target.value)}
                      className="w-full rounded border px-2 py-1"
                    />
                  </td>
                  {onRemove && (
                    <td className="py-3 px-2 text-sm text-center">
                      <button
                        onClick={() => onRemove(row.id)}
                        className="rounded p-2 text-gray-500 hover:bg-gray-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-sm text-gray-400"
                >
                  No Transactions added yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {onAdd && (
        <CustomButton onClick={onAdd} className="flex items-center gap-1 mt-4">
          <Plus size={16} />
          Add Item
        </CustomButton>
      )}
    </div>
  );
}

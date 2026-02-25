import { Plus, Trash2 } from "lucide-react";
import { ComboBox } from "../ui/ComboBox";
import CustomButton from "../ui/CustomButton";
import { InvoiceItem } from "@/stores/useInvoiceDraft";
import { useQuery } from "@tanstack/react-query";
import { ServiceType, getServices } from "@/lib/api/services";
import { getInventory } from "@/lib/api/inventory";
import { ca } from "zod/locales";

type Props = {
  rows: InvoiceItem[];
  onAdd: () => void;
  onUpdate: (
    id: string,
    field: keyof InvoiceItem,
    value: string | number,
  ) => void;
  onRemove: (id: string) => void;
  products?: any[];
};

export function InvoiceTable({
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
  const recalculateAmount = (
    id: string,
    category: string,
    product_id: string | undefined,
    service_id: string | undefined,
    quantity: number,
  ) => {
    let price = 0;
    if (category === "Tire") {
      price = products?.find((prod: any) => prod.id === product_id)?.price || 0;
    } else if (category === "Service") {
      price = services?.find((serv: any) => serv.id === service_id)?.price || 0;
    }

    const newAmount = quantity * price;
    onUpdate(id, "amount", newAmount);
  };
  return (
    <div className="rounded-xl bg-white p-5 m-4 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Create Invoice</h2>
      </div>
      <div className="overflow-x-auto ">
        <table className="w-full border-collapse">
          <thead className="border-b text-left text-sm text-gray-500">
            <tr>
              <th className="p-2 min-w-17">Type</th>
              <th className="p-2 min-w-17">Category</th>
              <th className="p-2 min-w-17">Product/Service</th>
              {/* <th className="p-2 min-w-17">Description</th> */}
              <th className="p-2 min-w-17">Quantity</th>
              <th className="p-2 min-w-17">Total Price</th>
              <th className="p-2 min-w-17 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b last:border-0">
                <td className="py-3 px-2 text-sm align-top">
                  <select
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
                  </select>
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
                    <ComboBox
                      value={row.product_id}
                      options={
                        products?.map((prod: any) => ({
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
                          products?.find((prod) => prod.id === value)?.name ||
                            "",
                        );
                        recalculateAmount(
                          row.id,
                          row.category,
                          value,
                          row.service_id,
                          row.quantity,
                        );
                      }}
                    />
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
                      );
                    }}
                    placeholder="Enter quantity"
                    className="w-full rounded border px-2 py-1"
                  />
                </td>

                <td className="py-3 px-2 text-sm align-top">
                  <input
                    disabled
                    value={row.amount}
                    // onChange={(e) => onUpdate(row.id, "amount", e.target.value)}
                    className="w-full rounded border px-2 py-1"
                  />
                </td>

                <td className="py-3 px-2 text-sm text-center">
                  <button
                    onClick={() => onRemove(row.id)}
                    className="rounded p-2 text-gray-500 hover:bg-gray-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}

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
      <CustomButton onClick={onAdd} className="flex items-center gap-1 mt-4">
        <Plus size={16} />
        Add Item
      </CustomButton>
    </div>
  );
}

import { Plus, Trash2 } from "lucide-react";
import { ComboBox } from "../ui/ComboBox";
import CustomButton from "../ui/CustomButton";
import { InvoiceItem } from "@/stores/useInvoiceDraft";
import { useQuery } from "@tanstack/react-query";
import { CategoryType, getCategories } from "@/lib/api/categories";

type Props = {
  rows: InvoiceItem[];
  onAdd: () => void;
  onUpdate: (
    id: string,
    field: keyof InvoiceItem,
    value: string | number,
  ) => void;
  onRemove: (id: string) => void;
};

export function InvoiceTable({ rows, onAdd, onUpdate, onRemove }: Props) {
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
  console.log("Rendering InvoiceTable with rows:", rows);
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
              <th className="p-2 min-w-17">Description</th>
              <th className="p-2 min-w-17">Amount</th>
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
                      onUpdate(row.id, "type", e.target.value as CategoryType)
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
                <td className="py-3 px-2 text-sm align-top ">
                  <ComboBox
                    value={row.category_id}
                    options={
                      categories
                        ?.filter((c) => c.type === row.type)
                        ?.map((cat: any) => ({
                          label: cat.name,
                          value: cat.id,
                        })) || []
                    }
                    placeholder="Category"
                    onChange={(value) => {
                      onUpdate(row.id, "category_id", value);
                      onUpdate(
                        row.id,
                        "category_name",
                        categories?.find((cat) => cat.id === value)?.name || "",
                      );
                    }}
                  />
                </td>

                <td className="py-3 px-2 text-sm align-top">
                  <textarea
                    value={row.description}
                    onChange={(e) =>
                      onUpdate(row.id, "description", e.target.value)
                    }
                    placeholder="Enter description"
                    className="w-full rounded border px-2 py-1"
                  />
                </td>

                <td className="py-3 px-2 text-sm align-top">
                  <input
                    value={row.amount}
                    onChange={(e) => onUpdate(row.id, "amount", e.target.value)}
                    placeholder="Enter amount"
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

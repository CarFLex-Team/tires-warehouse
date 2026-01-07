import { Plus, Trash2 } from "lucide-react";
import { ComboBox } from "../ui/ComboBox";
import CustomButton from "../ui/CustomButton";

type Row = {
  id: string;
  category: string;
  description: string;
  amount: string;
};

type Props = {
  rows: Row[];
  onAdd: () => void;
  onUpdate: (id: string, field: keyof Row, value: string) => void;
  onRemove: (id: string) => void;
};

export function InvoiceTable({ rows, onAdd, onUpdate, onRemove }: Props) {
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
              <th className="p-2 min-w-17">Category</th>
              <th className="p-2 min-w-17">Description</th>
              <th className="p-2 min-w-17">Amount</th>
              <th className="p-2 min-w-17 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b last:border-0">
                <td className="py-3 px-2 text-sm align-top ">
                  <ComboBox
                    value={row.category}
                    options={[
                      { label: "Tires", value: "tires" },
                      { label: "Battery Fix", value: "batteryFix" },
                    ]}
                    placeholder="Category"
                    onChange={(value) => onUpdate(row.id, "category", value)}
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
                  colSpan={4}
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

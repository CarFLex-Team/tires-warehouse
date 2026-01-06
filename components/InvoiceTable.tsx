import { Trash2 } from "lucide-react";

type Row = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

type Props = {
  rows: Row[];
  onAdd: () => void;
  onUpdate: (id: string, field: keyof Row, value: string) => void;
  onRemove: (id: string) => void;
};

export function InvoiceTable({ rows, onUpdate, onRemove }: Props) {
  return (
    <div className="rounded-lg border bg-white">
      <table className="w-full border-collapse">
        <thead className="border-b text-left text-sm text-gray-500">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b">
              <td className="px-4 py-2">
                <input
                  value={row.name}
                  onChange={(e) => onUpdate(row.id, "name", e.target.value)}
                  placeholder="Enter name"
                  className="w-full rounded border px-2 py-1"
                />
              </td>

              <td className="px-4 py-2">
                <input
                  value={row.email}
                  onChange={(e) => onUpdate(row.id, "email", e.target.value)}
                  placeholder="Enter email"
                  className="w-full rounded border px-2 py-1"
                />
              </td>

              <td className="px-4 py-2">
                <input
                  value={row.phone}
                  onChange={(e) => onUpdate(row.id, "phone", e.target.value)}
                  placeholder="Enter phone"
                  className="w-full rounded border px-2 py-1"
                />
              </td>

              <td className="px-4 py-2 text-right">
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
                No items added yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

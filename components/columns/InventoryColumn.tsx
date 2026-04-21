import { InventorySummary } from "../../lib/api/inventory";
import { TableColumn } from "../Tables/Type";

const InventoryColumn: TableColumn<InventorySummary>[] = [
  { header: "Product", accessor: "name" },
  { header: "Quantity (Tire)", accessor: "quantity" },
  {
    header: "Status",
    accessor: (row) =>
      row.quantity <= 0 ? (
        <p className="bg-red-300 text-center px-2 py-1 rounded">Out of Stock</p>
      ) : row.quantity <= 4 ? (
        <p className="bg-yellow-300 text-center px-2 py-1 rounded">Low Stock</p>
      ) : (
        <p className="bg-green-300 text-center px-2 py-1 rounded">In Stock</p>
      ),
  },
];
export default InventoryColumn;

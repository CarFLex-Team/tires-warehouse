import { Transaction } from "@/lib/api/transactions";
import { TableColumn } from "../Tables/Type";
import formatDate from "@/lib/formatDate";
import { formatTime } from "@/lib/formatTime";

const transactionColumns: TableColumn<Transaction>[] = [
  { header: "Type", accessor: "type" },
  { header: "Category", accessor: "category" },
  {
    header: "Product/Service",
    accessor: (row) =>
      row.category === "Tire" ? row.product_name : row.service_name,
  },
  // { header: "Description", accessor: "description" },
  { header: "Quantity", accessor: "quantity" },
  { header: "Amount", accessor: "amount" },
  { header: "Payment Method", accessor: "payment_method" },

  {
    header: "Created At",
    accessor: (row) => (
      <div>
        <div>{formatDate(row.created_at)}</div>
        <div className="text-xs text-gray-400">
          at {formatTime(row.created_at)}
        </div>
      </div>
    ),
  },
  { header: "Created by", accessor: "created_by_name" },
];

import { Invoice } from "@/lib/api/customers";
import { TableColumn } from "../Tables/Type";
import formatDate from "@/lib/formatDate";
import formatTime from "@/lib/formatTime";

const invoiceColumns: TableColumn<Invoice>[] = [
  { header: "Invoice ID", accessor: "invoice_no" },
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
  {
    header: "Customer",
    accessor: (row) => (
      <div>
        <div>
          <span className="font-medium">Name:</span> {row.customer_name}
        </div>
        <div className="text-xs text-gray-400">
          <span className="font-medium">Phone:</span> {row.customer_phone}
        </div>
      </div>
    ),
  },
  {
    header: "Total Amount",
    accessor: (row) => `$${row.total_amount ?? row.subtotal}`,
  },
  {
    header: "SubTotal",
    accessor: (row) => `$${row.subtotal}`,
  },
  // {
  //   header: "Tax",
  //   accessor: (row) => `$${row.tax ?? 0}`,
  // },
  {
    header: "Status",
    accessor: (row) => <p className="capitalize">{row.status}</p>,
  },
  { header: "Payment Method", accessor: "payment_method" },

  { header: "Created By", accessor: "created_by_name" },
];
export default invoiceColumns;

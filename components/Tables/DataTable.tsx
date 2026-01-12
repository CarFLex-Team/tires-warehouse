import { TableColumn } from "./Type";
type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

type DataTableProps<T> = {
  title?: string;
  columns: TableColumn<T>[];
  data: T[];
  action?: React.ReactNode;
  pagination?: Pagination;
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  renderActions?: (row: T) => React.ReactNode;
};
function TableSkeleton({
  columns,
  length,
}: {
  columns: number;
  length: number;
}) {
  return (
    <>
      {Array.from({ length: length }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="py-3">
              <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function DataTable<T>({
  title,
  columns,
  data,
  action,
  pagination,
  isLoading = false,
  onRowClick,
  renderActions,
}: DataTableProps<T>) {
  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.pageSize)
    : 0;

  return (
    <div className="rounded-xl bg-white p-5 m-4 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-4">
        {title && <h2 className="text-lg font-semibold">{title}</h2>}
        {action}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse ">
          <thead>
            <tr className="border-b text-left text-sm text-gray-500 ">
              {columns.map((col, i) => (
                <th key={i} className="p-2 min-w-17">
                  {col.header}
                </th>
              ))}
              {renderActions && <th className="text-center">Actions</th>}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <TableSkeleton
                columns={columns.length}
                length={pagination ? pagination.pageSize : 3}
              />
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={renderActions ? columns.length + 1 : columns.length}
                  className="py-6 text-center text-sm text-gray-500"
                >
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b last:border-0  ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="py-3 px-2 text-sm">
                      {typeof col.accessor === "function"
                        ? col.accessor(row)
                        : col.header === "Amount"
                        ? "$" + (row[col.accessor] as React.ReactNode)
                        : (row[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                  {renderActions && (
                    <td className="text-center">{renderActions(row)}</td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && !isLoading && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            onClick={() => pagination.onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="rounded border cursor-pointer px-3 py-1  text-white bg-primary-600 disabled:opacity-50"
          >
            Previous
          </button>

          <span>
            Page {pagination.page} of {totalPages}
          </span>

          <button
            onClick={() => pagination.onPageChange(pagination.page + 1)}
            disabled={pagination.page === totalPages}
            className="rounded border cursor-pointer px-3 py-1 text-white bg-primary-600 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

"use client";
import { getInventorySummary, InventorySummary } from "@/lib/api/inventory";
import InventoryColumn from "../columns/InventoryColumn";
import { DataTable } from "../Tables/DataTable";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function StockAlert({
  setError,
}: {
  setError: (message: string) => void;
}) {
  const [stockPage, setStockPage] = useState(1);
  const pageSize = 6;
  const {
    data: summaryInventoryData,
    isLoading: summaryInventoryLoading,
    error: summaryInventoryError,
  } = useQuery<InventorySummary[]>({
    queryKey: ["inventorySummary"],
    queryFn: () => getInventorySummary(),
  });
  if (summaryInventoryError) {
    setError(
      summaryInventoryError.message ||
        "An error occurred while fetching inventory summary",
    );
  }
  return (
    <DataTable
      title="Stock Alert"
      columns={InventoryColumn}
      data={
        summaryInventoryLoading
          ? []
          : summaryInventoryData
            ? summaryInventoryData.slice(
                (stockPage - 1) * pageSize,
                stockPage * pageSize,
              )
            : []
      }
      isLoading={summaryInventoryLoading}
      pagination={{
        page: stockPage,
        pageSize,
        total: summaryInventoryData?.length || 0,
        onPageChange: setStockPage,
      }}
    />
  );
}

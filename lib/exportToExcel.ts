import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const exportToExcel = (
  filteredData: any[],
  filteredTopTires: any[],
  totals: any,
  selectedYear: string,
  selectedMonth: string,
) => {
  const workbook = XLSX.utils.book_new();

  // Monthly sales sheet
  const salesSheet = XLSX.utils.json_to_sheet(filteredData);

  XLSX.utils.book_append_sheet(workbook, salesSheet, "Monthly Sales");

  // Top tires sheet
  const tiresSheet = XLSX.utils.json_to_sheet(filteredTopTires);

  XLSX.utils.book_append_sheet(workbook, tiresSheet, "Top Tires");

  // Summary sheet
  const summarySheet = XLSX.utils.json_to_sheet([
    {
      Year: selectedYear,
      Month: selectedMonth,
      Sales: totals.sales,
      Expenses: totals.expenses,
      TiresSold: totals.tires,
      Services: totals.services,
    },
  ]);

  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const file = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(file, `report-${selectedYear}-${selectedMonth}.xlsx`);
};

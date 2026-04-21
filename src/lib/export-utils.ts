import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable"; // ← sirf import, no named import

// Extend jsPDF type to include autoTable
import type { UserOptions } from "jspdf-autotable";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: UserOptions) => jsPDF;
  }
}

export type ExportColumn<T> = { header: string; accessor: (row: T) => string | number };

export function exportToExcel<T>(filename: string, columns: ExportColumn<T>[], rows: T[]) {
  const data = rows.map((r) => {
    const obj: Record<string, string | number> = {};
    columns.forEach((c) => { obj[c.header] = c.accessor(r); });
    return obj;
  });
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportToPdf<T>(filename: string, title: string, columns: ExportColumn<T>[], rows: T[]) {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text(title, 14, 14);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 20);

  doc.autoTable({          // ← autoTable as method on doc instance
    startY: 26,
    head: [columns.map((c) => c.header)],
    body: rows.map((r) => columns.map((c) => String(c.accessor(r) ?? ""))),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  doc.save(`${filename}.pdf`);
}
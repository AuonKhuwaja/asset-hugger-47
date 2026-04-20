import { FileSpreadsheet, FileText } from "lucide-react";
import { exportToExcel, exportToPdf, type ExportColumn } from "@/lib/export-utils";

interface Props<T> {
  filename: string;
  title?: string;
  columns: ExportColumn<T>[];
  rows: T[];
}

export function ExportButtons<T>({ filename, title, columns, rows }: Props<T>) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => exportToExcel(filename, columns, rows)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-600/20 transition-colors"
        title="Export to Excel"
      >
        <FileSpreadsheet className="w-4 h-4" /> Excel
      </button>
      <button
        type="button"
        onClick={() => exportToPdf(filename, title || filename, columns, rows)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 text-xs font-semibold border border-red-600/20 transition-colors"
        title="Export to PDF"
      >
        <FileText className="w-4 h-4" /> PDF
      </button>
    </div>
  );
}

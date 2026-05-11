import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface TablePaginationProps {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
  pageSizeOptions?: number[];
}

export function TablePagination({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, total);

  const btn =
    "h-8 w-8 inline-flex items-center justify-center rounded-lg border border-border/40 bg-muted/20 text-foreground hover:bg-primary/10 hover:text-primary disabled:opacity-40 disabled:pointer-events-none transition-colors";

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-5 py-3 border-t border-dashed border-border bg-muted/10">
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>
          Showing <span className="font-semibold text-foreground">{from}</span>–
          <span className="font-semibold text-foreground">{to}</span> of{" "}
          <span className="font-semibold text-foreground">{total}</span>
        </span>
        <div className="flex items-center gap-1.5">
          <span>Rows:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="h-7 px-2 rounded-lg bg-background border border-border/40 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {pageSizeOptions.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <button className={btn} disabled={safePage <= 1} onClick={() => onPageChange(1)} aria-label="First page">
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button className={btn} disabled={safePage <= 1} onClick={() => onPageChange(safePage - 1)} aria-label="Previous page">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs text-muted-foreground px-2">
          Page <span className="font-semibold text-foreground">{safePage}</span> of{" "}
          <span className="font-semibold text-foreground">{totalPages}</span>
        </span>
        <button className={btn} disabled={safePage >= totalPages} onClick={() => onPageChange(safePage + 1)} aria-label="Next page">
          <ChevronRight className="w-4 h-4" />
        </button>
        <button className={btn} disabled={safePage >= totalPages} onClick={() => onPageChange(totalPages)} aria-label="Last page">
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function usePagination<T>(items: T[], initialPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  useEffect(() => {
    setPage(1);
  }, [items.length]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize],
  );

  return {
    page: safePage,
    pageSize,
    setPage,
    setPageSize,
    paged,
    total: items.length,
  };
}

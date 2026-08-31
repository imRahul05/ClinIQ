import * as React from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";
import { cn } from "../lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T extends Record<string, React.ReactNode | string | number | boolean | null | undefined>> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  searchPlaceholder?: string;
  searchFilter?: (item: T, query: string) => boolean;
  pageSize?: number;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function DataTable<T extends Record<string, React.ReactNode | string | number | boolean | null | undefined>>({
  data,
  columns,
  keyExtractor,
  searchPlaceholder = "Search records...",
  searchFilter,
  pageSize = 10,
  emptyMessage = "No records found.",
  onRowClick,
  className,
}: DataTableProps<T>) {
  const [query, setQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);

  const filteredData = React.useMemo(() => {
    if (!query.trim() || !searchFilter) return data;
    return data.filter((item) => searchFilter(item, query.trim().toLowerCase()));
  }, [data, query, searchFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageData = filteredData.slice(startIndex, startIndex + pageSize);

  return (
    <div className={cn("flex flex-col gap-3 w-full", className)}>
      {searchFilter && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[var(--ink-faint)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full rounded border border-[var(--line-strong)] bg-[var(--paper-sunken)] pl-8 pr-3 py-1.5 font-mono text-xs text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:border-[var(--ink)] shadow-2xs"
          />
        </div>
      )}

      <div className="rounded border border-[var(--line)] overflow-hidden bg-[var(--paper-raised)] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="border-b border-[var(--line)] bg-[var(--paper-sunken)] font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-muted)] font-medium">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className={cn("px-4 py-3", col.className)}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {pageData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-8 text-center font-mono text-xs text-[var(--ink-muted)]"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                pageData.map((item) => (
                  <tr
                    key={keyExtractor(item)}
                    onClick={() => onRowClick?.(item)}
                    className={cn(
                      "transition-colors hover:bg-[var(--paper-sunken)]/60",
                      onRowClick && "cursor-pointer"
                    )}
                  >
                    {columns.map((col) => {
                      const value = item[col.key];
                      const renderedValue = col.render
                        ? col.render(item)
                        : (typeof value === "string" || typeof value === "number")
                        ? String(value)
                        : (React.isValidElement(value) ? value : null);
                      return (
                        <td key={col.key} className={cn("px-4 py-3 text-[var(--ink)]", col.className)}>
                          {renderedValue}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--line)] px-4 py-2.5 bg-[var(--paper-sunken)] font-mono text-[11px] text-[var(--ink-muted)]">
            <span>
              Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredData.length)} of {filteredData.length} entries
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="size-3 mr-1" /> Prev
              </Button>
              <span className="font-medium text-[var(--ink)]">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next <ChevronRight className="size-3 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



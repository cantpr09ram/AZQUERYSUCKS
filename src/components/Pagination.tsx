import React from "react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  window?: number; // number of pages to show around current page
};

// logic for building page numbers with gaps
function buildPages(current: number, total: number, window: number = 2) {
  const pages: (number | "gap")[] = [];

  const start = Math.max(1, current - window);
  const end = Math.min(total, current + window);

  // always show first
  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push("gap");
  }

  // show current window
  for (let p = start; p <= end; p++) {
    pages.push(p);
  }

  // always show last
  if (end < total) {
    if (end < total - 1) pages.push("gap");
    pages.push(total);
  }

  return pages;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  window = 2,
}) => {
  const pages = buildPages(currentPage, totalPages, window);

  return (
    <div className="sticky left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 z-50">
      <div className="flex items-center justify-center gap-2">
        {/* Prev button */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm border border-border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
        >
          &lt;
        </button>

        {/* Page buttons */}
        {pages.map((p, idx) =>
          p === "gap" ? (
            <span
              key={`gap-${idx}`}
              className="px-2 text-sm text-muted-foreground"
            >
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`px-3 py-1 text-sm border border-border rounded ${
                currentPage === p
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {p}
            </button>
          )
        )}

        {/* Next button */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm border border-border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default Pagination;

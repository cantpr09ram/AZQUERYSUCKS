import type React from "react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  window?: number; // number of pages to show around current page
};

type PageItem = { type: "page"; page: number } | { type: "gap"; id: string };

function clampPage(page: number, totalPages: number) {
  if (totalPages <= 0) return 1;
  return Math.max(1, Math.min(totalPages, page));
}

// logic for building page numbers with gaps
function buildPages(current: number, total: number, window: number = 2) {
  const items: PageItem[] = [];

  const safeTotal = Math.max(0, total);
  const safeCurrent = clampPage(current, safeTotal);

  const start = Math.max(1, safeCurrent - window);
  const end = Math.min(safeTotal, safeCurrent + window);

  // always show first
  if (start > 1) {
    items.push({ type: "page", page: 1 });
    if (start > 2) items.push({ type: "gap", id: `gap-before-${start}` });
  }

  // show current window
  for (let page = start; page <= end; page++) {
    items.push({ type: "page", page });
  }

  // always show last
  if (end < safeTotal) {
    if (end < safeTotal - 1) {
      items.push({ type: "gap", id: `gap-after-${end}` });
    }
    items.push({ type: "page", page: safeTotal });
  }

  return items;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  window = 2,
}) => {
  if (totalPages <= 1) return null;

  const safeCurrentPage = clampPage(currentPage, totalPages);
  const pages = buildPages(safeCurrentPage, totalPages, window);

  const changePage = (page: number) => {
    onPageChange(clampPage(page, totalPages));
  };

  return (
    <div className="sticky left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-2 z-50">
      <div className="flex items-center justify-center gap-2">
        {/* Prev button */}
        <button
          type="button"
          onClick={() => changePage(safeCurrentPage - 1)}
          disabled={safeCurrentPage === 1}
          className="px-2 py-1 text-sm border border-border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
        >
          &lt;
        </button>

        {/* Page buttons */}
        {pages.map((item) =>
          item.type === "gap" ? (
            <span key={item.id} className="px-1 text-sm text-muted-foreground">
              ...
            </span>
          ) : (
            <button
              key={item.page}
              type="button"
              onClick={() => changePage(item.page)}
              className={`px-2 py-1 text-sm border border-border rounded ${
                safeCurrentPage === item.page
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {item.page}
            </button>
          ),
        )}

        {/* Next button */}
        <button
          type="button"
          onClick={() => changePage(safeCurrentPage + 1)}
          disabled={safeCurrentPage === totalPages}
          className="px-2 py-1 text-sm border border-border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default Pagination;

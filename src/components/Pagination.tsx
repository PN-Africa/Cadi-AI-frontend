import { LucideChevronLeft, LucideChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

type PageItem = number | "ellipsis";

const getPageItems = (page: number, totalPages: number): PageItem[] => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const visible = Array.from(
    new Set([1, totalPages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= totalPages))
  ).sort((a, b) => a - b);

  const items: PageItem[] = [];
  visible.forEach((value, index) => {
    if (index > 0 && value - visible[index - 1] > 1) {
      items.push("ellipsis");
    }
    items.push(value);
  });

  return items;
};

const Pagination = ({ page, totalPages, onPageChange, disabled = false }: PaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  const baseButton =
    "border-[1.5px] rounded-md px-3 py-1.5 text-[12px] sm:text-[13px] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <nav aria-label="Pagination" className="flex items-center gap-1.5 flex-wrap justify-center">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page <= 1}
        aria-label="Previous page"
        className={`${baseButton} border-[#C6C6CD99] bg-white text-[#6B7C93] flex items-center`}
      >
        <LucideChevronLeft className="size-4" />
      </button>

      {getPageItems(page, totalPages).map((item, index) =>
        item === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="px-1 text-[#6B7C93]" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            disabled={disabled}
            aria-label={`Page ${item}`}
            aria-current={item === page ? "page" : undefined}
            className={`${baseButton} ${
              item === page
                ? "bg-[#1F3A5F] border-[#1F3A5F] text-white"
                : "bg-white border-[#C6C6CD99] text-[#6B7C93]"
            }`}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page >= totalPages}
        aria-label="Next page"
        className={`${baseButton} border-[#C6C6CD99] bg-white text-[#6B7C93] flex items-center`}
      >
        <LucideChevronRight className="size-4" />
      </button>
    </nav>
  );
};

export default Pagination;
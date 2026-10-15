import { LucideLoader2 } from "lucide-react";

type LoadingVariant = "spinner" | "cards" | "table";

interface LoadingProps {
  variant?: LoadingVariant;
  rows?: number;
  label?: string;
}

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse motion-reduce:animate-none rounded-md bg-[#E4E8F0] ${className}`} />
);

const Loading = ({ variant = "spinner", rows = 5, label = "Loading" }: LoadingProps) => {
  if (variant === "cards") {
    return (
      <div role="status" aria-live="polite" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <span className="sr-only">{label}</span>
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="bg-white border border-[#C6C6CD99] rounded-md p-4 sm:p-5 flex items-center gap-3"
          >
            <Skeleton className="size-10" />
            <div className="flex-1 flex flex-col gap-2">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col divide-y divide-[#C6C6CD99]"
      >
        <span className="sr-only">{label}</span>
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="px-4 py-4 flex items-center gap-4">
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 flex-1 hidden sm:block" />
            <Skeleton className="h-6 w-28" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-2 py-10 text-[13px] sm:text-[14px] text-[#6B7C93]"
    >
      <LucideLoader2 className="size-5 animate-spin motion-reduce:animate-none" />
      {label}
    </div>
  );
};

export default Loading;
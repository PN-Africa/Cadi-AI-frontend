import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LucideAlertTriangle, LucideBell, LucideOctagonAlert } from "lucide-react";
import type { DashboardAlert } from "../services/apiDashboard";

interface NotificationsProps {
  items: DashboardAlert[];
}

const severityStyles = {
  "Needs Attention": { icon: LucideAlertTriangle, text: "text-[#8A6116]" },
  Alert: { icon: LucideOctagonAlert, text: "text-[#8A1F1F]" },
} as const;

const Notifications = ({ items }: NotificationsProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const hasItems = items.length > 0;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={hasItems ? `Notifications, ${items.length} new` : "Notifications"}
        className="relative p-2 rounded-md cursor-pointer hover:bg-white"
      >
        <LucideBell className="size-6 text-primary" />
        {hasItems && (
          <span
            className="absolute top-1.5 right-1.5 size-2.5 rounded-full bg-[#D64545] border-2 border-[#F8F9FF]"
            aria-hidden="true"
          />
        )}
      </button>

      {isOpen && (
        <div
          className="fixed left-4 right-4 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-80 max-h-96 overflow-y-auto bg-white border border-[#C6C6CD99] rounded-md shadow-lg z-30"
        >
          <p className="px-4 py-3 font-semibold text-[14px] sm:text-[15px] text-primary border-b border-[#C6C6CD99]">
            Notifications
          </p>

          {hasItems ? (
            <ul className="divide-y divide-[#C6C6CD99]">
              {items.map((item) => {
                const style = severityStyles[item.severity];
                const Icon = style.icon;

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        navigate(`/patients/${item.patientId}`);
                      }}
                      className="w-full text-left px-4 py-3 flex flex-col gap-1 cursor-pointer hover:bg-[#F8F9FF]"
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className={`text-[12px] sm:text-[13px] font-medium flex items-center gap-1.5 ${style.text}`}>
                          <Icon className="size-4 shrink-0" />
                          {item.severity}
                        </span>
                        <span className="text-[11px] text-[#6B7C93] whitespace-nowrap">
                          {item.timestamp}
                        </span>
                      </span>
                      <span className="text-[13px] sm:text-[14px] text-primary font-medium">
                        {item.patientName} — {item.type}
                      </span>
                      {item.reason && (
                        <span className="text-[12px] text-[#6B7C93]">{item.reason}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-[13px] sm:text-[14px] text-primary font-medium">
                You're all caught up
              </p>
              <p className="text-[12px] text-[#6B7C93] mt-1">
                New alerts for your patients will appear here.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
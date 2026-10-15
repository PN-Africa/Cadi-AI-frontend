import { LucideMenu } from "lucide-react";
import { useAuthStore } from "../auth/auth";
import Notifications from "./Notification";
import type { DashboardAlert } from "../services/apiDashboard";

interface NavbarProps {
  onMenuClick: () => void;
  notifications?: DashboardAlert[];
}

const Navbar = ({ onMenuClick, notifications = [] }: NavbarProps) => {
  const user = useAuthStore((state) => state.user);

  const displayName = user?.name?.trim() || "";
  const initial = displayName.charAt(0).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-20 bg-[#F8F9FF] border-b border-[#C6C6CD99] px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="lg:hidden p-2 rounded-md cursor-pointer hover:bg-white"
        >
          <LucideMenu className="size-6 text-primary" />
        </button>

        <p className="font-semibold text-[16px] sm:text-[20px] lg:text-[24px] text-primary truncate">
          Welcome Back{displayName ? `, ${displayName}` : ""}
        </p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <Notifications items={notifications} />
        <div
          className="size-9 rounded-full bg-[#1F3A5F] text-white flex items-center justify-center text-[14px] font-medium"
          title={displayName || undefined}
          aria-hidden="true"
        >
          {initial}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
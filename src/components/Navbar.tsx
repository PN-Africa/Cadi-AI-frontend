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
    <header className="sticky top-0 z-20 bg-[#F8F9FF] px-4 sm:px-6 lg:px-8 py-3 lg:py-6 flex items-center justify-between gap-3">
      <div className="flex items-center gap-6 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="lg:hidden py-2 rounded-md cursor-pointer hover:bg-white"
        >
          <LucideMenu className="size-6 text-primary" />
        </button>

        <p className="font-semibold text-[16px] sm:text-[24px] lg:text-[32px] text-primary truncate">
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
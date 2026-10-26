import { useEffect } from "react";
import { LucideMenu } from "lucide-react";
import { useAuthStore } from "../auth/auth";
import { useProfileStore } from "../data/profile";
import { getSettings } from "../services/apiSettings";
import Notifications from "./Notification";
import SearchBar from "./SearchBar";
import type { DashboardAlert } from "../services/apiDashboard";
import profileicon from "../assets/profile-circle.svg"

interface NavbarProps {
  onMenuClick: () => void;
  notifications?: DashboardAlert[];
}

const titles = ["dr", "mr", "mrs", "ms", "prof"];

const getFirstName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts.find(
    (part, index) =>
      index === parts.length - 1 || !titles.includes(part.toLowerCase().replace(/\.$/, ""))
  );
  return first ?? "";
};

const Navbar = ({ onMenuClick, notifications = [] }: NavbarProps) => {
  const user = useAuthStore((state) => state.user);
  const profileName = useProfileStore((state) => state.name);
  const setProfileName = useProfileStore((state) => state.setName);

  useEffect(() => {
    let cancelled = false;
    setProfileName("");

    getSettings()
      .then((settings) => {
        if (!cancelled) setProfileName(settings.profile.fullName);
      })
      .catch(() => {
        // keep the fallback name if settings can't be loaded
      });

    return () => {
      cancelled = true;
    };
  }, [setProfileName]);

const displayName = getFirstName(profileName || user?.name || "");
  return (
    <header className="sticky top-0 z-20 bg-[#F8F9FF] px-4 sm:px-6 lg:px-8 py-3 lg:py-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center lg:gap-15 min-w-0 flex-1">
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

        <div className="order-last w-full md:order-none md:w-72 lg:w-120">
          <SearchBar />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <Notifications items={notifications} />
        <img src={profileicon} className="size-7 shrink-0" />
      </div>
    </header>
  );
};

export default Navbar;
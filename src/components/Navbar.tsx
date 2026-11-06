import { useEffect } from "react";
import { LucideMenu } from "lucide-react";
import { useAuthStore } from "../auth/auth";
import { useProfileStore } from "../data/profile";
import { getSettings } from "../services/apiSettings";
// import Notifications from "./Notification";
import SearchBar from "./SearchBar";
import type { DashboardAlert } from "../services/apiDashboard";
import profileicon from "../assets/profile-circle.svg"
import { useNavigate } from "react-router-dom";

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

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const user = useAuthStore((state) => state.user);
  const profileName = useProfileStore((state) => state.name);
  const setProfileName = useProfileStore((state) => state.setName);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    setProfileName("");

    getSettings()
      .then((settings) => {
        if (!cancelled) setProfileName(settings.profile.fullName);
      })
      .catch(() => {
      });

    return () => {
      cancelled = true;
    };
  }, [setProfileName]);

  const displayName = getFirstName(profileName || user?.name || "");

  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center gap-x-3 gap-y-3 bg-[#F8F9FF] px-4 py-3 sm:px-6 lg:h-24 lg:flex-nowrap lg:gap-x-6 lg:px-8 lg:py-0">
      <div className="flex min-w-0 flex-1 items-center gap-3 md:flex-initial">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="-ml-1.5 shrink-0 cursor-pointer rounded-md p-1.5 hover:bg-white lg:hidden"
        >
          <LucideMenu className="size-6 text-primary" />
        </button>

        <p className="min-w-0 truncate text-[18px] font-semibold text-primary sm:text-[24px] lg:text-[26px] xl:text-[32px]">
          Welcome Back{displayName ? `, ${displayName}` : ""}
        </p>
      </div>

      <div className="order-last w-full md:order-none md:w-64 md:shrink-0 lg:w-72 xl:w-96 2xl:w-120">
        <SearchBar />
      </div>

      <button
        type="button"
        onClick={() => navigate("/settings")}
        aria-label="Open settings"
        className="ml-auto shrink-0 cursor-pointer"
      >
        <img src={profileicon} alt="" className="size-7" />
      </button>
    </header>
  );
};

export default Navbar;
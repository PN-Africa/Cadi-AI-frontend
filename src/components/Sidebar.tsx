import { NavLink, useNavigate } from "react-router-dom";
import { LucideLayoutDashboard, LucideLogOut, LucideUsers, LucideX } from "lucide-react";
import { useAuthStore } from "../auth/auth";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Only routes that exist in the router are listed here. Add new entries as
// their pages are built.
const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: LucideLayoutDashboard },
  { label: "Patients", to: "/patients", icon: LucideUsers },
];

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogout = () => {
    clearAuth();
    onClose();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 z-40 bg-white border-r border-[#C6C6CD99] flex flex-col p-4 transition-transform motion-reduce:transition-none lg:sticky lg:h-screen lg:w-60 lg:z-auto lg:translate-x-0 shrink-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between px-2 py-2">
          <p className="font-bold text-[20px] lg:text-[22px] text-primary">CADI AI</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="lg:hidden p-1 rounded-md cursor-pointer hover:bg-[#F8F9FF]"
          >
            <LucideX className="size-5 text-[#6B7C93]" />
          </button>
        </div>

        <nav className="mt-6 flex flex-col gap-1">
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-[14px] ${
                  isActive
                    ? "bg-[#EEF3FC] text-[#0D469C] font-medium"
                    : "text-[#6B7C93] hover:bg-[#F8F9FF]"
                }`
              }
            >
              <Icon className="size-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 px-3 py-2 rounded-md text-[14px] text-[#6B7C93] hover:bg-[#F8F9FF] cursor-pointer"
        >
          <LucideLogOut className="size-5 shrink-0" />
          Log Out
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
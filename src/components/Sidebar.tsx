import { NavLink, useNavigate, useParams } from "react-router-dom";
import { LucideX } from "lucide-react";
import { useAuthStore } from "../auth/auth";
import dashboardicon from "../assets/activity.svg"
import patientsicon from "../assets/profile-2user.svg"
import foldericon from "../assets/Outline.svg"
import logouticon from "../assets/logout.svg"
import dashboardiconActive from "../assets/activity-active.svg"
import patientsiconActive from "../assets/profile-2user-active.svg"


interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navItems = [
    { label: "Dashboard", to: "/dashboard", icon: dashboardicon, activeIcon: dashboardiconActive },
    { label: "Patients", to: "/patients", icon: patientsicon, activeIcon: patientsiconActive },
    { label: "History", to: id ? `/patients/${id}/history` : `/patients/${id}`, icon: foldericon, activeIcon: foldericon },
  ];

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
          {navItems.map(({ label, to, icon: icon, activeIcon: activeIcon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-[14px] ${
                  isActive
                    ? "text-[#2563EB] font-medium"
                    : "text-[#6B7C93] hover:bg-[#F8F9FF]"
                }`
              }
            >
            {({ isActive }) => (
              <>
                <img src={isActive ? activeIcon : icon} alt="" className="w-6 h-6 shrink-0" />
                {label}
              </>
            )}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 px-3 py-2 rounded-md text-[14px] text-[#6B7C93] hover:bg-[#F8F9FF] cursor-pointer"
        >
          <img src={logouticon} className="size-5 shrink-0" />
          Log Out
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
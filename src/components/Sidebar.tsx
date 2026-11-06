import { useEffect, useState } from "react";
import { NavLink, useLocation, useMatch, useNavigate } from "react-router-dom";
import { LucideX } from "lucide-react";
import { useAuthStore } from "../auth/auth";
import { isAdminRole } from "../auth/roles";
import dashboardicon from "../assets/activity.svg"
import patientsicon from "../assets/profile-2user.svg"
import foldericon from "../assets/Outline.svg"
import logouticon from "../assets/logout.svg"
import dashboardiconActive from "../assets/activity-active.svg"
import patientsiconActive from "../assets/profile-2user-active.svg"
import foldericonActive from "../assets/History icon.svg"
import overviewicon from "../assets/menu-board.svg"
import overviewiconActive from "../assets/menu-board-active.svg"
import notificationsicon from "../assets/notification-sidebar.svg"
import notificationsiconActive from "../assets/notification-active.svg"
import settingsicon from "../assets/setting-3.svg"
import settingsIconActive from "../assets/setting-active.svg"
import cadiailogo from "../assets/favicon.svg"
import { usePatients } from "../data/usePatients";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const role = useAuthStore((state) => state.user?.role);
  const isAdmin = isAdminRole(role);

  const patientMatch = useMatch("/patient/:id/*");
  const currentPatientId = patientMatch?.params.id;
  const [lastPatientId, setLastPatientId] = useState<string | undefined>(currentPatientId);
  useEffect(() => {
    if (currentPatientId) setLastPatientId(currentPatientId);
  }, [currentPatientId]);
  const { patients } = usePatients();
  const activePatientId = currentPatientId ?? lastPatientId ?? patients[0]?.id;
  const historyPath = `/patient/${activePatientId}/history`;
  const onHistoryPage =
    !!currentPatientId && pathname === `/patient/${currentPatientId}/history`;

  const userNavItems: {
    label: string;
    to: string;
    icon: string;
    activeIcon: string;
    active?: boolean;
  }[] = [
    { label: "Dashboard", to: "/dashboard", icon: dashboardicon, activeIcon: dashboardiconActive },
    {
      label: "Patients",
      to: "/patients",
      icon: patientsicon,
      activeIcon: patientsiconActive,
      active: pathname.startsWith("/patients") || (!!currentPatientId && !onHistoryPage),
    },
    { label: "History", to: historyPath, icon: foldericon, activeIcon: foldericonActive },
    { label: "Drafts", to: '/drafts', icon: overviewicon, activeIcon: overviewiconActive },
    { label: "Notifications", to: '/notifications', icon: notificationsicon, activeIcon: notificationsiconActive },
    { label: "Settings", to: '/settings', icon: settingsicon, activeIcon: settingsIconActive },
  ];

  const adminNavItems = userNavItems
    .filter((item) => item.label !== "Notifications")
    .map((item) => (item.label === "Drafts" ? { ...item, label: "Tasks", to: "/tasks" } : item));
  const usersItem = { label: "Users", to: "/users", icon: patientsicon, activeIcon: patientsiconActive };
  const navItems = isAdmin
    ? [...adminNavItems.slice(0, -1), usersItem, ...adminNavItems.slice(-1)]
    : userNavItems;

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
        className={`fixed top-0 left-0 z-40 flex h-dvh w-64 shrink-0 flex-col border-r border-[#C6C6CD99] bg-white transition-transform motion-reduce:transition-none lg:sticky lg:z-auto lg:w-60 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Main navigation"
      >
        <div className="relative flex h-16 shrink-0 items-center justify-center px-4 lg:h-24">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-md p-1 hover:bg-[#F8F9FF] lg:hidden"
          >
            <LucideX className="size-5 text-[#6B7C93]" />
          </button>
          <div className="flex items-center gap-3">
            <img className="size-10 shrink-0" src={cadiailogo} alt="" />
            <p className="text-xl font-semibold">CADI AI</p>
          </div>
        </div>

        {/* Scrolls on short screens so Log Out never gets pushed off */}
        <nav className="mt-2 flex flex-1 flex-col gap-1 overflow-y-auto">
          {navItems.map(({ label, to, icon: icon, activeIcon: activeIcon }) => (
            <NavLink
              key={label}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-2.5 text-[14px] ${
                  isActive ?
                    "text-[#2563EB] font-medium bg-gray-100"
                    : "text-[#6B7C93] hover:bg-[#F8F9FF]"
                }`
              }
            >
            {({ isActive }) => (
              <>
                {to === "/users" ? (
                  <img src={isActive ? usersItem.activeIcon : usersItem.icon} aria-hidden="true" className="w-6 h-6 shrink-0" />
                ) : (
                  <img src={isActive ? activeIcon : icon} alt="" className="w-6 h-6 shrink-0" />
                )}
                {label}
              </>
            )}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mb-4 flex w-full shrink-0 cursor-pointer items-center gap-3 px-6 py-2.5 text-left text-[14px] text-[#6B7C93] hover:bg-[#F8F9FF]"
        >
          <img src={logouticon} alt="" className="size-6 shrink-0" />
          Log Out
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
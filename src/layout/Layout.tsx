import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import type { DashboardAlert } from "../services/apiDashboard";

// Pages rendered inside the layout can read this through useOutletContext()
// to feed the navbar's notification tray.
export interface LayoutContext {
  setNotifications: (alerts: DashboardAlert[]) => void;
}

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<DashboardAlert[]>([]);

  const context: LayoutContext = { setNotifications };

  return (
    <div className="min-h-screen bg-[#F8F9FF] lg:flex">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar
          onMenuClick={() => setIsSidebarOpen(true)}
          notifications={notifications}
        />

        <main className="flex-1">
          <Outlet context={context} />
        </main>
      </div>
    </div>
  );
};

export default Layout;
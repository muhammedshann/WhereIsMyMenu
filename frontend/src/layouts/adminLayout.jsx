import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../componenets/sideBar";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState("Dashboard");

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-200">

      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
      />

      {/* Main Content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
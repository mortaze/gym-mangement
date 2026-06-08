// dashboard/layout.jsx
"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

export default function DashboardLayout({ children }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex bg-[#080a0f] min-h-screen" dir="rtl">
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <main
        id="mainContent"
        className="flex-1 p-4 md:p-6 bg-[#080a0f] text-gray-100 min-h-screen lg:mr-56 dashboard-dark-shell"
      >
        <Header onOpenSidebar={() => setIsMobileSidebarOpen(true)} />
        {children}
      </main>
    </div>
  );
}

// dashboard/layout.jsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

export default function DashboardLayout({ children }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") setIsMobileSidebarOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = isMobileSidebarOpen ? "hidden" : "";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isMobileSidebarOpen]);

  return (
    <div className="flex bg-[#080a0f] min-h-screen" dir="rtl">
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {isMobileSidebarOpen && <button aria-label="بستن منوی موبایل" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setIsMobileSidebarOpen(false)} />}

      <main
        id="mainContent"
        className="min-w-0 flex-1 overflow-x-hidden p-3 sm:p-4 md:p-6 bg-[#080a0f] text-gray-100 min-h-screen lg:mr-56 dashboard-dark-shell"
      >
        <Header onOpenSidebar={() => setIsMobileSidebarOpen(true)} />
        {children}
      </main>
    </div>
  );
}

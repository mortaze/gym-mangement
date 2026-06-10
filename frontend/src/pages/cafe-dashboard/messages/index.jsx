"use client";
import React, { useEffect, useState } from "react";
import DashboardLayout from "../layout";
import MessagingPanel from "@/components/MessagingPanel";

export default function MessagesPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? sessionStorage.getItem("currentUser") : null;
    const u = raw ? JSON.parse(raw) : null;
    setUser(u);
  }, []);

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24 text-gray-500 font-black">در حال بارگذاری...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 min-h-screen bg-[#0f1115] rounded-[2.5rem]" dir="rtl">
        <MessagingPanel currentUser={user} />
      </div>
    </DashboardLayout>
  );
}

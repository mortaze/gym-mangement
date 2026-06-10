"use client";

import React from "react";
import { Dumbbell } from "lucide-react";
import AdminLoginForm from "../forms/AdminLoginForm";

export default function AdminLoginArea() {
  return (
    <main
      id="login-section"
      className="overflow-x-hidden bg-[radial-gradient(circle_at_top,#2f2a14_0%,#101318_32%,#07080c_100%)] px-4 py-6 text-[var(--text-body)] sm:px-6 lg:px-8"
      dir="rtl"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-6 py-16">
        <div className="flex items-center gap-3 rounded-full border border-yellow-400/20 bg-white/5 px-5 py-3 shadow-2xl shadow-black/30 backdrop-blur">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-400 text-[var(--text-body)]">
            <Dumbbell size={24} strokeWidth={3} />
          </span>
          <span className="text-lg font-black italic tracking-tighter sm:text-xl">
            IRON <span className="text-yellow-400">GYM</span>
          </span>
        </div>

        <AdminLoginForm />
      </div>
    </main>
  );
}

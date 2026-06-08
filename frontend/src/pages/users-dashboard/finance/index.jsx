"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "../layout";
import { API_BASE_URL } from "@/config/api";
import { CreditCard, ShieldCheck, Clock } from "lucide-react";
import Swal from "sweetalert2";

const plans = [
  ["1m-10", "طرح یک‌ماهه ۱۰ جلسه‌ای", "۸۵۰,۰۰۰"],
  ["1m-15", "طرح یک‌ماهه ۱۵ جلسه‌ای", "۱,۱۰۰,۰۰۰"],
  ["1m-20", "طرح یک‌ماهه ۲۰ جلسه‌ای", "۱,۳۵۰,۰۰۰"],
  ["3m-30", "طرح سه‌ماهه ۳۰ جلسه‌ای", "۳,۲۰۰,۰۰۰"],
];

export default function UserFinancePage() {
  const [user, setUser] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async (u) => {
    if (!u?._id) return;
    const res = await fetch(`${API_BASE_URL}/memberships?userId=${u._id}`);
    const data = await res.json();
    if (data.success) setMemberships(data.memberships || []);
  };

  useEffect(() => {
    const raw = typeof window !== "undefined" ? sessionStorage.getItem("currentUser") : null;
    const u = raw ? JSON.parse(raw) : null;
    setUser(u);
    load(u);
  }, []);

  const purchase = async (planCode) => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/memberships/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id, planCode }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      await Swal.fire({ icon: "success", title: "در انتظار تایید پرداخت", text: "پرداخت شبیه‌سازی شده ثبت شد و پس از تایید مالی فعال می‌شود.", background: "#11141b", color: "#fff" });
      load(user);
    } catch (err) {
      Swal.fire({ icon: "error", title: "خطا", text: err.message, background: "#11141b", color: "#fff" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 min-h-screen rounded-[2rem] bg-[#0f1115] text-right" dir="rtl">
        <h1 className="text-3xl font-black text-white mb-2">خرید و تمدید عضویت</h1>
        <p className="text-gray-500 mb-8">پرداخت واقعی وجود ندارد؛ درخواست با وضعیت در انتظار پرداخت ثبت می‌شود.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
          {plans.map(([code, name, price]) => (
            <div key={code} className="bg-[#1a1d23] border border-gray-800 rounded-[2rem] p-6">
              <ShieldCheck className="text-yellow-400 mb-4" />
              <h3 className="text-white font-black text-lg">{name}</h3>
              <p className="text-gray-400 my-3">{price} تومان</p>
              <button disabled={loading} onClick={() => purchase(code)} className="w-full bg-yellow-400 text-black rounded-xl py-3 font-black disabled:opacity-50">
                <CreditCard className="inline ml-2" size={16} /> خرید شبیه‌سازی‌شده
              </button>
            </div>
          ))}
        </div>
        <h2 className="text-white font-black mb-4">تاریخچه عضویت و پرداخت</h2>
        <div className="space-y-3">
          {memberships.map((m) => (
            <div key={m._id} className="bg-[#1a1d23] border border-gray-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div><p className="text-white font-black">{m.planName}</p><p className="text-gray-500 text-xs">جلسات: {m.completedSessions}/{m.totalSessions} | باقی‌مانده: {m.remainingSessions}</p></div>
              <div className="text-gray-300 text-sm"><Clock size={14} className="inline ml-1" /> انقضا: {m.membershipEndDate ? new Date(m.membershipEndDate).toLocaleDateString("fa-IR") : "بعد از تایید"}</div>
              <span className="px-3 py-1 rounded-xl bg-gray-900 text-yellow-400 text-xs font-black">{m.status}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

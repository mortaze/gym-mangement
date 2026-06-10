"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "../layout";
import { API_BASE_URL } from "@/config/api";
import { CreditCard, ShieldCheck, Clock, Tag } from "lucide-react";
import Swal from "sweetalert2";

export default function UserFinancePage() {
  const [user, setUser] = useState(null);
  const [plans, setPlans] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  const load = async (u) => {
    if (!u?._id) return;
    const [pRes, mRes] = await Promise.all([
      fetch(`${API_BASE_URL}/memberships/plans`),
      fetch(`${API_BASE_URL}/memberships?userId=${u._id}`),
    ]);
    const pData = await pRes.json();
    const mData = await mRes.json();
    if (pData.success) setPlans(pData.plans || []);
    if (mData.success) setMemberships(mData.memberships || []);
  };

  useEffect(() => {
    const raw = typeof window !== "undefined" ? sessionStorage.getItem("currentUser") : null;
    const u = raw ? JSON.parse(raw) : null;
    setUser(u);
    load(u);
  }, []);

  const purchase = async (planId) => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const body = { userId: user._id, planId };
      if (couponCode.trim()) body.couponCode = couponCode.trim();

      const res = await fetch(`${API_BASE_URL}/memberships/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      await Swal.fire({ icon: "success", title: "در انتظار تایید پرداخت", text: "پرداخت شبیه‌سازی شده ثبت شد و پس از تایید مالی فعال می‌شود.", background: "#11141b", color: "#fff" });
      setCouponCode("");
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
        <p className="text-gray-500 mb-4">پرداخت واقعی وجود ندارد؛ درخواست با وضعیت در انتظار پرداخت ثبت می‌شود.</p>

        <div className="bg-[#1a1d23] border border-gray-800 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <Tag className="text-yellow-400 shrink-0" size={20} />
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="کد تخفیف دارید؟ وارد کنید"
            className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-yellow-400 w-full sm:w-auto"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
          {plans.map((p) => (
            <div key={p._id} className="bg-[#1a1d23] border border-gray-800 rounded-[2rem] p-6 flex flex-col">
              <ShieldCheck className="text-yellow-400 mb-4" size={28} />
              <h3 className="text-white font-black text-lg">{p.title}</h3>
              {p.subtitle && <p className="text-gray-500 text-xs mt-0.5 mb-2">{p.subtitle}</p>}
              {p.badge && <span className="inline-block self-start mb-2 bg-yellow-400/10 text-yellow-400 text-[10px] px-2 py-0.5 rounded-full font-black">{p.badge}</span>}
              <div className="mt-auto">
                <div className="flex items-baseline gap-2 my-3">
                  {p.discount > 0 ? (
                    <>
                      <span className="text-gray-500 line-through text-sm">{p.price.toLocaleString()}</span>
                      <span className="text-white text-2xl font-black">{p.effectivePrice.toLocaleString()}</span>
                    </>
                  ) : (
                    <span className="text-white text-2xl font-black">{p.price.toLocaleString()}</span>
                  )}
                  <span className="text-gray-500 text-xs">تومان</span>
                </div>
                <p className="text-gray-400 text-xs mb-4">{p.durationMonths} ماه / {p.totalSessions} جلسه</p>
                <button disabled={loading} onClick={() => purchase(p._id)} className="w-full bg-yellow-400 text-black rounded-xl py-3 font-black disabled:opacity-50 transition-all hover:bg-yellow-500">
                  <CreditCard className="inline ml-2" size={16} /> خرید شبیه‌سازی‌شده
                </button>
              </div>
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

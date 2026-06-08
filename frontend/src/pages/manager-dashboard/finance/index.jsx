"use client";

import React, { useEffect, useState } from "react";
import { Activity, CheckCircle2, ClipboardList, DollarSign, ShieldAlert } from "lucide-react";
import DashboardLayout from "../layout";
import { API_BASE_URL } from "@/config/api";

const money = (value) => `${Number(value || 0).toLocaleString("fa-IR")} تومان`;

export default function FinanceDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSummary = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/memberships/finance/summary`, { credentials: "include" });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "خطا در دریافت اطلاعات مالی");
      setSummary(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const approvePayment = async (paymentId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/memberships/payments/${paymentId}/approve`, { method: "PUT", credentials: "include" });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "خطا در تایید پرداخت");
      await loadSummary();
    } catch (err) {
      setError(err.message);
    }
  };

  const counts = summary?.counts || {};
  const cards = [
    { label: "درآمد تاییدشده", value: money(summary?.revenue?.total), icon: <DollarSign />, color: "text-green-400" },
    { label: "پرداخت‌های در انتظار", value: counts.pendingPayments || 0, icon: <ClipboardList />, color: "text-yellow-400" },
    { label: "عضویت‌های فعال", value: counts.activeMemberships || 0, icon: <CheckCircle2 />, color: "text-blue-400" },
    { label: "منقضی/نزدیک انقضا", value: `${counts.expiredMemberships || 0} / ${counts.nearExpiryMemberships || 0}`, icon: <ShieldAlert />, color: "text-red-400" },
  ];

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 min-h-screen bg-[#0f1115] rounded-[2.5rem] border border-gray-800 shadow-2xl" dir="rtl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10 pb-8 border-b border-gray-800">
          <div>
            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
              ماژول <span className="text-yellow-400">مدیریت مالی</span>
            </h1>
            <p className="text-gray-500 text-xs uppercase tracking-[0.5em] mt-3 flex items-center gap-2">
              <Activity size={14} className="text-yellow-400" /> پرداخت‌های شبیه‌سازی‌شده، تمدیدها و گزارش درآمد
            </p>
          </div>
          <button onClick={load} className="flex items-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 font-black text-black">
            <RefreshCcw size={18} /> بروزرسانی
          </button>
        </div>

        {loading && <div className="text-yellow-400 font-black mb-6">در حال بارگذاری...</div>}
        {error && <div className="bg-red-950/40 border border-red-800 text-red-200 rounded-2xl p-4 mb-6">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {cards.map((card) => (
            <div key={card.label} className="bg-[#1a1d23] p-6 rounded-[2rem] border border-gray-800">
              <div className={`mb-4 ${card.color}`}>{React.cloneElement(card.icon, { size: 30 })}</div>
              <p className="text-gray-500 text-[10px] uppercase font-black mb-1 tracking-widest">{card.label}</p>
              <h3 className="text-2xl font-black text-white italic">{card.value}</h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <section className="bg-[#1a1d23] border border-gray-800 rounded-[2rem] overflow-hidden">
            <div className="p-5 border-b border-gray-800 text-white font-black">تایید پرداخت‌ها</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-gray-500 bg-[#0f1115]"><tr><th className="p-4">عضو</th><th>مبلغ</th><th>وضعیت</th><th>عملیات</th></tr></thead>
                <tbody>
                  {(summary?.payments || []).map((payment) => (
                    <tr key={payment._id} className="border-t border-gray-800 text-gray-300">
                      <td className="p-4">{payment.userId?.name || "—"}</td>
                      <td>{money(payment.amount)}</td>
                      <td>{payment.status}</td>
                      <td>
                        {payment.status === "Pending Payment" ? (
                          <button onClick={() => approvePayment(payment._id)} className="bg-yellow-400 text-black px-3 py-2 rounded-xl font-black text-xs">تایید پرداخت</button>
                        ) : <span className="text-green-400">پرداخت‌شده</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-[#1a1d23] border border-gray-800 rounded-[2rem] overflow-hidden">
            <div className="p-5 border-b border-gray-800 text-white font-black">عضویت‌ها</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-gray-500 bg-[#0f1115]"><tr><th className="p-4">عضو</th><th>جلسات</th><th>روز</th><th>وضعیت</th></tr></thead>
                <tbody>
                  {(summary?.memberships || []).map((membership) => (
                    <tr key={membership._id} className="border-t border-gray-800 text-gray-300">
                      <td className="p-4">{membership.userId?.name || "—"}</td>
                      <td>{membership.remainingSessions} / {membership.totalSessions}</td>
                      <td>{membership.remainingDays}</td>
                      <td>{membership.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="rounded-[2rem] border border-gray-800 bg-[#1a1d23] p-6">
      <div className="mb-4 flex items-center justify-between text-yellow-400">{icon}<span className="text-[10px] font-black uppercase text-gray-500">{label}</span></div>
      <div className="text-2xl font-black text-white">{value}</div>
    </div>
  );
}

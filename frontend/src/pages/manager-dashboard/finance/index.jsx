"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "../layout";
import { API_BASE_URL } from "@/config/api";
import { CreditCard, CheckCircle2, RefreshCcw, TrendingUp } from "lucide-react";

export default function FinanceDashboard() {
  const [data, setData] = useState({ payments: [], revenue: { total: 0, count: 0 } });
  const [membershipStatus, setMembershipStatus] = useState({ active: [], expired: [], nearExpiry: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [paymentsRes, statusRes] = await Promise.all([
        fetch(`${API_BASE_URL}/memberships/payments`),
        fetch(`${API_BASE_URL}/memberships/admin/status`),
      ]);
      const payments = await paymentsRes.json();
      const status = await statusRes.json();
      if (!payments.success) throw new Error(payments.message || "خطا در دریافت پرداخت‌ها");
      if (!status.success) throw new Error(status.message || "خطا در دریافت عضویت‌ها");
      setData(payments);
      setMembershipStatus(status);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const approve = async (paymentId) => {
    const raw = sessionStorage.getItem("currentUser");
    const admin = raw ? JSON.parse(raw) : null;
    await fetch(`${API_BASE_URL}/memberships/payments/${paymentId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approvedBy: admin?._id }),
    });
    load();
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen rounded-[2.5rem] border border-gray-800 bg-[#0f1115] p-4 sm:p-8" dir="rtl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black text-white">داشبورد مالی</h1>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Mock Payments, Approvals & Revenue</p>
          </div>
          <button onClick={load} className="flex items-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 font-black text-black">
            <RefreshCcw size={18} /> بروزرسانی
          </button>
        </div>

        {loading && <div className="rounded-2xl bg-[#1a1d23] p-4 text-yellow-400">در حال بارگذاری...</div>}
        {error && <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">{error}</div>}

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Stat icon={<TrendingUp />} label="درآمد پرداخت‌شده" value={`${Number(data.revenue?.total || 0).toLocaleString()} تومان`} />
          <Stat icon={<CreditCard />} label="پرداخت‌های تاییدشده" value={data.revenue?.count || 0} />
          <Stat icon={<CheckCircle2 />} label="عضویت فعال" value={membershipStatus.active?.length || 0} />
          <Stat icon={<RefreshCcw />} label="نزدیک انقضا" value={membershipStatus.nearExpiry?.length || 0} />
        </div>

        <section className="overflow-hidden rounded-[2rem] border border-gray-800 bg-[#1a1d23]">
          <div className="border-b border-gray-800 p-5">
            <h2 className="font-black text-white">تاریخچه و تایید پرداخت‌ها</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-gray-900 text-xs text-gray-500">
                <tr>
                  <th className="p-4">عضو</th>
                  <th className="p-4">پلن</th>
                  <th className="p-4">مبلغ</th>
                  <th className="p-4">وضعیت</th>
                  <th className="p-4">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-gray-300">
                {(data.payments || []).map((payment) => (
                  <tr key={payment._id}>
                    <td className="p-4 text-white">{payment.userId?.name || "—"}</td>
                    <td className="p-4">{payment.membershipId?.planName || "—"}</td>
                    <td className="p-4">{Number(payment.amount || 0).toLocaleString()}</td>
                    <td className="p-4"><span className={payment.status === "Paid" ? "text-green-400" : "text-yellow-400"}>{payment.status}</span></td>
                    <td className="p-4">
                      {payment.status !== "Paid" && (
                        <button onClick={() => approve(payment._id)} className="rounded-xl bg-green-500 px-4 py-2 font-black text-black">
                          تایید پرداخت
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
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

"use client";

import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layout";
import { API_BASE_URL } from "@/config/api";
import { CheckCircle2, Clock, DollarSign, Users, FileText, ChevronDown, ChevronUp } from "lucide-react";
import Swal from "sweetalert2";

export default function FinanceDashboard() {
  const [memberships, setMemberships] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvoices, setShowInvoices] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [mRes, iRes] = await Promise.all([
        fetch(`${API_BASE_URL}/memberships`),
        fetch(`${API_BASE_URL}/invoices`),
      ]);
      const mData = await mRes.json();
      const iData = await iRes.json();
      if (mData.success) setMemberships(mData.memberships || []);
      if (iData.success) setInvoices(iData.invoices || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    const res = await fetch(`${API_BASE_URL}/memberships/${id}/approve-payment`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    const data = await res.json();
    if (data.success) {
      await Swal.fire({ icon: "success", title: "پرداخت تأیید شد", background: "#11141b", color: "#fff" });
      load();
    } else {
      Swal.fire({ icon: "error", title: "خطا", text: data.message, background: "#11141b", color: "#fff" });
    }
  };

  const generateInvoice = async (membershipId) => {
    const res = await fetch(`${API_BASE_URL}/invoices/generate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ membershipId }) });
    const data = await res.json();
    if (data.success) {
      await Swal.fire({ icon: "success", title: "فاکتور صادر شد", background: "#11141b", color: "#fff" });
      load();
    } else {
      Swal.fire({ icon: "error", title: "خطا", text: data.message, background: "#11141b", color: "#fff" });
    }
  };

  const stats = useMemo(() => {
    const paid = memberships.filter((m) => m.paymentId?.status === "Paid" || m.status === "Active");
    return {
      pending: memberships.filter((m) => m.status === "Pending Payment").length,
      active: memberships.filter((m) => m.status === "Active").length,
      expired: memberships.filter((m) => m.status === "Expired").length,
      revenue: paid.reduce((sum, m) => sum + Number(m.price || 0), 0),
    };
  }, [memberships]);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 min-h-screen bg-[#0f1115] rounded-[2rem]" dir="rtl">
        <h1 className="text-3xl font-black text-white mb-8">داشبورد مالی</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card icon={<Clock />} label="در انتظار پرداخت" value={stats.pending} />
          <Card icon={<Users />} label="عضویت فعال" value={stats.active} />
          <Card icon={<CheckCircle2 />} label="منقضی" value={stats.expired} />
          <Card icon={<DollarSign />} label="درآمد تأیید شده" value={`${stats.revenue.toLocaleString()} تومان`} />
        </div>

        {loading ? <p className="text-yellow-400">در حال بارگذاری...</p> : (
          <>
            <h2 className="text-xl font-black text-white mb-4">درخواست‌های عضویت</h2>
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {memberships.map((m) => <MembershipCard key={m._id} membership={m} approve={approve} generateInvoice={generateInvoice} />)}
            </div>
            <div className="hidden overflow-x-auto rounded-[2rem] border border-gray-800 bg-[#1a1d23] md:block mb-8">
              <table className="w-full min-w-[840px] text-right text-sm">
                <thead><tr className="border-b border-gray-800 text-gray-400"><th className="p-4">عضو</th><th className="p-4">طرح</th><th className="p-4">مبلغ</th><th className="p-4">وضعیت</th><th className="p-4">جلسات</th><th className="p-4">فاکتور</th><th className="p-4">عملیات</th></tr></thead>
                <tbody>{memberships.map((m) => (
                  <tr key={m._id} className="border-b border-gray-800 text-gray-200 last:border-b-0">
                    <td className="p-4">{m.userId?.name || "—"}<div className="text-xs text-gray-500">{m.userId?.employeeCode}</div></td>
                    <td className="p-4">{m.planName}</td><td className="p-4">{Number(m.price || 0).toLocaleString()}</td><td className="p-4">{statusLabel(m.status)}</td><td className="p-4">{m.remainingSessions}/{m.totalSessions}</td>
                    <td className="p-4">
                      {m.paymentId ? (
                        <button onClick={() => generateInvoice(m._id)} className="bg-gray-800 text-gray-300 px-3 py-2 rounded-xl font-black text-xs hover:bg-gray-700 transition-all">
                          <FileText size={14} className="inline ml-1" /> صدور فاکتور
                        </button>
                      ) : "—"}
                    </td>
                    <td className="p-4">{m.status === "Pending Payment" && <button onClick={() => approve(m._id)} className="bg-green-500 text-black px-3 py-2 rounded-xl font-black text-xs">تایید پرداخت</button>}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>

            <button onClick={() => setShowInvoices(!showInvoices)} className="flex items-center gap-2 text-white font-black mb-4 hover:text-yellow-400 transition-all">
              <FileText size={18} /> فاکتورهای صادر شده
              {showInvoices ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showInvoices && (
              <div className="overflow-x-auto rounded-[2rem] border border-gray-800 bg-[#1a1d23]">
                <table className="w-full min-w-[800px] text-right text-sm">
                  <thead><tr className="border-b border-gray-800 text-gray-400"><th className="p-4">شماره فاکتور</th><th className="p-4">عضو</th><th className="p-4">طرح</th><th className="p-4">مبلغ نهایی</th><th className="p-4">وضعیت</th><th className="p-4">تاریخ</th></tr></thead>
                  <tbody>{invoices.map((inv) => (
                    <tr key={inv._id} className="border-b border-gray-800 text-gray-200 last:border-b-0">
                      <td className="p-4 font-black text-yellow-400">{inv.invoiceNumber}</td>
                      <td className="p-4">{inv.userId?.name || "—"}</td>
                      <td className="p-4">{inv.planName}</td>
                      <td className="p-4 font-black text-white">{inv.finalAmount.toLocaleString()}</td>
                      <td className="p-4"><span className={`px-2 py-1 rounded-lg text-[10px] font-black ${inv.status === "Paid" ? "bg-green-500/20 text-green-400" : inv.status === "Pending" ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"}`}>{inv.status === "Paid" ? "پرداخت شده" : inv.status === "Pending" ? "در انتظار" : inv.status === "Cancelled" ? "لغو شده" : inv.status}</span></td>
                      <td className="p-4 text-gray-400 text-xs">{new Date(inv.createdAt).toLocaleDateString("fa-IR")}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function MembershipCard({ membership, approve, generateInvoice }) {
  const fields = [
    ["طرح", membership.planName || "—"],
    ["مبلغ", `${Number(membership.price || 0).toLocaleString()} تومان`],
    ["وضعیت", statusLabel(membership.status)],
    ["جلسات", `${membership.remainingSessions}/${membership.totalSessions}`],
  ];
  return (
    <article className="rounded-3xl border border-gray-800 bg-[#1a1d23] p-4 text-gray-200 shadow-xl">
      <div className="mb-4 border-b border-gray-800 pb-3">
        <h3 className="text-base font-black text-white">{membership.userId?.name || "—"}</h3>
        <p className="mt-1 text-xs font-bold text-gray-500">{membership.userId?.employeeCode || "بدون کد"}</p>
      </div>
      <div className="space-y-3">
        {fields.map(([label, value]) => <div key={label} className="flex items-center justify-between gap-3 rounded-2xl bg-gray-900/70 p-3 text-sm"><span className="text-gray-500">{label}</span><span className="text-left font-black text-white">{value}</span></div>)}
      </div>
      <div className="flex gap-2 mt-4">
        {membership.status === "Pending Payment" && <button onClick={() => approve(membership._id)} className="flex-1 rounded-2xl bg-green-500 px-4 py-3 font-black text-black text-sm">تایید پرداخت</button>}
        {membership.paymentId && <button onClick={() => generateInvoice(membership._id)} className="flex-1 rounded-2xl bg-gray-800 px-4 py-3 font-black text-white text-sm"><FileText size={14} className="inline ml-1" /> فاکتور</button>}
      </div>
    </article>
  );
}

function Card({ icon, label, value }) {
  return <div className="bg-[#1a1d23] border border-gray-800 rounded-3xl p-5 text-white"><div className="text-yellow-400 mb-2">{icon}</div><p className="text-gray-500 text-xs">{label}</p><h3 className="text-2xl font-black mt-1">{value}</h3></div>;
}

function statusLabel(status) {
  return { "Pending Payment": "در انتظار پرداخت", Active: "فعال", Expired: "منقضی", Cancelled: "لغوشده" }[status] || status || "—";
}

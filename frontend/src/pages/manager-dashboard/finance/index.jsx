"use client";

import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layout";
import { API_BASE_URL } from "@/config/api";
import { CheckCircle2, Clock, DollarSign, Users } from "lucide-react";
import Swal from "sweetalert2";

export default function FinanceDashboard() {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/memberships`);
      const data = await res.json();
      if (data.success) setMemberships(data.memberships || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    const res = await fetch(`${API_BASE_URL}/memberships/${id}/approve-payment`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    const data = await res.json();
    if (data.success) {
      await Swal.fire({ icon: "success", title: "پرداخت تایید شد", background: "#11141b", color: "#fff" });
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
          <Card icon={<DollarSign />} label="درآمد تایید شده" value={`${stats.revenue.toLocaleString()} تومان`} />
        </div>
        {loading ? <p className="text-yellow-400">در حال بارگذاری...</p> : (
          <div className="bg-[#1a1d23] border border-gray-800 rounded-[2rem] overflow-hidden">
            <table className="w-full text-sm text-right">
              <thead><tr className="text-gray-400 border-b border-gray-800"><th className="p-4">عضو</th><th>طرح</th><th>مبلغ</th><th>وضعیت</th><th>جلسات</th><th>عملیات</th></tr></thead>
              <tbody>{memberships.map((m) => (
                <tr key={m._id} className="border-b border-gray-800 text-gray-200">
                  <td className="p-4">{m.userId?.name || "—"}<div className="text-xs text-gray-500">{m.userId?.employeeCode}</div></td>
                  <td>{m.planName}</td><td>{Number(m.price || 0).toLocaleString()}</td><td>{m.status}</td><td>{m.remainingSessions}/{m.totalSessions}</td>
                  <td>{m.status === "Pending Payment" && <button onClick={() => approve(m._id)} className="bg-green-500 text-black px-3 py-2 rounded-xl font-black">Approve Payment</button>}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function Card({ icon, label, value }) {
  return <div className="bg-[#1a1d23] border border-gray-800 rounded-3xl p-5 text-white"><div className="text-yellow-400 mb-2">{icon}</div><p className="text-gray-500 text-xs">{label}</p><h3 className="text-2xl font-black mt-1">{value}</h3></div>;
}

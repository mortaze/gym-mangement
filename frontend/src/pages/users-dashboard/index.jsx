"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ShieldAlert, Clock, Coffee, Zap, Target, Bell, CheckCircle2, Activity } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import DashboardLayout from "./layout";
import { API_BASE_URL } from "@/config/api";

const bmiBands = [
  { name: "Underweight", min: 0, max: 18.5, color: "#60a5fa" },
  { name: "Normal", min: 18.5, max: 25, color: "#22c55e" },
  { name: "Overweight", min: 25, max: 30, color: "#facc15" },
  { name: "Obese", min: 30, max: 40, color: "#ef4444" },
];

export default function UserMainDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const raw = typeof window !== "undefined" ? sessionStorage.getItem("currentUser") : null;
    const parsed = raw ? JSON.parse(raw) : null;
    setCurrentUser(parsed);
    if (!parsed?._id) {
      setLoading(false);
      return;
    }
    fetch(`${API_BASE_URL}/memberships/summary/${parsed._id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) throw new Error(data.message || "خطا در دریافت اطلاعات عضویت");
        setSummary(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const activeMembership = summary?.activeMembership;
  const bmi = Number(currentUser?.bmi || summary?.activeMembership?.userId?.bmi || 0);
  const bmiCategory = currentUser?.bmiCategory || "Unknown";
  const sessionChart = useMemo(() => {
    const completed = activeMembership?.completedSessions || 0;
    const remaining = activeMembership?.remainingSessions || 0;
    return [
      { name: "Completed", value: completed, color: "#22c55e" },
      { name: "Remaining", value: remaining, color: "#facc15" },
    ];
  }, [activeMembership]);

  const bmiChart = bmiBands.map((band) => ({ ...band, value: band.max - band.min }));

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 min-h-screen rounded-4xl bg-[#0f1115] text-right" dir="rtl">
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-white italic tracking-tighter">
              پنل <span className="text-yellow-400">فرماندهی</span>
            </h1>
            <p className="text-gray-500 text-[10px] font-black mt-1 uppercase tracking-widest">
              Membership, Sessions, BMI & Programs
            </p>
          </div>
          <div className="bg-[#1a1d23] p-3 rounded-2xl border border-gray-800 relative">
            <Bell size={20} className="text-gray-500" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
          </div>
        </div>

        {loading && <div className="rounded-3xl border border-gray-800 bg-[#1a1d23] p-6 text-yellow-400">در حال بارگذاری...</div>}
        {error && <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <InfoCard icon={<ShieldAlert />} label="Active Membership" value={activeMembership?.planName || "بدون عضویت فعال"} sub={activeMembership?.membershipEndDate ? `انقضا: ${new Date(activeMembership.membershipEndDate).toLocaleDateString("fa-IR")}` : "در انتظار تمدید"} warn={!activeMembership} />
          <InfoCard icon={<Clock />} label="Remaining Sessions" value={activeMembership?.remainingSessions ?? "—"} sub={`انجام‌شده: ${activeMembership?.completedSessions ?? 0}`} />
          <InfoCard icon={<Activity />} label="Remaining Days" value={activeMembership?.remainingDays ?? "—"} sub="به‌روزرسانی خودکار روزانه" />
          <InfoCard icon={<Target />} label="BMI" value={bmi || "—"} sub={bmiCategory} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <div className="xl:col-span-2 bg-[#1a1d23] border border-gray-800 rounded-[2rem] p-6">
            <h3 className="text-white font-black mb-4">نمودار جلسات عضویت</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sessionChart} dataKey="value" nameKey="name" innerRadius={70} outerRadius={105} paddingAngle={5}>
                    {sessionChart.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-[#1a1d23] border border-gray-800 rounded-[2rem] p-6">
            <h3 className="text-white font-black mb-4">BMI Chart</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bmiChart} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={90} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 8, 8]}>
                    {bmiChart.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-400 mt-3">قد/وزن در پروفایل یا درخواست تمرینی تغییر کند، BMI در بک‌اند دوباره محاسبه و ذخیره می‌شود.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Panel title="برنامه فعال">
            <p className="text-gray-400">آخرین برنامه‌های تمرینی و تغذیه از سیستم درخواست مربی در دسترس هستند.</p>
          </Panel>
          <Panel title="آخرین حضورها">
            {(summary?.attendance || []).slice(0, 5).map((item) => (
              <div key={item._id} className="flex items-center justify-between border-b border-gray-800 py-3 text-sm text-gray-300">
                <span><CheckCircle2 className="inline text-green-400 ml-2" size={16} />حضور ثبت شد</span>
                <span>{new Date(item.checkInAt).toLocaleDateString("fa-IR")}</span>
              </div>
            ))}
            {(summary?.attendance || []).length === 0 && <p className="text-gray-500">هنوز حضوری ثبت نشده است.</p>}
          </Panel>
        </div>
      </div>
    </DashboardLayout>
  );
}

function InfoCard({ icon, label, value, sub, warn }) {
  return (
    <div className={`p-6 rounded-[2rem] border-2 ${warn ? "bg-red-950/20 border-red-900/50" : "bg-[#1a1d23] border-gray-800"}`}>
      <div className="flex justify-between items-start mb-4">
        {React.cloneElement(icon, { className: warn ? "text-red-500" : "text-yellow-400" })}
        <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">{label}</span>
      </div>
      <h3 className="text-white text-2xl font-black italic">{value}</h3>
      <p className="text-gray-500 text-[10px] font-bold mt-1">{sub}</p>
    </div>
  );
}

function Panel({ title, children }) {
  return <div className="bg-[#1a1d23] border border-gray-800 rounded-[2rem] p-6"><h3 className="text-white font-black mb-4">{title}</h3>{children}</div>;
}

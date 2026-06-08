"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ShieldAlert,
  Clock,
  CreditCard,
  Coffee,
  ChevronLeft,
  Zap,
  Target,
  Bell,
  CheckCircle2,
  Activity,
} from "lucide-react";
import DashboardLayout from "./layout";
import Link from "next/link";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { API_BASE_URL } from "@/config/api";

export default function UserMainDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [membership, setMembership] = useState(null);
  const [programs, setPrograms] = useState({ trainingPrograms: [], nutritionPrograms: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = sessionStorage.getItem("currentUser");
    const parsed = raw ? JSON.parse(raw) : null;
    setCurrentUser(parsed);
    if (!parsed?._id) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetch(`${API_BASE_URL}/memberships/active/${parsed._id}`, { credentials: "include" }).then((res) => res.json()).catch(() => null),
      fetch(`${API_BASE_URL}/programs/member/${parsed._id}`, { credentials: "include" }).then((res) => res.json()).catch(() => null),
      fetch(`${API_BASE_URL}/users/${parsed._id}`).then((res) => res.json()).catch(() => null),
    ]).then(([membershipRes, programRes, userRes]) => {
      if (membershipRes?.success) setMembership(membershipRes.membership);
      if (programRes?.success) setPrograms(programRes);
      if (userRes?.user) setCurrentUser((prev) => ({ ...prev, ...userRes.user }));
    }).finally(() => setLoading(false));
  }, []);

  const bmi = Number(currentUser?.bmi || 0);
  const bmiData = useMemo(() => [{ name: "BMI", value: Math.min(bmi || 0, 40), fill: bmi < 18.5 ? "#38bdf8" : bmi < 25 ? "#22c55e" : bmi < 30 ? "#facc15" : "#ef4444" }], [bmi]);

  // داده‌های واقعی بر اساس صفحات قبلی که با هم ساختیم
  const dashboardState = {
    // از بخش رزرو دستگاه
    nextReservation: {
      device: "تردمیل نئون - شماره ۴",
      time: "۱۸:۳۰ امروز",
      remains: "۲ ساعت دیگر",
    },
    // از بخش مالی
    subscription: {
      daysLeft: membership?.remainingDays ?? 0,
      type: membership?.planName || "بدون عضویت فعال",
      isWarning: !membership || membership.remainingDays <= 7,
    },
    // از بخش کافه
    lastOrder: {
      item: "شیک پروتئین + فیله",
      status: "در حال آماده‌سازی",
      location: "تحویل در بوفه",
    },
    // از بخش مربی
    trainingPlan: {
      title: programs.trainingPrograms?.[0]?.title || "برنامه فعالی ثبت نشده",
      progress: membership ? `${membership.completedSessions} از ${membership.totalSessions} جلسه انجام شده` : "—",
      coach: programs.trainingPrograms?.[0]?.trainerId?.name || "—",
    },
  };

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

        {loading && <div className="mb-4 text-yellow-400 text-xs font-black">در حال بروزرسانی داشبورد...</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* کارت ۱: وضعیت اشتراک (بسیار مهم) */}
          <div
            className={`p-6 rounded-[2rem] border-2 transition-all ${
              dashboardState.subscription.isWarning
                ? "bg-red-950/20 border-red-900/50 shadow-[0_0_30px_rgba(220,38,38,0.1)]"
                : "bg-[#1a1d23] border-gray-800"
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <ShieldAlert
                className={
                  dashboardState.subscription.isWarning
                    ? "text-red-500"
                    : "text-yellow-400"
                }
              />
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">
                Subscription
              </span>
            </div>
            <h3 className="text-white text-2xl font-black italic">
              {dashboardState.subscription.daysLeft} روز
            </h3>
            <p className="text-gray-500 text-[10px] font-bold mt-1">
              تا پایان اعتبار سطح {dashboardState.subscription.type}
            </p>
            <p className="text-yellow-400 text-[10px] font-black mt-2">
              جلسات: {membership?.remainingSessions ?? 0} باقی‌مانده / {membership?.completedSessions ?? 0} انجام‌شده
            </p>
            <p className="text-gray-500 text-[10px] font-bold mt-1">
              انقضا: {membership?.membershipEndDate ? new Date(membership.membershipEndDate).toLocaleDateString("fa-IR") : "—"}
            </p>
            <button className="w-full mt-4 py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black rounded-xl transition-all">
              تمدید سریع
            </button>
          </div>

          {/* کارت ۲: BMI خودکار */}
          <div className="bg-[#1a1d23] border border-gray-800 p-6 rounded-[2rem]">
            <div className="flex justify-between items-start mb-4">
              <Activity className="text-blue-400" />
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">
                BMI
              </span>
            </div>
            <div className="h-20">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="65%" outerRadius="100%" data={bmiData} startAngle={180} endAngle={0}>
                  <RadialBar dataKey="value" background />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <h3 className="text-white text-lg font-black italic">
              {bmi ? bmi.toFixed(1) : "—"}
            </h3>
            <p className="text-blue-400 text-[11px] font-black mt-1">
              {currentUser?.bmiCategory || "نامشخص"}
            </p>
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

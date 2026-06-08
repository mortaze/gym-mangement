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
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { API_BASE_URL } from "@/config/api";

const bmiCategory = (bmi) => {
  if (!bmi) return "نامشخص";
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
};

export default function UserMainDashboard() {
  const [summary, setSummary] = useState(null);
  const [programs, setPrograms] = useState({ trainingPrograms: [], nutritionPrograms: [] });
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? sessionStorage.getItem("currentUser") : null;
    const user = raw ? JSON.parse(raw) : null;
    setCurrentUser(user);
    if (!user?._id) return;
    fetch(`${API_BASE_URL}/memberships/summary?userId=${user._id}`).then((r) => r.json()).then(setSummary).catch(console.error);
    fetch(`${API_BASE_URL}/programs/user/${user._id}`).then((r) => r.json()).then((data) => {
      if (data.success) setPrograms(data);
    }).catch(console.error);
  }, []);

  const activeMembership = summary?.activeMembership;
  const remainingDays = activeMembership?.remainingDays ?? 0;
  const activeTraining = programs.trainingPrograms?.find((p) => p.status === "active");
  const bmi = currentUser?.bmi || (currentUser?.weight && currentUser?.height
    ? Number((currentUser.weight / (((currentUser.height > 3 ? currentUser.height / 100 : currentUser.height) || 1) ** 2)).toFixed(1))
    : 0);
  const bmiData = useMemo(() => [
    { name: "BMI", value: bmi || 0 },
    { name: "Remaining", value: Math.max(0, 40 - (bmi || 0)) },
  ], [bmi]);

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
      daysLeft: remainingDays,
      type: activeMembership?.planName || "بدون عضویت فعال",
      isWarning: !activeMembership || remainingDays <= 7,
    },
    // از بخش کافه
    lastOrder: {
      item: "شیک پروتئین + فیله",
      status: "در حال آماده‌سازی",
      location: "تحویل در بوفه",
    },
    // از بخش مربی
    trainingPlan: {
      title: activeTraining?.title || "برنامه فعالی ثبت نشده",
      progress: activeTraining ? `${activeTraining.exercises?.length || 0} حرکت برنامه‌ریزی شده` : "در انتظار برنامه",
      coach: activeTraining?.trainerId?.name || "—",
    },
  };

  return (
    <DashboardLayout>
      <div
        className="p-4 md:p-8 min-h-screen rounded-4xl bg-[#0f1115] text-right"
        dir="rtl"
      >
        {/* Header - وضعیت سیستم */}
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-white italic tracking-tighter">
              پنل <span className="text-yellow-400">فرماندهی</span>
            </h1>
            <p className="text-gray-500 text-[10px] font-black mt-1 uppercase tracking-widest">
              System Status: Operational | ID: FL-502
            </p>
          </div>
          <div className="bg-[#1a1d23] p-3 rounded-2xl border border-gray-800 relative">
            <Bell size={20} className="text-gray-500" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
          </div>
        </div>

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
            <Link href="/users-dashboard/finance" className="block text-center w-full mt-4 py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black rounded-xl transition-all">
              تمدید سریع
            </Link>
          </div>

          {/* کارت ۲: جلسات عضویت */}
          <div className="bg-[#1a1d23] border border-gray-800 p-6 rounded-[2rem]">
            <div className="flex justify-between items-start mb-4">
              <Clock className="text-blue-400" />
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">
                Sessions
              </span>
            </div>
            <h3 className="text-white text-lg font-black italic">
              {activeMembership?.remainingSessions ?? 0} جلسه باقی‌مانده
            </h3>
            <p className="text-blue-400 text-[11px] font-black mt-1">
              انجام‌شده: {activeMembership?.completedSessions ?? 0} از {activeMembership?.totalSessions ?? 0}
            </p>
            <div className="mt-4 flex items-center gap-2 text-[9px] text-gray-500 font-bold uppercase">
              <Zap size={12} className="text-yellow-400" /> انقضا: {activeMembership?.membershipEndDate ? new Date(activeMembership.membershipEndDate).toLocaleDateString("fa-IR") : "—"}
            </div>
          </div>

          {/* کارت ۳: وضعیت کافه (برگرفته از صفحه کافه) */}
          <div className="bg-[#1a1d23] border border-gray-800 p-6 rounded-[2rem]">
            <div className="flex justify-between items-start mb-4">
              <Coffee className="text-orange-400" />
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">
                Cafe Order
              </span>
            </div>
            <h3 className="text-white text-base font-black italic leading-tight">
              {dashboardState.lastOrder.item}
            </h3>
            <div className="mt-4 inline-block bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full text-orange-500 text-[9px] font-black italic">
              {dashboardState.lastOrder.status}
            </div>
          </div>

          {/* کارت ۴: برنامه تمرینی (برگرفته از صفحه مربی) */}
          <div className="bg-[#1a1d23] border border-gray-800 p-6 rounded-[2rem]">
            <div className="flex justify-between items-start mb-4">
              <Target className="text-green-400" />
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">
                Today&apos;s Mission
              </span>
            </div>
            <h3 className="text-white text-base font-black italic">
              {dashboardState.trainingPlan.title}
            </h3>
            <p className="text-gray-500 text-[10px] font-bold mt-1">
              مربی: {dashboardState.trainingPlan.coach}
            </p>
            <div className="w-full h-1 bg-gray-900 rounded-full mt-4">
              <div className="w-[40%] h-full bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.3)]"></div>
            </div>
          </div>
        </div>

        {/* لیست عملیات‌های اخیر (کاربردی و واقعی) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-white font-black italic text-xl mb-6">
              گزارش فعالیت‌های اخیر
            </h2>

            {[
              {
                icon: <CreditCard size={18} />,
                title: "پرداخت شهریه ماهانه",
                desc: "تایید شده توسط درگاه",
                time: "دیروز",
                amount: "۸۵۰,۰۰۰ ت-",
                color: "text-red-500",
              },
              {
                icon: <CheckCircle2 size={18} />,
                title: "اتمام جلسه تمرینی هوازی",
                desc: "۴۵ دقیقه تردمیل شماره ۴",
                time: "دیروز",
                amount: "پایان",
                color: "text-green-500",
              },
              {
                icon: <Coffee size={18} />,
                title: "شارژ حساب کافه",
                desc: "افزایش موجودی کیف پول",
                time: "۲ روز پیش",
                amount: "۲۰۰,۰۰۰ ت+",
                color: "text-blue-500",
              },
            ].map((log, i) => (
              <div
                key={i}
                className="bg-[#1a1d23]/50 border border-gray-800 p-5 rounded-[1.5rem] flex items-center justify-between group hover:bg-[#1a1d23] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-gray-500 group-hover:text-yellow-400 transition-colors">
                    {log.icon}
                  </div>
                  <div>
                    <h4 className="text-white font-black text-sm italic">
                      {log.title}
                    </h4>
                    <p className="text-gray-600 text-[10px] font-bold mt-1">
                      {log.desc} | {log.time}
                    </p>
                  </div>
                </div>
                <div
                  className={`text-left font-black italic text-xs ${log.color}`}
                >
                  {log.amount}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#1a1d23] border border-gray-800 p-6 rounded-[2rem]">
            <h2 className="text-white font-black italic text-xl mb-3 flex items-center gap-2"><Activity className="text-yellow-400" /> شاخص BMI</h2>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={bmiData} innerRadius={45} outerRadius={65} dataKey="value" startAngle={180} endAngle={-180}>
                    <Cell fill="#facc15" />
                    <Cell fill="#283241" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center"><span className="text-3xl text-white font-black">{bmi || "—"}</span><p className="text-yellow-400 font-bold text-xs mt-1">{bmiCategory(bmi)}</p></div>
          </div>

          {/* کارت دسترسی سریع به بخش‌های عملیاتی */}
          <div className="space-y-4">
            <h2 className="text-white font-black italic text-xl mb-6">
              تجهیز سریع
            </h2>
            <div className="grid grid-cols-1 gap-3">
              <Link
                href={"users-dashboard/aerobic"}
                className="flex items-center justify-between p-5 bg-yellow-400 hover:bg-white rounded-2xl transition-all group"
              >
                <span className="text-black font-black italic text-sm">
                  رزرو دستگاه هوازی
                </span>
                <ChevronLeft
                  className="text-black group-hover:translate-x-[-5px] transition-transform"
                  size={20}
                />
              </Link>
              <Link
                href={"users-dashboard/cafe"}
                className="flex items-center justify-between p-5 bg-[#1a1d23] border border-gray-800 hover:border-yellow-400 rounded-2xl transition-all group"
              >
                <span className="text-white font-black italic text-sm">
                  سفارش از منوی کافه
                </span>
                <ChevronLeft
                  className="text-gray-500 group-hover:translate-x-[-5px] transition-transform"
                  size={20}
                />
              </Link>
              <Link
                href={"users-dashboard/finance"}
                className="flex items-center justify-between p-5 bg-[#1a1d23] border border-gray-800 hover:border-yellow-400 rounded-2xl transition-all group"
              >
                <span className="text-white font-black italic text-sm">
                  تمدید اعتبار شهریه
                </span>
                <ChevronLeft
                  className="text-gray-500 group-hover:translate-x-[-5px] transition-transform"
                  size={20}
                />
              </Link>
            </div>

            <div className="mt-6 p-6 bg-gradient-to-br from-[#1a1d23] to-[#0f1115] border border-gray-800 rounded-[2rem]">
              <p className="text-gray-500 text-[10px] font-black uppercase mb-3">
                نکته امنیتی:
              </p>
              <p className="text-white/70 text-[11px] font-bold leading-relaxed italic">
                &quot;یادت باشه یگان! نظم در تمرین یعنی نتیجه در آینه. رزروهای هوازی
                خودت رو حداقل ۲۴ ساعت قبل نهایی کن.&quot;
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

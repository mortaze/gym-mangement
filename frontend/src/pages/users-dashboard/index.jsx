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

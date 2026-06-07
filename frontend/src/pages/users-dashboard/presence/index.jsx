"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
  CreditCard,
  Target,
  Flame,
  ChevronLeft,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import DashboardLayout from "../layout"; // فرض بر این است که لی‌اوت داشبورد کاربر را دارید
import Link from "next/link";

export default function UserPresencePage() {
  // داده‌های فرضی اشتراک کاربر
  const subscription = {
    daysTotal: 30,
    daysRemaining: 12,
    expiryDate: "۱۴۰۲/۱۰/۲۵",
    planName: "اشتراک VIP سه ماهه",
    price: "۱,۸۰۰,۰۰۰ تومان",
  };

  // داده‌های حضور و غیاب هفته جاری (شنبه تا جمعه)
  const weeklyAttendance = [
    { day: "شنبه", date: "۱۰ دی", status: "present" },
    { day: "یک‌شنبه", date: "۱۱ دی", status: "absent" },
    { day: "دوشنبه", date: "۱۲ دی", status: "present" },
    { day: "سه‌شنبه", date: "۱۳ دی", status: "present" },
    { day: "چهارشنبه", date: "۱۴ دی", status: "pending" },
    { day: "پنج‌شنبه", date: "۱۵ دی", status: "pending" },
    { day: "جمعه", date: "۱۶ دی", status: "pending" },
  ];

  // محاسبه درصد باقی‌مانده برای نمودار
  const subData = [
    { name: "باقیمانده", value: subscription.daysRemaining, color: "#facc15" },
    {
      name: "مصرف شده",
      value: subscription.daysTotal - subscription.daysRemaining,
      color: "#1f2937",
    },
  ];

  return (
    <DashboardLayout>
      <div
        className="p-4 sm:p-8 min-h-screen rounded-4xl bg-[#0f1115]"
        dir="rtl"
      >
        {/* Header - خوش‌آمدگویی قهرمان */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">
              وضعیت <span className="text-yellow-400">آمادگی و حضور</span>
            </h1>
            <p className="text-gray-500 text-xs font-bold mt-2 flex items-center gap-2 uppercase tracking-widest">
              <Flame size={14} className="text-orange-500" />
              Warrior Presence & Subscription Fuel
            </p>
          </div>
          <div className="bg-gray-800/50 px-4 py-2 rounded-xl border border-gray-700">
            <span className="text-gray-400 text-[10px] font-black block uppercase">
              آخرین ورود
            </span>
            <span className="text-white font-bold text-sm">دیروز - ۱۸:۳۰</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* بخش ۱: وضعیت شهریه و اشتراک (Subscription Fuel) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#1a1d23] p-8 rounded-[2.5rem] border border-gray-800 relative overflow-hidden shadow-2xl">
              <h3 className="text-white font-black italic mb-6 flex items-center gap-2">
                <CreditCard size={18} className="text-yellow-400" /> اعتبار
                عملیاتی
              </h3>

              <div className="relative h-[220px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subData}
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      startAngle={90}
                      endAngle={450}
                    >
                      {subData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="none"
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-black text-white italic">
                    {subscription.daysRemaining}
                  </span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    روز باقی‌مانده
                  </span>
                </div>
              </div>

              <div className="space-y-4 mt-6">
                <div className="flex justify-between items-center p-4 bg-gray-900/50 rounded-2xl border border-gray-800">
                  <span className="text-gray-500 text-xs font-bold">
                    نوع اشتراک:
                  </span>
                  <span className="text-yellow-400 text-xs font-black italic">
                    {subscription.planName}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-900/50 rounded-2xl border border-gray-800">
                  <span className="text-gray-500 text-xs font-bold">
                    تاریخ انقضا:
                  </span>
                  <span className="text-white text-xs font-black font-mono">
                    {subscription.expiryDate}
                  </span>
                </div>
              </div>

              <Link
                href={"finance"}
                className="w-full mt-8 bg-yellow-400 hover:bg-white text-black font-black py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Zap size={18} fill="currentColor" /> تمدید و شارژ مجدد
              </Link>

              {subscription.daysRemaining < 5 && (
                <div className="mt-4 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <AlertCircle size={14} className="text-red-500" />
                  <p className="text-red-500 text-[9px] font-black uppercase">
                    هشدار: سوخت شما در حال اتمام است!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* بخش ۲: جدول حضور و غیاب هفتگی (Weekly Battle Log) */}
          <div className="lg:col-span-2">
            <div className="bg-[#1a1d23] p-8 rounded-[2.5rem] border border-gray-800 shadow-2xl h-full">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-white font-black italic flex items-center gap-2 uppercase tracking-tighter text-xl">
                  <Calendar size={22} className="text-yellow-400" /> گزارش نبرد
                  هفتگی
                </h3>
                <div className="flex items-center gap-2 text-gray-500 text-xs font-bold">
                  هفته دوم دی <ChevronLeft size={16} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {weeklyAttendance.map((item, index) => (
                  <div
                    key={index}
                    className={`p-6 rounded-[2rem] border transition-all duration-300 ${
                      item.status === "present"
                        ? "bg-yellow-400/5 border-yellow-400/20"
                        : item.status === "absent"
                        ? "bg-red-500/5 border-red-500/20 opacity-60"
                        : "bg-gray-900/40 border-gray-800 border-dashed"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest ${
                          item.status === "present"
                            ? "text-yellow-400"
                            : "text-gray-500"
                        }`}
                      >
                        {item.day}
                      </span>
                      {item.status === "present" ? (
                        <CheckCircle2 size={18} className="text-yellow-400" />
                      ) : item.status === "absent" ? (
                        <XCircle size={18} className="text-red-500" />
                      ) : (
                        <Clock size={18} className="text-gray-700" />
                      )}
                    </div>
                    <p className="text-white text-lg font-black italic">
                      {item.date}
                    </p>
                    <p
                      className={`text-[9px] font-bold mt-1 uppercase ${
                        item.status === "present"
                          ? "text-green-500"
                          : "text-gray-600"
                      }`}
                    >
                      {item.status === "present"
                        ? "حضور ثبت شد"
                        : item.status === "absent"
                        ? "غیبت"
                        : "در انتظار..."}
                    </p>
                  </div>
                ))}
              </div>

              {/* آمار خلاصه ماهانه برای کاربر */}
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-gray-900/80 p-6 rounded-2xl border border-gray-800 text-center">
                  <p className="text-gray-500 text-[10px] font-black uppercase mb-1">
                    جلسات تمرین ماه
                  </p>
                  <h4 className="text-2xl font-black text-white italic">
                    ۱۸{" "}
                    <span className="text-xs text-gray-600 tracking-normal">
                      جلسه
                    </span>
                  </h4>
                </div>
                <div className="bg-gray-900/80 p-6 rounded-2xl border border-gray-800 text-center">
                  <p className="text-gray-500 text-[10px] font-black uppercase mb-1">
                    رکورد پیوستگی
                  </p>
                  <h4 className="text-2xl font-black text-yellow-400 italic">
                    ۵{" "}
                    <span className="text-xs text-gray-600 tracking-normal">
                      روز مداوم
                    </span>
                  </h4>
                </div>
                <div className="bg-gray-900/80 p-6 rounded-2xl border border-gray-800 text-center border-b-yellow-400 border-b-2">
                  <p className="text-gray-500 text-[10px] font-black uppercase mb-1">
                    امتیاز وفاداری
                  </p>
                  <h4 className="text-2xl font-black text-white italic">
                    ۱۲۵۰
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* بخش راهنمای سیستم */}
        <div className="mt-8 p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h5 className="text-white text-sm font-black">نکته امنیتی</h5>
            <p className="text-gray-500 text-xs font-bold mt-1">
              حضور شما بر اساس اسکن QR-Code در بدو ورود ثبت می‌شود. در صورت عدم
              ثبت، به پذیرش اطلاع دهید.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

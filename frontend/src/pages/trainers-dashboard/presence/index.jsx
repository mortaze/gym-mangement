"use client";

import React, { useState } from "react";
import {
  Users,
  LogIn,
  LogOut,
  Clock,
  Search,
  Zap,
  Activity,
  UserPlus,
  Dumbbell,
  ShieldAlert,
  BarChart,
} from "lucide-react";
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import DashboardLayout from "../layout";

// داده‌های ترافیک ساعتی باشگاه (تراکم جمعیت)
const occupancyData = [
  { hour: "۰۶:۰۰", count: 12 },
  { hour: "۰۹:۰۰", count: 25 },
  { hour: "۱۲:۰۰", count: 45 },
  { hour: "۱۵:۰۰", count: 30 },
  { hour: "۱۸:۰۰", count: 85 }, // پیک شلوغی
  { hour: "۲۱:۰۰", count: 60 },
  { hour: "۲۳:۰۰", count: 15 },
];

export default function PresencePage() {
  const [activeTab, setActiveTab] = useState("present");

  // لیست ورزشکاران حاضر در سالن
  const presentMembers = [
    {
      id: "M-101",
      name: "امیرحسین فلاح",
      entrance: "۱۸:۱۰",
      zone: "هوازی",
      locker: 42,
      plan: "VIP",
    },
    {
      id: "M-102",
      name: "رضا قاسمی",
      entrance: "۱۸:۳۰",
      zone: "وزنه آزاد",
      locker: 15,
      plan: "عادی",
    },
    {
      id: "M-103",
      name: "سهراب سپهری",
      entrance: "۱۹:۰۰",
      zone: "فانکشنال",
      locker: 8,
      plan: "VIP",
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 min-h-screen bg-[var(--bg-body)]" dir="rtl">
        {/* Header - مرکز کنترل حضور */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-6 border-b border-[var(--border)]">
          <div>
            <h1 className="text-4xl font-black text-[var(--text-body)] italic tracking-tighter uppercase">
              لیست{" "}
              <span className="text-yellow-400 underline decoration-2 underline-offset-8">
                حاضرین در خط
              </span>
            </h1>
            <p className="text-[var(--text-muted)] text-xs font-bold mt-3 flex items-center gap-2">
              <Activity size={14} className="text-green-500 animate-pulse" />
              LIVE TRAINING MONITORING SYSTEM
            </p>
          </div>

          <button onClick={() => window.alert("ثبت ورود اعضا در باشگاه از طریق سیستم احراز هویت حضوری انجام می‌شود و اطلاعات ثبت‌شده در این بخش صرفاً جهت نمایش و گزارش‌گیری نمایش داده می‌شوند.")} className="w-full md:w-auto bg-yellow-400 hover:bg-yellow-500 text-[var(--text-body)] font-black px-8 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_10px_20px_rgba(250,204,21,0.2)]">
            <UserPlus size={20} /> ثبت ورود جدید (SCAN)
          </button>
        </div>

        {/* Stats Grid - آمار لحظه‌ای سالن */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            {
              label: "ورزشکاران داخل سالن",
              val: "۴۸ نفر",
              icon: <Users />,
              color: "text-blue-400",
            },
            {
              label: "میانگین زمان تمرین",
              val: "۷۴ دقیقه",
              icon: <Clock />,
              color: "text-yellow-400",
            },
            {
              label: "کمدهای اشغال شده",
              val: "۳۲/۱۰۰",
              icon: <ShieldAlert />,
              color: "text-red-400",
            },
            {
              label: "ظرفیت باقیمانده",
              val: "۱۵ نفر",
              icon: <Dumbbell />,
              color: "text-green-400",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border)] flex items-center gap-5"
            >
              <div className={`p-4 rounded-2xl bg-[var(--bg-hover)] ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest">
                  {stat.label}
                </p>
                <h3 className="text-2xl font-black text-[var(--text-body)] italic">
                  {stat.val}
                </h3>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Table - لیست دقیق حاضرین */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border)] overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-[var(--border)] flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex bg-[var(--bg-hover)] p-1 rounded-xl">
                  <button
                    onClick={() => setActiveTab("present")}
                    className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${
                      activeTab === "present"
                        ? "bg-yellow-400 text-[var(--text-body)]"
                        : "text-[var(--text-muted)]"
                    }`}
                  >
                    حاضرین
                  </button>
                  <button
                    onClick={() => setActiveTab("history")}
                    className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${
                      activeTab === "history"
                        ? "bg-yellow-400 text-[var(--text-body)]"
                        : "text-[var(--text-muted)]"
                    }`}
                  >
                    تاریخچه امروز
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="جستجوی قهرمان..."
                    className="bg-gray-800 text-[var(--text-body)] text-xs p-3 pr-10 rounded-xl outline-none focus:ring-1 ring-yellow-400 w-full"
                  />
                  <Search
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                    size={16}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-gray-800/50 text-[var(--text-muted)] text-[10px] uppercase font-black tracking-widest">
                    <tr>
                      <th className="p-5">ورزشکار</th>
                      <th className="p-5">زمان ورود</th>
                      <th className="p-5">بخش تمرینی</th>
                      <th className="p-5">شماره کمد</th>
                      <th className="p-5 text-center">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800 font-bold">
                    {presentMembers.map((member) => (
                      <tr
                        key={member.id}
                        className="hover:bg-gray-800/30 transition-colors group"
                      >
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-400/10 rounded-full flex items-center justify-center text-yellow-400 font-black text-xs border border-yellow-400/20">
                              {member.name[0]}
                            </div>
                            <div>
                              <p className="text-[var(--text-body)] text-sm">
                                {member.name}
                              </p>
                              <p className="text-[10px] text-[var(--text-muted)]">
                                {member.id} | {member.plan}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-5 text-[var(--text-dim)] font-mono text-xs">
                          {member.entrance}
                        </td>
                        <td className="p-5">
                          <span className="bg-[var(--bg-hover)] text-blue-400 px-3 py-1 rounded-lg text-[10px] border border-blue-400/20">
                            {member.zone}
                          </span>
                        </td>
                        <td className="p-5">
                          <div className="flex items-center gap-2 text-[var(--text-dim)]">
                            <Zap size={14} className="text-yellow-400" />{" "}
                            {member.locker}
                          </div>
                        </td>
                        <td className="p-5 text-center">
                          <button className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all group-hover:scale-110">
                            <LogOut size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar - ترافیک سالن و اطلاعیه‌ها */}
          <div className="space-y-8">
            {/* نمودار ترافیک لحظه‌ای */}
            <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border)]">
              <h3 className="text-[var(--text-body)] font-black italic mb-8 flex items-center gap-2 uppercase tracking-tighter">
                <BarChart size={20} className="text-yellow-400" /> تراکم جمعیت
                (Live)
              </h3>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart data={occupancyData}>
                    <XAxis dataKey="hour" hide />
                    <Tooltip
                      cursor={{ fill: "#2d3139" }}
                      contentStyle={{
                        backgroundColor: "#0f1115",
                        border: "none",
                        borderRadius: "10px",
                      }}
                    />
                    <Bar dataKey="count" radius={[5, 5, 5, 5]}>
                      {occupancyData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.count > 70 ? "#ef4444" : "#facc15"}
                        />
                      ))}
                    </Bar>
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-[var(--text-muted)] text-[10px] mt-4 font-bold uppercase tracking-widest">
                تحلیل هوش مصنوعی: سالن در وضعیت قرمز (شلوغ)
              </p>
            </div>

            {/* بخش کمدها */}
            <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border)] relative overflow-hidden">
              <div className="relative z-10 text-center">
                <ShieldAlert
                  size={48}
                  className="text-yellow-400 mx-auto mb-4"
                />
                <h3 className="text-[var(--text-body)] font-black italic text-xl mb-2">
                  مدیریت کمدها
                </h3>
                <p className="text-[var(--text-muted)] text-xs mb-6">
                  تعداد ۶۸ کمد خالی جهت واگذاری موجود است.
                </p>
                <button className="w-full bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-body)] py-4 rounded-2xl font-black text-sm hover:border-yellow-400 transition-all">
                  مشاهده نقشه کمدها
                </button>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 blur-3xl rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

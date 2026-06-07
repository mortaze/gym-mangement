"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  Dumbbell,
  TrendingUp,
  Activity,
  DollarSign,
  Zap,
  BarChart3,
  Settings,
  ShieldCheck,
  ShoppingCart,
  ArrowUpRight,
  ClipboardList,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import DashboardLayout from "./layout";

// داده‌های تحلیلی: مقایسه حضور اعضا و درآمد کل (نمودار سینوسی پیچیده)
const performanceData = [
  { name: "شنبه", members: 400, revenue: 2400 },
  { name: "۱شنبه", members: 300, revenue: 1398 },
  { name: "۲شنبه", members: 900, revenue: 9800 },
  { name: "۳شنبه", members: 1480, revenue: 3908 },
  { name: "۴شنبه", sales: 1890, revenue: 4800 },
  { name: "۵شنبه", members: 2390, revenue: 3800 },
  { name: "جمعه", members: 3490, revenue: 4300 },
];

export default function GlobalGymDashboard() {
  // کارت‌های آمار حیاتی کل مجموعه
  const kpiStats = [
    {
      label: "کل اعضای فعال",
      val: "۱,۲۴۰",
      sub: "+۱۲٪ این ماه",
      icon: <Users />,
      color: "text-blue-400",
    },
    {
      label: "مربیان VIP",
      val: "۱۸",
      sub: "در حال آموزش",
      icon: <UserCheck />,
      color: "text-green-400",
    },
    {
      label: "تجهیزات و دستگاه‌ها",
      val: "۸۵",
      sub: "۳ مورد نیاز به سرویس",
      icon: <Dumbbell />,
      color: "text-yellow-400",
    },
    {
      label: "تراز مالی کل (سود)",
      val: "۸۴۲.۰ M",
      sub: "برآورد سالیانه",
      icon: <DollarSign />,
      color: "text-purple-400",
    },
  ];

  // وضعیت لحظه‌ای بخش‌های مختلف
  const gymSections = [
    {
      id: 1,
      title: "مدیریت اعضا",
      desc: "تمدید شهریه و ثبت‌نام",
      icon: <ShieldCheck />,
      link: "/members",
    },
    {
      id: 2,
      title: "لیست مربیان",
      desc: "برنامه تمرینی و درصد فروش",
      icon: <ClipboardList />,
      link: "/coaches",
    },
    {
      id: 3,
      title: "انبار و تجهیزات",
      desc: "خرید دستگاه و استهلاک",
      icon: <Settings />,
      link: "/equipment",
    },
    {
      id: 4,
      title: "فروشگاه مکمل",
      desc: "مدیریت فروش محصولات",
      icon: <ShoppingCart />,
      link: "/shop",
    },
  ];

  return (
    <DashboardLayout>
      <div
        className="p-4 sm:p-8 min-h-screen bg-[#0f1115] rounded-[2.5rem] border border-gray-800 shadow-2xl"
        dir="rtl"
      >
        {/* Header - استایل فرماندهی فلاح */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12 pb-8 border-b border-gray-800">
          <div>
            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
              داشبورد مدیریتی{" "}
              <span className="text-yellow-400 text-5xl">IRON GYM</span>
            </h1>
            <p className="text-gray-500 text-xs uppercase tracking-[0.5em] mt-3 flex items-center gap-2">
              <Zap size={14} className="text-yellow-400" />
              Full Enterprise Management System v2.0
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-[#1a1d23] border border-gray-700 p-2 px-4 rounded-2xl hidden md:block">
              <p className="text-[10px] text-gray-500 font-bold uppercase">
                آخرین آپدیت سیستم
              </p>
              <p className="text-white font-mono text-sm">2025/12/31 - 23:15</p>
            </div>
            <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-black px-6 py-4 rounded-2xl flex items-center gap-2 transition-all active:scale-95 italic text-sm">
              <Activity size={18} /> گزارش جامع نهایی
            </button>
          </div>
        </div>

        {/* KPI Grid - آمار ۴ رکن اصلی */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {kpiStats.map((stat, i) => (
            <div
              key={i}
              className="bg-[#1a1d23] p-6 rounded-[2rem] border border-gray-800 relative overflow-hidden group hover:border-yellow-400/40 transition-all"
            >
              <div className="relative z-10">
                <p className="text-gray-500 text-[10px] uppercase font-black mb-1 tracking-widest">
                  {stat.label}
                </p>
                <h3 className="text-3xl font-black text-white italic">
                  {stat.val}
                </h3>
                <p className="text-[10px] mt-2 text-gray-400 font-bold flex items-center gap-1">
                  <ArrowUpRight size={12} className="text-green-400" />{" "}
                  {stat.sub}
                </p>
              </div>
              <div
                className={`absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500 ${stat.color}`}
              >
                {React.cloneElement(stat.icon, { size: 100 })}
              </div>
            </div>
          ))}
        </div>

        {/* Main Analytics Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
          {/* نمودار پیشرفته - تحلیل حضور و درآمد */}
          <div className="xl:col-span-2 bg-[#1a1d23] p-8 rounded-[2.5rem] border border-gray-800 shadow-inner">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-white text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                  <BarChart3 className="text-yellow-400" size={24} /> آنالیز
                  عملکرد کل مجموعه
                </h3>
                <p className="text-gray-500 text-[10px] mt-1">
                  تطبیق تعداد ورزشکاران با درآمد ناخالص هفتگی
                </p>
              </div>
              <div className="flex gap-2">
                <span className="flex items-center gap-1 text-[10px] text-yellow-400 font-bold bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20">
                  درآمد
                </span>
                <span className="flex items-center gap-1 text-[10px] text-blue-400 font-bold bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">
                  حضور اعضا
                </span>
              </div>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#facc15" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#2d3139"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#4b5563"
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#4b5563"
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f1115",
                      border: "1px solid #374151",
                      borderRadius: "15px",
                      textAlign: "right",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#facc15"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                  <Area
                    type="monotone"
                    dataKey="members"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="transparent"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Access Menu - دسترسی سریع بخش‌ها */}
          <div className="space-y-4">
            <h3 className="text-white font-black italic uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
              <Settings className="text-yellow-400" size={18} /> دسترسی به
              واحدها
            </h3>
            {gymSections.map((section) => (
              <Link
                key={section.id}
                href={section.link}
                className="block p-5 bg-[#1a1d23] border border-gray-800 rounded-3xl hover:bg-yellow-400 group transition-all duration-300"
              >
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-gray-900 rounded-2xl text-yellow-400 group-hover:bg-black group-hover:text-yellow-400 transition-colors">
                    {section.icon}
                  </div>
                  <div>
                    <h4 className="text-white group-hover:text-black font-black text-lg italic uppercase tracking-tighter leading-none">
                      {section.title}
                    </h4>
                    <p className="text-gray-500 group-hover:text-black/70 text-xs mt-1 font-bold">
                      {section.desc}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Section: Equipment Status & Recent Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* وضعیت سلامت دستگاه‌ها */}
          <div className="bg-[#1a1d23] rounded-[2.5rem] border border-gray-800 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-800 bg-gray-800/30">
              <h3 className="text-white font-black italic flex items-center gap-2 uppercase tracking-widest text-sm">
                <Dumbbell className="text-yellow-400" size={18} /> مانیتورینگ
                سلامت تجهیزات
              </h3>
            </div>
            <div className="p-6 space-y-6">
              {[
                {
                  name: "لاین دمبل‌های حرفه‌ای",
                  status: 100,
                  color: "bg-green-400",
                },
                {
                  name: "تردمیل‌های سری X7",
                  status: 65,
                  color: "bg-yellow-400",
                },
                {
                  name: "دستگاه‌های بدنسازی هاگ",
                  status: 90,
                  color: "bg-green-400",
                },
                { name: "سیستم صوتی و تهویه", status: 40, color: "bg-red-500" },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300 text-xs font-bold italic uppercase tracking-tighter">
                      {item.name}
                    </span>
                    <span className="text-white text-xs font-black">
                      {item.status}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} shadow-[0_0_10px_rgba(250,204,21,0.2)]`}
                      style={{ width: `${item.status}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* آخرین فعالیت‌های مدیریتی */}
          <div className="bg-[#1a1d23] rounded-[2.5rem] border border-gray-800 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-800 bg-gray-800/30">
              <h3 className="text-white font-black italic flex items-center gap-2 uppercase tracking-widest text-sm">
                <Activity className="text-yellow-400" size={18} /> لاگ
                فعالیت‌های اخیر سیستم
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4 font-bold">
                <div className="flex items-center gap-4 text-xs p-3 bg-gray-900/50 rounded-2xl border-r-4 border-yellow-400 text-gray-400">
                  <span className="text-yellow-400 shrink-0">۱۰:۴۵</span>
                  <p>
                    خرید{" "}
                    <span className="text-white font-black italic uppercase">
                      ۳ دستگاه پرس پا
                    </span>{" "}
                    جدید توسط مدیریت ثبت شد.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs p-3 bg-gray-900/50 rounded-2xl border-r-4 border-blue-400 text-gray-400">
                  <span className="text-blue-400 shrink-0">۰۹:۳۰</span>
                  <p>
                    <span className="text-white font-black italic uppercase italic">
                      ۴۵ نفر
                    </span>{" "}
                    عضو جدید در شعبه مرکزی ثبت‌نام کردند.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs p-3 bg-gray-900/50 rounded-2xl border-r-4 border-red-500 text-gray-400">
                  <span className="text-red-500 shrink-0">۰۸:۱۵</span>
                  <p>
                    اخطار:{" "}
                    <span className="text-white font-black italic uppercase">
                      سیستم تهویه
                    </span>{" "}
                    سالن ۲ نیاز به بررسی فنی دارد.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

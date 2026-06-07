"use client";

import React from "react";
import {
  DollarSign,
  TrendingUp,
  BarChart3,
  ClipboardList,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DashboardLayout from "../layout";

// داده‌های نمونه برای نمودار درآمد و هزینه
const financeData = [
  { name: "هفته 1", revenue: 2400, expenses: 1200 },
  { name: "هفته 2", revenue: 3000, expenses: 1800 },
  { name: "هفته 3", revenue: 2000, expenses: 800 },
  { name: "هفته 4", revenue: 3500, expenses: 1500 },
  { name: "هفته 5", revenue: 4000, expenses: 2200 },
];

export default function FinanceDashboard() {
  const kpiStats = [
    {
      label: "درآمد کل ماه",
      val: "۱۸,۴۰۰,۰۰۰",
      sub: "+۱۵٪ نسبت به ماه قبل",
      icon: <DollarSign />,
      color: "text-yellow-400",
    },
    {
      label: "هزینه‌ها",
      val: "۸,۲۰۰,۰۰۰",
      sub: "-۵٪ نسبت به ماه قبل",
      icon: <TrendingUp />,
      color: "text-red-400",
    },
    {
      label: "سود خالص",
      val: "۱۰,۲۰۰,۰۰۰",
      sub: "+۲۰٪ رشد",
      icon: <BarChart3 />,
      color: "text-green-400",
    },
    {
      label: "تراکنش‌ها",
      val: "۲۳۵",
      sub: "کل پرداخت‌ها",
      icon: <ClipboardList />,
      color: "text-blue-400",
    },
  ];

  const recentLogs = [
    {
      time: "۱۰:۳۰",
      text: "ثبت درآمد ۳,۰۰۰,۰۰۰ تومان بابت حق عضویت اعضا",
      color: "text-green-400",
    },
    {
      time: "۱۲:۱۵",
      text: "پرداخت ۱,۵۰۰,۰۰۰ تومان بابت خرید تجهیزات",
      color: "text-red-400",
    },
    {
      time: "۱۴:۰۰",
      text: "ثبت تراکنش فروش محصولات کافه ۲,۵۰۰,۰۰۰ تومان",
      color: "text-yellow-400",
    },
  ];

  return (
    <DashboardLayout>
      <div
        className="p-4 sm:p-8 min-h-screen bg-[#0f1115] rounded-[2.5rem] border border-gray-800 shadow-2xl"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12 pb-8 border-b border-gray-800">
          <div>
            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
              داشبورد مالی{" "}
              <span className="text-yellow-400 text-5xl">IRON GYM</span>
            </h1>
            <p className="text-gray-500 text-xs uppercase tracking-[0.5em] mt-3 flex items-center gap-2">
              <Activity size={14} className="text-yellow-400" />
              مدیریت درآمد و هزینه‌ها
            </p>
          </div>
        </div>

        {/* KPI Grid */}
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

        {/* نمودار درآمد و هزینه */}
        <div className="bg-[#1a1d23] p-8 rounded-[2.5rem] border border-gray-800 shadow-inner mb-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
              <BarChart3 className="text-yellow-400" size={24} /> تحلیل مالی
              ماهانه
            </h3>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financeData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#facc15" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
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
                  strokeWidth={3}
                  fill="url(#colorRev)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  strokeWidth={3}
                  fill="url(#colorExp)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* لاگ تراکنش‌های مالی */}
        <div className="bg-[#1a1d23] rounded-[2.5rem] border border-gray-800 overflow-hidden shadow-2xl p-6">
          <h3 className="text-white font-black italic flex items-center gap-2 uppercase tracking-widest text-sm mb-6">
            <Activity className="text-yellow-400" size={18} /> فعالیت‌های مالی
            اخیر
          </h3>
          <div className="space-y-4 font-bold">
            {recentLogs.map((log, i) => (
              <div
                key={i}
                className={`flex items-center gap-4 text-xs p-3 bg-gray-900/50 rounded-2xl border-r-4 ${log.color} text-gray-400`}
              >
                <span className={`${log.color} shrink-0`}>{log.time}</span>
                <p className="text-white font-black italic">{log.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

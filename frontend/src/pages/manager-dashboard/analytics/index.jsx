"use client";
import React, { useEffect, useState } from "react";
import DashboardLayout from "../layout";
import { API_BASE_URL } from "@/config/api";
import {
  BarChart3, TrendingUp, Users, DollarSign, CalendarDays,
  Activity, Target, Loader2, UserCheck, BookOpen,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, RadialBarChart,
  RadialBar, PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["#facc15", "#22c55e", "#3b82f6", "#ef4444", "#a855f7", "#06b6d4"];

export default function AnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [membershipGrowth, setMembershipGrowth] = useState([]);
  const [classHeatmap, setClassHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/analytics/overview`),
      fetch(`${API_BASE_URL}/analytics/revenue-trend?days=30`),
      fetch(`${API_BASE_URL}/analytics/membership-growth`),
      fetch(`${API_BASE_URL}/analytics/class-heatmap?days=14`),
    ]).then(async ([ovRes, revRes, growRes, heatRes]) => {
      const [ov, rev, grow, heat] = await Promise.all([
        ovRes.json(), revRes.json(), growRes.json(), heatRes.json(),
      ]);
      if (ov.success) setOverview(ov.stats);
      if (rev.success) setRevenueTrend(rev.trend || []);
      if (grow.success) setMembershipGrowth(grow.growth || []);
      if (heat.success) setClassHeatmap(heat.heatmap || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-screen items-center justify-center rounded-[2rem] bg-[var(--bg-body)]">
          <Loader2 size={40} className="animate-spin text-yellow-400" />
        </div>
      </DashboardLayout>
    );
  }

  const s = overview || {};
  const revenueData = revenueTrend.map((r) => ({ name: r._id.slice(5), revenue: r.revenue, count: r.count }));
  const growthData = membershipGrowth.map((g) => ({ name: g._id, count: g.count, revenue: g.revenue }));
  const heatmapData = classHeatmap.map((h) => ({ name: h._id.slice(5), attended: h.attended }));

  const roleData = Object.entries(s.usersByRole || {}).map(([key, val], i) => ({
    name: key === "Member" ? "اعضا" : key === "Trainer" ? "مربیان" : key === "Admin" ? "مدیران" : key,
    value: val,
    fill: COLORS[i % COLORS.length],
  }));

  return (
    <DashboardLayout>
      <div className="min-h-screen rounded-[2rem] bg-[var(--bg-body)] p-4 md:p-8" dir="rtl">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-2xl bg-yellow-400 p-3 text-[var(--text-body)]"><BarChart3 size={24} /></div>
          <div>
            <h1 className="text-2xl font-black text-[var(--text-body)] md:text-3xl">آمار و تحلیل</h1>
            <p className="text-xs font-bold text-[var(--text-muted)] mt-0.5">داده‌های واقعی از دیتابیس</p>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiCard icon={<Users />} label="اعضای فعال" value={s.activeMemberships || 0} color="text-blue-400" />
          <KpiCard icon={<DollarSign />} label="درآمد کل" value={`${((s.totalRevenue || 0) / 1000000).toFixed(1)}M`} color="text-green-400" />
          <KpiCard icon={<BookOpen />} label="کلاس‌ها" value={s.totalClasses || 0} color="text-yellow-400" />
          <KpiCard icon={<Target />} label="میزان اشغال" value={`${s.occupancyRate || 0}%`} color="text-purple-400" />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ChartCard title="روند درآمد (۳۰ روز)" icon={<DollarSign size={18} />}>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData}>
                <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#facc15" stopOpacity={0.3} /><stop offset="95%" stopColor="#facc15" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3139" vertical={false} />
                <XAxis dataKey="name" stroke="#4b5563" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="#4b5563" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0f1115", border: "1px solid #374151", borderRadius: "15px", textAlign: "right" }} />
                <Area type="monotone" dataKey="revenue" stroke="#facc15" strokeWidth={3} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="رشد اعضا (ماهیانه)" icon={<TrendingUp size={18} />}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3139" vertical={false} />
                <XAxis dataKey="name" stroke="#4b5563" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="#4b5563" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0f1115", border: "1px solid #374151", borderRadius: "15px", textAlign: "right" }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="#facc15" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="حضور در کلاس‌ها (۱۴ روز)" icon={<Activity size={18} />}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={heatmapData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3139" vertical={false} />
                <XAxis dataKey="name" stroke="#4b5563" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="#4b5563" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0f1115", border: "1px solid #374151", borderRadius: "15px", textAlign: "right" }} />
                <Line type="monotone" dataKey="attended" stroke="#22c55e" strokeWidth={3} dot={{ fill: "#22c55e" }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="ترکیب کاربران" icon={<Users size={18} />}>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={roleData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {roleData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#0f1115", border: "1px solid #374151", borderRadius: "15px" }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-[var(--text-body)]"><Activity size={18} className="text-yellow-400" /> آخرین رویدادهای سیستم</h3>
          <div className="space-y-2">
            {(s.auditActions || []).slice(0, 8).map((a, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-[var(--bg-hover)]/50 p-3 text-xs">
                <span className="font-bold text-[var(--text-dim)]">{a._id === "login" ? "ورود" : a._id === "create_user" ? "ایجاد کاربر" : a._id === "book_class" ? "رزرو کلاس" : a._id === "create_invoice" ? "صدور فاکتور" : a._id === "create_class" ? "ایجاد کلاس" : a._id === "create_membership" ? "عضویت جدید" : a._id === "mark_attendance" ? "حضور کلاس" : a._id === "cancel_booking" ? "لغو رزرو" : a._id}</span>
                <span className="font-black text-yellow-400">{a.count} بار</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function KpiCard({ icon, label, value, color }) {
  return (
    <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--bg-card)] p-4 md:p-5">
      <div className={`mb-3 ${color}`}>{React.cloneElement(icon, { size: 22 })}</div>
      <p className="text-2xl font-black text-[var(--text-body)] md:text-3xl">{typeof value === "number" ? value.toLocaleString("fa-IR") : value}</p>
      <p className="mt-1 text-[10px] font-bold text-[var(--text-muted)]">{label}</p>
    </div>
  );
}

function ChartCard({ title, icon, children }) {
  return (
    <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--bg-card)] p-5">
      <h3 className="mb-5 flex items-center gap-2 text-sm font-black text-[var(--text-body)]">
        <span className="text-yellow-400">{icon}</span> {title}
      </h3>
      {children}
    </div>
  );
}

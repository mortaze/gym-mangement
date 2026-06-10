"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { Activity, Bell, CalendarDays, CheckCircle2, CreditCard, Dumbbell, HeartPulse, ShieldAlert, Target, Timer, UserRound } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, RadialBarChart, RadialBar } from "recharts";
import DashboardLayout from "./layout";
import { API_BASE_URL } from "@/config/api";

const bmiCategory = (bmi) => {
  if (!bmi) return "نامشخص";
  if (bmi < 18.5) return "کمبود وزن";
  if (bmi < 25) return "نرمال";
  if (bmi < 30) return "اضافه وزن";
  return "چاقی";
};

const activityIcon = (type) => {
  const iconProps = { size: 18 };
  if (type === "attendance") return <CheckCircle2 {...iconProps} />;
  if (type === "training_request" || type === "program") return <Dumbbell {...iconProps} />;
  if (type === "payment") return <CreditCard {...iconProps} />;
  if (type === "membership") return <ShieldAlert {...iconProps} />;
  return <Activity {...iconProps} />;
};

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fa-IR", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

export default function UserMainDashboard() {
  const [summary, setSummary] = useState(null);
  const [programs, setPrograms] = useState({ trainingPrograms: [], nutritionPrograms: [] });
  const [activities, setActivities] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? sessionStorage.getItem("currentUser") : null;
    const user = raw ? JSON.parse(raw) : null;
    setCurrentUser(user);
    if (!user?._id) return;

    const load = async () => {
      try {
        const [userRes, summaryRes, programsRes, activitiesRes, notifRes] = await Promise.all([
          fetch(`${API_BASE_URL}/users/${user._id}`),
          fetch(`${API_BASE_URL}/memberships/summary?userId=${user._id}`),
          fetch(`${API_BASE_URL}/programs/user/${user._id}`),
          fetch(`${API_BASE_URL}/users/${user._id}/activities`),
          fetch(`${API_BASE_URL}/notifications/unread-count/${user._id}`),
        ]);
        const [userJson, summaryJson, programsJson, activitiesJson, notifJson] = await Promise.all([
          userRes.json(), summaryRes.json(), programsRes.json(), activitiesRes.json(), notifRes.json(),
        ]);
        if (userJson?.user) {
          const freshUser = { ...user, ...userJson.user };
          setCurrentUser(freshUser);
          sessionStorage.setItem("currentUser", JSON.stringify(freshUser));
        }
        setSummary(summaryJson);
        if (programsJson.success) setPrograms(programsJson);
        if (activitiesJson.success) setActivities(activitiesJson.activities || []);
        if (notifJson.success) setUnreadCount(notifJson.count || 0);
      } catch (error) {
        console.error(error);
      }
    };
    load();
  }, []);

  const activeMembership = summary?.activeMembership;
  const remainingDays = activeMembership?.remainingDays ?? 0;
  const activeTraining = programs.trainingPrograms?.find((p) => p.status === "active");
  const activeNutrition = programs.nutritionPrograms?.find((p) => p.status === "active");

  const bmi = currentUser?.bmi || (currentUser?.weight && currentUser?.height
    ? Number((currentUser.weight / (((currentUser.height > 3 ? currentUser.height / 100 : currentUser.height) || 1) ** 2)).toFixed(1))
    : 0);

  const bmiData = useMemo(() => [
    { name: "BMI", value: Math.min(bmi || 0, 45), fill: bmi < 18.5 ? "#60a5fa" : bmi < 25 ? "#22c55e" : bmi < 30 ? "#facc15" : "#ef4444" },
  ], [bmi]);

  const sessionChart = useMemo(() => [
    { name: "مصرف شده", value: activeMembership?.completedSessions || 0 },
    { name: "باقی‌مانده", value: activeMembership?.remainingSessions || 0 },
  ], [activeMembership]);

  const progressPercent = activeTraining?.progressScore || 0;

  return (
    <DashboardLayout>
      <div className="min-h-screen rounded-[2rem] bg-[var(--bg-body)] p-4 text-right md:p-8" dir="rtl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl font-black text-[var(--text-body)] md:text-4xl">داشبورد <span className="text-yellow-400">ورزشکار</span></h1>
            <p className="mt-2 text-xs font-bold text-[var(--text-muted)]">تمام اطلاعات از API و دیتابیس واقعی سیستم خوانده می‌شود.</p>
          </div>
          <Link href="/users-dashboard/notifications" className="relative w-fit rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-3 text-[var(--text-muted)] transition-all hover:border-yellow-400/50 hover:text-yellow-400">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={<ShieldAlert />} title="اشتراک فعال" value={activeMembership?.planName || "ندارد"} hint={`وضعیت: ${activeMembership?.status || "بدون اشتراک"}`} danger={!activeMembership} />
          <StatCard icon={<CalendarDays />} title="روزهای باقی‌مانده" value={`${remainingDays} روز`} hint="تا پایان تاریخ اعتبار" danger={remainingDays <= 7} />
          <StatCard icon={<Timer />} title="جلسات باقی‌مانده" value={`${activeMembership?.remainingSessions ?? 0}`} hint={`از ${activeMembership?.totalSessions ?? 0} جلسه`} />
          <StatCard icon={<CheckCircle2 />} title="جلسات مصرف شده" value={`${activeMembership?.completedSessions ?? 0}`} hint="ثبت‌شده از حضورهای واقعی" />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--bg-card)] p-5 xl:col-span-2">
            <div className="mb-5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Dumbbell className="text-yellow-400" />
                <h2 className="text-xl font-black text-[var(--text-body)]">برنامه تمرینی و غذایی</h2>
              </div>
              {activeTraining && (
                <Link href="/users-dashboard/workout" className="flex items-center gap-1.5 rounded-2xl bg-yellow-400/10 px-4 py-2 text-xs font-black text-yellow-400 transition-all hover:bg-yellow-400/20">
                  <CalendarDays size={14} />
                  تقویم تمرینی
                </Link>
              )}
            </div>
            {activeTraining && (
              <div className="mb-4 rounded-2xl bg-[var(--bg-hover)]/50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserRound size={16} className="text-yellow-400" />
                    <span className="text-sm font-black text-[var(--text-body)]">
                      {activeTraining.trainerId?.name ? `مربی: ${activeTraining.trainerId.name}` : "مربی: ثبت نشده"}
                    </span>
                  </div>
                  <span className="rounded-lg bg-yellow-400/10 px-2.5 py-1 text-xs font-black text-yellow-400">
                    {progressPercent}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-800">
                  <div className="h-full rounded-full bg-gradient-to-l from-yellow-400 to-yellow-500 transition-all" style={{ width: `${Math.min(progressPercent, 100)}%` }} />
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <ProgramCard title="برنامه تمرینی" subtitle={activeTraining?.trainerId?.name ? `مربی: ${activeTraining.trainerId.name}` : "در انتظار مربی"} items={(activeTraining?.exercises || []).slice(0, 6).map((ex) => `${ex.day ? `${ex.day}: ` : ""}${ex.name} | ${ex.sets || "—"} ست | ${ex.reps || "—"} تکرار`)} empty="هنوز برنامه تمرینی فعالی ثبت نشده است." />
              <ProgramCard title="برنامه غذایی" subtitle={activeNutrition?.title || "در انتظار برنامه غذایی"} items={activeNutrition?.meals ? Object.entries(activeNutrition.meals).filter(([, v]) => v).map(([k, v]) => `${mealLabels[k] || k}: ${v}`) : []} empty="هنوز برنامه غذایی فعالی ثبت نشده است." />
            </div>
          </section>

          <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--bg-card)] p-5">
            <div className="mb-3 flex items-center gap-2">
              <HeartPulse className="text-yellow-400" />
              <h2 className="text-xl font-black text-[var(--text-body)]">شاخص توده بدنی (BMI)</h2>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="62%" outerRadius="100%" data={bmiData} startAngle={180} endAngle={-180}>
                  <RadialBar dataKey="value" cornerRadius={20} background={{ fill: "#283241" }} />
                  <Tooltip />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center">
              <span className="text-4xl font-black text-[var(--text-body)]">{bmi || "—"}</span>
              <p className="mt-1 text-sm font-black text-yellow-400">{bmiCategory(bmi)}</p>
              <p className="mt-2 text-xs font-bold text-[var(--text-muted)]">قد: {currentUser?.height || "—"} | وزن: {currentUser?.weight || "—"}</p>
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--bg-card)]/70 p-5 xl:col-span-2">
            <div className="mb-5 flex items-center gap-2">
              <Activity className="text-yellow-400" />
              <h2 className="text-xl font-black text-[var(--text-body)]">گزارش فعالیت‌های اخیر</h2>
            </div>
            <div className="space-y-3">
              {activities.length ? activities.map((log, index) => (
                <div key={`${log.type}-${log.date}-${index}`} className="flex flex-col justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 transition hover:border-yellow-400/50 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--bg-hover)] text-yellow-400">{activityIcon(log.type)}</div>
                    <div>
                      <h4 className="text-sm font-black text-[var(--text-body)]">{log.title}</h4>
                      <p className="mt-1 text-xs font-bold text-[var(--text-muted)]">{log.description} | {formatDate(log.date)}</p>
                    </div>
                  </div>
                  <div className="text-left text-xs font-black text-yellow-400">{typeof log.amount === "number" ? `${log.amount.toLocaleString("fa-IR")} تومان` : log.amount}</div>
                </div>
              )) : <p className="rounded-2xl bg-[var(--bg-card)] p-6 text-center text-sm font-bold text-[var(--text-muted)]">هنوز فعالیت واقعی برای این حساب ثبت نشده است.</p>}
            </div>
          </section>

          <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--bg-card)] p-5">
            <div className="mb-5 flex items-center gap-2">
              <Target className="text-yellow-400" />
              <h2 className="text-xl font-black text-[var(--text-body)]">تحلیل جلسات اشتراک</h2>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sessionChart} innerRadius={52} outerRadius={75} dataKey="value">
                    <Cell fill="#facc15" />
                    <Cell fill="#22c55e" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 text-xs font-bold text-[var(--text-dim)]">
              <p>نام طرح: <span className="text-[var(--text-body)]">{activeMembership?.planName || "—"}</span></p>
              <p>شروع: <span className="text-[var(--text-body)]">{activeMembership?.membershipStartDate ? new Date(activeMembership.membershipStartDate).toLocaleDateString("fa-IR") : "—"}</span></p>
              <p>پایان: <span className="text-[var(--text-body)]">{activeMembership?.membershipEndDate ? new Date(activeMembership.membershipEndDate).toLocaleDateString("fa-IR") : "—"}</span></p>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

const mealLabels = {
  breakfast: "صبحانه",
  snack: "میان وعده",
  lunch: "ناهار",
  beforeWorkout: "قبل تمرین",
  afterWorkout: "بعد تمرین",
  dinner: "شام",
};

function StatCard({ icon, title, value, hint, danger = false }) {
  return (
    <div className={`rounded-[2rem] border p-5 ${danger ? "border-red-900/50 bg-red-950/20" : "border-[var(--border)] bg-[var(--bg-card)]"}`}>
      <div className="mb-4 flex items-start justify-between">
        <div className={danger ? "text-red-400" : "text-yellow-400"}>{icon}</div>
        <span className="text-[10px] font-black text-[var(--text-muted)]">{title}</span>
      </div>
      <h3 className="text-2xl font-black text-[var(--text-body)]">{value}</h3>
      <p className="mt-2 text-xs font-bold text-[var(--text-muted)]">{hint}</p>
    </div>
  );
}

function ProgramCard({ title, subtitle, items, empty }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <h3 className="font-black text-[var(--text-body)]">{title}</h3>
      <p className="mb-4 mt-1 text-xs font-bold text-[var(--text-muted)]">{subtitle}</p>
      {items?.length ? (
        <div className="space-y-2">
          {items.map((item, index) => <div key={index} className="rounded-xl bg-[var(--bg-hover)]/60 p-3 text-xs font-bold leading-6 text-[var(--text-dim)]">{item}</div>)}
        </div>
      ) : <p className="rounded-xl bg-[var(--bg-hover)]/60 p-4 text-center text-xs font-bold text-[var(--text-muted)]">{empty}</p>}
    </div>
  );
}

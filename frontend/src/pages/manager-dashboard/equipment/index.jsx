"use client";

import React from "react";
import { useGetEquipmentsQuery } from "@/redux/features/equipmentApi";

import Link from "next/link";
import {
  Dumbbell,
  Wrench,
  AlertTriangle,
  Plus,
  BarChart3,
  Zap,
  ShieldCheck,
  History,
  TrendingDown,
  Info,
  Link as LinkIcon,
  Edit3,
  Trash2,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as ReTooltip,
} from "recharts";
import DashboardLayout from "../layout";

// داده‌های وضعیت سلامت کل تجهیزات
const equipmentStatusData = [
  { name: "آماده به کار", value: 75, color: "#facc15" }, // زرد فلاح
  { name: "نیاز به سرویس", value: 15, color: "#3b82f6" }, // آبی
  { name: "خارج از رده", value: 10, color: "#ef4444" }, // قرمز
];


function EquipmentMobileCard({ item }) {
  return (
    <article className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-4 text-right shadow-xl">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg-hover)] text-yellow-400"><Zap size={20} /></div>
        <div className="min-w-0 flex-1">
          <h4 className="break-words text-base font-black text-[var(--text-body)]">{item.name}</h4>
          <p className="mt-1 break-all text-[11px] font-mono text-[var(--text-muted)]">{item.id}</p>
        </div>
      </div>
      <div className="space-y-3 text-sm font-bold text-[var(--text-dim)]">
        <MobileRow label="برند سازنده" value={item.brand} />
        <MobileRow label="آخرین سرویس" value={item.lastService} />
        <div className="rounded-2xl bg-[var(--bg-hover)]/70 p-3">
          <div className="mb-2 flex items-center justify-between"><span className="text-[var(--text-muted)]">شاخص سلامت</span><span className="text-[var(--text-body)]">{item.health}%</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-800"><div className={`h-full ${item.health > 80 ? "bg-green-500" : item.health > 40 ? "bg-yellow-400" : "bg-red-500"}`} style={{ width: `${item.health}%` }} /></div>
        </div>
        <MobileRow label="وضعیت عملیاتی" value={item.status} />
      </div>
      <Link href={`/manager-dashboard/equipment/${item.id}/edit`} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-800 p-3 font-black text-yellow-400">
        <Edit3 size={16} /> ویرایش
      </Link>
    </article>
  );
}

function MobileRow({ label, value }) {
  return <div className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--bg-hover)]/70 p-3"><span className="text-[var(--text-muted)]">{label}</span><span className="break-words text-left text-[var(--text-body)]">{value || "—"}</span></div>;
}

export default function EquipmentPage() {
  // داخل تابع کامپوننت (مثلاً بالای return)
  const {
    data: equipments = [],
    isLoading,
    isError,
    refetch,
  } = useGetEquipmentsQuery();

  // normalize و map کردن به آرایه inventory مورد استفاده در جدول
  const inventory = React.useMemo(() => {
    // handle cases: equipments ممکنه [] یا { data: [...] } یا هر ساختار دیگری باشه
    const items = Array.isArray(equipments)
      ? equipments
      : Array.isArray(equipments?.data)
        ? equipments.data
        : [];

    return items.map((item) => ({
      id:
        item._id?.toString() ||
        item.equipmentCode ||
        Math.random().toString(36).slice(2, 9),
      name: item.name || "—",
      brand: item.brand || "—",
      health:
        typeof item.healthIndex === "number"
          ? item.healthIndex
          : Number(item.healthIndex) || 0,
      lastService: item.lastServiceDate || item.lastService || "—",
      // فارسی‌سازی وضعیت برای نمایش در جدول
      status:
        item.operationalStatus === "Operational"
          ? "عملیاتی"
          : item.operationalStatus === "NeedsRepair"
            ? "نیاز به تعمیر"
            : item.operationalStatus === "OutOfService"
              ? "خارج از رده"
              : item.status && item.status === "عملیاتی"
                ? "عملیاتی"
                : "نامشخص",
    }));
  }, [equipments]);
  return (
    <DashboardLayout>
      <div
        className="min-h-screen overflow-x-hidden rounded-4xl bg-[var(--bg-body)] p-3 sm:p-4 md:p-8"
        dir="rtl"
      >
        {/* Header - مدیریت دارایی‌ها */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-6 border-b border-[var(--border)]">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-body)] italic tracking-tighter uppercase">
              مدیریت{" "}
              <span className="text-yellow-400">تجهیزات و ماشین‌آلات</span>
            </h1>
            <p className="text-[var(--text-muted)] text-xs font-bold mt-3 flex items-center gap-2">
              <Wrench size={14} className="text-yellow-400" />
              ASSET MANAGEMENT & MAINTENANCE SYSTEM
            </p>
          </div>

          <Link
            href="/manager-dashboard/equipment/create"
            className="w-full md:w-auto bg-[var(--bg-card)] hover:bg-yellow-400 text-[var(--text-body)] font-black px-8 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
          >
            <Plus size={20} />
            افزودن دستگاه جدید
          </Link>
        </div>

        {/* Top Analytics - تحلیل سلامت کل */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* کارت نمودار وضعیت */}
          <div className="bg-[var(--bg-card)] p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-[var(--border)] flex flex-col md:flex-row items-center gap-6 md:gap-8 shadow-2xl">
            <div className="h-[180px] w-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={equipmentStatusData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {equipmentStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <ReTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              <h3 className="text-[var(--text-body)] font-black italic text-lg mb-4 uppercase tracking-tighter">
                وضعیت سلامت کل
              </h3>
              {equipmentStatusData.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-[var(--text-dim)] text-xs font-bold">
                    {item.name}:
                  </span>
                  <span className="text-[var(--text-body)] text-xs font-black">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* کارت آمار سریع */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border)] relative overflow-hidden group">
              <div className="relative z-10">
                <TrendingDown className="text-red-500 mb-4" size={32} />
                <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.2em]">
                  هزینه استهلاک ماهانه
                </p>
                <h3 className="text-3xl font-black text-[var(--text-body)] italic mt-1">
                  ۱۲,۵۰۰,۰۰۰{" "}
                  <span className="text-sm font-normal text-[var(--text-dim)] tracking-normal">
                    تومان
                  </span>
                </h3>
              </div>
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50"></div>
            </div>

            <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border)] relative overflow-hidden group">
              <div className="relative z-10">
                <ShieldCheck className="text-green-500 mb-4" size={32} />
                <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.2em]">
                  تجهیزات تحت گارانتی
                </p>
                <h3 className="text-3xl font-black text-[var(--text-body)] italic mt-1">
                  ۴۲{" "}
                  <span className="text-sm font-normal text-[var(--text-dim)] tracking-normal text-rtl">
                    دستگاه
                  </span>
                </h3>
              </div>
              <div className="absolute top-0 left-0 w-full h-1 bg-green-500/50"></div>
            </div>
          </div>
        </div>
        {/* اگر در حال لود است */}
        {isLoading && (
          <div className="text-[var(--text-body)] p-6 text-center">
            در حال بارگذاری داده‌ها...
          </div>
        )}

        {/* اگر خطا وجود دارد */}
        {isError && (
          <div className="text-red-400 p-6 text-center">
            خطا در دریافت داده‌ها — دوباره تلاش کنید یا صفحه را رفرش کنید.
            <button
              onClick={() => refetch()}
              className="mr-2 text-sm bg-yellow-400 text-[var(--text-body)] px-3 py-1 rounded-xl"
            >
              تلاش مجدد
            </button>
          </div>
        )}

        {/* Inventory Table - لیست موجودی انبار آهن */}
        <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border)] overflow-hidden shadow-2xl">
          <div className="flex flex-col gap-4 border-b border-[var(--border)] bg-gray-800/20 p-4 sm:p-6 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-[var(--text-body)] font-black italic uppercase tracking-widest text-sm flex items-center gap-3">
              <Dumbbell className="text-yellow-400" size={20} /> لیست دارایی‌های
              ثابت مجموعه
            </h3>
            <div className="flex gap-2">
              <button className="p-2 bg-[var(--bg-hover)] text-[var(--text-dim)] rounded-lg hover:text-[var(--text-body)] transition-colors">
                <History size={18} />
              </button>
              <button className="p-2 bg-[var(--bg-hover)] text-[var(--text-dim)] rounded-lg hover:text-[var(--text-body)] transition-colors">
                <BarChart3 size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
            {inventory.map((item) => <EquipmentMobileCard key={item.id} item={item} />)}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[880px] text-right">
              <thead className="bg-gray-800/50 text-[var(--text-muted)] text-[10px] uppercase font-black tracking-widest">
                <tr>
                  <th className="p-6">شناسه / دستگاه</th>
                  <th className="p-6">برند سازنده</th>
                  <th className="p-6">شاخص سلامت</th>
                  <th className="p-6">آخرین سرویس فنی</th>
                  <th className="p-6 text-center">وضعیت عملیاتی</th>
                  <th className="p-6 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 font-bold">
                {inventory.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-800/30 transition-colors group"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[var(--bg-hover)] rounded-2xl flex items-center justify-center text-yellow-400 border border-[var(--border)] group-hover:border-yellow-400/50 transition-all">
                          <Zap size={20} />
                        </div>
                        <div>
                          <p className="text-[var(--text-body)] text-sm">{item.name}</p>
                          <p className="text-[10px] text-[var(--text-muted)] font-mono italic">
                            {item.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-[var(--text-dim)] text-xs uppercase tracking-widest">
                      {item.brand}
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 w-24 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.health > 80
                                ? "bg-green-500"
                                : item.health > 40
                                  ? "bg-yellow-400"
                                  : "bg-red-500"
                            }`}
                            style={{ width: `${item.health}%` }}
                          ></div>
                        </div>
                        <span className="text-[var(--text-body)] text-xs">
                          {item.health}%
                        </span>
                      </div>
                    </td>
                    <td className="p-6 text-[var(--text-dim)] text-xs font-mono">
                      {item.lastService}
                    </td>
                    <td className="p-6 text-center">
                      <span
                        className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                          item.status === "عملیاتی"
                            ? "bg-green-500/10 text-green-500 border-green-500/20"
                            : item.status === "نیاز به تعمیر"
                              ? "bg-yellow-400/10 text-yellow-400 border-yellow-400/20"
                              : "bg-red-500/10 text-red-500 border-red-500/20"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex justify-center gap-2">
                        <Link
                          href={`/manager-dashboard/equipment/${item.id}/edit`}
                          className="p-2 bg-gray-800 text-[var(--text-dim)] hover:text-yellow-400 hover:bg-gray-700 rounded-lg transition-all"
                        >
                          <Edit3 size={16} />
                        </Link>
                        <button
                          onClick={() => window.alert("حذف تجهیزات از این صفحه فعال نشده است.")}
                          className="p-2 bg-gray-800 text-[var(--text-dim)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 flex items-center gap-2 text-[var(--text-muted)]">
          <AlertTriangle size={14} className="text-yellow-400" />
          <p className="text-[10px] font-bold uppercase tracking-widest italic">
            هشدار سیستم: ۲ دستگاه به زمان اورهال (Overhaul) نزدیک می‌شوند. نسبت
            به رزرو تکنسین اقدام کنید.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

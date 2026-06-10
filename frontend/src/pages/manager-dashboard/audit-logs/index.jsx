"use client";
import React, { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../layout";
import { API_BASE_URL } from "@/config/api";
import {
  ClipboardList, Search, Loader2, Filter,
} from "lucide-react";

const ACTION_LABELS = {
  login: "ورود", logout: "خروج", create_user: "ایجاد کاربر", update_user: "ویرایش کاربر",
  delete_user: "حذف کاربر", create_class: "ایجاد کلاس", update_class: "ویرایش کلاس",
  delete_class: "حذف کلاس", book_class: "رزرو کلاس", cancel_booking: "لغو رزرو",
  mark_attendance: "حضور", create_membership: "عضویت جدید", create_invoice: "فاکتور",
  create_coupon: "تخفیف", create_plan: "طرح عضویت", update_plan: "ویرایش طرح",
  delete_plan: "حذف طرح", system: "سیستم",
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 30;

  useEffect(() => {
    const params = new URLSearchParams({ limit: String(limit), skip: String((page - 1) * limit) });
    if (actionFilter) params.set("action", actionFilter);

    fetch(`${API_BASE_URL}/audit-logs?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) { setLogs(data.logs || []); setTotal(data.total || 0); }
      })
      .finally(() => setLoading(false));
  }, [page, actionFilter]);

  const filtered = useMemo(() => {
    if (!search.trim()) return logs;
    const q = search.trim().toLowerCase();
    return logs.filter((l) =>
      l.userId?.name?.toLowerCase().includes(q) ||
      l.resource?.toLowerCase().includes(q) ||
      l.action?.toLowerCase().includes(q),
    );
  }, [logs, search]);

  const totalPages = Math.ceil(total / limit);

  const formatTime = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString("fa-IR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-screen items-center justify-center rounded-[2rem] bg-[var(--bg-body)]">
          <Loader2 size={40} className="animate-spin text-yellow-400" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen rounded-[2rem] bg-[var(--bg-body)] p-4 md:p-8" dir="rtl">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-yellow-400 p-3 text-[var(--text-body)]"><ClipboardList size={24} /></div>
          <div>
            <h1 className="text-2xl font-black text-[var(--text-body)] md:text-3xl">لاگ فعالیت‌ها</h1>
            <p className="text-xs font-bold text-[var(--text-muted)] mt-0.5">{total} رویداد ثبت شده</p>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجو..." className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] py-3 pr-10 pl-4 text-sm text-[var(--text-body)] outline-none focus:border-yellow-400" />
          </div>
          <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 text-sm text-[var(--text-body)] outline-none focus:border-yellow-400">
            <option value="">همه رویدادها</option>
            {Object.entries(ACTION_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)]">
              <ClipboardList size={48} className="mb-4 opacity-30" />
              <p className="text-lg font-black">رویدادی یافت نشد</p>
            </div>
          ) : filtered.map((log) => (
            <div key={log._id} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-3 text-xs transition-all hover:border-yellow-400/20">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-yellow-400/10 px-2 py-1 font-black text-yellow-400">
                    {ACTION_LABELS[log.action] || log.action}
                  </span>
                  <span className="font-bold text-[var(--text-body)]">{log.userId?.name || "سیستم"}</span>
                  {log.resource && <span className="text-[var(--text-muted)]">{log.resource}</span>}
                </div>
                <span className="text-[var(--text-muted)]">{formatTime(log.createdAt)}</span>
              </div>
              {log.details && typeof log.details === "object" && (
                <div className="mt-2 rounded-xl bg-[var(--bg-hover)]/50 p-2 text-[10px] text-[var(--text-muted)] font-mono">
                  {JSON.stringify(log.details).slice(0, 200)}
                </div>
              )}
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-xl bg-gray-800 px-4 py-2 text-xs font-black text-[var(--text-body)] transition-all hover:bg-gray-700 disabled:opacity-40">
              قبلی
            </button>
            <span className="text-xs text-[var(--text-dim)]">صفحه {page} از {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-xl bg-gray-800 px-4 py-2 text-xs font-black text-[var(--text-body)] transition-all hover:bg-gray-700 disabled:opacity-40">
              بعدی
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

"use client";
import React, { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../layout";
import { API_BASE_URL } from "@/config/api";
import {
  CalendarDays, Clock, Users, MapPin, Search, Eye, X,
  Loader2, UserCheck, UserX,
} from "lucide-react";

export default function TrainerClassesPage() {
  const [trainer, setTrainer] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailSession, setDetailSession] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const raw = typeof window !== "undefined" ? sessionStorage.getItem("currentUser") : null;
    const u = raw ? JSON.parse(raw) : null;
    setTrainer(u);
    if (u?._id) {
      fetch(`${API_BASE_URL}/classes?trainerId=${u._id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success) setSessions(data.sessions || []);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return sessions;
    const q = search.trim().toLowerCase();
    return sessions.filter((s) => s.title.toLowerCase().includes(q));
  }, [sessions, search]);

  const viewDetail = async (id) => {
    const res = await fetch(`${API_BASE_URL}/classes/${id}`);
    const data = await res.json();
    if (data.success) setDetailSession(data.session);
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("fa-IR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

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
          <div className="rounded-2xl bg-yellow-400 p-3 text-[var(--text-body)]"><CalendarDays size={24} /></div>
          <div>
            <h1 className="text-2xl font-black text-[var(--text-body)] md:text-3xl">کلاس‌های من</h1>
            <p className="text-xs font-bold text-[var(--text-muted)] mt-0.5">{sessions.length} کلاس برنامه‌ریزی شده</p>
          </div>
        </div>

        <div className="mb-4 relative">
          <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجوی کلاس..." className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] py-3 pr-10 pl-4 text-sm text-[var(--text-body)] outline-none focus:border-yellow-400" />
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)]">
              <CalendarDays size={48} className="mb-4 opacity-30" />
              <p className="text-lg font-black">کلاسی برای شما ثبت نشده</p>
            </div>
          ) : filtered.map((s) => {
            const booked = s.attendees?.filter((a) => a.status === "booked").length || 0;
            const attended = s.attendees?.filter((a) => a.status === "attended").length || 0;
            return (
              <div key={s._id} className="rounded-[2rem] border border-[var(--border)] bg-[var(--bg-card)] p-4 transition-all hover:border-yellow-400/30">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-400"><CalendarDays size={22} /></div>
                    <div>
                      <h3 className="font-black text-[var(--text-body)]">{s.title}</h3>
                      <p className="text-xs text-[var(--text-dim)] mt-0.5">{s.time} • {s.duration} دقیقه</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{formatDate(s.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-xl bg-green-500/10 px-3 py-1 text-xs font-black text-green-400">
                      <UserCheck size={14} className="inline ml-1" />{attended}
                    </span>
                    <span className="rounded-xl bg-yellow-400/10 px-3 py-1 text-xs font-black text-yellow-400">
                      <Users size={14} className="inline ml-1" />{booked}/{s.capacity}
                    </span>
                    <button onClick={() => viewDetail(s._id)} className="rounded-xl bg-gray-800 p-2 text-[var(--text-dim)] transition-all hover:bg-gray-700 hover:text-[var(--text-body)]"><Eye size={16} /></button>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-[var(--text-muted)]">
                  <span className="flex items-center gap-1"><MapPin size={12} /> {s.location}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {s.duration} دقیقه</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {detailSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-overlay)]/60 p-4 backdrop-blur-sm" onClick={() => setDetailSession(null)}>
          <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-[var(--border)] bg-[var(--bg-card)] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-[var(--text-body)]">جزئیات کلاس</h2>
              <button onClick={() => setDetailSession(null)} className="text-[var(--text-dim)] hover:text-[var(--text-body)]"><X size={20} /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="rounded-2xl bg-[var(--bg-hover)]/50 p-4">
                <p className="font-black text-[var(--text-body)]">{detailSession.title}</p>
                <p className="text-xs text-[var(--text-dim)] mt-1">{formatDate(detailSession.date)} ساعت {detailSession.time}</p>
                <p className="text-xs text-[var(--text-dim)]">{detailSession.duration} دقیقه • {detailSession.location}</p>
              </div>
              <h3 className="font-black text-[var(--text-body)]">شرکت‌کنندگان</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(detailSession.attendees || []).filter((a) => a.status !== "cancelled").length === 0 ? (
                  <p className="text-[var(--text-muted)] text-xs">هنوز کسی ثبت‌نام نکرده</p>
                ) : (
                  (detailSession.attendees || []).filter((a) => a.status !== "cancelled").map((a) => (
                    <div key={a._id} className={`rounded-xl p-3 flex items-center justify-between ${a.status === "attended" ? "bg-green-500/10" : "bg-[var(--bg-hover)]/50"}`}>
                      <div>
                        <p className="font-bold text-[var(--text-body)] text-xs">{a.userId?.name || "کاربر"}</p>
                        <p className="text-[10px] text-[var(--text-muted)]">{a.userId?.employeeCode || ""}</p>
                      </div>
                      <span className={`text-[10px] font-black ${a.status === "attended" ? "text-green-400" : "text-yellow-400"}`}>
                        {a.status === "attended" ? "حاضر" : "رزرو شده"}
                      </span>
                    </div>
                  ))
                )}
              </div>
              {detailSession.waitingList?.length > 0 && (
                <>
                  <h3 className="font-black text-[var(--text-body)] mt-2">صف انتظار ({detailSession.waitingList.length})</h3>
                  <div className="space-y-2">
                    {detailSession.waitingList.map((w) => (
                      <div key={w._id} className="rounded-xl bg-yellow-400/5 p-3">
                        <p className="font-bold text-[var(--text-body)] text-xs">{w.userId?.name || "کاربر"}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

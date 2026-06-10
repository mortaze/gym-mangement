"use client";
import React, { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../layout";
import { API_BASE_URL } from "@/config/api";
import {
  CalendarDays, Clock, Users, MapPin, Loader2, X, CheckCircle2,
  Ban, UserRound, QrCode, ChevronRight, ChevronLeft, BookOpen,
} from "lucide-react";
import Swal from "sweetalert2";
import { SkeletonList, SkeletonCard } from "@/components/Skeleton";

export default function UserClassesPage() {
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("browse");
  const [selectedQr, setSelectedQr] = useState(null);
  const [filterDate, setFilterDate] = useState(() => new Date().toISOString().split("T")[0]);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? sessionStorage.getItem("currentUser") : null;
    const u = raw ? JSON.parse(raw) : null;
    setUser(u);
    if (u?._id) {
      loadAll(u);
    } else {
      setLoading(false);
    }
  }, []);

  const loadAll = async (u) => {
    try {
      const [cRes, bRes] = await Promise.all([
        fetch(`${API_BASE_URL}/classes?status=scheduled`),
        fetch(`${API_BASE_URL}/classes/user/${u._id}/bookings`),
      ]);
      const cData = await cRes.json();
      const bData = await bRes.json();
      if (cData.success) setSessions(cData.sessions || []);
      if (bData.success) setBookings(bData.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reload = async () => {
    if (!user?._id) return;
    const [cRes, bRes] = await Promise.all([
      fetch(`${API_BASE_URL}/classes?status=scheduled`),
      fetch(`${API_BASE_URL}/classes/user/${user._id}/bookings`),
    ]);
    const cData = await cRes.json();
    const bData = await bRes.json();
    if (cData.success) setSessions(cData.sessions || []);
    if (bData.success) setBookings(bData.bookings || []);
  };

  const bookedIds = useMemo(() => {
    return new Set(
      bookings.filter((b) => b.status === "booked").map((b) => b.classId),
    );
  }, [bookings]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const sDate = new Date(s.date).toISOString().split("T")[0];
      return sDate === filterDate;
    });
  }, [sessions, filterDate]);

  const groupByDate = useMemo(() => {
    const map = {};
    sessions.forEach((s) => {
      const key = new Date(s.date).toLocaleDateString("fa-IR");
      if (!map[key]) map[key] = [];
      map[key].push(s);
    });
    return Object.entries(map).slice(0, 7);
  }, [sessions]);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("fa-IR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const formatTime = (t) => t;

  const isBooked = (classId) => bookedIds.has(classId);

  const bookClass = async (classId) => {
    if (!user?._id) return;
    try {
      const res = await fetch(`${API_BASE_URL}/classes/${classId}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      if (data.waiting) {
        Swal.fire({ icon: "info", title: "در صف انتظار قرار گرفتید", background: "#11141b", color: "#fff" });
      } else {
        Swal.fire({ icon: "success", title: "کلاس با موفقیت رزرو شد", background: "#11141b", color: "#fff" });
      }
      await reload();
    } catch (err) {
      Swal.fire({ icon: "error", title: "خطا", text: err.message, background: "#11141b", color: "#fff" });
    }
  };

  const cancelBooking = async (classId) => {
    if (!user?._id) return;
    const result = await Swal.fire({
      title: "لغو رزرو؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "لغو",
      cancelButtonText: "انصراف",
      background: "#11141b",
      color: "#fff",
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${API_BASE_URL}/classes/${classId}/cancel/${user._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      await reload();
    } catch (err) {
      Swal.fire({ icon: "error", title: "خطا", text: err.message, background: "#11141b", color: "#fff" });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen rounded-[2rem] bg-[#0f1115] p-4 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-14 w-14 animate-pulse rounded-2xl bg-gray-800" />
            <div className="space-y-2">
              <div className="h-7 w-40 animate-pulse rounded-lg bg-gray-800" />
              <div className="h-4 w-24 animate-pulse rounded-lg bg-gray-800" />
            </div>
          </div>
          <SkeletonList rows={4} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen rounded-[2rem] bg-[#0f1115] p-4 md:p-8" dir="rtl">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-yellow-400 p-3 text-black"><CalendarDays size={24} /></div>
          <div>
            <h1 className="text-2xl font-black text-white md:text-3xl">کلاس‌های گروهی</h1>
            <p className="text-xs font-bold text-gray-500 mt-0.5">رزرو و مدیریت کلاس‌ها</p>
          </div>
        </div>

        <div className="mb-6 flex gap-2">
          {[
            { key: "browse", label: "کلاس‌های موجود" },
            { key: "my", label: "رزروهای من", count: bookings.filter((b) => b.status === "booked").length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-2xl px-5 py-2.5 text-sm font-black transition-all ${
                activeTab === tab.key
                  ? "bg-yellow-400 text-black"
                  : "border border-gray-800 bg-[#1a1d23] text-gray-400 hover:border-yellow-400/40 hover:text-white"
              }`}
            >
              {tab.label}
              {tab.count > 0 && <span className="mr-2 rounded-lg bg-gray-900 px-2 py-0.5 text-[10px]">{tab.count}</span>}
            </button>
          ))}
        </div>

        {activeTab === "browse" && (
          <>
            <div className="mb-4">
              <label className="block mb-1.5 text-xs font-bold text-gray-400">انتخاب تاریخ</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full max-w-xs rounded-2xl border border-gray-800 bg-[#1a1d23] px-4 py-2.5 text-sm text-white outline-none focus:border-yellow-400"
              />
            </div>

            <div className="space-y-3">
              {filteredSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                  <CalendarDays size={48} className="mb-4 opacity-30" />
                  <p className="text-lg font-black">کلاسی در این تاریخ وجود ندارد</p>
                  <p className="text-sm text-gray-600 mt-1">تاریخ دیگری را انتخاب کنید</p>
                </div>
              ) : filteredSessions.map((s) => {
                const booked = s.attendees?.filter((a) => a.status === "booked").length || 0;
                const avail = Math.max(0, s.capacity - booked);
                const alreadyBooked = isBooked(s._id);
                return (
                  <div key={s._id} className="rounded-[2rem] border border-gray-800 bg-[#1a1d23] p-4 transition-all hover:border-yellow-400/30">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-400">
                          <CalendarDays size={24} />
                        </div>
                        <div>
                          <h3 className="font-black text-white">{s.title}</h3>
                          <p className="text-xs text-gray-400 mt-0.5">مربی: {s.trainerId?.name || "—"}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{formatDate(s.date)} • ساعت {s.time} • {s.duration} دقیقه</p>
                          <p className="text-xs text-gray-500 mt-0.5">{s.location}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`rounded-xl px-3 py-1 text-xs font-black ${avail > 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                          {avail > 0 ? `${avail} جای خالی` : "تکمیل"}
                        </span>
                        {alreadyBooked ? (
                          <button onClick={() => cancelBooking(s._id)} className="flex items-center gap-1 rounded-2xl border border-red-900/50 bg-red-950/20 px-4 py-2 text-xs font-black text-red-400 transition-all hover:bg-red-950/40">
                            <Ban size={14} /> لغو رزرو
                          </button>
                        ) : (
                          <button onClick={() => bookClass(s._id)} disabled={avail === 0} className="flex items-center gap-1 rounded-2xl bg-yellow-400 px-4 py-2 text-xs font-black text-black transition-all hover:bg-yellow-500 disabled:opacity-50">
                            <BookOpen size={14} /> {avail === 0 ? "تکمیل" : "رزرو"}
                          </button>
                        )}
                      </div>
                    </div>
                    {s.description && <p className="mt-3 text-xs text-gray-500 rounded-xl bg-gray-900/50 p-3">{s.description}</p>}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === "my" && (
          <div className="space-y-3">
            {bookings.filter((b) => b.status !== "cancelled").length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <BookOpen size={48} className="mb-4 opacity-30" />
                <p className="text-lg font-black">رزروی ندارید</p>
                <p className="text-sm text-gray-600 mt-1">از بخش کلاس‌های موجود رزرو کنید</p>
              </div>
            ) : bookings.filter((b) => b.status !== "cancelled").map((b) => (
              <div key={b._id} className="rounded-[2rem] border border-gray-800 bg-[#1a1d23] p-4 transition-all hover:border-yellow-400/30">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-400">
                      <CalendarDays size={22} />
                    </div>
                    <div>
                      <h3 className="font-black text-white">{b.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">مربی: {b.trainer?.name || "—"}</p>
                      <p className="text-xs text-gray-500">{formatDate(b.date)} • ساعت {b.time} • {b.duration} دقیقه</p>
                      <span className={`mt-1 inline-block rounded-xl px-3 py-0.5 text-[10px] font-black ${b.status === "booked" ? "bg-yellow-400/10 text-yellow-400" : "bg-green-500/10 text-green-400"}`}>
                        {b.status === "booked" ? "رزرو شده" : b.status === "attended" ? "حاضر شده" : "لغو شده"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {b.status === "booked" && b.qrToken && (
                      <button onClick={() => setSelectedQr(b)} className="flex items-center gap-1 rounded-2xl border border-gray-700 bg-gray-800 px-3 py-2 text-xs font-black text-gray-300 transition-all hover:border-yellow-400/50 hover:text-yellow-400">
                        <QrCode size={14} /> QR
                      </button>
                    )}
                    {b.status === "booked" && (
                      <button onClick={() => cancelBooking(b.classId)} className="rounded-2xl border border-red-900/50 bg-red-950/20 px-3 py-2 text-xs font-black text-red-400 transition-all hover:bg-red-950/40">
                        لغو
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <QuickSchedule groupByDate={groupByDate} sessions={sessions} setFilterDate={setFilterDate} />
      </div>

      {selectedQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setSelectedQr(null)}>
          <div className="w-full max-w-sm rounded-[2rem] border border-gray-800 bg-[#1a1d23] p-8 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4">
              <div className="inline-flex items-center justify-center rounded-2xl bg-white p-4">
                <div className="h-40 w-40 bg-white flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-black text-xs mb-2 font-bold">QR ورود به کلاس</div>
                    <QrCode size={80} className="text-black mx-auto" />
                    <div className="mt-2 bg-gray-100 p-1 rounded text-[8px] text-gray-600 font-mono break-all">
                      {selectedQr.qrToken}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <h3 className="font-black text-white">{selectedQr.title}</h3>
            <p className="text-xs text-gray-400 mt-1">{formatDate(selectedQr.date)} • {selectedQr.time}</p>
            <p className="text-xs text-gray-500 mt-0.5">این QR را هنگام ورود به مربی نشان دهید</p>
            <button onClick={() => setSelectedQr(null)} className="mt-4 rounded-2xl bg-yellow-400 px-6 py-2.5 text-sm font-black text-black transition-all hover:bg-yellow-500">
              بستن
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function QuickSchedule({ groupByDate, sessions, setFilterDate }) {
  const [open, setOpen] = useState(false);

  const toGregorian = (faDate) => {
    const found = sessions.find((s) => new Date(s.date).toLocaleDateString("fa-IR") === faDate);
    return found ? new Date(found.date).toISOString().split("T")[0] : "";
  };

  return (
    <div className="mt-6">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 text-sm font-black text-yellow-400 transition-all hover:text-yellow-300">
        {open ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        برنامه هفتگی
      </button>
      {open && (
        <div className="mt-3 space-y-2">
          {groupByDate.map(([dateLabel, clsList]) => (
            <button
              key={dateLabel}
              onClick={() => {
                const gDate = toGregorian(dateLabel);
                if (gDate) setFilterDate(gDate);
                setOpen(false);
              }}
              className="w-full rounded-2xl border border-gray-800 bg-[#1a1d23] p-3 text-right transition-all hover:border-yellow-400/30"
            >
              <p className="text-sm font-black text-white">{dateLabel}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {clsList.length} کلاس • {clsList.reduce((s, c) => s + (c.attendees?.filter((a) => a.status === "booked").length || 0), 0)} ثبت‌نام
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

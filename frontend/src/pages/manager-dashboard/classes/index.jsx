"use client";
import React, { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../layout";
import { API_BASE_URL } from "@/config/api";
import {
  Plus, Trash2, Edit3, Search, CalendarDays, Clock,
  Users, MapPin, Loader2, X, CheckCircle2, UserRound,
  Ban, Eye,
} from "lucide-react";
import Swal from "sweetalert2";

export default function ManagerClassesPage() {
  const [sessions, setSessions] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [detailSession, setDetailSession] = useState(null);

  const [form, setForm] = useState({
    title: "",
    trainerId: "",
    date: "",
    time: "",
    capacity: "20",
    duration: "60",
    description: "",
    location: "باشگاه",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [debugLog, setDebugLog] = useState(null);

  const set = (f, v) => {
    setForm((p) => ({ ...p, [f]: v }));
    setFieldErrors((p) => ({ ...p, [f]: null }));
  };

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/classes`),
      fetch(`${API_BASE_URL}/classes/trainers/list`),
    ]).then(async ([cRes, tRes]) => {
      const cData = await cRes.json();
      const tData = await tRes.json();
      if (cData.success) setSessions(cData.sessions || []);
      if (tData.success) setTrainers(tData.trainers || []);
    }).finally(() => setLoading(false));
  }, []);

  const reload = async () => {
    const res = await fetch(`${API_BASE_URL}/classes`);
    const data = await res.json();
    if (data.success) setSessions(data.sessions || []);
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return sessions;
    const q = search.trim().toLowerCase();
    return sessions.filter(
      (s) => s.title.toLowerCase().includes(q) || s.trainerId?.name?.toLowerCase().includes(q),
    );
  }, [sessions, search]);

  const resetForm = () => {
    setForm({ title: "", trainerId: "", date: "", time: "", capacity: "20", duration: "60", description: "", location: "باشگاه" });
    setEditId(null);
    setShowForm(false);
  };

  const openEdit = (s) => {
    setForm({
      title: s.title,
      trainerId: s.trainerId?._id || "",
      date: s.date ? new Date(s.date).toISOString().slice(0, 16) : "",
      time: s.time,
      capacity: String(s.capacity),
      duration: String(s.duration),
      description: s.description || "",
      location: s.location || "باشگاه",
    });
    setEditId(s._id);
    setShowForm(true);
  };

  const submit = async () => {
    const derivedTime = form.time || (form.date.includes("T") ? form.date.split("T")[1].slice(0, 5) : "");
    const errs = {};
    if (!form.title.trim()) errs.title = "عنوان الزامی است";
    if (!form.trainerId) errs.trainerId = "مربی الزامی است";
    if (!form.date) errs.date = "تاریخ و زمان الزامی است";
    if (!derivedTime) errs.time = "زمان الزامی است";
    if (!form.capacity || Number(form.capacity) < 1) errs.capacity = "ظرفیت باید حداقل ۱ باشد";
    if (!form.duration || Number(form.duration) < 15) errs.duration = "مدت باید حداقل ۱۵ دقیقه باشد";
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      Swal.fire({ icon: "warning", title: "خطاهای فرم", text: Object.values(errs).join("\n"), background: "#11141b", color: "#fff" });
      return;
    }
    setFieldErrors({});
    setDebugLog(null);
    setFormLoading(true);
    try {
      const payload = {
        ...form,
        date: new Date(form.date).toISOString(),
        time: derivedTime,
        capacity: Number(form.capacity),
        duration: Number(form.duration),
      };
      const url = editId
        ? `${API_BASE_URL}/classes/${editId}`
        : `${API_BASE_URL}/classes`;
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!data.success) {
        if (data.errors && Array.isArray(data.errors)) {
          const apiFieldErrs = {};
          data.errors.forEach((e) => { if (e.path) apiFieldErrs[e.path] = e.msg; });
          setFieldErrors(apiFieldErrs);
          setDebugLog(JSON.stringify(data, null, 2));
          throw new Error(data.errors.map((e) => e.msg).join("\n"));
        }
        throw new Error(data.message || "خطای ناشناخته");
      }
      await reload();
      resetForm();
      Swal.fire({ icon: "success", title: editId ? "ویرایش شد" : "کلاس ایجاد شد", background: "#11141b", color: "#fff" });
    } catch (err) {
      Swal.fire({ icon: "error", title: "خطا", text: err.message, background: "#11141b", color: "#fff" });
    } finally {
      setFormLoading(false);
    }
  };

  const deleteClass = async (id) => {
    const result = await Swal.fire({
      title: "حذف کلاس؟",
      text: "این عملیات قابل بازگشت نیست",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "حذف",
      cancelButtonText: "انصراف",
      background: "#11141b",
      color: "#fff",
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${API_BASE_URL}/classes/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      await reload();
    } catch (err) {
      Swal.fire({ icon: "error", title: "خطا", text: err.message, background: "#11141b", color: "#fff" });
    }
  };

  const viewDetail = async (id) => {
    const res = await fetch(`${API_BASE_URL}/classes/${id}`);
    const data = await res.json();
    if (data.success) setDetailSession(data.session);
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

  const formatDate = (d) => new Date(d).toLocaleDateString("fa-IR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <DashboardLayout>
      <div className="min-h-screen rounded-[2rem] bg-[var(--bg-body)] p-4 md:p-8" dir="rtl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-yellow-400 p-3 text-[var(--text-body)]"><CalendarDays size={24} /></div>
            <div>
              <h1 className="text-2xl font-black text-[var(--text-body)] md:text-3xl">مدیریت کلاس‌ها</h1>
              <p className="text-xs font-bold text-[var(--text-muted)] mt-0.5">{sessions.length} کلاس</p>
            </div>
          </div>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 rounded-2xl bg-yellow-400 px-5 py-2.5 text-sm font-black text-[var(--text-body)] transition-all hover:bg-yellow-500">
            <Plus size={18} /> کلاس جدید
          </button>
        </div>

        {showForm && (
          <div className="mb-6 rounded-[2rem] border border-[var(--border)] bg-[var(--bg-card)] p-5">
            <h2 className="mb-4 text-lg font-black text-[var(--text-body)]">{editId ? "ویرایش کلاس" : "ایجاد کلاس جدید"}</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block mb-1.5 text-xs font-bold text-[var(--text-dim)]">عنوان *</label>
                <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="مثال: پیلاتس صبحگاهی" className={`w-full rounded-2xl border px-4 py-2.5 text-sm text-[var(--text-body)] outline-none bg-[var(--bg-body)] ${fieldErrors.title ? "border-red-500" : "border-[var(--border)] focus:border-yellow-400"}`} />
                {fieldErrors.title && <p className="mt-1 text-[10px] text-red-400">❌ {fieldErrors.title}</p>}
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-bold text-[var(--text-dim)]">مربی *</label>
                <select value={form.trainerId} onChange={(e) => set("trainerId", e.target.value)} className={`w-full rounded-2xl border px-4 py-2.5 text-sm text-[var(--text-body)] outline-none bg-[var(--bg-body)] ${fieldErrors.trainerId ? "border-red-500" : "border-[var(--border)] focus:border-yellow-400"}`}>
                  <option value="">انتخاب مربی...</option>
                  {trainers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
                {fieldErrors.trainerId && <p className="mt-1 text-[10px] text-red-400">❌ {fieldErrors.trainerId}</p>}
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-bold text-[var(--text-dim)]">تاریخ و زمان *</label>
                <input type="datetime-local" value={form.date} onChange={(e) => set("date", e.target.value)} className={`w-full rounded-2xl border px-4 py-2.5 text-sm text-[var(--text-body)] outline-none bg-[var(--bg-body)] ${fieldErrors.date || fieldErrors.time ? "border-red-500" : "border-[var(--border)] focus:border-yellow-400"}`} />
                {(fieldErrors.date || fieldErrors.time) && <p className="mt-1 text-[10px] text-red-400">❌ {fieldErrors.date || fieldErrors.time}</p>}
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-bold text-[var(--text-dim)]">مدت (دقیقه)</label>
                <input type="number" min="15" value={form.duration} onChange={(e) => set("duration", e.target.value)} className={`w-full rounded-2xl border px-4 py-2.5 text-sm text-[var(--text-body)] outline-none bg-[var(--bg-body)] ${fieldErrors.duration ? "border-red-500" : "border-[var(--border)] focus:border-yellow-400"}`} />
                {fieldErrors.duration && <p className="mt-1 text-[10px] text-red-400">❌ {fieldErrors.duration}</p>}
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-bold text-[var(--text-dim)]">ظرفیت</label>
                <input type="number" min="1" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} className={`w-full rounded-2xl border px-4 py-2.5 text-sm text-[var(--text-body)] outline-none bg-[var(--bg-body)] ${fieldErrors.capacity ? "border-red-500" : "border-[var(--border)] focus:border-yellow-400"}`} />
                {fieldErrors.capacity && <p className="mt-1 text-[10px] text-red-400">❌ {fieldErrors.capacity}</p>}
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-bold text-[var(--text-dim)]">مکان</label>
                <input type="text" value={form.location} onChange={(e) => set("location", e.target.value)} className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-body)] px-4 py-2.5 text-sm text-[var(--text-body)] outline-none focus:border-yellow-400" />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block mb-1.5 text-xs font-bold text-[var(--text-dim)]">توضیحات</label>
                <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-body)] px-4 py-2.5 text-sm text-[var(--text-body)] outline-none focus:border-yellow-400" />
              </div>
            </div>
            {debugLog && (
              <details className="mt-3 rounded-2xl bg-red-900/10 border border-red-900/30 p-3">
                <summary className="text-xs font-bold text-red-400 cursor-pointer">نمایش خطای دیباگ</summary>
                <pre className="mt-2 text-[10px] text-red-300 whitespace-pre-wrap">{debugLog}</pre>
              </details>
            )}
            <div className="mt-4 flex gap-3">
              <button onClick={submit} disabled={formLoading} className="flex items-center gap-2 rounded-2xl bg-yellow-400 px-6 py-2.5 text-sm font-black text-[var(--text-body)] transition-all hover:bg-yellow-500 disabled:opacity-50">
                {formLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                {editId ? "ویرایش" : "ایجاد کلاس"}
              </button>
              <button onClick={resetForm} className="rounded-2xl border border-[var(--border)] px-6 py-2.5 text-sm font-black text-[var(--text-dim)] transition-all hover:bg-gray-800 hover:text-[var(--text-body)]">
                انصراف
              </button>
            </div>
          </div>
        )}

        <div className="mb-4 relative">
          <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجوی کلاس یا مربی..." className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] py-3 pr-10 pl-4 text-sm text-[var(--text-body)] outline-none focus:border-yellow-400" />
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)]">
              <CalendarDays size={48} className="mb-4 opacity-30" />
              <p className="text-lg font-black">کلاسی یافت نشد</p>
            </div>
          ) : filtered.map((s) => {
            const booked = s.attendees?.filter((a) => a.status === "booked").length || 0;
            const avail = Math.max(0, s.capacity - booked);
            const waiting = s.waitingList?.length || 0;
            return (
              <div key={s._id} className="rounded-[2rem] border border-[var(--border)] bg-[var(--bg-card)] p-4 transition-all hover:border-yellow-400/30">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-400">
                      <CalendarDays size={22} />
                    </div>
                    <div>
                      <h3 className="font-black text-[var(--text-body)]">{s.title}</h3>
                      <p className="mt-0.5 text-xs font-bold text-[var(--text-dim)]">
                        {s.trainerId?.name || "مربی: نامشخص"} • {s.time}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{formatDate(s.date)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`rounded-xl px-3 py-1 text-xs font-black ${avail > 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                      {avail > 0 ? `${avail} ظرفیت` : "تکمیل"}
                    </span>
                    {waiting > 0 && <span className="rounded-xl bg-yellow-400/10 px-3 py-1 text-xs font-black text-yellow-400">{waiting} صف</span>}
                    <button onClick={() => viewDetail(s._id)} className="rounded-xl bg-gray-800 p-2 text-[var(--text-dim)] transition-all hover:bg-gray-700 hover:text-[var(--text-body)]"><Eye size={16} /></button>
                    <button onClick={() => openEdit(s)} className="rounded-xl bg-gray-800 p-2 text-[var(--text-dim)] transition-all hover:bg-gray-700 hover:text-yellow-400"><Edit3 size={16} /></button>
                    <button onClick={() => deleteClass(s._id)} className="rounded-xl bg-gray-800 p-2 text-[var(--text-dim)] transition-all hover:bg-red-500/20 hover:text-red-400"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
                  <span className="flex items-center gap-1"><Clock size={12} /> {s.duration} دقیقه</span>
                  <span className="flex items-center gap-1"><MapPin size={12} /> {s.location}</span>
                  <span className="flex items-center gap-1"><Users size={12} /> {booked}/{s.capacity}</span>
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
                <p className="text-xs text-[var(--text-dim)] mt-1">مربی: {detailSession.trainerId?.name || "—"}</p>
                <p className="text-xs text-[var(--text-dim)]">{formatDate(detailSession.date)} ساعت {detailSession.time}</p>
                <p className="text-xs text-[var(--text-dim)]">{detailSession.duration} دقیقه • {detailSession.location}</p>
                {detailSession.description && <p className="mt-2 text-xs text-[var(--text-muted)]">{detailSession.description}</p>}
              </div>
              <h3 className="font-black text-[var(--text-body)]">شرکت‌کنندگان ({detailSession.attendees?.filter((a) => a.status !== "cancelled").length || 0})</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(detailSession.attendees || []).filter((a) => a.status !== "cancelled").map((a) => (
                  <div key={a._id} className={`rounded-xl p-3 flex items-center justify-between ${a.status === "attended" ? "bg-green-500/10" : "bg-[var(--bg-hover)]/50"}`}>
                    <span className="text-[var(--text-body)] font-bold text-xs">{a.userId?.name || "کاربر"}</span>
                    <span className={`text-[10px] font-black ${a.status === "attended" ? "text-green-400" : "text-yellow-400"}`}>
                      {a.status === "attended" ? "حاضر" : "رزرو شده"}
                    </span>
                  </div>
                ))}
              </div>
              {detailSession.waitingList?.length > 0 && (
                <>
                  <h3 className="font-black text-[var(--text-body)] mt-2">صف انتظار ({detailSession.waitingList.length})</h3>
                  <div className="space-y-2">
                    {detailSession.waitingList.map((w) => (
                      <div key={w._id} className="rounded-xl bg-yellow-400/5 p-3">
                        <span className="text-[var(--text-body)] font-bold text-xs">{w.userId?.name || "کاربر"}</span>
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

"use client";

import React, { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../layout";
import { API_BASE_URL } from "@/config/api";
import {
  Users,
  Search,
  X,
  Dumbbell,
  Calendar,
  Clock,
  Activity,
  UserCheck,
  AlertTriangle,
  ChevronLeft,
  Zap,
} from "lucide-react";

const DAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"];

export default function MyStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const raw = typeof window !== "undefined" ? sessionStorage.getItem("currentUser") : null;
      const currentUser = raw ? JSON.parse(raw) : null;
      if (!currentUser?._id) return;
      const res = await fetch(`${API_BASE_URL}/programs/trainer/${currentUser._id}/students`);
      const data = await res.json();
      if (data.success) setStudents(data.students || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = students;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((s) => s.name?.toLowerCase().includes(q) || s.employeeCode?.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") {
      list = list.filter((s) => {
        if (statusFilter === "active") return s.membershipStatus === "Active";
        if (statusFilter === "inactive") return s.membershipStatus !== "Active";
        return true;
      });
    }
    return list;
  }, [students, search, statusFilter]);

  const lastActivity = (date) => {
    if (!date) return "ثبت نشده";
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "امروز";
    if (diff === 1) return "دیروز";
    return `${diff} روز پیش`;
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 min-h-screen bg-[var(--bg-body)] rounded-[2.5rem] border border-[var(--border)] shadow-2xl" dir="rtl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-yellow-400 text-[var(--text-body)] rounded-2xl shadow-lg">
            <Users size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-[var(--text-body)] uppercase tracking-tight">ورزشکاران من</h2>
            <p className="text-[var(--text-muted)] text-xs mt-1 uppercase tracking-widest">My Students</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو بر اساس نام یا کد..."
              className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl py-3 pr-12 pl-4 text-[var(--text-body)] text-sm outline-none focus:border-yellow-400 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-body)]">
                <X size={16} />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {[
              { key: "all", label: "همه" },
              { key: "active", label: "عضویت فعال" },
              { key: "inactive", label: "بدون عضویت" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${
                  statusFilter === f.key
                    ? "bg-yellow-400 text-[var(--text-body)]"
                    : "bg-[var(--bg-card)] text-[var(--text-dim)] border border-[var(--border)] hover:border-yellow-400/40"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <SkeletonGrid />
        ) : filtered.length === 0 ? (
          <EmptyState search={search} statusFilter={statusFilter} total={students.length} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((s) => (
              <StudentCard key={s._id} student={s} onSelect={() => setSelectedStudent(s)} lastActivity={lastActivity} />
            ))}
          </div>
        )}
      </div>

      {selectedStudent && (
        <StudentDetailPanel student={selectedStudent} onClose={() => setSelectedStudent(null)} lastActivity={lastActivity} />
      )}
    </DashboardLayout>
  );
}

function StudentCard({ student, onSelect, lastActivity }) {
  const isActive = student.membershipStatus === "Active";
  return (
    <div
      onClick={onSelect}
      className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] hover:border-yellow-400/60 transition-all shadow-xl overflow-hidden cursor-pointer group"
    >
      <div className="p-5 border-b border-[var(--border)] flex items-center gap-3">
        <div className="w-12 h-12 flex items-center justify-center bg-gray-800 rounded-xl text-yellow-400 font-black text-lg border border-[var(--border)] shrink-0">
          {student.name?.charAt(0) || "?"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[var(--text-body)] font-black leading-tight truncate">{student.name || "—"}</p>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{student.employeeCode || "—"}</p>
        </div>
      </div>

      <div className="p-5 space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-[var(--text-muted)] text-xs">وضعیت عضویت</span>
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black ${
            isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-400" : "bg-red-400"}`} />
            {isActive ? "فعال" : "غیرفعال"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[var(--text-muted)] text-xs">آخرین حضور</span>
          <span className="text-[var(--text-dim)] text-xs font-bold flex items-center gap-1">
            <Clock size={12} className="text-[var(--text-muted)]" />
            {lastActivity(student.lastAttendance)}
          </span>
        </div>

        {student.activeProgramTitle && (
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)] text-xs">برنامه</span>
            <span className="text-yellow-400 text-xs font-black truncate max-w-[160px]">{student.activeProgramTitle}</span>
          </div>
        )}

        {student.bmi && (
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)] text-xs">BMI</span>
            <span className="text-[var(--text-body)] font-black text-xs">{student.bmi}</span>
          </div>
        )}

        <div className="pt-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[var(--text-muted)] text-xs">پیشرفت</span>
            <span className={`text-xs font-black ${student.progressScore >= 70 ? "text-green-400" : student.progressScore >= 40 ? "text-yellow-400" : "text-red-400"}`}>
              {student.progressScore}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-[var(--bg-hover)] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                student.progressScore >= 70 ? "bg-green-400" : student.progressScore >= 40 ? "bg-yellow-400" : "bg-red-400"
              }`}
              style={{ width: `${student.progressScore}%` }}
            />
          </div>
        </div>
      </div>

      <div className="px-5 pb-5">
        <div className="flex items-center justify-center gap-2 text-yellow-400 text-xs font-black group-hover:gap-3 transition-all">
          مشاهده جزئیات <ChevronLeft size={14} />
        </div>
      </div>
    </div>
  );
}

function StudentDetailPanel({ student, onClose, lastActivity }) {
  const isActive = student.membershipStatus === "Active";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-[var(--bg-overlay)]/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[var(--bg-body)] border-r border-[var(--border)] h-full overflow-y-auto animate-slide-in">
        <div className="sticky top-0 bg-[var(--bg-body)] border-b border-[var(--border)] p-4 flex items-center justify-between z-10">
          <h3 className="text-lg font-black text-[var(--text-body)]">جزئیات ورزشکار</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-800 text-[var(--text-dim)] hover:text-[var(--text-body)] transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 flex items-center justify-center bg-gray-800 rounded-2xl text-yellow-400 font-black text-2xl border border-[var(--border)]">
              {student.name?.charAt(0) || "?"}
            </div>
            <div>
              <h2 className="text-2xl font-black text-[var(--text-body)]">{student.name}</h2>
              <p className="text-[var(--text-muted)] text-sm">{student.employeeCode}</p>
              {student.email && <p className="text-[var(--text-muted)] text-xs mt-0.5">{student.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InfoBox label="عضویت" value={isActive ? "فعال" : "غیرفعال"} color={isActive ? "text-green-400" : "text-red-400"} />
            <InfoBox label="BMI" value={student.bmi || "—"} />
            <InfoBox label="قد" value={student.height ? `${student.height} cm` : "—"} />
            <InfoBox label="وزن" value={student.weight ? `${student.weight} kg` : "—"} />
          </div>

          <div className="bg-[var(--bg-card)] rounded-2xl p-4 space-y-3">
            <h4 className="text-[var(--text-body)] font-black text-sm">فعالیت</h4>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)] text-xs">آخرین حضور</span>
              <span className="text-[var(--text-dim)] text-xs font-bold">{lastActivity(student.lastAttendance)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)] text-xs">پایان عضویت</span>
              <span className="text-[var(--text-dim)] text-xs font-bold">
                {student.membershipEndDate ? new Date(student.membershipEndDate).toLocaleDateString("fa-IR") : "—"}
              </span>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] rounded-2xl p-4 space-y-3">
            <h4 className="text-[var(--text-body)] font-black text-sm">پیشرفت تمرینی</h4>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--text-muted)] text-xs">امتیاز کلی</span>
              <span className={`text-lg font-black ${student.progressScore >= 70 ? "text-green-400" : student.progressScore >= 40 ? "text-yellow-400" : "text-red-400"}`}>
                {student.progressScore}%
              </span>
            </div>
            <div className="h-2 w-full bg-[var(--bg-hover)] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  student.progressScore >= 70 ? "bg-green-400" : student.progressScore >= 40 ? "bg-yellow-400" : "bg-red-400"
                }`}
                style={{ width: `${student.progressScore}%` }}
              />
            </div>
          </div>

          {student.activeProgramTitle && (
            <div className="bg-[var(--bg-card)] rounded-2xl p-4 space-y-3">
              <h4 className="text-[var(--text-body)] font-black text-sm">برنامه فعال</h4>
              <p className="text-yellow-400 font-black">{student.activeProgramTitle}</p>
            </div>
          )}

          {student.goals?.length > 0 && (
            <div className="bg-[var(--bg-card)] rounded-2xl p-4 space-y-3">
              <h4 className="text-[var(--text-body)] font-black text-sm">اهداف</h4>
              <div className="flex flex-wrap gap-2">
                {student.goals.map((g, i) => (
                  <span key={i} className="bg-[var(--bg-hover)] text-[var(--text-dim)] px-3 py-1 rounded-xl text-xs font-bold border border-[var(--border)]">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value, color = "text-[var(--text-body)]" }) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4">
      <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-wider">{label}</p>
      <p className={`text-lg font-black mt-0.5 ${color}`}>{value}</p>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] overflow-hidden animate-pulse">
          <div className="p-5 border-b border-[var(--border)] flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gray-800" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-800 rounded w-2/3" />
              <div className="h-3 bg-gray-800 rounded w-1/3" />
            </div>
          </div>
          <div className="p-5 space-y-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="h-3 bg-gray-800 rounded w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ search, statusFilter, total }) {
  const hasFilters = search || statusFilter !== "all";
  return (
    <div className="flex flex-col items-center justify-center py-24 text-[var(--text-muted)]">
      <Users size={64} className="mb-6 opacity-40" />
      {hasFilters ? (
        <>
          <p className="font-black text-xl italic">نتیجه‌ای یافت نشد</p>
          <p className="text-sm mt-2 text-[var(--text-muted)]">
            {total === 0 ? "هنوز ورزشکاری به شما اختصاص داده نشده" : "فیلترها را تغییر دهید"}
          </p>
        </>
      ) : (
        <>
          <p className="font-black text-xl italic">هنوز ورزشکاری وجود ندارد</p>
          <p className="text-sm mt-2 text-[var(--text-muted)]">پس از ثبت درخواست تمرین توسط کاربران و تایید آن، ورزشکاران شما در این بخش نمایش داده می‌شوند</p>
        </>
      )}
    </div>
  );
}

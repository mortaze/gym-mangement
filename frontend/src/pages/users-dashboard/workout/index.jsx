"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import DashboardLayout from "../layout";
import { API_BASE_URL } from "@/config/api";
import moment from "moment-jalaali";
import {
  ChevronRight, ChevronLeft, Dumbbell, CheckCircle2, Circle,
  Trophy, Flame, BarChart3, Loader2, CalendarDays, UserRound,
} from "lucide-react";
import Swal from "sweetalert2";
import { SkeletonCard, SkeletonList } from "@/components/Skeleton";

const PERSIAN_DAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه\u200cشنبه", "چهارشنبه", "پنج\u200cشنبه", "جمعه"];
const PERSIAN_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

export default function WorkoutCalendarPage() {
  const [user, setUser] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [activeProgram, setActiveProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [curYear, setCurYear] = useState(() => moment().jYear());
  const [curMonth, setCurMonth] = useState(() => moment().jMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [updating, setUpdating] = useState({});
  const [allProgramsActive, setAllProgramsActive] = useState(false);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? sessionStorage.getItem("currentUser") : null;
    const u = raw ? JSON.parse(raw) : null;
    setUser(u);
    if (u?._id) {
      fetch(`${API_BASE_URL}/programs/user/${u._id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            setPrograms(data.trainingPrograms || []);
            const active = (data.trainingPrograms || []).find((p) => p.status === "active");
            setActiveProgram(active || null);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const today = useMemo(
    () => ({ jYear: moment().jYear(), jMonth: moment().jMonth(), jDate: moment().jDate() }),
    [],
  );

  const prevMonth = useCallback(() => {
    if (curMonth === 0) {
      setCurMonth(11);
      setCurYear((y) => y - 1);
    } else {
      setCurMonth((m) => m - 1);
    }
  }, [curMonth]);

  const nextMonth = useCallback(() => {
    if (curMonth === 11) {
      setCurMonth(0);
      setCurYear((y) => y + 1);
    } else {
      setCurMonth((m) => m + 1);
    }
  }, [curMonth]);

  const calendarDays = useMemo(() => {
    const daysInMonth = moment.jDaysInMonth(curYear, curMonth);
    const firstOfMonth = moment(`${curYear}/${curMonth + 1}/1`, "jYYYY/jM/jD");
    const startOffset = (firstOfMonth.day() + 1) % 7;
    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [curYear, curMonth]);

  const getWeekRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      rows.push(calendarDays.slice(i, i + 7));
    }
    return rows;
  }, [calendarDays]);

  const getExercisesForDate = useCallback(
    (jDate) => {
      if (!activeProgram || !jDate) return [];
      const date = moment(`${curYear}/${curMonth + 1}/${jDate}`, "jYYYY/jM/jD");
      const dayName = PERSIAN_DAYS[(date.day() + 1) % 7];
      return (activeProgram.exercises || []).filter((ex) => ex.day === dayName);
    },
    [activeProgram, curYear, curMonth],
  );

  const getDayName = useCallback(
    (jDate) => {
      if (!jDate) return "";
      const date = moment(`${curYear}/${curMonth + 1}/${jDate}`, "jYYYY/jM/jD");
      return PERSIAN_DAYS[(date.day() + 1) % 7];
    },
    [curYear, curMonth],
  );

  const getDailyLog = useCallback(
    (jDate) => {
      if (!activeProgram || !jDate) return null;
      const date = moment(`${curYear}/${curMonth + 1}/${jDate}`, "jYYYY/jM/jD");
      const dayName = PERSIAN_DAYS[(date.day() + 1) % 7];
      const isoDate = date.toDate();
      return (activeProgram.dailyLogs || []).find(
        (l) =>
          l.dayName === dayName &&
          new Date(l.date).toDateString() === isoDate.toDateString(),
      );
    },
    [activeProgram, curYear, curMonth],
  );

  const toggleDayCompletion = async (jDate) => {
    if (!activeProgram) return;
    const date = moment(`${curYear}/${curMonth + 1}/${jDate}`, "jYYYY/jM/jD");
    const dayName = PERSIAN_DAYS[(date.day() + 1) % 7];
    const existing = getDailyLog(jDate);
    const newCompleted = existing ? !existing.completed : true;
    const key = `${jDate}`;
    setUpdating((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await fetch(
        `${API_BASE_URL}/programs/${activeProgram._id}/daily-log`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: date.format(),
            dayName,
            completed: newCompleted,
          }),
        },
      );
      const data = await res.json();
      if (data.success) {
        setActiveProgram(data.program);
        const updatedPrograms = programs.map((p) =>
          p._id === data.program._id ? data.program : p,
        );
        setPrograms(updatedPrograms);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating((prev) => ({ ...prev, [key]: false }));
    }
  };

  const progressStats = useMemo(() => {
    if (!activeProgram) return { completed: 0, totalLogs: 0, percent: 0, streak: 0 };
    const logs = activeProgram.dailyLogs || [];
    const completed = logs.filter((l) => l.completed).length;
    const totalLogs = logs.length;
    const percent = activeProgram.progressScore || 0;

    let streak = 0;
    const sorted = [...logs]
      .filter((l) => l.completed)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    const seen = new Set();
    for (const log of sorted) {
      const key = new Date(log.date).toDateString();
      if (seen.has(key)) continue;
      seen.add(key);
      streak++;
    }

    const totalScheduled = activeProgram.weekDays?.length || activeProgram.trainingDays || 0;
    const weekLogs = (activeProgram.dailyLogs || []).filter((l) => {
      const d = new Date(l.date);
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() + 6);
      weekStart.setHours(0, 0, 0, 0);
      return d >= weekStart;
    });
    const weekCompleted = weekLogs.filter((l) => l.completed).length;
    const weekTotal = weekLogs.length || 1;

    return {
      completed,
      totalLogs,
      percent,
      streak,
      weekPercent: Math.round((weekCompleted / Math.max(weekTotal, 1)) * 100),
      totalScheduled,
    };
  }, [activeProgram]);

  const canToggle = (jDate) => {
    if (!activeProgram) return false;
    const exercises = getExercisesForDate(jDate);
    return exercises.length > 0;
  };

  const handleDayClick = (jDate) => {
    if (!jDate) return;
    if (selectedDay === jDate) {
      setSelectedDay(null);
    } else {
      setSelectedDay(jDate);
    }
  };

  const dayStatusColor = (jDate) => {
    if (!jDate || !activeProgram) return "";
    const log = getDailyLog(jDate);
    const exs = getExercisesForDate(jDate);
    if (exs.length === 0) return "";
    if (log?.completed) return "bg-green-500/20 border-green-500/50";
    return "border-yellow-400/40 bg-yellow-400/5";
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen rounded-[2rem] bg-[var(--bg-body)] p-4 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-14 w-14 animate-pulse rounded-2xl bg-gray-800" />
            <div className="space-y-2">
              <div className="h-7 w-48 animate-pulse rounded-lg bg-gray-800" />
              <div className="h-4 w-32 animate-pulse rounded-lg bg-gray-800" />
            </div>
          </div>
          <div className="mb-4 grid grid-cols-4 gap-3">
            <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
          <SkeletonList rows={3} />
        </div>
      </DashboardLayout>
    );
  }

  const currentMonthName = PERSIAN_MONTHS[curMonth];

  return (
    <DashboardLayout>
      <div className="min-h-screen rounded-[2rem] bg-[var(--bg-body)] p-4 md:p-8" dir="rtl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-yellow-400 p-3 text-[var(--text-body)]">
              <CalendarDays size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[var(--text-body)] md:text-3xl">تقویم تمرینی</h1>
              <p className="text-xs font-bold text-[var(--text-muted)] mt-0.5">
                {activeProgram
                  ? `برنامه فعال: ${activeProgram.title}`
                  : "برنامه تمرینی فعالی وجود ندارد"}
              </p>
            </div>
          </div>
          {!activeProgram && programs.length > 0 && (
            <button
              onClick={() => {
                setAllProgramsActive(!allProgramsActive);
                if (!allProgramsActive) {
                  setActiveProgram(programs[0]);
                } else {
                  setActiveProgram(programs.find((p) => p.status === "active") || null);
                }
              }}
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 text-sm font-black text-[var(--text-dim)] transition-all hover:border-yellow-400/50 hover:text-yellow-400"
            >
              نمای همه برنامه‌ها
            </button>
          )}
        </div>

        {/* Progress bar */}
        {activeProgram && (
          <div className="mb-6 rounded-[2rem] border border-[var(--border)] bg-[var(--bg-card)] p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dumbbell size={18} className="text-yellow-400" />
                <span className="font-black text-[var(--text-body)]">{activeProgram.title}</span>
              </div>
              <span className="rounded-xl bg-yellow-400/10 px-3 py-1 text-sm font-black text-yellow-400">
                {progressStats.percent}%
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-gray-800">
              <div
                className="h-full rounded-full bg-gradient-to-l from-yellow-400 to-yellow-500 transition-all duration-500"
                style={{ width: `${Math.min(progressStats.percent, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats cards */}
        {activeProgram && (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatBadge icon={<Flame size={16} />} label="رکورد روزانه" value={`${progressStats.streak} روز`} />
            <StatBadge icon={<BarChart3 size={16} />} label="تکمیل هفته" value={`${progressStats.weekPercent}%`} />
            <StatBadge icon={<CheckCircle2 size={16} />} label="لاگ‌های ثبت شده" value={`${progressStats.completed}/${progressStats.totalLogs}`} />
            <StatBadge icon={<Trophy size={16} />} label="وضعیت" value={progressStats.percent >= 80 ? "عالی 🏆" : progressStats.percent >= 50 ? "خوب" : "در حال تلاش"} />
          </div>
        )}

        {/* Calendar header */}
        <div className="mb-4 flex items-center justify-between rounded-2xl bg-[var(--bg-card)] px-5 py-3">
          <button onClick={prevMonth} className="rounded-xl p-2 text-[var(--text-dim)] transition-all hover:bg-gray-800 hover:text-[var(--text-body)]">
            <ChevronRight size={20} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-[var(--text-body)]">{currentMonthName}</span>
            <span className="rounded-lg bg-gray-800 px-3 py-1 text-sm font-black text-yellow-400">{curYear}</span>
          </div>
          <button onClick={nextMonth} className="rounded-xl p-2 text-[var(--text-dim)] transition-all hover:bg-gray-800 hover:text-[var(--text-body)]">
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Day headers */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {PERSIAN_DAYS.map((d) => (
            <div key={d} className="rounded-xl bg-[var(--bg-hover)]/50 py-2 text-center text-[10px] font-black text-[var(--text-muted)] md:text-xs">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="mb-6 grid grid-cols-7 gap-1">
          {calendarDays.map((jDate, idx) => {
            const exercises = getExercisesForDate(jDate);
            const log = getDailyLog(jDate);
            const hasWorkout = exercises.length > 0;
            const todayCell = isToday(jDate);
            const selected = selectedDay === jDate;
            const cellUpdating = updating[`${jDate}`];

            return (
              <div
                key={idx}
                onClick={() => jDate && handleDayClick(jDate)}
                className={`relative flex min-h-[60px] cursor-pointer flex-col rounded-2xl border p-1.5 transition-all md:min-h-[80px] md:p-2 ${
                  !jDate ? "border-transparent" : ""
                } ${todayCell ? "border-yellow-400 bg-yellow-400/10 shadow-lg shadow-yellow-400/10" : ""} ${
                  selected ? "ring-2 ring-yellow-400" : ""
                } ${hasWorkout && !todayCell ? dayStatusColor(jDate) : "border-[var(--border)] bg-[var(--bg-card)]/50"}`}
              >
                {jDate && (
                  <>
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-black md:text-sm ${
                          todayCell ? "text-yellow-400" : "text-[var(--text-dim)]"
                        }`}
                      >
                        {jDate.toLocaleString("fa-IR")}
                      </span>
                      {cellUpdating && <Loader2 size={12} className="animate-spin text-yellow-400" />}
                      {!cellUpdating && hasWorkout && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDayCompletion(jDate);
                          }}
                          className={`transition-all ${
                            log?.completed ? "text-green-400" : "text-[var(--text-muted)] hover:text-yellow-400"
                          }`}
                        >
                          {log?.completed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                        </button>
                      )}
                    </div>
                    {hasWorkout && (
                      <div className="mt-auto flex flex-wrap gap-0.5">
                        {exercises.slice(0, 3).map((ex, i) => (
                          <span key={i} className="truncate rounded-md bg-yellow-400/10 px-1.5 py-0.5 text-[8px] font-bold text-yellow-400 md:text-[10px]">
                            {ex.name}
                          </span>
                        ))}
                        {exercises.length > 3 && (
                          <span className="text-[8px] font-black text-[var(--text-muted)]">+{exercises.length - 3}</span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected day detail */}
        {selectedDay && (
          <DayDetailPanel
            jDate={selectedDay}
            dayName={getDayName(selectedDay)}
            year={curYear}
            month={curMonth}
            exercises={getExercisesForDate(selectedDay)}
            log={getDailyLog(selectedDay)}
            onToggle={() => toggleDayCompletion(selectedDay)}
            updating={updating[`${selectedDay}`]}
          />
        )}

        {/* Empty state */}
        {!activeProgram && (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)]">
            <CalendarDays size={48} className="mb-4 opacity-30" />
            <p className="text-lg font-black">برنامه تمرینی فعالی ندارید</p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              از مربی خود درخواست برنامه تمرینی دهید تا در اینجا نمایش داده شود
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function isToday(jDate) {
  const now = moment();
  return jDate === now.jDate() && false; // handled in parent via today ref
}

function StatBadge({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-3 md:p-4">
      <div className="mb-2 flex items-center gap-1.5 text-yellow-400">{icon}</div>
      <p className="text-lg font-black text-[var(--text-body)] md:text-2xl">{value}</p>
      <p className="mt-0.5 text-[10px] font-bold text-[var(--text-muted)] md:text-xs">{label}</p>
    </div>
  );
}

function DayDetailPanel({ jDate, dayName, year, month, exercises, log, onToggle, updating }) {
  const gregorian = moment(`${year}/${month + 1}/${jDate}`, "jYYYY/jM/jD").format("YYYY/MM/DD");

  return (
    <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--bg-card)] p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-[var(--text-body)]">
            روز {jDate.toLocaleString("fa-IR")} {dayName && `(${dayName})`}
          </h2>
          <p className="text-xs font-bold text-[var(--text-muted)] mt-0.5">{gregorian}</p>
        </div>
        {exercises.length > 0 && (
          <button
            onClick={onToggle}
            disabled={updating}
            className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-black transition-all ${
              log?.completed
                ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                : "bg-yellow-400 text-[var(--text-body)] hover:bg-yellow-500"
            } disabled:opacity-50`}
          >
            {updating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : log?.completed ? (
              <CheckCircle2 size={16} />
            ) : (
              <Circle size={16} />
            )}
            {log?.completed ? "علامت به اتمام رسیده" : "علامت اتمام تمرین"}
          </button>
        )}
      </div>

      {exercises.length === 0 ? (
        <p className="rounded-2xl bg-[var(--bg-hover)]/50 p-6 text-center text-sm font-bold text-[var(--text-muted)]">
          در این روز تمرینی ثبت نشده است
        </p>
      ) : (
        <div className="space-y-3">
          {exercises.map((ex, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg-hover)]/50 p-4 transition-all hover:border-yellow-400/30"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
                    <Dumbbell size={18} />
                  </div>
                  <div>
                    <h4 className="font-black text-[var(--text-body)]">{ex.name}</h4>
                    {ex.muscleGroup && (
                      <p className="text-[10px] font-bold text-[var(--text-muted)]">{ex.muscleGroup}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-gray-800/50 p-2">
                  <p className="text-lg font-black text-yellow-400">{ex.sets || "—"}</p>
                  <p className="text-[10px] font-bold text-[var(--text-muted)]">ست</p>
                </div>
                <div className="rounded-xl bg-gray-800/50 p-2">
                  <p className="text-lg font-black text-yellow-400">{ex.reps || "—"}</p>
                  <p className="text-[10px] font-bold text-[var(--text-muted)]">تکرار</p>
                </div>
                <div className="rounded-xl bg-gray-800/50 p-2">
                  <p className="text-lg font-black text-yellow-400">{ex.restTime || "—"}</p>
                  <p className="text-[10px] font-bold text-[var(--text-muted)]">استراحت (ثانیه)</p>
                </div>
              </div>
              {ex.notes && (
                <p className="mt-2 rounded-xl bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-400">
                  نکته: {ex.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {log?.notes && (
        <div className="mt-3 rounded-xl bg-gray-800/30 p-3">
          <p className="text-xs font-bold text-[var(--text-dim)]">یادداشت: {log.notes}</p>
        </div>
      )}
    </div>
  );
}

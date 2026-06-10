"use client";

import React, { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../layout";
import { API_BASE_URL } from "@/config/api";
import {
  Dumbbell,
  Save,
  Copy,
  Check,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
  Search,
  AlertTriangle,
  FileText,
  UserCheck,
} from "lucide-react";
import Swal from "sweetalert2";

const ALL_DAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"];

const emptyExercise = { name: "", muscleGroup: "", sets: "3", reps: "12", restTime: "60", notes: "" };

export default function WorkoutBuilderPage() {
  const [trainer, setTrainer] = useState(null);
  const [students, setStudents] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    athleteId: "",
    athleteName: "",
    title: "",
    durationWeeks: 4,
    weekDays: [],
    exercises: {},
  });

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  useEffect(() => {
    const raw = typeof window !== "undefined" ? sessionStorage.getItem("currentUser") : null;
    const u = raw ? JSON.parse(raw) : null;
    setTrainer(u);
    if (u?._id) {
      Promise.all([
        fetch(`${API_BASE_URL}/programs/trainer/${u._id}/students`),
        fetch(`${API_BASE_URL}/programs/trainer/${u._id}`),
      ]).then(async ([sRes, pRes]) => {
        const sData = await sRes.json();
        const pData = await pRes.json();
        if (sData.success) setStudents(sData.students || []);
        if (pData.success) setTemplates(pData.programs.filter((p) => p.isTemplate) || []);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const selectedDays = form.weekDays;

  const toggleDay = (day) => {
    const next = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];
    const exercises = { ...form.exercises };
    if (!next.includes(day)) {
      delete exercises[day];
    } else if (!exercises[day]) {
      exercises[day] = [{ ...emptyExercise }];
    }
    setForm((prev) => ({ ...prev, weekDays: next, exercises }));
  };

  const addExercise = (day) => {
    const exercises = { ...form.exercises };
    exercises[day] = [...(exercises[day] || []), { ...emptyExercise }];
    set("exercises", exercises);
  };

  const updateExercise = (day, idx, field, value) => {
    const exercises = { ...form.exercises };
    exercises[day] = [...exercises[day]];
    exercises[day][idx] = { ...exercises[day][idx], [field]: value };
    set("exercises", exercises);
  };

  const removeExercise = (day, idx) => {
    const exercises = { ...form.exercises };
    exercises[day] = exercises[day].filter((_, i) => i !== idx);
    if (exercises[day].length === 0) delete exercises[day];
    set("exercises", exercises);
  };

  const moveExercise = (day, idx, dir) => {
    const exercises = { ...form.exercises };
    const arr = [...exercises[day]];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    exercises[day] = arr;
    set("exercises", exercises);
  };

  const selectAthlete = (id, name) => {
    set("athleteId", id);
    set("athleteName", name);
  };

  const loadTemplate = (tmpl) => {
    const exByDay = {};
    (tmpl.exercises || []).forEach((ex) => {
      const d = ex.day || "شنبه";
      if (!exByDay[d]) exByDay[d] = [];
      exByDay[d].push({
        name: ex.name || "",
        muscleGroup: ex.muscleGroup || "",
        sets: ex.sets || "3",
        reps: ex.reps || "12",
        restTime: ex.restTime || "60",
        notes: ex.notes || "",
      });
    });
    const weekDays = tmpl.weekDays?.length ? tmpl.weekDays : Object.keys(exByDay);
    setForm({
      athleteId: "",
      athleteName: "",
      title: tmpl.title || "",
      durationWeeks: tmpl.durationWeeks || 4,
      weekDays,
      exercises: exByDay,
    });
    setShowTemplates(false);
  };

  const countTotalExercises = useMemo(() => {
    return Object.values(form.exercises).reduce((sum, exs) => sum + exs.length, 0);
  }, [form.exercises]);

  const validate = () => {
    if (!form.athleteId) { Swal.fire({ icon: "warning", title: "لطفاً یک ورزشکار انتخاب کنید", background: "#11141b", color: "#fff" }); return false; }
    if (!form.title.trim()) { Swal.fire({ icon: "warning", title: "عنوان برنامه را وارد کنید", background: "#11141b", color: "#fff" }); return false; }
    if (form.weekDays.length === 0) { Swal.fire({ icon: "warning", title: "حداقل یک روز تمرینی انتخاب کنید", background: "#11141b", color: "#fff" }); return false; }
    if (countTotalExercises === 0) { Swal.fire({ icon: "warning", title: "حداقل یک تمرین اضافه کنید", background: "#11141b", color: "#fff" }); return false; }
    for (const day of form.weekDays) {
      const dayExs = form.exercises[day] || [];
      for (let i = 0; i < dayExs.length; i++) {
        if (!dayExs[i].name.trim()) {
          Swal.fire({ icon: "warning", title: `روز ${day} — تمرین ${i + 1} نام ندارد`, background: "#11141b", color: "#fff" });
          return false;
        }
      }
    }
    return true;
  };

  const buildPayload = (asTemplate = false) => {
    const flatExercises = form.weekDays.flatMap((day) =>
      (form.exercises[day] || []).map((ex) => ({
        day,
        name: ex.name.trim(),
        muscleGroup: ex.muscleGroup?.trim() || "",
        sets: ex.sets,
        reps: ex.reps,
        restTime: ex.restTime,
        notes: ex.notes?.trim() || "",
      }))
    );

    return {
      userId: asTemplate ? form.athleteId : form.athleteId,
      trainerId: trainer._id,
      requestId: null,
      title: form.title.trim(),
      trainingDays: form.weekDays.length,
      weekDays: form.weekDays,
      exercises: flatExercises,
      isTemplate: asTemplate,
    };
  };

  const submit = async (asTemplate = false) => {
    if (!validate()) return;
    if (!trainer?._id) return;
    setSaving(true);
    try {
      const payload = buildPayload(asTemplate);
      const res = await fetch(`${API_BASE_URL}/programs/training`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      await Swal.fire({
        icon: "success",
        title: asTemplate ? "قالب ذخیره شد" : "برنامه تمرینی با موفقیت ثبت شد",
        text: asTemplate ? "" : `برای ${form.athleteName}`,
        background: "#11141b",
        color: "#fff",
      });

      if (!asTemplate) {
        setForm({ athleteId: "", athleteName: "", title: "", durationWeeks: 4, weekDays: [], exercises: {} });
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "خطا", text: err.message, background: "#11141b", color: "#fff" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-24 text-yellow-400 font-black animate-pulse">
          <Dumbbell size={52} className="mb-4 animate-bounce" />
          در حال بارگذاری...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 min-h-screen bg-[var(--bg-body)] rounded-[2.5rem] border border-[var(--border)] shadow-2xl" dir="rtl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-yellow-400 text-[var(--text-body)] rounded-2xl shadow-lg">
            <Dumbbell size={28} />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-black text-[var(--text-body)] uppercase tracking-tight">برنامه‌ساز تمرینی</h2>
            <p className="text-[var(--text-muted)] text-xs mt-1 uppercase tracking-widest">Workout Program Builder</p>
          </div>
          {templates.length > 0 && (
            <button onClick={() => setShowTemplates(true)} className="bg-gray-800 hover:bg-gray-700 text-[var(--text-body)] px-4 py-3 rounded-2xl font-black text-sm flex items-center gap-2 transition-all">
              <FileText size={16} /> قالب‌ها ({templates.length})
            </button>
          )}
        </div>

        <div className="space-y-6">
          <Section title="مشخصات برنامه" icon={<FileText size={18} />}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[var(--text-dim)] text-sm font-bold mb-1.5">ورزشکار *</label>
                <AthleteSelector students={students} value={form.athleteId} onSelect={selectAthlete} />
              </div>
              <div>
                <label className="block text-[var(--text-dim)] text-sm font-bold mb-1.5">عنوان برنامه *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="مثال: برنامه حرفه ای حجمی"
                  className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl py-3 px-4 text-[var(--text-body)] text-sm outline-none focus:border-yellow-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-[var(--text-dim)] text-sm font-bold mb-1.5">مدت (هفته)</label>
                <input
                  type="number"
                  min="1"
                  max="52"
                  value={form.durationWeeks}
                  onChange={(e) => set("durationWeeks", Math.max(1, Number(e.target.value)))}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl py-3 px-4 text-[var(--text-body)] text-sm outline-none focus:border-yellow-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[var(--text-dim)] text-sm font-bold mb-2 mt-4">روزهای تمرین *</label>
              <div className="flex flex-wrap gap-2">
                {ALL_DAYS.map((day) => {
                  const active = selectedDays.includes(day);
                  return (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-black transition-all ${
                        active
                          ? "bg-yellow-400 text-[var(--text-body)] shadow-lg"
                          : "bg-[var(--bg-card)] text-[var(--text-dim)] border border-[var(--border)] hover:border-yellow-400/40"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </Section>

          {selectedDays.map((day) => {
            const dayExs = form.exercises[day] || [];
            return (
              <Section key={day} title={`تمرین‌های روز ${day}`} icon={<Dumbbell size={18} />}>
                {dayExs.length === 0 && (
                  <p className="text-[var(--text-muted)] text-sm mb-4">هنوز تمرینی اضافه نشده</p>
                )}
                <div className="space-y-3">
                  {dayExs.map((ex, idx) => (
                    <ExerciseRow
                      key={idx}
                      exercise={ex}
                      index={idx}
                      total={dayExs.length}
                      onUpdate={(field, value) => updateExercise(day, idx, field, value)}
                      onRemove={() => removeExercise(day, idx)}
                      onMoveUp={() => moveExercise(day, idx, -1)}
                      onMoveDown={() => moveExercise(day, idx, 1)}
                    />
                  ))}
                </div>
                <button
                  onClick={() => addExercise(day)}
                  className="mt-3 flex items-center gap-2 text-yellow-400 text-sm font-black hover:text-yellow-300 transition-all"
                >
                  <Plus size={16} /> افزودن تمرین
                </button>
              </Section>
            );
          })}

          {selectedDays.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-[var(--text-muted)] bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border)]">
              <Dumbbell size={48} className="mb-4 opacity-40" />
              <p className="font-black text-lg">روزهای تمرینی را انتخاب کنید</p>
              <p className="text-sm mt-1 text-[var(--text-muted)]">با کلیک روی روزهای بالا، تمرینات روزانه را وارد کنید</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={() => submit(false)}
              disabled={saving}
              className="flex-1 bg-yellow-400 text-[var(--text-body)] py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-yellow-500 disabled:opacity-50 transition-all text-lg"
            >
              <UserCheck size={20} /> {saving ? "در حال ثبت..." : `اختصاص برنامه به ${form.athleteName || "ورزشکار"}`}
            </button>
            <button
              onClick={() => submit(true)}
              disabled={saving || !form.title.trim()}
              className="bg-gray-800 text-[var(--text-body)] py-4 px-6 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-gray-700 disabled:opacity-50 transition-all"
            >
              <Save size={18} /> ذخیره به عنوان قالب
            </button>
          </div>
        </div>
      </div>

      {showTemplates && (
        <TemplateModal
          templates={templates}
          onSelect={loadTemplate}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </DashboardLayout>
  );
}

function ExerciseRow({ exercise, index, total, onUpdate, onRemove, onMoveUp, onMoveDown }) {
  return (
    <div className="bg-[var(--bg-hover)]/70 border border-[var(--border)] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[var(--text-muted)] text-xs font-black">تمرین {index + 1}</span>
        <div className="flex items-center gap-1">
          <button onClick={onMoveUp} disabled={index === 0} className="p-1.5 rounded-lg hover:bg-gray-800 text-[var(--text-muted)] hover:text-[var(--text-body)] disabled:opacity-30 transition-all">
            <ChevronUp size={16} />
          </button>
          <button onClick={onMoveDown} disabled={index === total - 1} className="p-1.5 rounded-lg hover:bg-gray-800 text-[var(--text-muted)] hover:text-[var(--text-body)] disabled:opacity-30 transition-all">
            <ChevronDown size={16} />
          </button>
          <button onClick={onRemove} className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-all">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div>
          <label className="block text-[var(--text-muted)] text-[10px] font-bold mb-0.5">نام تمرین *</label>
          <input type="text" value={exercise.name} onChange={(e) => onUpdate("name", e.target.value)} placeholder="پرس سینه" className="w-full bg-[var(--bg-body)] border border-[var(--border)] rounded-xl py-2 px-3 text-[var(--text-body)] text-sm outline-none focus:border-yellow-400" />
        </div>
        <div>
          <label className="block text-[var(--text-muted)] text-[10px] font-bold mb-0.5">عضله</label>
          <input type="text" value={exercise.muscleGroup} onChange={(e) => onUpdate("muscleGroup", e.target.value)} placeholder="سینه" className="w-full bg-[var(--bg-body)] border border-[var(--border)] rounded-xl py-2 px-3 text-[var(--text-body)] text-sm outline-none focus:border-yellow-400" />
        </div>
        <div>
          <label className="block text-[var(--text-muted)] text-[10px] font-bold mb-0.5">ست</label>
          <input type="text" value={exercise.sets} onChange={(e) => onUpdate("sets", e.target.value)} className="w-full bg-[var(--bg-body)] border border-[var(--border)] rounded-xl py-2 px-3 text-[var(--text-body)] text-sm outline-none focus:border-yellow-400" />
        </div>
        <div>
          <label className="block text-[var(--text-muted)] text-[10px] font-bold mb-0.5">تکرار</label>
          <input type="text" value={exercise.reps} onChange={(e) => onUpdate("reps", e.target.value)} className="w-full bg-[var(--bg-body)] border border-[var(--border)] rounded-xl py-2 px-3 text-[var(--text-body)] text-sm outline-none focus:border-yellow-400" />
        </div>
        <div>
          <label className="block text-[var(--text-muted)] text-[10px] font-bold mb-0.5">استراحت (ثانیه)</label>
          <input type="text" value={exercise.restTime} onChange={(e) => onUpdate("restTime", e.target.value)} className="w-full bg-[var(--bg-body)] border border-[var(--border)] rounded-xl py-2 px-3 text-[var(--text-body)] text-sm outline-none focus:border-yellow-400" />
        </div>
        <div className="sm:col-span-3 lg:col-span-1">
          <label className="block text-[var(--text-muted)] text-[10px] font-bold mb-0.5">توضیحات</label>
          <input type="text" value={exercise.notes} onChange={(e) => onUpdate("notes", e.target.value)} placeholder="نکته..." className="w-full bg-[var(--bg-body)] border border-[var(--border)] rounded-xl py-2 px-3 text-[var(--text-body)] text-sm outline-none focus:border-yellow-400" />
        </div>
      </div>
    </div>
  );
}

function AthleteSelector({ students, value, onSelect }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.trim().toLowerCase();
    return students.filter((s) => s.name?.toLowerCase().includes(q) || s.employeeCode?.toLowerCase().includes(q));
  }, [students, search]);

  const selected = students.find((s) => s._id === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl py-3 px-4 text-right text-sm outline-none focus:border-yellow-400 transition-all flex items-center justify-between"
      >
        {selected ? (
          <span className="text-[var(--text-body)] font-black">{selected.name}</span>
        ) : (
          <span className="text-[var(--text-muted)]">انتخاب ورزشکار...</span>
        )}
        <ChevronDown size={16} className={`text-[var(--text-muted)] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-2 left-0 right-0 z-20 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-3 border-b border-[var(--border)]">
            <div className="relative">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="جستجوی ورزشکار..."
                className="w-full bg-[var(--bg-body)] border border-[var(--border)] rounded-xl py-2 pr-9 pl-3 text-[var(--text-body)] text-sm outline-none focus:border-yellow-400"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="p-4 text-[var(--text-muted)] text-sm text-center">نتیجه‌ای یافت نشد</p>
            ) : (
              filtered.map((s) => (
                <button
                  key={s._id}
                  onClick={() => { onSelect(s._id, s.name); setOpen(false); setSearch(""); }}
                  className={`w-full text-right px-4 py-3 text-sm hover:bg-gray-800 transition-all flex items-center gap-3 ${
                    s._id === value ? "bg-yellow-400/10 text-yellow-400" : "text-[var(--text-dim)]"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-yellow-400 font-black text-xs border border-[var(--border)]">
                    {s.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="font-black">{s.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{s.employeeCode}</p>
                  </div>
                  {s._id === value && <Check size={16} className="mr-auto text-yellow-400" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2rem] p-6">
      <h3 className="text-[var(--text-body)] font-black text-lg flex items-center gap-2 mb-5">
        <span className="text-yellow-400">{icon}</span> {title}
      </h3>
      {children}
    </div>
  );
}

function TemplateModal({ templates, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-overlay)]/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2rem] p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-[var(--text-body)]">قالب‌های ذخیره شده</h3>
          <button onClick={onClose} className="text-[var(--text-dim)] hover:text-[var(--text-body)] p-1"><X size={20} /></button>
        </div>
        {templates.length === 0 ? (
          <p className="text-[var(--text-muted)] text-center py-8">هنوز قالبی ذخیره نشده</p>
        ) : (
          <div className="space-y-3">
            {templates.map((t) => (
              <button
                key={t._id}
                onClick={() => onSelect(t)}
                className="w-full text-right bg-[var(--bg-hover)] rounded-2xl p-4 border border-[var(--border)] hover:border-yellow-400/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[var(--text-body)] font-black">{t.title}</p>
                    <p className="text-[var(--text-muted)] text-xs mt-1">
                      {t.weekDays?.length || t.trainingDays || 0} روز • {t.exercises?.length || 0} تمرین
                    </p>
                  </div>
                  <Copy size={18} className="text-yellow-400 shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import { Activity, ArrowRight, Dumbbell, Plus, Trash2, Utensils } from "lucide-react";
import DashboardLayout from "../../../layout";
import { API_BASE_URL, API_ORIGIN } from "@/config/api";

const emptyExercise = () => ({ day: "", name: "", sets: "", reps: "", restTime: "", notes: "" });
const emptyMeals = { breakfast: "", snack: "", lunch: "", beforeWorkout: "", afterWorkout: "", dinner: "" };
const mealLabels = { breakfast: "صبحانه", snack: "میان وعده", lunch: "ناهار", beforeWorkout: "قبل تمرین", afterWorkout: "بعد تمرین", dinner: "شام" };

export default function TrainingRequestShowPage() {
  const router = useRouter();
  const { id } = router.query;
  const [trainer, setTrainer] = useState(null);
  const [request, setRequest] = useState(null);
  const [user, setUser] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [form, setForm] = useState({ status: "in_progress", trainerNotes: "", userNotes: "", title: "برنامه تمرینی اختصاصی", trainingDays: "3" });
  const [exercises, setExercises] = useState([emptyExercise()]);
  const [meals, setMeals] = useState(emptyMeals);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = sessionStorage.getItem("currentUser");
    setTrainer(raw ? JSON.parse(raw) : null);
  }, []);

  useEffect(() => {
    if (!router.isReady || !id) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/training-requests/${id}`);
        const json = await res.json();
        if (!json.success || !json.request) throw new Error(json.message || "درخواست یافت نشد");
        setRequest(json.request);
        setForm((prev) => ({ ...prev, status: json.request.status || "in_progress", trainerNotes: json.request.trainerNotes || "", userNotes: json.request.userNotes || "" }));
        const userId = json.request?.userId?._id || json.request?.userId;
        if (userId) {
          const uRes = await fetch(`${API_BASE_URL}/users/${userId}`);
          const uJson = await uRes.json();
          setUser(uJson.user || null);
        }
      } catch (error) {
        console.error(error);
        Swal.fire({ icon: "error", title: "خطا", text: error.message });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router.isReady, id]);

  const resolvePhotoUrl = (p) => p?.startsWith("http") ? p : `${API_ORIGIN}/uploads/${String(p || "").replace(/^\/+/, "")}`;
  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const updateExercise = (index, key, value) => setExercises((prev) => prev.map((item, i) => i === index ? { ...item, [key]: value } : item));
  const removeExercise = (index) => setExercises((prev) => prev.length > 1 ? prev.filter((_, i) => i !== index) : prev);
  const updateMeal = (key, value) => setMeals((prev) => ({ ...prev, [key]: value }));

  const onSave = async () => {
    if (!request?._id) return;
    const userId = request?.userId?._id || request?.userId;
    if (!userId || !trainer?._id) {
      Swal.fire({ icon: "error", title: "خطا", text: "شناسه مربی یا ورزشکار پیدا نشد" });
      return;
    }
    const cleanExercises = exercises.filter((item) => item.day || item.name || item.sets || item.reps || item.restTime || item.notes);
    if (!cleanExercises.length) {
      Swal.fire({ icon: "warning", title: "برنامه ناقص", text: "حداقل یک حرکت تمرینی وارد کنید" });
      return;
    }

    setSaving(true);
    try {
      const trainingPayload = { userId, trainerId: trainer._id, requestId: request._id, title: form.title, trainingDays: Number(form.trainingDays) || 1, exercises: cleanExercises };
      const nutritionPayload = { userId, trainerId: trainer._id, requestId: request._id, title: "برنامه غذایی اختصاصی", meals };

      await fetch(`${API_BASE_URL}/programs/training`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(trainingPayload) });
      await fetch(`${API_BASE_URL}/programs/nutrition`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(nutritionPayload) });

      const res = await fetch(`${API_BASE_URL}/training-requests/${request._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          by: "trainer",
          status: form.status || "approved",
          trainerNotes: form.trainerNotes,
          userNotes: form.userNotes,
          trainingPlan: JSON.stringify(trainingPayload),
          nutritionPlan: JSON.stringify(nutritionPayload),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "ذخیره‌سازی انجام نشد");
      await Swal.fire({ icon: "success", title: "برنامه ثبت شد", text: "برنامه تمرینی و غذایی در قالب ساختاریافته ذخیره شد" });
      router.push("/trainers-dashboard/trainers");
    } catch (error) {
      Swal.fire({ icon: "error", title: "خطا", text: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <DashboardLayout><div className="rounded-3xl bg-black p-10 text-yellow-400">در حال بارگذاری...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen rounded-[2rem] bg-[#0f1115] p-4 text-right md:p-8" dir="rtl">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-black text-white md:text-3xl">صدور برنامه حرفه‌ای</h1>
            <p className="mt-2 text-xs font-bold text-gray-500">هیچ JSON خامی به کاربر نمایش داده نمی‌شود؛ برنامه‌ها در کارت‌های ساختاریافته ذخیره و نمایش داده می‌شوند.</p>
          </div>
          <button onClick={() => router.back()} className="flex w-fit items-center gap-2 rounded-2xl border border-gray-700 px-4 py-3 text-sm font-black text-gray-300 hover:border-yellow-400 hover:text-yellow-400"><ArrowRight size={18} /> بازگشت</button>
        </div>

        <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <InfoCard title="ورزشکار" value={user?.name || request?.userId?.name || "—"} hint={`BMI: ${request?.bmi || user?.bmi || "—"}`} />
          <InfoCard title="هدف‌ها" value={request?.goals?.join("، ") || "ثبت نشده"} hint="اهداف انتخاب‌شده فارسی" />
          <InfoCard title="وضعیت درخواست" value={form.status} hint="قابل تغییر توسط مربی" />
        </section>

        <section className="mb-6 rounded-[2rem] border border-gray-800 bg-[#1a1d23] p-5">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-white"><Activity className="text-yellow-400" /> جزئیات درخواست</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Readonly label="قد" value={request?.height ? `${request.height} سانتی‌متر` : "—"} />
            <Readonly label="وزن" value={request?.weight ? `${request.weight} کیلوگرم` : "—"} />
            <Readonly label="تجربه تمرینی" value={request?.trainingExperience || "—"} />
            <Readonly label="روزهای آزاد" value={request?.weeklyAvailableDays || "—"} />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Textarea label="یادداشت ورزشکار" value={form.userNotes} disabled onChange={(v) => onChange("userNotes", v)} />
            <Textarea label="یادداشت مربی" value={form.trainerNotes} onChange={(v) => onChange("trainerNotes", v)} />
          </div>
          <div className="mt-4 flex gap-3 overflow-x-auto">
            {(request?.photos || []).map((p, idx) => <button key={idx} onClick={() => setPreviewPhoto(resolvePhotoUrl(p))} className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-gray-700"><img src={resolvePhotoUrl(p)} alt={`photo-${idx}`} className="h-full w-full object-cover" /></button>)}
          </div>
        </section>

        <section className="mb-6 rounded-[2rem] border border-gray-800 bg-[#1a1d23] p-5">
          <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <h2 className="flex items-center gap-2 text-xl font-black text-white"><Dumbbell className="text-yellow-400" /> برنامه تمرینی روزانه</h2>
            <button onClick={() => setExercises((prev) => [...prev, emptyExercise()])} className="flex w-fit items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-xs font-black text-black"><Plus size={16} /> افزودن حرکت</button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="عنوان برنامه" value={form.title} onChange={(v) => onChange("title", v)} />
            <Input label="تعداد روزهای تمرین" value={form.trainingDays} type="number" onChange={(v) => onChange("trainingDays", v)} />
          </div>
          <div className="mt-4 space-y-4">
            {exercises.map((exercise, index) => (
              <div key={index} className="rounded-2xl border border-gray-800 bg-[#10131a] p-4">
                <div className="mb-3 flex items-center justify-between"><span className="font-black text-yellow-400">حرکت {index + 1}</span><button onClick={() => removeExercise(index)} className="text-red-400"><Trash2 size={18} /></button></div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <Input label="نام روز" value={exercise.day} onChange={(v) => updateExercise(index, "day", v)} placeholder="مثال: شنبه" />
                  <Input label="نام حرکت" value={exercise.name} onChange={(v) => updateExercise(index, "name", v)} placeholder="مثال: پرس سینه" />
                  <Input label="تعداد ست" value={exercise.sets} onChange={(v) => updateExercise(index, "sets", v)} />
                  <Input label="تعداد تکرار" value={exercise.reps} onChange={(v) => updateExercise(index, "reps", v)} />
                  <Input label="زمان استراحت" value={exercise.restTime} onChange={(v) => updateExercise(index, "restTime", v)} placeholder="مثال: ۶۰ ثانیه" />
                  <Input label="توضیحات حرکت" value={exercise.notes} onChange={(v) => updateExercise(index, "notes", v)} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6 rounded-[2rem] border border-gray-800 bg-[#1a1d23] p-5">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-white"><Utensils className="text-yellow-400" /> برنامه غذایی</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Object.entries(mealLabels).map(([key, label]) => <Textarea key={key} label={label} value={meals[key]} onChange={(v) => updateMeal(key, v)} />)}
          </div>
        </section>

        <section className="mb-6 rounded-[2rem] border border-gray-800 bg-[#1a1d23] p-5">
          <label className="mb-2 block text-xs font-black text-gray-500">وضعیت</label>
          <select value={form.status} onChange={(e) => onChange("status", e.target.value)} className="w-full rounded-xl bg-gray-800 p-3 font-bold text-white">
            <option value="pending">در انتظار</option>
            <option value="in_progress">در حال پردازش</option>
            <option value="approved">تایید شده</option>
            <option value="rejected">رد شده</option>
          </select>
        </section>

        <button onClick={onSave} disabled={saving} className="w-full rounded-2xl bg-yellow-400 py-4 font-black text-black disabled:opacity-60 md:w-auto md:px-10">{saving ? "در حال ذخیره..." : "ثبت نهایی برنامه"}</button>
      </div>
      {previewPhoto && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setPreviewPhoto(null)}><img src={previewPhoto} alt="preview" className="max-h-[90vh] rounded-2xl" /></div>}
    </DashboardLayout>
  );
}

function InfoCard({ title, value, hint }) { return <div className="rounded-2xl border border-gray-800 bg-[#1a1d23] p-5"><p className="text-xs font-black text-gray-500">{title}</p><h3 className="mt-2 text-xl font-black text-white">{value}</h3><p className="mt-1 text-xs font-bold text-gray-500">{hint}</p></div>; }
function Readonly({ label, value }) { return <div className="rounded-xl bg-gray-900 p-3"><p className="text-[11px] font-black text-gray-500">{label}</p><p className="mt-1 text-sm font-bold text-white">{value}</p></div>; }
function Input({ label, value, onChange, type = "text", placeholder = "" }) { return <div><label className="mb-1 block text-xs font-black text-gray-500">{label}</label><input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl bg-gray-800 p-3 font-bold text-white outline-none focus:ring-2 focus:ring-yellow-400" /></div>; }
function Textarea({ label, value, onChange, disabled = false }) { return <div><label className="mb-1 block text-xs font-black text-gray-500">{label}</label><textarea value={value ?? ""} disabled={disabled} onChange={(e) => onChange(e.target.value)} className="min-h-[110px] w-full rounded-xl bg-gray-800 p-3 font-bold text-white outline-none focus:ring-2 focus:ring-yellow-400 disabled:text-gray-400" /></div>; }

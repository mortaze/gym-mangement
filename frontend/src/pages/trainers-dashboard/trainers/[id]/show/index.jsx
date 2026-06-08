// frontend/src/pages/trainers-dashboard/trainers/[id]/show/index.jsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router"; // Pages Router
import moment from "moment-jalaali";
import DashboardLayout from "../../../layout";
import Swal from "sweetalert2";
import { API_BASE_URL, API_ORIGIN } from "@/config/api";

export default function TrainingRequestShowPage() {
  const router = useRouter();
  const { id } = router.query; // id از URL

  const [trainer, setTrainer] = useState(null); // از sessionStorage خوانده می‌شود
  const [request, setRequest] = useState(null);
  const [user, setUser] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [form, setForm] = useState({
    status: "",
    amount: "",
    paymentMethod: "",
    trainerNotes: "",
    userrNotes: "",
    trainingPlan: "",
    nutritionPlan: "",
    trainingDays: "3",
    exercises: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const API_BASE = API_BASE_URL;

  // --- 1) بارگذاری مربی از sessionStorage ---
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const raw = sessionStorage.getItem("currentUser");
      if (!raw) {
        console.warn("هیچ کاربری در sessionStorage نیست");
        setTrainer(null);
        // در صورت نیاز میتوانی redirect کنی، الان فقط وضعیت را ست میکنیم:
        setLoading(false);
        return;
      }
      const parsed = JSON.parse(raw);
      console.log("🔐 trainer from sessionStorage:", parsed);
      setTrainer(parsed);
    } catch (err) {
      console.error("خطا در خواندن currentUser از sessionStorage:", err);
      setTrainer(null);
      setLoading(false);
    }
  }, []);

  // --- 2) وقتی router آماده و trainer لود شد، درخواست را بگیر ---
  useEffect(() => {
    if (!router.isReady) {
      // router هنوز پارس نکرده queryها رو
      console.log("router not ready yet");
      return;
    }
    if (!trainer || !trainer._id) {
      console.log("trainer هنوز آماده نیست یا لاگین نشده");
      setLoading(false);
      return;
    }
    if (!id) {
      console.warn("id مسیر موجود نیست");
      setLoading(false);
      return;
    }

    console.log("🔥 useEffect fired - loading request", {
      id,
      trainerId: trainer._id,
    });

    const load = async () => {
      setLoading(true);
      try {
        // 1) گرفتن درخواست
        const res = await fetch(`${API_BASE}/training-requests/${id}`);
        const json = await res.json();
        console.log("📡 request response:", json);

        if (!json.success || !json.request) {
          throw new Error(json.message || "request not found");
        }

        // 2) بررسی مالکیت مربی (اجازه بده admin هم دسترسی داشته باشه اگر لازم است)
        const reqTrainerId =
          json.request?.trainerId?._id || json.request?.trainerId;
        if (!reqTrainerId) {
          console.warn("درخواست مربی نداشت — دسترسی بررسی نشد");
        } else if (
          String(reqTrainerId) !== String(trainer._id) &&
          !["Admin", "admin"].includes(trainer.role)
        ) {
          console.warn("⛔ trainer mismatch", {
            reqTrainerId,
            trainerId: trainer._id,
          });
          throw new Error("این درخواست به مربی دیگری اختصاص دارد.");
        }

        setRequest(json.request);

        // مقداردهی اولیه فرم از request (فیلدهای قابل ویرایش)
        setForm({
          status: json.request.status || "",
          amount: json.request.amount ?? "",
          paymentMethod: json.request.paymentMethod || "online",
          trainerNotes: json.request.trainerNotes || "",
          userNotes: json.request.userNotes || "",
          trainingPlan: json.request.trainingPlan || "",
          nutritionPlan: json.request.nutritionPlan || "",
          trainingDays: "3",
          exercises: "",
        });

        // 3) گرفتن اطلاعات کامل کاربر مرتبط
        const userId = json.request?.userId?._id || json.request?.userId;
        if (userId) {
          const uRes = await fetch(`${API_BASE}/users/${userId}`);
          const uJson = await uRes.json();
          console.log("📡 user response:", uJson);
          if (uJson && (uJson.user || uJson.success)) {
            // بعضی endpointها ممکنه ساختار متفاوت برگردانند (users vs user)
            const u = uJson.user ?? (uJson.users && uJson.users[0]) ?? null;
            setUser(u);
          } else {
            console.warn("کاربر یافت نشد یا پاسخ نامتعارف:", uJson);
            setUser(null);
          }
        } else {
          console.warn("userId در درخواست وجود ندارد");
          setUser(null);
        }
      } catch (err) {
        console.error("❌ load error:", err);
        setRequest(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, trainer, id]);

  // --- handlers ---
  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSave = async () => {
    if (!request || !request._id) return;

    setSaving(true);

    try {
      const payload = {
        by: trainer ? "trainer" : "unknown",
        status: form.status,
        amount: Number(form.amount) || 0,
        paymentMethod: form.paymentMethod,
        trainerNotes: form.trainerNotes,
        userNotes: form.userNotes,
        trainingPlan: form.trainingPlan,
      };

      console.log("📤 saving payload:", payload);

      const res = await fetch(`${API_BASE}/training-requests/${request._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      console.log("📥 save response:", json);

      if (json.success) {
        const userId = request?.userId?._id || request?.userId;
        if (userId && trainer?._id && form.trainingPlan) {
          const exercises = String(form.exercises || "").split("\n").map((line) => {
            const [name, sets, reps, restTime] = line.split("|").map((part) => part?.trim());
            return name ? { name, sets, reps, restTime } : null;
          }).filter(Boolean);
          await fetch(`${API_BASE}/programs/training`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, trainerId: trainer._id, requestId: request._id, title: "برنامه تمرینی اختصاصی", trainingDays: Number(form.trainingDays) || 3, exercises, }),
          });
        }
        if (userId && trainer?._id && form.nutritionPlan) {
          await fetch(`${API_BASE}/programs/nutrition`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, trainerId: trainer._id, requestId: request._id, title: "برنامه تغذیه اختصاصی", plan: form.nutritionPlan, }),
          });
        }
        // آپدیت state محلی
        setRequest(json.request ?? { ...request, ...payload });

        // نمایش پیام موفقیت + ریدایرکت بعد از تایید کاربر
        await Swal.fire({
          icon: "success",
          title: "با موفقیت ذخیره شد",
          text: "تغییرات با موفقیت ثبت گردید ✓",
          confirmButtonText: "تأیید",
          confirmButtonColor: "#10b981",
          timer: 2200, // اختیاری: بعد ۲.۲ ثانیه بسته شود
          timerProgressBar: true,
        });

        // ریدایرکت با Pages Router
        router.push("/trainers-dashboard/trainers");
        // یا اگر می‌خوای تاریخچه را جایگزین کنی (back button کار نکند):
        // router.replace("/trainers-dashboard/trainers");
      } else {
        await Swal.fire({
          icon: "error",
          title: "خطا در ذخیره‌سازی",
          text: json.message || "خطای نامشخص – لطفاً کنسول را چک کنید",
          confirmButtonText: "باشه",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (err) {
      console.error("❌ save error:", err);

      await Swal.fire({
        icon: "error",
        title: "خطای ارتباط",
        text: "مشکلی در ارتباط با سرور پیش آمد. لطفاً دوباره امتحان کنید.",
        confirmButtonText: "باشه",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setSaving(false);
    }
  };

  // helper برای مسیر عکس
  const resolvePhotoUrl = (p) => {
    if (!p) return null;
    if (p.startsWith("http://") || p.startsWith("https://")) return p;
    // اگر فقط مسیر فایل مثل "TrainingRequest/xyz.jpg" است
    return `${API_ORIGIN}/uploads/${p.replace(/^\/+/, "")}`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-10 text-yellow-400 bg-black rounded-3xl">
          در حال بارگذاری...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 bg-[#0f1115] rounded-3xl border border-gray-800">
        <h1 className="text-2xl font-black text-white mb-6">
          جزئیات درخواست تمرینی
        </h1>

        {/* مربی لاگین شده */}
        <div className="mb-6 p-4 bg-[#1a1d23] rounded-lg border border-gray-800 flex items-center justify-between">
          <div>
            <div className="text-gray-400 text-sm">مربی واردشده</div>
            <div className="text-white font-black">{trainer?.name || "—"}</div>
            <div className="text-gray-400 text-xs">
              ID: {trainer?._id || "—"}
            </div>
          </div>
          <div className="text-right">
            <div className="text-gray-400 text-xs">تعداد تاریخچه</div>
            <div className="text-yellow-400 font-black">
              {request?.history?.length ?? 0}
            </div>
          </div>
        </div>

        {/* اطلاعات ورزشکار */}
        <section className="mb-8">
          <h3 className="text-yellow-400 font-bold mb-3">اطلاعات ورزشکار</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
            <div>
              <label className="text-xs text-gray-500">نام</label>
              <div className="mt-1 text-white font-black">
                {user?.name ?? "—"}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">کد عضویت</label>
              <div className="mt-1 text-gray-300">
                {user?.employeeCode ?? "—"}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">شماره تماس</label>
              <div className="mt-1 text-gray-300">
                {user?.contactNumber ?? "—"}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">ایمیل</label>
              <div className="mt-1 text-gray-300">{user?.email ?? "—"}</div>
            </div>
            <div><label className="text-xs text-gray-500">BMI</label><div className="mt-1 text-gray-300">{request?.bmi ?? user?.bmi ?? "—"}</div></div>
            <div><label className="text-xs text-gray-500">اهداف</label><div className="mt-1 text-gray-300">{request?.goals?.join("، ") || "—"}</div></div>
            <div><label className="text-xs text-gray-500">سابقه تمرین</label><div className="mt-1 text-gray-300">{request?.trainingExperience || "—"}</div></div>
            <div><label className="text-xs text-gray-500">آسیب‌دیدگی</label><div className="mt-1 text-gray-300">{request?.injuries || "—"}</div></div>
            <div><label className="text-xs text-gray-500">روزهای آزاد</label><div className="mt-1 text-gray-300">{request?.weeklyAvailableDays || "—"}</div></div>
          </div>
        </section>

        {/* اطلاعات درخواست + فرم ویرایش (قد و وزن غیرقابل ویرایش) */}
        <section className="mb-6">
          <h3 className="text-yellow-400 font-bold mb-3">اطلاعات درخواست</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="قد (cm)" value={request?.height ?? "—"} disabled />
            <Field label="وزن (kg)" value={request?.weight ?? "—"} disabled />

            <Field
              label="مبلغ (تومان)"
              value={form.amount}
              onChange={(v) => onChange("amount", v)}
              disabled
            />
            <Field
              label="روش پرداخت"
              value={
                form.paymentMethod === "online"
                  ? "آنلاین"
                  : form.paymentMethod === "cash"
                    ? "نقدی"
                    : form.paymentMethod || "نامشخص"
              }
              disabled
            />

            <Field
              label="تاریخ ایجاد"
              value={
                request?.createdAt
                  ? moment(request.createdAt).format("jYYYY/jMM/jDD")
                  : "—"
              }
              disabled
            />
          </div>
        </section>
        {/* تصاویر */}
        <section className="mb-8">
          <h3 className="text-yellow-400 font-bold mb-3">عکس‌های آپلودشده</h3>

          <div className="flex gap-3 overflow-x-auto">
            {(request?.photos ?? []).length === 0 && (
              <div className="text-gray-500">عکسی آپلود نشده</div>
            )}

            {(request?.photos ?? []).map((p, idx) => (
              <button
                key={idx}
                onClick={() => setPreviewPhoto(resolvePhotoUrl(p))}
                className="w-28 h-28 cursor-pointer rounded-md overflow-hidden border border-gray-700 hover:border-yellow-400 transition"
              >
                <img
                  src={resolvePhotoUrl(p)}
                  alt={`photo-${idx}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </section>
        {/* یادداشت کاربر */}
        <section className="mb-6">
          <label className="text-sm text-gray-400">یادداشت کاربر</label>
          <textarea
            value={form.userNotes}
            onChange={(e) => onChange("userNotes", e.target.value)}
            className="w-full bg-gray-800 p-3 rounded-lg text-white mt-2 min-h-[120px]"
            placeholder="اینجا یادداشت کاربر را بنویسید..."
            disabled
          />
        </section>
        {/* یادداشت مربی */}
        <section className="mb-6">
          <label className="text-sm text-gray-400">یادداشت مربی</label>
          <textarea
            value={form.trainerNotes}
            onChange={(e) => onChange("trainerNotes", e.target.value)}
            className="w-full bg-gray-800 p-3 rounded-lg text-white mt-2 min-h-[120px]"
            placeholder="اینجا یادداشت مربی را بنویسید..."
          />
        </section>

        {/* برنامه تمرینی */}
        <section className="mb-6">
          <label className="text-sm text-gray-400">
            برنامه تمرینی (متن یا JSON)
          </label>
          <textarea
            value={form.trainingPlan}
            onChange={(e) => onChange("trainingPlan", e.target.value)}
            className="w-full bg-gray-800 p-3 rounded-lg text-white mt-2 min-h-[160px] font-mono text-sm"
            placeholder='مثال: {"days":[...]} یا متن توضیحی'
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Field label="تعداد روزهای تمرین" value={form.trainingDays} onChange={(v) => onChange("trainingDays", v)} />
            <Field label="حرکات (هر خط: حرکت | ست | تکرار | استراحت)" value={form.exercises} onChange={(v) => onChange("exercises", v)} />
          </div>
        </section>
        <section className="mb-6">
          <label className="text-sm text-gray-400">برنامه تغذیه</label>
          <textarea value={form.nutritionPlan} onChange={(e) => onChange("nutritionPlan", e.target.value)} className="w-full bg-gray-800 p-3 rounded-lg text-white mt-2 min-h-[140px]" placeholder="وعده‌ها، کالری، مکمل‌ها و نکات تغذیه..." />
        </section>
        <SelectField
          label="وضعیت"
          value={form.status}
          onChange={(v) => onChange("status", v)}
          options={[
            { value: "pending", label: "در انتظار" },
            { value: "in_progress", label: "در حال پردازش" },
            { value: "approved", label: "تایید شده" },
            { value: "rejected", label: "رد شده" },
          ]}
        />
        <div className="flex items-center gap-3 mt-8">
          <button
            onClick={onSave}
            disabled={saving}
            className="px-5 py-3 bg-yellow-400 text-black font-black rounded-2xl"
          >
            {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </button>

          <button
            onClick={() => router.back()}
            className="px-5 py-3 bg-gray-800 text-gray-300 rounded-2xl"
          >
            بازگشت
          </button>
        </div>
      </div>
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute -top-10 right-0 text-white text-3xl font-black hover:text-yellow-400"
            >
              ×
            </button>

            <img
              src={previewPhoto}
              alt="preview"
              className="max-h-[90vh] max-w-full rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

/* ---------- کمکی‌ها ---------- */
function Field({ label, value, onChange, disabled = false }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      {disabled ? (
        <div className="bg-gray-800 p-3 rounded-lg text-gray-300">
          {value ?? "—"}
        </div>
      ) : (
        <input
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full bg-gray-800 p-3 rounded-lg text-white"
        />
      )}
    </div>
  );
}

function SelectField({ label, value, onChange, options = [] }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <select
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full bg-gray-800 p-3 rounded-lg text-white"
      >
        <option value="" disabled>
          انتخاب کنید
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

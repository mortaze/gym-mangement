// frontend/src/pages/users-dashboard/trainers/request-plan/[id]/show/index.jsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router"; // Pages Router
import moment from "moment-jalaali";
import DashboardLayout from "../../../../layout";
import Swal from "sweetalert2";
import { API_BASE_URL, API_ORIGIN } from "@/config/api";

export default function TrainingRequestShowPage() {
  const router = useRouter();
  const { id } = router.query; // id از URL

  const [currentUser, setCurrentUser] = useState(null); // کاربر لاگین شده (sessionStorage)
  const [request, setRequest] = useState(null);
  const [user, setUser] = useState(null); // اطلاعات کامل کاربرِ درخواست دهنده
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [trainer, setTrainer] = useState(null);
  const [isPaid, setIsPaid] = useState(false); // پرداخت نمادین
  const PRICE = 500000;

  // فرم محلی (فیلدهای قابل ویرایش)
  const [form, setForm] = useState({
    status: "",
    amount: 500000,
    paymentMethod: "online",
    height: "",
    weight: "",
    userNotes: "",
  });
  useEffect(() => {
    if (request) {
      setForm((p) => ({
        ...p,
        status: request.status || "pending",
        amount: request.amount ?? 500000,
        paymentMethod: request.paymentMethod || "online",
        height: request.height || "",
        weight: request.weight || "",
        userNotes: request.userNotes || "",
      }));
    }
  }, [request]);

  // وضعیت پرداخت نمادین (client-side)
  const [paid, setPaid] = useState(false);

  const API_BASE = API_BASE_URL;

  // ---------- load currentUser from sessionStorage ----------
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const raw = sessionStorage.getItem("currentUser");
      if (raw) {
        const parsed = JSON.parse(raw);
        setCurrentUser(parsed);
        console.log("🔐 currentUser from sessionStorage:", parsed);
      } else {
        console.log("🔐 no currentUser in sessionStorage");
      }
    } catch (err) {
      console.error("خطا در خواندن currentUser از sessionStorage:", err);
    }
  }, []);

  // ---------- fetch request and related user ----------
  useEffect(() => {
    if (!router.isReady) return;
    if (!id) {
      console.warn("id مسیر موجود نیست");
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        // 1) گرفتن درخواست
        const res = await fetch(`${API_BASE}/training-requests/${id}`);
        if (!res.ok) {
          const t = await res.json().catch(() => ({}));
          throw new Error(t.message || `HTTP ${res.status}`);
        }
        const json = await res.json();
        console.log("📡 request response:", json);

        if (!json.success || !json.request) {
          throw new Error(json.message || "request not found");
        }
        const req = json.request;
        setRequest(req);
        setTrainer(req.trainerId);
        // مقداردهی اولیه فرم (حفظ داده‌های موجود یا مقدار پیش‌فرض)
        setForm({
          status: req.status || "pending",
          amount: req.amount ?? 500000,
          paymentMethod: req.paymentMethod || "online",
          trainerNotes: req.trainerNotes || "",
          userNotes: req.userNotes || "",
          trainingPlan: req.trainingPlan || "",
        });

        // 2) گرفتن اطلاعات کامل کاربر مرتبط (از API کاربران)
        const userId = req?.userId?._id || req?.userId;
        if (userId) {
          const uRes = await fetch(`${API_BASE}/users/${userId}`);
          const uJson = await uRes.json();
          console.log("📡 user response:", uJson);
          // پشتیبانی از ساختارهای مختلف پاسخ
          const u =
            uJson.user ??
            (Array.isArray(uJson.users) && uJson.users[0]) ??
            null;
          if (u) {
            setUser(u);
          } else {
            // fallback: استفاده از بخش مختصر userId که در خود request وجود دارد
            const short = req.userId && req.userId._id ? req.userId : null;
            setUser(short);
          }
        } else {
          console.warn("userId در request وجود ندارد");
          setUser(null);
        }

        // اگر در درخواست وضعیت پرداختی مشخص شده بود، می‌توان آن را ست کرد
        // (در این پروژه فرض می‌کنیم پرداخت client-side است)
        // setPaid(!!req.paymentConfirmed); // فقط اگر backend این فیلد را داشت
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
  }, [router.isReady, id]);

  // ---------- handlers ----------
  const onChange = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  const onSave = async () => {
    if (!request || !request._id) {
      Swal.fire("خطا", "درخواست قابل ذخیره نیست.", "error");
      return;
    }

    setSaving(true);
    try {
      // by: تعیین می‌کنیم که چه کسی این تغییر را ثبت کرده است؛ اگر کاربر لاگین است از role او استفاده کن
      const byRole = currentUser
        ? currentUser.role && currentUser.role.toLowerCase().includes("trainer")
          ? "trainer"
          : "user"
        : "user";

      const payload = {
        by: byRole,
        status: form.status || "pending",
        // مبلغ ثابت ۵۰۰٬۰۰۰ را ارسال می‌کنیم (در صورت نیاز)
        amount: Number(form.amount) || 500000,
        paymentMethod: form.paymentMethod || "online",
        height: form.height || "",
        weight: form.weight || "",
        userNotes: form.userNotes || "",

        // flag نمادین پرداخت — backend ممکن است نپذیرد اما برای ردیابی client-side میفرستیم
        paymentConfirmed: true,
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
        setRequest(json.request ?? { ...request, ...payload });
        Swal.fire({
          icon: "success",
          title: "درخواست ثبت شد",
          text: "تغییرات با موفقیت ذخیره شدند.",
          background: "#0f1115",
          color: "#fff",
          confirmButtonColor: "#10b981",
        });
        router.push("/users-dashboard/trainers");

        // می‌تونی اینجا router.push یا replace بزنی یا همان صفحه را به‌روز نگه داری
      } else {
        Swal.fire({
          icon: "error",
          title: "خطا در ذخیره",
          text: json.message || "خطای نامشخص",
          background: "#0f1115",
          color: "#fff",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (err) {
      console.error("❌ save error:", err);
      Swal.fire({
        icon: "error",
        title: "خطای ارتباط",
        text: "مشکلی در ارتباط با سرور پیش آمد. کنسول را بررسی کنید.",
        background: "#0f1115",
        color: "#fff",
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

  const handlePay = async () => {
    // شبیه‌سازی پرداخت؛ در اپ واقعی باید به درگاه وصل بشی
    const result = await Swal.fire({
      title: "آیا می‌خواهید پرداخت نمادین را انجام دهید؟",
      html: `مبلغ: <strong>${PRICE.toLocaleString()} تومان</strong>`,
      showCancelButton: true,
      confirmButtonText: "پرداخت (نمادین)",
      cancelButtonText: "انصراف",
      background: "#1a1d23",
      color: "#fff",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#374151",
    });

    if (result.isConfirmed) {
      // شبیه‌سازی موفقیت
      setIsPaid(true);
      Swal.fire({
        title: "پرداخت موفق",
        text: "پرداخت (نمادین) با موفقیت انجام شد.",
        icon: "success",
        background: "#1a1d23",
        color: "#fff",
        confirmButtonColor: "#facc15",
      });
    }
  };
  const calcAgeFromBirthday = (birthday) => {
    if (!birthday) return "";

    // birthday مثال: "1383/06/03"
    const birthDate = moment(birthday, "jYYYY/jMM/jDD");
    if (!birthDate.isValid()) return "";

    return moment().jYear() - birthDate.jYear();
  };
  // ---------- UI ----------
  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-10 text-yellow-400 bg-[var(--bg-overlay)] rounded-3xl">
          در حال بارگذاری...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="overflow-x-hidden rounded-3xl border border-[var(--border)] bg-[var(--bg-body)] p-4 sm:p-6 md:p-8">
        <h1 className="text-2xl font-black text-[var(--text-body)] mb-6">
          مشاهده و ویرایش درخواست تمرینی
        </h1>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* مربی */}
          <div className="flex-1 p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border)]">
            <div className="flex items-center gap-4">
              <div className="w-26 h-26 rounded-xl bg-gray-800 border-2 border-yellow-400 overflow-hidden flex items-center justify-center">
                {trainer?.profileImage ? (
                  <img
                    src={trainer.profileImage}
                    alt={trainer.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-yellow-400 font-black text-lg">
                    {trainer?.name?.charAt(0) || "T"}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0 text-right">
                <div className="text-[var(--text-body)] font-black text-2xl">
                  {trainer?.name || "—"}
                </div>
                <div className="text-[var(--text-dim)] text-sm mt-2">
                  نقش: {trainer?.role || "—"}
                </div>
              </div>
            </div>
          </div>

          {/* پرداخت / خلاصه */}
          <div className="w-full md:w-64 p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border)] flex flex-col items-center justify-between">
            <div className="text-right w-full">
              <div className="text-[var(--text-dim)] text-xs">مبلغ (ثابت)</div>
              <div className="text-yellow-400 font-black text-lg">
                {PRICE.toLocaleString()} تومان
              </div>
              <div className="text-[var(--text-dim)] text-xs mt-2">
                روش پرداخت: آنلاین (نمادین)
              </div>
            </div>

            <div className="w-full mt-4">
              {isPaid || request?.status === "approved" ? (
                <div className="text-center py-2 rounded-xl bg-green-600/10 text-green-300 font-bold">
                  پرداخت انجام شد ✓
                </div>
              ) : (
                <button
                  onClick={handlePay}
                  className="w-full py-2 rounded-xl bg-yellow-400 text-[var(--text-body)] font-black hover:bg-yellow-500"
                >
                  پرداخت
                </button>
              )}
            </div>
          </div>
        </div>

        {/* اطلاعات ورزشکار کامل */}
        <section className="mb-8">
          <h3 className="text-yellow-400 font-bold mb-3">اطلاعات ورزشکار</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[var(--text-dim)]">
            <Field label="نام" value={user?.name ?? "—"} disabled />
            <Field
              label="کد عضویت"
              value={user?.employeeCode ?? "—"}
              disabled
            />
            <Field
              label="شماره تماس"
              value={user?.contactNumber ?? "—"}
              disabled
            />
            <Field label="ایمیل" value={user?.email ?? "—"} disabled />
            <Field
              label="تاریخ عضویت"
              value={
                user?.createdAt
                  ? moment(user.createdAt).format("jYYYY/jMM/jDD")
                  : "—"
              }
              disabled
            />
            <Field
              label="سن (محاسبه‌شده از birthday)"
              value={calcAgeFromBirthday(user?.birthday) ?? "—"}
              disabled
            />
          </div>
        </section>

        {/* تصاویر */}
        <section className="mb-8">
          <h3 className="text-yellow-400 font-bold mb-3">عکس‌های آپلودشده</h3>
          <div className="flex gap-3 overflow-x-auto">
            {(request?.photos ?? []).length === 0 && (
              <div className="text-[var(--text-muted)]">عکسی آپلود نشده</div>
            )}

            {(request?.photos ?? []).map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  // فقط modal نمایش داده شود (و نه تکرار تصویر در صفحه)
                  setPreviewPhoto(resolvePhotoUrl(p));
                }}
                className="w-28 h-28 cursor-pointer rounded-md overflow-hidden border border-[var(--border)] hover:border-yellow-400 transition"
                type="button"
                title="نمایش تصویر"
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

        {/* فرم اطلاعات درخواست (قد/وزن غیرقابل ویرایش، مبلغ ثابت) */}
        <section className="mb-6">
          <h3 className="text-yellow-400 font-bold mb-3">اطلاعات درخواست</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="قد (cm)"
              value={form.height}
              onChange={(val) => onChange("height", val)}
            />

            <Field
              label="وزن (kg)"
              value={form.weight}
              onChange={(val) => onChange("weight", val)}
            />

            <Field
              label="مبلغ (تومان)"
              value={formatCurrency(form.amount)}
              disabled
            />

            <Field
              label="روش پرداخت"
              value={
                form.paymentMethod === "online"
                  ? "آنلاین"
                  : form.paymentMethod === "cash"
                    ? "نقدی"
                    : form.paymentMethod
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

        {/* یادداشت کاربر (غیرفعال برای ویرایش توسط مربی/کاربر) */}
        <section className="mb-6">
          <label className="text-sm text-[var(--text-dim)]">یادداشت کاربر</label>
          <textarea
            value={form.userNotes}
            onChange={(e) => onChange("userNotes", e.target.value)}
            className="w-full bg-gray-800 p-3 rounded-lg text-[var(--text-body)] mt-2 min-h-[120px]"
          />
        </section>

        {/* یادداشت مربی (قابل ویرایش) */}
        <section className="mb-6">
          <label className="text-sm text-[var(--text-dim)]">یادداشت مربی</label>
          <textarea
            value={form.trainerNotes}
            onChange={(e) => onChange("trainerNotes", e.target.value)}
            className="w-full bg-gray-800 p-3 rounded-lg text-[var(--text-body)] mt-2 min-h-[120px]"
            placeholder="اینجا یادداشت مربی را بنویسید..."
            disabled
          />
        </section>

        <TrainingPlanPreview request={request} trainer={trainer} />
        <SelectField
          label="وضعیت"
          value={form.status}
          onChange={(v) => onChange("status", v)}
          options={[
            { value: "pending", label: "در انتظار" },
            { value: "in_progress", label: "ویرایش شده توسط کاربر" },
            { value: "approved", label: "تأیید شده" },
          ]}
        />
        {/* سمت چپ: پرداخت نمادین و دکمه ثبت */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4 mt-6">
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <button
              onClick={onSave}
              disabled={saving}
              className="w-full rounded-2xl bg-yellow-400 px-6 py-3 font-black text-[var(--text-body)] sm:w-auto"
            >
              {saving ? "در حال ذخیره..." : "ثبت / بروزرسانی درخواست"}
            </button>

            <button
              onClick={() => router.back()}
              className="w-full rounded-2xl bg-gray-800 px-5 py-3 text-[var(--text-dim)] sm:w-auto"
            >
              بازگشت
            </button>
          </div>
        </div>
      </div>

      {/* modal preview عکس */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 bg-[var(--bg-overlay)]/80 flex items-center justify-center"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute -top-10 right-0 text-[var(--text-body)] text-3xl font-black hover:text-yellow-400"
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

function parseTrainingPlan(raw) {
  if (!raw) return null;
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return { title: "برنامه تمرینی", exercises: [{ day: "توضیحات", name: raw }] };
  }
}

function groupExercisesByDay(exercises = []) {
  return exercises.reduce((acc, exercise) => {
    const day = exercise.day || "روز تمرینی";
    acc[day] = acc[day] || [];
    acc[day].push(exercise);
    return acc;
  }, {});
}

function TrainingPlanPreview({ request, trainer }) {
  const plan = parseTrainingPlan(request?.trainingPlan);
  const exercisesByDay = groupExercisesByDay(plan?.exercises || []);
  const issuedAt = request?.updatedAt || request?.createdAt;

  return (
    <section className="mb-6 rounded-[2rem] border border-[var(--border)] bg-[var(--bg-card)] p-4 sm:p-5">
      <div className="mb-5 flex flex-col gap-3 border-b border-[var(--border)] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black text-[var(--text-muted)]">کارت اطلاعات برنامه</p>
          <h3 className="mt-1 text-xl font-black text-[var(--text-body)]">{plan?.title || "برنامه تمرینی صادر نشده است"}</h3>
        </div>
        <span className="w-fit rounded-full bg-yellow-400/10 px-4 py-2 text-xs font-black text-yellow-400">
          {request?.status === "approved" ? "برنامه صادر شد" : "در انتظار صدور"}
        </span>
      </div>
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <PlanMeta label="عنوان برنامه" value={plan?.title || "—"} />
        <PlanMeta label="تعداد روزهای تمرین" value={plan?.trainingDays ? `${plan.trainingDays} روز` : "—"} />
        <PlanMeta label="نام مربی" value={trainer?.name || request?.trainerId?.name || "—"} />
        <PlanMeta label="تاریخ صدور" value={issuedAt ? moment(issuedAt).format("jYYYY/jMM/jDD") : "—"} />
      </div>
      {Object.keys(exercisesByDay).length ? (
        <div className="space-y-3">
          {Object.entries(exercisesByDay).map(([day, exercises], index) => (
            <details key={day} className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4" open={index === 0}>
              <summary className="cursor-pointer list-none text-base font-black text-yellow-400">{day}</summary>
              <div className="mt-4 space-y-3 border-r-2 border-yellow-400/30 pr-4">
                {exercises.map((exercise, i) => (
                  <div key={`${exercise.name}-${i}`} className="rounded-2xl bg-[var(--bg-hover)]/80 p-4">
                    <h4 className="font-black text-[var(--text-body)]">{exercise.name || "حرکت تمرینی"}</h4>
                    <div className="mt-3 grid grid-cols-1 gap-2 text-sm font-bold text-[var(--text-dim)] sm:grid-cols-3">
                      <span>ست: {exercise.sets || "—"}</span>
                      <span>تکرار: {exercise.reps || "—"}</span>
                      <span>استراحت: {exercise.restTime || "—"}</span>
                    </div>
                    {exercise.notes && <p className="mt-3 rounded-xl bg-white/5 p-3 text-xs font-bold leading-6 text-[var(--text-dim)]">{exercise.notes}</p>}
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      ) : <p className="rounded-2xl bg-[var(--bg-hover)]/80 p-5 text-center text-sm font-bold text-[var(--text-muted)]">هنوز برنامه تمرینی برای نمایش صادر نشده است.</p>}
    </section>
  );
}

function PlanMeta({ label, value }) {
  return <div className="rounded-2xl bg-[var(--bg-hover)]/80 p-3"><p className="text-[11px] font-black text-[var(--text-muted)]">{label}</p><p className="mt-1 text-sm font-black text-[var(--text-body)]">{value}</p></div>;
}

function Field({ label, value, onChange, disabled = false }) {
  return (
    <div>
      <label className="block text-xs text-[var(--text-muted)] mb-1">{label}</label>
      {disabled ? (
        <div className="bg-gray-800 p-3 rounded-lg text-[var(--text-dim)]">
          {value ?? "—"}
        </div>
      ) : (
        <input
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full bg-gray-800 p-3 rounded-lg text-[var(--text-body)]"
        />
      )}
    </div>
  );
}

function SelectField({ label, value, onChange, options = [] }) {
  return (
    <div>
      <label className="block text-xs text-[var(--text-muted)] mb-1">{label}</label>
      <select
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full bg-gray-800 p-3 rounded-lg text-[var(--text-body)]"
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

// فرمت عددی ساده برای نمایش تومان
function formatCurrency(v) {
  try {
    if (v == null) return "—";
    return Number(v).toLocaleString("fa-IR") + " تومان";
  } catch {
    return v;
  }
}

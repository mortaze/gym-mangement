// frontend/src/pages/users-dashboard/trainers/request-plan/[id]/show/index.jsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router"; // Pages Router
import moment from "moment-jalaali";
import DashboardLayout from "../../../../layout";
import Swal from "sweetalert2";

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

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000";

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
    return `http://localhost:7000/uploads/${p.replace(/^\/+/, "")}`;
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
          مشاهده و ویرایش درخواست تمرینی
        </h1>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* مربی */}
          <div className="flex-1 p-4 bg-[#1a1d23] rounded-lg border border-gray-800">
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
                <div className="text-white font-black text-2xl">
                  {trainer?.name || "—"}
                </div>
                <div className="text-gray-400 text-sm mt-2">
                  نقش: {trainer?.role || "—"}
                </div>
              </div>
            </div>
          </div>

          {/* پرداخت / خلاصه */}
          <div className="w-full md:w-64 p-4 bg-[#1a1d23] rounded-lg border border-gray-800 flex flex-col items-center justify-between">
            <div className="text-right w-full">
              <div className="text-gray-400 text-xs">مبلغ (ثابت)</div>
              <div className="text-yellow-400 font-black text-lg">
                {PRICE.toLocaleString()} تومان
              </div>
              <div className="text-gray-400 text-xs mt-2">
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
                  className="w-full py-2 rounded-xl bg-yellow-400 text-black font-black hover:bg-yellow-500"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
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
              <div className="text-gray-500">عکسی آپلود نشده</div>
            )}

            {(request?.photos ?? []).map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  // فقط modal نمایش داده شود (و نه تکرار تصویر در صفحه)
                  setPreviewPhoto(resolvePhotoUrl(p));
                }}
                className="w-28 h-28 cursor-pointer rounded-md overflow-hidden border border-gray-700 hover:border-yellow-400 transition"
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
          <label className="text-sm text-gray-400">یادداشت کاربر</label>
          <textarea
            value={form.userNotes}
            onChange={(e) => onChange("userNotes", e.target.value)}
            className="w-full bg-gray-800 p-3 rounded-lg text-white mt-2 min-h-[120px]"
          />
        </section>

        {/* یادداشت مربی (قابل ویرایش) */}
        <section className="mb-6">
          <label className="text-sm text-gray-400">یادداشت مربی</label>
          <textarea
            value={form.trainerNotes}
            onChange={(e) => onChange("trainerNotes", e.target.value)}
            className="w-full bg-gray-800 p-3 rounded-lg text-white mt-2 min-h-[120px]"
            placeholder="اینجا یادداشت مربی را بنویسید..."
            disabled
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
            disabled
          />
        </section>
        <SelectField
          label="وضعیت"
          value={form.status}
          onChange={(v) => onChange("status", v)}
          options={[
            { value: "pending", label: "در انتظار" },
            { value: "in_progress", label: "ویرایش شده توسط کاربر" },
            { value: "approved", label: "تایید شده" },
          ]}
        />
        {/* سمت چپ: پرداخت نمادین و دکمه ثبت */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4 mt-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onSave}
              disabled={saving}
              className="px-6 py-3 bg-yellow-400 text-black font-black rounded-2xl"
            >
              {saving ? "در حال ذخیره..." : "ثبت / بروزرسانی درخواست"}
            </button>

            <button
              onClick={() => router.back()}
              className="px-5 py-3 bg-gray-800 text-gray-300 rounded-2xl"
            >
              بازگشت
            </button>
          </div>
        </div>
      </div>

      {/* modal preview عکس */}
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

// فرمت عددی ساده برای نمایش تومان
function formatCurrency(v) {
  try {
    if (v == null) return "—";
    return Number(v).toLocaleString("fa-IR") + " تومان";
  } catch {
    return v;
  }
}

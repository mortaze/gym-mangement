"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../../layout";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  Zap,
  Wrench,
  Plus,
  History,
  Info,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

export default function CreateEquipmentPage() {
  const router = useRouter();

  // === تنظیم پایه API (قابل override با env در صورت نیاز) ===
  const API_BASE =
    (typeof window !== "undefined" && process.env.NEXT_PUBLIC_API_BASE) ||
    "http://localhost:7000/api";

  const [form, setForm] = useState({
    equipmentCode: "",
    name: "",
    brand: "",
    model: "",
    healthIndex: 100,
    lastServiceDate: "",
    operationalStatus: "Operational",
    location: "",
    purchaseDate: "",
    warrantyEndDate: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = [
    { value: "Operational", label: "عملیاتی" },
    { value: "NeedsRepair", label: "نیاز به سرویس" },
    { value: "OutOfService", label: "خارج از رده" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const num = Number(value);
    if (Number.isNaN(num)) return;
    setForm((p) => ({ ...p, [name]: num }));
  };

  const validate = () => {
    // حداقل فیلدهای ضروری: name, brand
    // (equipmentCode از فرانت نمایش داده میشه ولی backend هم اتومات میسازه اگه لازم بود)
    if (!form.name.trim()) {
      Swal.fire({
        icon: "error",
        title: "نام دستگاه وارد نشده",
        text: "لطفاً نام دستگاه را وارد کنید.",
        background: "#1a1d23",
        color: "#fff",
        confirmButtonColor: "#facc15",
      });
      return false;
    }
    if (!form.brand.trim()) {
      Swal.fire({
        icon: "error",
        title: "برند وارد نشده",
        text: "لطفاً برند سازنده را وارد کنید.",
        background: "#1a1d23",
        color: "#fff",
        confirmButtonColor: "#facc15",
      });
      return false;
    }
    // healthIndex در بازه 0-100
    if (form.healthIndex < 0 || form.healthIndex > 100) {
      Swal.fire({
        icon: "error",
        title: "شاخص سلامت نامعتبر",
        text: "شاخص سلامت باید بین 0 تا 100 باشد.",
        background: "#1a1d23",
        color: "#fff",
        confirmButtonColor: "#facc15",
      });
      return false;
    }
    // optional: تاریخ‌ها با فرمت YYYY/MM/DD اگر وارد شده‌اند
    const dateRegex = /^\d{4}\/\d{2}\/\d{2}$/;
    const dateFields = ["lastServiceDate", "purchaseDate", "warrantyEndDate"];
    for (const f of dateFields) {
      if (form[f] && !dateRegex.test(form[f])) {
        Swal.fire({
          icon: "error",
          title: "قالب تاریخ نادرست است",
          text: `فیلد ${f} باید در قالب YYYY/MM/DD وارد شود (مثال: 1402/09/10).`,
          background: "#1a1d23",
          color: "#fff",
          confirmButtonColor: "#facc15",
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // فقط لاگ برای دیباگ (چه داده‌ای فرستاده می‌شود)
      console.log("🚀 Sending form data:", form);

      const res = await fetch(`${API_BASE}/equipment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      console.log("🔹 HTTP Status:", res.status, res.statusText);

      // تلاش برای خواندن بدنه پاسخ
      let body = null;
      try {
        body = await res.json();
        console.log("📦 Response body:", body);
      } catch (parseErr) {
        console.warn("⚠️ Response is not JSON or empty body", parseErr);
      }

      if (!res.ok) {
        // پیام خطای مناسب بر اساس status
        if (res.status === 404) {
          console.error("API Not Found:", `${API_BASE}/equipment`);
          Swal.fire({
            icon: "error",
            title: "خطا: مسیر API یافت نشد (404)",
            text: "درخواست به مسیر /api/equipment رسید ولی سرور این API را نشناخت. لطفاً مطمئن شوید روتر تجهیزات در بک‌اند رجیستر شده و آدرس صحیح است.",
            footer:
              "بررسی کن: app.use('/api/equipment', equipmentRouter) در بک‌اند.",
            background: "#1a1d23",
            color: "#fff",
            confirmButtonColor: "#ef4444",
          });
        } else if (res.status >= 500) {
          Swal.fire({
            icon: "error",
            title: `خطای سرور ${res.status}`,
            text:
              body?.message ||
              "خطا در سمت سرور هنگام ایجاد دستگاه. کنسول سرور را چک کنید.",
            background: "#1a1d23",
            color: "#fff",
            confirmButtonColor: "#ef4444",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: `خطا ${res.status}`,
            text:
              body?.message || `درخواست با خطا مواجه شد (HTTP ${res.status})`,
            background: "#1a1d23",
            color: "#fff",
            confirmButtonColor: "#ef4444",
          });
        }
        throw new Error(body?.message || `HTTP ${res.status}`);
      }

      // موفق
      await Swal.fire({
        icon: "success",
        title: "دستگاه با موفقیت ایجاد شد",
        text: `کد دستگاه: ${body?.equipmentCode || form.equipmentCode}`,
        background: "#1a1d23",
        color: "#fff",
        confirmButtonColor: "#facc15",
      });

      router.push("/manager-dashboard/equipment");
    } catch (err) {
      console.error("❌ create equipment error:", err);
      // اگر خطای شبکه (مثلاً backend آفلاین)
      if (err.name === "TypeError") {
        Swal.fire({
          icon: "error",
          title: "خطای شبکه",
          text: "ارتباط با سرور برقرار نشد. مطمئن شوید سرور در http://localhost:7000 اجرا شده و CORS اجازه می‌دهد.",
          background: "#1a1d23",
          color: "#fff",
          confirmButtonColor: "#ef4444",
        });
      } else {
        // پیام خطای عمومی
        Swal.fire({
          icon: "error",
          title: "خطا در ایجاد دستگاه",
          text: err.message || "خطا در ارتباط با سرور",
          background: "#1a1d23",
          color: "#fff",
          confirmButtonColor: "#ef4444",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // === تولید خودکار کد دستگاه (EQ-01, EQ-02, ...) با خواندن همه تجهیزات از سرور ===
  useEffect(() => {
    const generateEquipmentCode = async () => {
      try {
        const res = await fetch(`${API_BASE}/equipment`);
        if (!res.ok) {
          console.warn("GET /equipment returned:", res.status);
          // اگر مسیر یا auth مشکل داشت، مقدار پیش‌فرض قرار بده
          setForm((prev) => ({ ...prev, equipmentCode: "EQ-01" }));
          return;
        }

        let data = null;
        try {
          data = await res.json();
        } catch (parseErr) {
          console.warn(
            "Failed to parse GET /equipment response as JSON",
            parseErr,
          );
          setForm((prev) => ({ ...prev, equipmentCode: "EQ-01" }));
          return;
        }

        // داده ممکنه آرایه خالی یا { success, data } یا { data: [...] }
        let items = [];
        if (Array.isArray(data)) items = data;
        else if (data?.data && Array.isArray(data.data)) items = data.data;
        else if (data?.data && typeof data.data === "object")
          items = [data.data];
        else items = [];

        if (items.length === 0) {
          setForm((prev) => ({ ...prev, equipmentCode: "EQ-01" }));
          return;
        }

        // استخراج شماره‌ها از equipmentCode (یافتن بزرگترین عدد)
        const numbers = items
          .map((it) => {
            const code = it.equipmentCode || it.code || "";
            const parts = String(code).split("-");
            const n = parts.length > 1 ? parseInt(parts[1], 10) : NaN;
            return Number.isFinite(n) ? n : null;
          })
          .filter((n) => n !== null);

        const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
        const next = maxNum + 1;
        const formatted = `EQ-${String(next).padStart(2, "0")}`;

        setForm((prev) => ({ ...prev, equipmentCode: formatted }));
      } catch (err) {
        console.error("خطا در ساخت کد دستگاه", err);
        // مقدار پیش‌فرض
        setForm((prev) => ({ ...prev, equipmentCode: "EQ-01" }));
      }
    };

    generateEquipmentCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DashboardLayout>
      <div
        className="p-4 sm:p-8 min-h-screen bg-[#0f1115] rounded-[2.5rem] border border-gray-800 shadow-2xl"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-6 border-b border-gray-800">
          <div>
            <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">
              افزودن <span className="text-yellow-400">تجهیز جدید</span>
            </h1>
            <p className="text-gray-500 text-xs font-bold mt-2 flex items-center gap-2">
              <Wrench size={14} className="text-yellow-400" />
              ثبت و مدیریت دارایی‌های ثابت
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push("/manager-dashboard/equipment")}
              className="bg-[#1a1d23] text-yellow-400 border border-yellow-400 px-4 py-2 rounded-xl font-black hover:bg-yellow-400 hover:text-black transition"
            >
              بازگشت به فهرست
            </button>
            <button
              onClick={() => {
                setForm({
                  equipmentCode: "",
                  name: "",
                  brand: "",
                  model: "",
                  healthIndex: 100,
                  lastServiceDate: "",
                  operationalStatus: "Operational",
                  location: "",
                  purchaseDate: "",
                  warrantyEndDate: "",
                  notes: "",
                });
              }}
              className="bg-white text-black px-4 py-2 rounded-xl font-black hover:opacity-90 transition"
            >
              پاک‌سازی فرم
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
          <div className="bg-[#1a1d23] p-6 rounded-3xl border border-gray-800 shadow-inner">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* equipmentCode */}
              <div className="space-y-2">
                <label className="text-gray-400 text-sm font-bold">
                  شناسه دستگاه
                </label>

                <input
                  value={form.equipmentCode}
                  readOnly
                  className="w-full bg-[#0f1115] border border-gray-700 text-white rounded-2xl p-4
               focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400
               outline-none cursor-not-allowed opacity-80"
                />
              </div>

              {/* name */}
              <div className="space-y-2">
                <label className="text-gray-400 text-sm font-bold">
                  نام دستگاه
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="مثال: پرس پا وزنه‌آزاد"
                  required
                  className="w-full bg-[#0f1115] border border-gray-700 text-white rounded-2xl p-4 focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 outline-none"
                />
              </div>

              {/* brand */}
              <div className="space-y-2">
                <label className="text-gray-400 text-sm font-bold">
                  برند سازنده
                </label>
                <select
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0f1115] border border-gray-700 text-white rounded-2xl p-4 focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 outline-none appearance-none"
                >
                  <option value="" disabled>
                    انتخاب برند...
                  </option>
                  {/* برندهای معروف ایرانی */}
                  <option value="Technogym Iran">Technogym Iran</option>
                  <option value="Matrix Iran">Matrix Iran</option>
                  <option value="Body-Solid Iran">Body-Solid Iran</option>
                  <option value="DHZ Iran">DHZ Iran</option>
                  <option value="Life Fitness Iran">Life Fitness Iran</option>
                  {/* برندهای معروف خارجی */}
                  <option value="Technogym">Technogym</option>
                  <option value="Matrix">Matrix</option>
                  <option value="Body-Solid">Body-Solid</option>
                  <option value="DHZ">DHZ</option>
                  <option value="Life Fitness">Life Fitness</option>
                </select>
              </div>

              {/* model */}
              <div className="space-y-2">
                <label className="text-gray-400 text-sm font-bold">
                  مدل دستگاه
                </label>
                <input
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                  placeholder="مدل (اختیاری)"
                  className="w-full bg-[#0f1115] border border-gray-700 text-white rounded-2xl p-4 focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 outline-none"
                />
              </div>

              {/* healthIndex slider */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-gray-400 text-sm font-bold">
                  شاخص سلامت ({form.healthIndex}%)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    name="healthIndex"
                    min="0"
                    max="100"
                    value={form.healthIndex}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        healthIndex: Number(e.target.value),
                      }))
                    }
                    className="w-full"
                  />
                  <input
                    type="number"
                    name="healthIndex"
                    value={form.healthIndex}
                    onChange={handleNumberChange}
                    min="0"
                    max="100"
                    className="w-20 bg-[#0f1115] border border-gray-700 text-white rounded-2xl p-2 text-center"
                  />
                </div>
              </div>

              {/* lastServiceDate */}
              <div className="space-y-2">
                <label className="text-gray-400 text-sm font-bold">
                  آخرین سرویس فنی (YYYY/MM/DD)
                </label>
                <input
                  name="lastServiceDate"
                  value={form.lastServiceDate}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, ""); // فقط عدد
                    if (val.length > 4)
                      val = val.slice(0, 4) + "/" + val.slice(4);
                    if (val.length > 7)
                      val = val.slice(0, 7) + "/" + val.slice(7, 9);
                    if (val.length > 10) val = val.slice(0, 10);
                    setForm((prev) => ({ ...prev, lastServiceDate: val }));
                  }}
                  placeholder="مثال: 1402/09/10"
                  maxLength={10}
                  className="w-full bg-[#0f1115] border border-gray-700 text-white rounded-2xl p-4 focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 outline-none"
                />
              </div>

              {/* operationalStatus */}
              <div className="space-y-2">
                <label className="text-gray-400 text-sm font-bold">
                  وضعیت عملیاتی
                </label>
                <select
                  name="operationalStatus"
                  value={form.operationalStatus}
                  onChange={handleChange}
                  className="w-full bg-[#0f1115] border border-gray-700 text-white rounded-2xl p-4 focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 outline-none appearance-none"
                >
                  {statusOptions.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* محل قرارگیری */}
              <div className="space-y-2">
                <label className="text-gray-400 text-sm font-bold">
                  محل قرارگیری
                </label>
                <select
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0f1115] border border-gray-700 text-white rounded-2xl p-4 focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 outline-none appearance-none"
                >
                  <option value="" disabled>
                    انتخاب محل قرارگیری...
                  </option>
                  <option value="کف طبقه اول">کف طبقه اول</option>
                  <option value="کف طبقه دوم">کف طبقه دوم</option>
                  <option value="سالن اصلی">سالن اصلی</option>
                </select>
              </div>
              {/* تاریخ خرید */}
              <div className="space-y-2">
                <label className="text-gray-400 text-sm font-bold">
                  تاریخ خرید (YYYY/MM/DD)
                </label>
                <input
                  name="purchaseDate"
                  value={form.purchaseDate}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, ""); // فقط عدد
                    if (val.length > 4)
                      val = val.slice(0, 4) + "/" + val.slice(4);
                    if (val.length > 7)
                      val = val.slice(0, 7) + "/" + val.slice(7, 9);
                    if (val.length > 10) val = val.slice(0, 10);
                    setForm((prev) => ({ ...prev, purchaseDate: val }));
                  }}
                  placeholder="مثال: 1401/02/15"
                  maxLength={10}
                  className="w-full bg-[#0f1115] border border-gray-700 text-white rounded-2xl p-4 focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 outline-none"
                />
              </div>

              {/* پایان گارانتی */}
              <div className="space-y-2">
                <label className="text-gray-400 text-sm font-bold">
                  پایان گارانتی (YYYY/MM/DD)
                </label>
                <input
                  name="warrantyEndDate"
                  value={form.warrantyEndDate}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, ""); // فقط عدد
                    if (val.length > 4)
                      val = val.slice(0, 4) + "/" + val.slice(4);
                    if (val.length > 7)
                      val = val.slice(0, 7) + "/" + val.slice(7, 9);
                    if (val.length > 10) val = val.slice(0, 10);
                    setForm((prev) => ({ ...prev, warrantyEndDate: val }));
                  }}
                  placeholder="اختیاری"
                  maxLength={10}
                  className="w-full bg-[#0f1115] border border-gray-700 text-white rounded-2xl p-4 focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 outline-none"
                />
              </div>

              {/* notes */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-gray-400 text-sm font-bold">
                  توضیحات تکمیلی
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="یادداشت‌ها یا هشدارها درباره دستگاه..."
                  rows="4"
                  className="w-full bg-[#0f1115] border border-gray-700 text-white rounded-2xl p-4 focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 outline-none"
                />
              </div>
            </div>
          </div>

          {/* submit */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full max-w-md bg-yellow-400 hover:bg-yellow-500 text-black px-10 py-4 rounded-2xl font-black text-lg italic transition-all shadow-[0_20px_40px_rgba(250,204,21,0.15)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              {isSubmitting ? "در حال ثبت..." : "ایجاد دستگاه جدید"}
            </button>
          </div>
        </form>

        {/* small footer hint */}
        <div className="mt-8 text-gray-500 text-xs flex items-center gap-2">
          <Info size={14} className="text-yellow-400" />
          فیلدهای تاریخ را در قالب YYYY/MM/DD وارد کنید. برای تبدیل تاریخ شمسی
          از فرانت یا ابزار مناسب استفاده کنید.
        </div>
      </div>
    </DashboardLayout>
  );
}

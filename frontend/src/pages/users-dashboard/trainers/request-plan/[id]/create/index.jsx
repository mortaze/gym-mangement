// frontend/src/pages/trainers-dashboard/trainers/[id]/show/index.jsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router"; // Pages Router
import moment from "moment-jalaali";
import DashboardLayout from "../../../../layout";
import Swal from "sweetalert2";

/**
 * صفحهٔ درخواست برنامه تمرینی (نسخه‌ی کاربر -> ارسال درخواست به یک مربی مشخص)
 *
 * رفتار کلیدی:
 * - trainer: از sessionStorage خوانده می‌شود؛ اگر نبود از API /api/users/:id گرفته می‌شود
 * - currentUser: از sessionStorage خوانده می‌شود (بعد از لاگین باید ذخیره شده باشد)
 * - فیلدها: height, weight, photos, userNotes
 * - قیمت ثابت: 500000 تومان
 * - پرداخت: دکمهٔ نمادین "پرداخت" — وضعیت پرداخت در state نگه داشته می‌شود
 * - ارسال: multipart/form-data به POST /api/training-requests
 *
 * توجه: backend باید endpoint /api/training-requests را با multer یا مشابه برای دریافت فایل‌ها پشتیبانی کند.
 */

export default function TrainingRequestPage() {
  const router = useRouter();
  const { id } = router.query; // id مربی از URL

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000";

  const [trainer, setTrainer] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [form, setForm] = useState({
    height: "",
    weight: "",
    userNotes: "",
  });

  const [photos, setPhotos] = useState([]); // File[]
  const [photoPreviews, setPhotoPreviews] = useState([]); // object URLs

  const [isPaid, setIsPaid] = useState(false); // پرداخت نمادین
  const PRICE = 500000;

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [previewPhoto, setPreviewPhoto] = useState(null); // برای گالری بزرگ

  // --- load currentUser from sessionStorage -> fetch full user from API
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        if (typeof window === "undefined") return;

        const rawUser = sessionStorage.getItem("currentUser");
        if (!rawUser) {
          console.warn("currentUser not found in sessionStorage");
          return;
        }

        const sessionUser = JSON.parse(rawUser);

        // گرفتن اطلاعات کامل کاربر از API با id
        const res = await fetch(
          `http://localhost:7000/api/users/${sessionUser._id}`,
        );
        const json = await res.json();

        if (json?.user) {
          setCurrentUser(json.user);
        } else {
          console.warn("user api response invalid:", json);
        }

        // trainer (اختیاری – اگر قبلاً ذخیره شده باشد)
        const rawTrainer = sessionStorage.getItem("trainer");
        if (rawTrainer) {
          setTrainer(JSON.parse(rawTrainer));
        }
      } catch (err) {
        console.error("error loading currentUser/trainer:", err);
      }
    };

    loadCurrentUser();
  }, []);

  // fetch trainer by id if not in sessionStorage
  useEffect(() => {
    if (!id) return;
    if (trainer && trainer._id && String(trainer._id) === String(id)) {
      setLoading(false);
      return;
    }

    let mounted = true;
    const loadTrainer = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/users/${id}`);
        const json = await res.json();
        if (json && json.user) {
          if (!mounted) return;
          setTrainer(json.user);
          // optionally store in sessionStorage for later
          try {
            sessionStorage.setItem("trainer", JSON.stringify(json.user));
          } catch {}
        } else {
          console.warn("trainer not found:", json);
          if (!mounted) return;
          setTrainer(null);
        }
      } catch (err) {
        console.error("error fetching trainer:", err);
        if (!mounted) return;
        setTrainer(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadTrainer();
    return () => (mounted = false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // cleanup object URLs on unmount / photos change
  useEffect(() => {
    return () => {
      photoPreviews.forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch {}
      });
    };
  }, [photoPreviews]);

  // --- handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files || []);
    setPhotos(files);

    // previews
    // revoke old
    photoPreviews.forEach((p) => {
      try {
        URL.revokeObjectURL(p);
      } catch {}
    });
    const previews = files.map((f) => URL.createObjectURL(f));
    setPhotoPreviews(previews);
  };

  const removePhoto = (index) => {
    setPhotos((prev) => {
      const cp = [...prev];
      cp.splice(index, 1);
      return cp;
    });
    setPhotoPreviews((prev) => {
      const cp = [...prev];
      if (cp[index]) {
        try {
          URL.revokeObjectURL(cp[index]);
        } catch {}
      }
      cp.splice(index, 1);
      return cp;
    });
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
  const resolvePhotoUrl = (p) => {
    if (!p) return null;
    if (p.startsWith("http://") || p.startsWith("https://")) return p;
    return `${API_BASE}/uploads/${p.replace(/^\/+/, "")}`;
  };

  const handleSubmit = async () => {
    // اعتبارسنجی
    if (!currentUser || !currentUser._id) {
      Swal.fire({
        title: "ابتدا وارد شوید",
        text: "برای ارسال درخواست باید وارد حساب کاربری خود شوید.",
        icon: "warning",
        background: "#1a1d23",
        color: "#fff",
      });
      return;
    }

    if (!trainer || !trainer._id) {
      Swal.fire({
        title: "مربی نامشخص",
        text: "اطلاعات مربی موجود نیست.",
        icon: "error",
        background: "#1a1d23",
        color: "#fff",
      });
      return;
    }

    if (!form.height || !form.weight) {
      Swal.fire({
        title: "فیلدهای الزامی",
        text: "لطفاً قد و وزن خود را وارد کنید.",
        icon: "warning",
        background: "#1a1d23",
        color: "#fff",
      });
      return;
    }

    if (photos.length === 0) {
      Swal.fire({
        title: "عکس مورد نیاز",
        text: "لطفاً حداقل یک عکس آپلود کنید.",
        icon: "warning",
        background: "#1a1d23",
        color: "#fff",
      });
      return;
    }

    if (!isPaid) {
      Swal.fire({
        title: "پرداخت انجام نشده",
        text: "ابتدا پرداخت را انجام دهید.",
        icon: "warning",
        background: "#1a1d23",
        color: "#fff",
      });
      return;
    }

    // ارسال
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("userId", currentUser._id);
      fd.append("trainerId", trainer._id);
      fd.append("height", String(form.height));
      fd.append("weight", String(form.weight));
      fd.append("paymentMethod", "online");
      fd.append("amount", String(PRICE));
      // یادداشت کاربر (userNotes)
      fd.append("userNotes", form.userNotes || "");

      photos.forEach((file) => {
        fd.append("photos", file, file.name);
      });

      const res = await fetch(`${API_BASE}/training-requests`, {
        method: "POST",
        body: fd,
        // اگر سرور نیاز به توکن دارد، هدر Authorization اضافه کن
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok && (json.success || res.status === 201)) {
        Swal.fire({
          title: "درخواست ارسال شد",
          text: "درخواست شما با موفقیت ثبت شد. مربی به زودی بررسی خواهد کرد.",
          icon: "success",
          background: "#1a1d23",
          color: "#fff",
          confirmButtonColor: "#facc15",
        }).then(() => {
          // بعد از موفقیت می‌توان کاربر را هدایت کرد
          router.push("/users-dashboard/trainers");
        });
      } else {
        console.error("submit error:", json);
        Swal.fire({
          title: "خطا",
          text: json.message || "خطا در ارسال درخواست.",
          icon: "error",
          background: "#1a1d23",
          color: "#fff",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (err) {
      console.error("submit exception:", err);
      Swal.fire({
        title: "خطا",
        text: "ارسال ناموفق بود. اتصال یا سرور را بررسی کنید.",
        icon: "error",
        background: "#1a1d23",
        color: "#fff",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // --- UI ---
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
          ثبت درخواست برنامه تمرینی
        </h1>

        {/* بالای صفحه: اطلاعات مربی و پرداخت خلاصه */}
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
              {isPaid ? (
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

        {/* اطلاعات کاربر (ورود شده) */}
        <section className="mb-6 p-4 bg-[#1a1d23] rounded-lg border border-gray-800">
          <h3 className="text-yellow-400 font-bold mb-3">اطلاعات شما</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-300">
            <div>
              <label className="text-xs text-gray-500">نام</label>
              <div className="mt-1 text-white font-black">
                {currentUser?.name || "—"}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">کد عضویت</label>
              <div className="mt-1 text-gray-300">
                {currentUser?.employeeCode || "—"}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">تماس</label>
              <div className="mt-1 text-gray-300">
                {currentUser?.contactNumber || "—"}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">ایمیل</label>
              <div className="mt-1 text-gray-300">
                {currentUser?.email || "—"}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">تاریخ عضویت</label>
              <div className="mt-1 text-gray-300">
                {currentUser?.createdAt
                  ? moment(currentUser.createdAt).format("jYYYY/jMM/jDD")
                  : "—"}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">وضعیت</label>
              <div className="mt-1 text-gray-300">
                {currentUser?.status || "—"}
              </div>
            </div>
          </div>
        </section>

        {/* فرم درخواست */}
        <section className="mb-6 p-4 bg-[#1a1d23] rounded-lg border border-gray-800">
          <h3 className="text-yellow-400 font-bold mb-3">
            اطلاعات بدنی و جزئیات
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                قد (cm)
              </label>
              <input
                name="height"
                value={form.height}
                onChange={handleChange}
                type="number"
                className="w-full bg-gray-800 p-3 rounded-lg text-white"
                placeholder="مثال: 175"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                وزن (kg)
              </label>
              <input
                name="weight"
                value={form.weight}
                onChange={handleChange}
                type="number"
                className="w-full bg-gray-800 p-3 rounded-lg text-white"
                placeholder="مثال: 78"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">سن</label>
              <input
                type="number"
                value={calcAgeFromBirthday(currentUser?.birthday)}
                readOnly
                className="w-full bg-gray-800 p-3 rounded-lg text-white cursor-not-allowed"
                placeholder="—"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs text-gray-500 mb-1">
              عکس‌های بدن (حداقل 1)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotos}
                className="file:bg-gray-800 file:text-white file:px-3 file:py-2 file:rounded-lg cursor-pointer bg-gray-900 text-gray-300 rounded-lg p-2"
              />
              {/* نمایش عکس‌ها */}
              <div className="flex gap-3 overflow-x-auto">
                {photoPreviews.length === 0 && (
                  <div className="text-gray-500">عکسی آپلود نشده</div>
                )}

                {photoPreviews.map((p, idx) => (
                  <div
                    key={idx}
                    className="relative w-28 h-28 rounded-md overflow-hidden border border-gray-700 cursor-pointer hover:border-yellow-400 transition"
                  >
                    <img
                      src={p}
                      alt={`preview-${idx}`}
                      className="w-full h-full object-cover"
                      onClick={() => setPreviewPhoto(p)} // اینجا مهمه
                    />
                    <button
                      onClick={() => removePhoto(idx)}
                      type="button"
                      className="absolute top-1 left-1 bg-black/60 text-red-400 rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      title="حذف"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* مودال بزرگنمایی */}
              {previewPhoto && (
                <div
                  className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
                  onClick={() => setPreviewPhoto(null)}
                >
                  <div
                    className="relative max-w-4xl max-h-[90vh]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setPreviewPhoto(null)}
                      className="absolute -top-10 right-0 text-white text-3xl font-black hover:text-yellow-400"
                    >
                      ×
                    </button>
                    <img
                      src={previewPhoto} // blob یا URL واقعی هر دو اینجا کار می‌کنه
                      alt="preview"
                      className="max-h-[90vh] max-w-full rounded-xl shadow-2xl"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs text-gray-500 mb-1">
              توضیحات / یادداشت
            </label>
            <textarea
              name="userNotes"
              value={form.userNotes}
              onChange={handleChange}
              placeholder="درخواست یا توضیحات خود را بنویسید..."
              className="w-full bg-gray-800 p-3 rounded-lg text-white min-h-[120px]"
            />
          </div>
        </section>

        {/* دکمه‌ها */}
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full md:w-auto px-6 py-3 bg-yellow-400 text-black rounded-2xl font-black disabled:opacity-50"
          >
            {submitting ? "در حال ارسال..." : "ثبت درخواست"}
          </button>

          <button
            onClick={() => router.back()}
            className="w-full md:w-auto px-6 py-3 border border-gray-700 text-gray-300 rounded-2xl"
          >
            بازگشت
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

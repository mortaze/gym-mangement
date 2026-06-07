"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "../../../layout";
import { useRouter } from "next/router"; // pages-router
import Swal from "sweetalert2";
import {
  Zap,
  Wrench,
  History,
  Info,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

import {
  useGetEquipmentsQuery,
  useUpdateEquipmentMutation,
} from "@/redux/features/equipmentApi";

export default function EditEquipmentPage() {
  const router = useRouter();
  const { id } = router.query; // id can be equipmentCode (EQ-01) or mongo _id

  // RTK Query hooks from equipmentApi
  const {
    data: equipmentsData,
    isLoading: loadingEquipments,
    isError: equipmentsError,
    refetch,
  } = useGetEquipmentsQuery(); // no args — returns array or { data: [...] }

  const [updateEquipment, { isLoading: isUpdating }] =
    useUpdateEquipmentMutation();

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

  const [original, setOriginal] = useState(null); // اصل شیء از API

  // normalize equipmentsData to array
  const equipments = React.useMemo(() => {
    if (!equipmentsData) return [];
    if (Array.isArray(equipmentsData)) return equipmentsData;
    if (Array.isArray(equipmentsData.data)) return equipmentsData.data;
    return [];
  }, [equipmentsData]);

  // وقتی id یا داده‌ها آمد، تجهیز مورد نظر را پیدا کن و فرم را پر کن
  useEffect(() => {
    if (!id || equipments.length === 0) return;

    const found =
      equipments.find((it) => it.equipmentCode === id || it._id === id) ||
      equipments.find((it) => String(it._id) === String(id));

    if (!found) {
      // شاید id / equipmentCode وجود نداشت — پیام و بازگشت به لیست
      console.warn("equipment not found for id:", id);
      Swal.fire({
        icon: "warning",
        title: "تجهیز یافت نشد",
        text: "تجهیز مورد نظر در سرور پیدا نشد. مطمئن شوید شناسه صحیح است.",
        background: "#1a1d23",
        color: "#fff",
        confirmButtonColor: "#facc15",
      }).then(() => router.push("/manager-dashboard/equipment"));
      return;
    }

    setOriginal(found);
    setForm({
      equipmentCode: found.equipmentCode || found.code || "",
      name: found.name || "",
      brand: found.brand || "",
      model: found.model || "",
      healthIndex:
        typeof found.healthIndex === "number"
          ? found.healthIndex
          : Number(found.healthIndex) || 100,
      lastServiceDate: found.lastServiceDate || found.lastService || "",
      operationalStatus: found.operationalStatus || "Operational",
      location: found.location || "",
      purchaseDate: found.purchaseDate || "",
      warrantyEndDate: found.warrantyEndDate || "",
      notes: found.notes || "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, equipments]);

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
        text: "لطفاً برند سازنده را انتخاب یا وارد کنید.",
        background: "#1a1d23",
        color: "#fff",
        confirmButtonColor: "#facc15",
      });
      return false;
    }
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
    const dateRegex = /^\d{4}\/\d{2}\/\d{2}$/;
    const dateFields = ["lastServiceDate", "purchaseDate", "warrantyEndDate"];
    for (const f of dateFields) {
      if (form[f] && !dateRegex.test(form[f])) {
        Swal.fire({
          icon: "error",
          title: "قالب تاریخ نادرست است",
          text: `فیلد ${f} باید در قالب YYYY/MM/DD وارد شود.`,
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
    if (!original) {
      Swal.fire({
        icon: "error",
        title: "داده آماده نیست",
        text: "ابتدا داده‌ها را بارگذاری کنید.",
        background: "#1a1d23",
        color: "#fff",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    // ساخت payload فقط با فیلدهایی که نیاز داریم
    const payload = {
      name: form.name,
      brand: form.brand,
      model: form.model,
      healthIndex: form.healthIndex,
      lastServiceDate: form.lastServiceDate,
      operationalStatus: form.operationalStatus,
      location: form.location,
      purchaseDate: form.purchaseDate,
      warrantyEndDate: form.warrantyEndDate,
      notes: form.notes,
    };

    try {
      Swal.fire({
        title: "در حال ذخیره...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
        background: "#1a1d23",
        color: "#fff",
      });

      // برای شناسه از _id (در صورت وجود) یا equipmentCode استفاده می‌کنیم
      const ident = original._id || original.equipmentCode || id;

      // فرض ساختار mutation: updateEquipment({ id, ...payload })
      const res = await updateEquipment({ id: ident, ...payload }).unwrap();

      Swal.close();
      Swal.fire({
        icon: "success",
        title: "ویرایش با موفقیت انجام شد",
        text: `تجهیز ${res?.equipmentCode || form.equipmentCode} بروزرسانی شد.`,
        background: "#1a1d23",
        color: "#fff",
        confirmButtonColor: "#facc15",
      }).then(() => {
        router.push("/manager-dashboard/equipment");
      });
    } catch (err) {
      console.error("update error:", err);
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "خطا در به‌روزرسانی",
        text: err?.data?.message || err.message || "خطای شبکه یا سرور",
        background: "#1a1d23",
        color: "#fff",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  // حذف کردن (اختیاری) — اگر خواستی دکمه حذف هم اضافه کنم
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "حذف تجهیز",
      text: "آیا مطمئن هستید می‌خواهید این تجهیز را حذف کنید؟ این عمل قابل بازگشت نیست.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله حذف کن",
      cancelButtonText: "لغو",
      confirmButtonColor: "#ef4444",
      background: "#1a1d23",
      color: "#fff",
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: "در حال حذف...",
        didOpen: () => Swal.showLoading(),
        background: "#1a1d23",
        color: "#fff",
      });
      const ident = original._id || original.equipmentCode || id;
      // اگر equipmentApi در سرویس mutation deleteEquipment دارد:
      if (typeof updateEquipment === "function" && updateEquipment.delete) {
        // unlikely; placeholder
      }
      // fallback: call fetch directly to delete
      const res = await fetch(`http://localhost:7000/api/equipment/${ident}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      Swal.fire({
        icon: "success",
        title: "تجهیز حذف شد",
        background: "#1a1d23",
        color: "#fff",
        confirmButtonColor: "#facc15",
      }).then(() => router.push("/manager-dashboard/equipment"));
    } catch (err) {
      console.error("delete error:", err);
      Swal.fire({
        icon: "error",
        title: "خطا در حذف",
        text: err.message || "خطا در ارتباط با سرور",
        background: "#1a1d23",
        color: "#fff",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  // loading UI while fetching equipments or waiting for original
  if (loadingEquipments)
    return (
      <DashboardLayout>
        <div className="p-6 text-center text-white">
          در حال بارگذاری اطلاعات...
        </div>
      </DashboardLayout>
    );

  if (equipmentsError)
    return (
      <DashboardLayout>
        <div className="p-6 text-center text-red-400">
          خطا در دریافت داده‌ها — لطفاً اتصال سرور را بررسی کنید.
          <div className="mt-3">
            <button
              onClick={() => refetch()}
              className="bg-yellow-400 text-black px-3 py-2 rounded-xl"
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      </DashboardLayout>
    );

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
              ویرایش <span className="text-yellow-400">تجهیز</span>
            </h1>
            <p className="text-gray-500 text-xs font-bold mt-2 flex items-center gap-2">
              <Wrench size={14} className="text-yellow-400" />
              مدیریت و به‌روزرسانی دارایی‌ها
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
                // بازگشت به مقادیر اولیه
                if (original) {
                  setForm({
                    equipmentCode: original.equipmentCode || "",
                    name: original.name || "",
                    brand: original.brand || "",
                    model: original.model || "",
                    healthIndex:
                      typeof original.healthIndex === "number"
                        ? original.healthIndex
                        : Number(original.healthIndex) || 100,
                    lastServiceDate: original.lastServiceDate || "",
                    operationalStatus:
                      original.operationalStatus || "Operational",
                    location: original.location || "",
                    purchaseDate: original.purchaseDate || "",
                    warrantyEndDate: original.warrantyEndDate || "",
                    notes: original.notes || "",
                  });
                }
              }}
              className="bg-white text-black px-4 py-2 rounded-xl font-black hover:opacity-90 transition"
            >
              بازنشانی
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
                  className="w-full bg-[#0f1115] border border-gray-700 text-white rounded-2xl p-4 focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 outline-none cursor-not-allowed opacity-80"
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
                  <option value="Technogym Iran">Technogym Iran</option>
                  <option value="Matrix Iran">Matrix Iran</option>
                  <option value="Body-Solid Iran">Body-Solid Iran</option>
                  <option value="DHZ Iran">DHZ Iran</option>
                  <option value="Life Fitness Iran">Life Fitness Iran</option>
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

              {/* healthIndex */}
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
                    let val = e.target.value.replace(/\D/g, "");
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

              {/* location */}
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

              {/* purchaseDate */}
              <div className="space-y-2">
                <label className="text-gray-400 text-sm font-bold">
                  تاریخ خرید (YYYY/MM/DD)
                </label>
                <input
                  name="purchaseDate"
                  value={form.purchaseDate}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, "");
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

              {/* warrantyEndDate */}
              <div className="space-y-2">
                <label className="text-gray-400 text-sm font-bold">
                  پایان گارانتی (YYYY/MM/DD)
                </label>
                <input
                  name="warrantyEndDate"
                  value={form.warrantyEndDate}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, "");
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
          <div className="flex justify-center gap-4">
            <button
              type="submit"
              disabled={isUpdating}
              className="group relative w-full max-w-md bg-yellow-400 hover:bg-yellow-500 text-black px-10 py-4 rounded-2xl font-black text-lg italic transition-all shadow-[0_20px_40px_rgba(250,204,21,0.15)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              {isUpdating ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="group relative w-full max-w-xs bg-red-500 hover:bg-red-600 text-white px-6 py-4 rounded-2xl font-black text-sm italic transition-all shadow-[0_8px_20px_rgba(239,68,68,0.15)] active:scale-95"
            >
              حذف تجهیز
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

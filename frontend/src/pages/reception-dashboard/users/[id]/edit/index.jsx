// frontend\src\pages\manager-dashboard\users\[id]\edit\index.jsx
"use client";

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Link from "next/link";
import DashboardLayout from "../../../layout";
import { FaBirthdayCake } from "react-icons/fa";
import { useRouter } from "next/router";
import {
  ArrowRight,
  Eye,
  EyeOff,
  UserPlus,
  Image as ImageIcon,
  ShieldCheck,
  User,
  Hash,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
} from "lucide-react";

import {
  useGetUserByIdQuery,
  useUpdateUserMutation,
} from "../../../../../redux/features/userApi";

const ROLE_OPTIONS = [
  { value: "Member", label: "ورزشکار (عضو)" },
  { value: "Trainer", label: "مربی" },
  { value: "Reception", label: "پذیرش باشگاه" },
  { value: "Admin", label: "مدیر سیستم" },
  { value: "Accountant", label: "حسابدار" },
];

export default function EditUserPage() {
  const router = useRouter();
  const { id } = router.query;

  const [showPassword, setShowPassword] = useState(false);
  const [previewOld, setPreviewOld] = useState("");
  const [previewNew, setPreviewNew] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    employeeCode: "",
    password: "",
    role: "",
    email: "",
    contactNumber: "",
    address: "",
    birthday: "",
    profileImage: null,
    status: "active",
  });

  const { data, isLoading, isError } = useGetUserByIdQuery(id, { skip: !id });
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  useEffect(() => {
    if (!id) return; // اگر id هنوز نیومده، fetch نکن

    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:7000/api/users/${id}`);
        const result = await res.json();

        if (result?.user) {
          setFormData({
            name: result.user.name ?? "",
            employeeCode: result.user.employeeCode ?? "",
            password: "",
            role: result.user.role ?? "",
            email: result.user.email ?? "",
            contactNumber: result.user.contactNumber ?? "",
            address: result.user.address ?? "",
            birthday: result.user.birthday ?? "",
            profileImage: result.user.profileImage ?? null,
            status: result.user.status ?? "active",
          });
          setPreviewOld(result.user.profileImage ?? "");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchData();
  }, [id]); // فقط وقتی id تغییر کرد اجرا میشه

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData((prev) => ({ ...prev, profileImage: file }));
    setPreviewNew(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "profileImage") {
          if (formData[key] instanceof File) form.append(key, formData[key]);
        } else {
          form.append(key, formData[key]);
        }
      });

      await updateUser({ id, formData: form }).unwrap();

      Swal.fire({
        icon: "success",
        title: "ویرایش کاربر با موفقیت انجام شد",
        background: "#1a1d23",
        color: "#fff",
        confirmButtonColor: "#facc15",
        confirmButtonText: "باشه",
      }).then(() => router.push("/reception-dashboard/users"));
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "خطا در ویرایش اطلاعات",
        text: err?.data?.message || "لطفاً ورودی‌ها را بررسی کنید",
        background: "#1a1d23",
        color: "#fff",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  if (!id || isLoading)
    return (
      <DashboardLayout>
        <div className="text-white text-center py-10">در حال بارگذاری...</div>
      </DashboardLayout>
    );

  if (isError)
    return (
      <DashboardLayout>
        <div className="text-red-600 text-center py-10">
          خطا در دریافت اطلاعات کاربر
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
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-800">
          <Link
            href="/reception-dashboard/users"
            className="p-3 bg-gray-800 text-yellow-400 hover:bg-yellow-400 hover:text-black transition-all rounded-xl"
          >
            <ArrowRight size={24} />
          </Link>
          <div>
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">
              ویرایش <span className="text-yellow-400">کاربر</span>
            </h2>
            <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em]">
              Edit User Information
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8">
          <div className="bg-[#1a1d23] p-6 lg:p-10 rounded-3xl border border-gray-800 shadow-inner">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* نام کامل */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-gray-400 font-bold text-sm mr-2">
                  <User size={16} className="text-yellow-400" /> نام و نام
                  خانوادگی
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0f1115] border border-gray-700 text-white rounded-2xl p-4 focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 outline-none transition-all shadow-sm"
                  placeholder="مثال: علی فلاح"
                />
              </div>

              {/* کد عضویت */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-gray-400 font-bold text-sm mr-2">
                  <Hash size={16} className="text-yellow-400" /> کد عضویت / کد
                  ملی
                </label>
                <input
                  type="text"
                  name="employeeCode"
                  value={formData.employeeCode}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0f1115] border border-gray-700 text-white rounded-2xl p-4 focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 outline-none transition-all shadow-sm"
                  placeholder="شماره شناسایی"
                />
              </div>

              {/* رمز عبور */}
              <div className="space-y-2 relative">
                <label className="flex items-center gap-2 text-gray-400 font-bold text-sm mr-2">
                  <ShieldCheck size={16} className="text-yellow-400" /> رمز عبور
                  پنل
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-[#0f1115] border border-gray-700 text-white rounded-2xl p-4 pl-12 focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 outline-none transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-yellow-400 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* نقش */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-gray-400 font-bold text-sm mr-2">
                  <UserPlus size={16} className="text-yellow-400" /> سطح دسترسی
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0f1115] border border-gray-700 text-white rounded-2xl p-4 focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">انتخاب نقش کاربر...</option>
                  {ROLE_OPTIONS.map((role) => (
                    <option
                      key={role.value}
                      value={role.value}
                      className="bg-gray-900"
                    >
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* تاریخ تولد */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-gray-400 font-bold text-sm mr-2">
                  <FaBirthdayCake size={16} className="text-yellow-400" /> تاریخ
                  تولد
                </label>
                <input
                  type="text"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleChange}
                  placeholder="مثال: 1383/06/03"
                  pattern="\d{4}/\d{2}/\d{2}"
                  className="w-full bg-[#0f1115] border border-gray-700 text-white rounded-2xl p-4 focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 outline-none transition-all"
                />
              </div>

              {/* شماره تماس */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-gray-400 font-bold text-sm mr-2">
                  <Phone size={16} className="text-yellow-400" /> شماره موبایل
                </label>
                <input
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="w-full bg-[#0f1115] border border-gray-700 text-white rounded-2xl p-4 focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 outline-none transition-all text-left"
                  dir="ltr"
                  placeholder="0912XXXXXXX"
                />
              </div>

              {/* ایمیل */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-gray-400 font-bold text-sm mr-2">
                  <Mail size={16} className="text-yellow-400" /> پست الکترونیک
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#0f1115] border border-gray-700 text-white rounded-2xl p-4 focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 outline-none transition-all"
                  placeholder="example@gym.com"
                />
              </div>

              {/* آدرس */}
              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center gap-2 text-gray-400 font-bold text-sm mr-2">
                  <MapPin size={16} className="text-yellow-400" /> آدرس محل
                  سکونت
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full bg-[#0f1115] border border-gray-700 text-white rounded-2xl p-4 focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 outline-none transition-all"
                />
              </div>

              {/* تصویر پروفایل */}
              <div className="md:col-span-2 space-y-4">
                <label className="flex items-center gap-2 text-gray-400 font-bold text-sm mr-2">
                  <ImageIcon size={16} className="text-yellow-400" /> تصویر
                  پروفایل
                </label>
                <div className="flex flex-wrap items-center gap-6 p-4 bg-[#0f1115] border-2 border-dashed border-gray-700 rounded-3xl">
                  <label className="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-xl cursor-pointer transition-all font-black text-xs uppercase shadow-lg">
                    <UserPlus size={16} /> انتخاب فایل
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  {previewNew ? (
                    <div className="flex items-center gap-3 bg-gray-800/50 p-2 rounded-2xl border border-gray-700">
                      <img
                        src={previewNew}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded-xl border-2 border-yellow-400"
                      />
                      <span className="text-xs text-gray-300 max-w-[150px] truncate">
                        {formData.profileImage.name}
                      </span>
                    </div>
                  ) : previewOld ? (
                    <img
                      src={previewOld}
                      alt="Old Preview"
                      className="w-16 h-16 object-cover rounded-xl border border-gray-700"
                    />
                  ) : (
                    <span className="text-gray-500 text-xs italic">
                      عکسی انتخاب نشده است (فرمت های مجاز: JPG, PNG)
                    </span>
                  )}
                </div>
              </div>

              {/* وضعیت حساب */}
              <div className="md:col-span-2 space-y-2">
                <label className="flex items-center gap-2 text-gray-400 font-bold text-sm mr-2">
                  <CheckCircle2 size={16} className="text-yellow-400" /> وضعیت
                  اولیه حساب
                </label>
                <div className="flex gap-4">
                  {["active", "inactive"].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, status }))}
                      className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all border ${
                        formData.status === status
                          ? "bg-yellow-400 text-black border-yellow-400 shadow-[0_5px_15px_rgba(250,204,21,0.2)]"
                          : "bg-transparent text-gray-500 border-gray-800 hover:border-gray-600"
                      }`}
                    >
                      {status === "active"
                        ? "فعال (Active)"
                        : "غیرفعال (Inactive)"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* دکمه ارسال نهایی */}
          <div className="flex justify-center pb-10">
            <button
              type="submit"
              disabled={isUpdating}
              className="group relative w-full max-w-md bg-yellow-400 hover:bg-yellow-500 text-black px-10 py-5 rounded-2xl font-black text-lg italic transition-all shadow-[0_20px_40px_rgba(250,204,21,0.15)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                {isUpdating ? "در حال ذخیره تغییرات..." : "ذخیره تغییرات"}
                {!isUpdating && <UserPlus size={22} />}
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

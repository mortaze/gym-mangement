"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Link from "next/link";
import DashboardLayout from "../../layout";
import { useRouter } from "next/router";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Image as ImageIcon,
  User,
  Hash,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

import {
  useListUsersQuery,
  useUpdateUserMutation,
} from "../../../../redux/features/userApi";

export default function EditMyProfilePage() {
  const router = useRouter();

  const { data, isLoading, isError } = useListUsersQuery();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const user = Array.isArray(data) && data.length > 0 ? data[0] : null;

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
    profileImage: null,
  });

  /* ---------- Prefill ---------- */
  useEffect(() => {
    if (!user) return;

    setFormData({
      name: user.name ?? "",
      employeeCode: user.employeeCode ?? "",
      password: "",
      role: user.role ?? "",
      email: user.email ?? "",
      contactNumber: user.contactNumber ?? "",
      address: user.address ?? "",
      profileImage: null,
    });

    setPreviewOld(user.profileImage ?? "");
  }, [user]);

  /* ---------- Handlers ---------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData((p) => ({ ...p, profileImage: file }));
    setPreviewNew(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const form = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === "profileImage") {
          if (value instanceof File) form.append(key, value);
        } else if (key !== "employeeCode" && key !== "role") {
          form.append(key, value);
        }
      });

      await updateUser({ id: user._id, formData: form }).unwrap();

      Swal.fire({
        icon: "success",
        title: "پروفایل با موفقیت بروزرسانی شد",
        background: "#1a1d23",
        color: "#fff",
        confirmButtonColor: "#facc15",
      }).then(() => {
        // ریدایرکت پس از تایید
        window.location.href = "http://localhost:3000/users-dashboard/profile";
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "خطا در ذخیره اطلاعات",
        text: err?.data?.message || "مشکلی رخ داد",
        background: "#1a1d23",
        color: "#fff",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  /* ---------- Guards ---------- */
  if (isLoading)
    return (
      <DashboardLayout>
        <div className="text-center py-20 text-yellow-400">
          در حال بارگذاری اطلاعات...
        </div>
      </DashboardLayout>
    );

  if (isError || !user)
    return (
      <DashboardLayout>
        <div className="text-center py-20 text-red-500">
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
            href="/dashboard/profile"
            className="p-3 bg-gray-800 text-yellow-400 hover:bg-yellow-400 hover:text-black transition-all rounded-xl"
          >
            <ArrowRight size={24} />
          </Link>
          <div>
            <h2 className="text-3xl font-black text-white italic uppercase">
              ویرایش <span className="text-yellow-400">پروفایل</span>
            </h2>
            <p className="text-gray-500 text-[10px] tracking-[0.3em] uppercase">
              Edit My Profile
            </p>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto bg-[#1a1d23] p-6 lg:p-10 rounded-3xl border border-gray-800 space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <Input
              icon={User}
              label="نام و نام خانوادگی"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />

            {/* Employee Code - LOCKED */}
            <Input
              icon={Hash}
              label="کد ملی / کد عضویت"
              value={formData.employeeCode}
              disabled
            />

            {/* Password */}
            <div className="space-y-2 relative ">
              <Label icon={ShieldCheck} text="رمز عبور جدید" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-[#0f1115]  border border-gray-700 text-white rounded-2xl p-4 pl-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-3/5 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            {/* Role - LOCKED */}
            <Input
              icon={UserPlus}
              label="نقش کاربری"
              value={formData.role}
              disabled
            />

            <Input
              icon={Phone}
              label="شماره تماس"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              dir="ltr"
            />

            <Input
              icon={Mail}
              label="ایمیل"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />

            <Input
              icon={MapPin}
              label="آدرس"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="md:col-span-2"
            />
          </div>

          {/* تصویر پروفایل */}
          <div className="md:col-span-2 space-y-4">
            <label className="flex items-center gap-2 text-gray-400 font-bold text-sm mr-2">
              <ImageIcon size={16} className="text-yellow-400" /> تصویر پروفایل
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
                  className="w-24 h-24 object-cover rounded-xl border border-gray-700"
                />
              ) : (
                <span className="text-gray-500 text-xs italic">
                  عکسی انتخاب نشده است (فرمت های مجاز: JPG, PNG)
                </span>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isUpdating}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-5 rounded-2xl font-black text-lg"
          >
            ذخیره تغییرات
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}

/* ---------- Small Components ---------- */

function Label({ icon: Icon, text }) {
  return (
    <label className="flex items-center gap-2 text-gray-400 font-bold text-sm">
      <Icon size={16} className="text-yellow-400" />
      {text}
    </label>
  );
}

function Input({
  icon,
  label,
  value,
  name,
  onChange,
  disabled,
  className = "",
  ...props
}) {
  const Icon = icon;
  return (
    <div className={`space-y-2 ${className}`}>
      <Label icon={Icon} text={label} />
      <input
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full p-4 rounded-2xl bg-[#0f1115] border ${
          disabled
            ? "border-gray-800 text-gray-500 cursor-not-allowed"
            : "border-gray-700 text-white"
        }`}
        {...props}
      />
    </div>
  );
}

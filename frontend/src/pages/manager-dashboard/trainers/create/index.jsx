"use client";

import React, { useState } from "react";
// از 'next/router' برای Next.js Pages Router استفاده می‌شود
// اگر از App Router استفاده می‌کنید، باید به 'next/navigation' و 'useRouter' از آن تغییر دهید
import { useRouter } from "next/router";
import { useAddOwnerMutation } from "../../../../../redux/features/ownerApi";
import { FaSave, FaArrowLeft } from "react-icons/fa";
import Link from "next/link";
import DashboardLayout from "../../../layout";
import { MdDriveFolderUpload } from "react-icons/md";

export default function CreateOwnerPage() {
  const router = useRouter();
  const [addOwner] = useAddOwnerMutation();

  const [formData, setFormData] = useState({
    name: "",
    nationalId: "",
    orgId: "",
    email: "",
    phone: "",
    type: "individual",
    address: "",
    status: "active",
    notes: "",
    photo: null, // اضافه کردن فیلد عکس
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, photo: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      for (const key in formData) {
        // مطمئن می‌شویم که فیلد photo اگر null نباشد، اضافه شود
        if (formData[key] !== null) {
          form.append(key, formData[key]);
        }
      }

      await addOwner(form).unwrap();
      alert("✅ مالک با موفقیت ایجاد شد");
      router.push("/dashboard/main/owners");
    } catch (err) {
      console.error(err);
      alert("❌ خطا در ایجاد مالک");
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-10 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
          <Link
            href="/dashboard/main/owners"
            className="text-green-600 hover:text-green-400 flex items-center gap-2"
          >
            <FaArrowLeft /> بازگشت به مالکان
          </Link>
          <h2 className="text-2xl font-bold text-gray-800">ایجاد مالک جدید</h2>
        </div>

        {/* استفاده از Tailwind CSS Grid برای نظم و ریسپانسیو بودن */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white p-8 rounded-xl shadow-lg border border-gray-100" // تغییر رنگ پس‌زمینه و shadow برای ظاهر شیک‌تر
        >
          {/* بخش ۱: اطلاعات اصلی (تمام عرض) */}
          <div className="grid grid-cols-1 gap-5">
            {/* Name - تمام عرض در همه اندازه‌ها */}
            <div className="col-span-1">
              <label className="mb-1 font-semibold text-gray-700 block">
                نام کامل مالک <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-gray-800 transition duration-150"
                required
              />
            </div>
          </div>

          {/* خط جداکننده برای نظم بیشتر */}
          <hr className="border-gray-200" />

          {/* بخش ۲: اطلاعات هویتی و سازمانی (۲ ستونی در دسکتاپ) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* National ID */}
            <div>
              <label className="mb-1 font-semibold text-gray-700 block">
                کد ملی <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nationalId"
                value={formData.nationalId}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-gray-800 transition duration-150"
              />
            </div>

            {/* Organization ID */}
            <div>
              <label className="mb-1 font-semibold text-gray-700 block">
                شناسه سازمانی <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="orgId"
                value={formData.orgId}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-gray-800 transition duration-150"
              />
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* بخش ۳: اطلاعات تماس (۲ ستونی در دسکتاپ) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Email */}
            <div>
              <label className="mb-1 font-semibold text-gray-700 block">
                ایمیل <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-gray-800 transition duration-150"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="mb-1 font-semibold text-gray-700 block">
                شماره تماس <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-gray-800 transition duration-150"
              />
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* بخش ۴: اطلاعات دسته‌بندی و وضعیت (۲ ستونی در دسکتاپ) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Type */}
            <div>
              <label className="mb-1 font-semibold text-gray-700 block">
                نوع مالک <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-gray-800 transition duration-150 appearance-none" // appearance-none برای یکپارچگی ظاهر
              >
                <option value="individual">شخصی</option>
                <option value="organization">سازمانی</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="mb-1 font-semibold text-gray-700 block">
                وضعیت <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-gray-800 transition duration-150 appearance-none"
              >
                <option value="active">فعال</option>
                <option value="inactive">غیرفعال</option>
                <option value="blocked">مسدود</option>
              </select>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* بخش ۵: آدرس (تمام عرض) */}
          <div className="grid grid-cols-1 gap-5">
            {/* Address */}
            <div className="col-span-1">
              <label className="mb-1 font-semibold text-gray-700 block">
                آدرس <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-gray-800 transition duration-150"
              />
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* بخش ۶: عکس مالک (تمام عرض) */}
          <div className="grid grid-cols-1 gap-5">
            {/* Photo */}
            <div className="col-span-1">
              <label className="mb-1 font-semibold text-gray-700 block">
                عکس مالک <span className="text-red-500">*</span>
              </label>
              <label className="flex items-center gap-3 border border-gray-300 rounded-lg p-3 cursor-pointer bg-gray-50 text-gray-700 hover:border-green-500 hover:ring-2 hover:ring-green-500 transition duration-150 w-full">
                <MdDriveFolderUpload size={24} className="text-green-600" />
                <span className="text-gray-600">
                  {formData.photo
                    ? `فایل انتخاب شده: ${formData.photo.name}`
                    : "آپلود فایل (PNG, JPG)"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* بخش ۷: یادداشت‌ها (تمام عرض) */}
          <div className="grid grid-cols-1 gap-5">
            {/* Notes */}
            <div className="col-span-1">
              <label className="mb-1 font-semibold text-gray-700 block">
                یادداشت‌ها
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-gray-800 resize-y transition duration-150"
              />
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* دکمه ارسال */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-green-300"
            >
              <FaSave />
              <span>ایجاد و ثبت اطلاعات مالک</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

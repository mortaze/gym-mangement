"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  useGetOwnerByIdQuery,
  useUpdateOwnerMutation,
} from "../../../../../../redux/features/ownerApi";
import DashboardLayout from "../../../../layout";
import Link from "next/link";
import { FaArrowLeft, FaSave } from "react-icons/fa";
import { MdDriveFolderUpload } from "react-icons/md";
import Swal from "sweetalert2";

export default function EditOwnerPage() {
  const router = useRouter();
  const { id } = router.query;

  const { data, isLoading, isError } = useGetOwnerByIdQuery(id, {
    skip: !router.isReady || !id,
  });

  const [updateOwner] = useUpdateOwnerMutation();

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
    photo: null,
  });

  const [previewOld, setPreviewOld] = useState("");
  const [previewNew, setPreviewNew] = useState("");

  // Load data from API
  useEffect(() => {
    if (!data?.data) return;

    const owner = data.data;

    console.log("OWNER RAW DATA:", owner);

    setFormData({
      name: owner.name || "",
      nationalId: owner.nationalId || "",
      orgId: owner.orgId || "",
      email: owner.email || "",
      phone: owner.phone || "",
      type: owner.type || "individual",
      address: owner.address || "",
      status: owner.status || "active",
      notes: owner.notes || "",
      photo: null, // عکس جدید فقط زمان آپلود ست می‌شود
    });

    setPreviewOld(owner.photo ? `http://localhost:7000${owner.photo}` : "");
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setFormData((prev) => ({ ...prev, photo: file }));
    setPreviewNew(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const form = new FormData();

      for (const key in formData) {
        if (formData[key] !== null) {
          form.append(key, formData[key]);
        }
      }

      await updateOwner({ id, formData: form }).unwrap();
      Swal.fire({
        icon: "success",
        title: "اطلاعات ذخیره شد",
        text: "ویرایش مالک با موفقیت انجام شد",
        confirmButtonText: "باشه",
      });

      router.push("/dashboard/main/owners");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "خطا!",
        text: "مشکلی در ویرایش مالک رخ داد",
      });
    }
  };

  if (isLoading)
    return (
      <DashboardLayout>
        <div className="text-black">در حال بارگذاری...</div>;
      </DashboardLayout>
    );

  if (isError)
    return (
      <DashboardLayout>
        <div className="text-red-600">خطا در دریافت اطلاعات مالک</div>;
      </DashboardLayout>
    );
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
          <h2 className="text-2xl font-bold text-gray-800">ویرایش مالک</h2>
        </div>

        {/* فرم */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white text-black p-8 rounded-xl shadow-lg border border-gray-100"
        >
          {/* نام */}
          <div>
            <label className="mb-1 font-semibold text-gray-700 block">
              نام کامل مالک
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg p-3 w-full bg-gray-50"
            />
          </div>

          <hr className="border-gray-200" />

          {/* کد ملی + شناسه سازمانی */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="font-semibold text-gray-700">کد ملی</label>
              <input
                type="text"
                name="nationalId"
                value={formData.nationalId}
                onChange={handleChange}
                className="border border-gray-300  rounded-lg p-3 w-full bg-gray-50"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700">
                شناسه سازمانی
              </label>
              <input
                type="text"
                name="orgId"
                value={formData.orgId}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg p-3 w-full bg-gray-50"
              />
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* ایمیل + موبایل */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="font-semibold text-gray-700">ایمیل</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg p-3 w-full bg-gray-50"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700">شماره تماس</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg p-3 w-full bg-gray-50"
              />
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* نوع + وضعیت */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="font-semibold text-gray-700">نوع مالک</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg p-3 w-full bg-gray-50"
              >
                <option value="individual">شخصی</option>
                <option value="organization">سازمانی</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-gray-700">وضعیت</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg p-3 w-full bg-gray-50"
              >
                <option value="active">فعال</option>
                <option value="inactive">غیرفعال</option>
                <option value="blocked">مسدود</option>
              </select>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* آدرس */}
          <div>
            <label className="font-semibold text-gray-700">آدرس</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg p-3 w-full bg-gray-50"
            />
          </div>

          <hr className="border-gray-200" />

          {/* عکس */}
          <div>
            <label className="font-semibold text-gray-700 block mb-2">
              عکس مالک
            </label>

            {/* عکس قبلی */}
            {previewOld && (
              <div className="mb-4">
                <p className="text-gray-600 text-sm mb-1">عکس فعلی:</p>
                <img
                  src={previewOld}
                  className="w-32 h-32 rounded-lg object-cover border"
                />
              </div>
            )}

            {/* عکس جدید */}
            {previewNew && (
              <div className="mb-4">
                <p className="text-gray-600 text-sm mb-1">
                  پیش‌نمایش عکس جدید:
                </p>
                <img
                  src={previewNew}
                  className="w-32 h-32 rounded-lg object-cover border"
                />
              </div>
            )}

            <label className="flex items-center gap-3 border border-gray-300 rounded-lg p-3 cursor-pointer bg-gray-50 hover:ring-2 hover:ring-green-500 transition">
              <MdDriveFolderUpload size={24} className="text-green-600" />
              <span className="text-gray-600">انتخاب فایل جدید (اختیاری)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <hr className="border-gray-200" />

          {/* یادداشت */}
          <div>
            <label className="font-semibold text-gray-700">یادداشت‌ها</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="border border-gray-300 rounded-lg p-3 w-full bg-gray-50 resize-y"
            />
          </div>

          {/* دکمه ذخیره */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-md hover:shadow-lg"
            >
              <FaSave />
              <span>ذخیره تغییرات</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

"use client";

import React, { useState } from "react";
import axios from "axios";
import DashboardLayout from "../layout";
import {
  Upload,
  CheckCircle,
  XCircle,
  HandIcon,
  File,
  UploadIcon,
} from "lucide-react";

export default function CreateCafeMenu() {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    kcal: "",
    status: "available",
    img: null,
  });

  const [previewImg, setPreviewImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const categories = ["پروتئین", "نوشیدنی", "انرژی‌زا", "میان وعده", "قهوه"];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "img") {
      const file = files[0];
      setFormData((prev) => ({ ...prev, img: file }));
      setPreviewImg(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.img) {
      setErrorMsg("لطفاً یک تصویر انتخاب کنید.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("category", formData.category);
      data.append("price", formData.price);
      data.append("kcal", formData.kcal);
      data.append("status", formData.status);
      data.append("img", formData.img);

      const response = await axios.post("http://localhost:7000/menu", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccessMsg("آیتم منو با موفقیت ایجاد شد!");
      setFormData({
        name: "",
        category: "",
        price: "",
        kcal: "",
        status: "available",
        img: null,
      });
      setPreviewImg(null);
    } catch (error) {
      console.error(error);
      setErrorMsg(
        error.response?.data?.message || "خطایی در ایجاد آیتم رخ داد."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div
        className="p-6 md:p-10 min-h-screen rounded-4xl bg-[#0f1115] text-right"
        dir="rtl"
      >
        <h1 className="text-3xl md:text-4xl font-black text-white italic mb-8">
          ایجاد آیتم جدید <span className="text-yellow-400">کافه منو</span>
        </h1>

        {successMsg && (
          <div className="flex items-center gap-2 text-green-400 mb-4 font-bold">
            <CheckCircle size={20} /> {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center gap-2 text-red-500 mb-4 font-bold">
            <XCircle size={20} /> {errorMsg}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-[#1a1d23] p-8 rounded-3xl shadow-xl max-w-2xl mx-auto flex flex-col gap-6"
        >
          {/* نام محصول */}
          <div className="flex flex-col">
            <label className="text-gray-500 text-xs mb-1 font-black uppercase">
              نام محصول
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="مثال: شیک وی ایزوله"
              className="rounded-xl bg-[#0f1115] border border-gray-800 text-white px-4 py-3 focus:outline-none focus:border-yellow-400 transition-all italic"
              required
            />
          </div>

          {/* دسته‌بندی */}
          <div className="flex flex-col">
            <label className="text-gray-500 text-xs mb-1 font-black uppercase">
              دسته‌بندی
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="rounded-xl bg-[#0f1115] border border-gray-800 text-white px-4 py-3 focus:outline-none focus:border-yellow-400 transition-all italic"
              required
            >
              <option value="">انتخاب دسته</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* قیمت */}
          <div className="flex flex-col">
            <label className="text-gray-500 text-xs mb-1 font-black uppercase">
              قیمت (تومان)
            </label>
            <input
              type="text" // تغییر از number به text برای نمایش فرمت
              name="price"
              value={formData.price
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              onChange={(e) => {
                // فقط اعداد رو نگه دار
                const numericValue = e.target.value.replace(/,/g, "");
                if (!isNaN(numericValue)) {
                  setFormData((prev) => ({ ...prev, price: numericValue }));
                }
              }}
              className="rounded-xl bg-[#0f1115] border border-gray-800 text-white px-4 py-3 focus:outline-none focus:border-yellow-400 transition-all italic"
              required
            />
          </div>

          {/* کالری */}
          <div className="flex flex-col">
            <label className="text-gray-500 text-xs mb-1 font-black uppercase">
              کالری (KCAL)
            </label>
            <input
              type="text" // از number به text تغییر دادیم
              name="kcal"
              value={
                formData.kcal
                  ? formData.kcal
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  : ""
              }
              onChange={(e) => {
                // فقط اعداد رو نگه دار
                const numericValue = e.target.value.replace(/,/g, "");
                if (!isNaN(numericValue)) {
                  setFormData((prev) => ({ ...prev, kcal: numericValue }));
                }
              }}
              className="rounded-xl bg-[#0f1115] border border-gray-800 text-white px-4 py-3 focus:outline-none focus:border-yellow-400 transition-all italic"
            />
          </div>

          {/* وضعیت */}
          <div className="flex flex-col">
            <label className="text-gray-500 text-xs mb-1 font-black uppercase">
              وضعیت
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="rounded-xl bg-[#0f1115] border border-gray-800 text-white px-4 py-3 focus:outline-none focus:border-yellow-400 transition-all italic"
            >
              <option value="available">موجود</option>
              <option value="unavailable">ناموجود</option>
            </select>
          </div>

          {/* آپلود عکس */}
          <div className="flex flex-col">
            <label className="text-gray-500 text-xs mb-1 font-black uppercase">
              عکس محصول
            </label>

            <div className="relative">
              {/* input مخفی */}
              <input
                type="file"
                name="img"
                accept="image/*"
                onChange={handleChange}
                className="absolute w-full h-full opacity-0 cursor-pointer"
                required
              />

              {/* ظاهر سفارشی */}
              <div className="flex justify-between items-center bg-[#0f1115] border border-gray-800 rounded-xl px-4 py-3 cursor-pointer hover:border-yellow-400 transition-all">
                <span className="text-gray-300 text-sm italic">
                  {formData.img ? formData.img.name : "No file chosen"}
                </span>
                <Upload size={18} className="text-yellow-400" />
              </div>
            </div>

            {/* پیش‌نمایش */}
            {previewImg && (
              <img
                src={previewImg}
                alt="Preview"
                className="mt-4 w-48 h-48 object-cover rounded-2xl border border-gray-800"
              />
            )}
          </div>

          {/* دکمه ارسال */}
          <button
            type="submit"
            disabled={loading}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold uppercase px-6 py-3 rounded-2xl shadow-lg transition-all duration-200 mt-4"
          >
            {loading ? "در حال ارسال..." : "ایجاد آیتم"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}

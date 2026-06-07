"use client";

import React, { useState } from "react";
import {
  Calendar,
  ShieldCheck,
  UserPlus,
  Clock,
  Dumbbell,
  ShoppingCart,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import DashboardLayout from "../layout";
import { useListUsersQuery } from "../../../redux/features/userApi";
import moment from "moment-jalaali";

export default function UserFinancePage() {
  const [includeProgram, setIncludeProgram] = useState(false);

  // گرفتن اطلاعات واقعی کاربر از API
  const { data, isLoading, isError } = useListUsersQuery();

  const user = Array.isArray(data) && data.length > 0 ? data[0] : null;

  if (isLoading || !user) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-24 text-yellow-400 font-black animate-pulse">
          در حال بارگذاری اطلاعات مالی...
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-24 text-red-500 font-black">
          خطا در دریافت اطلاعات
        </div>
      </DashboardLayout>
    );
  }

  // محاسبه مقادیر داینامیک
  const createdAt = user.createdAt ? new Date(user.createdAt) : new Date();
  const joinDate = moment(createdAt).format("jYYYY/jMM/jDD");

  const monthsActive = Math.max(
    0,
    Math.floor((new Date() - createdAt) / (1000 * 60 * 60 * 24 * 30))
  );

  const subscriptionEnd = new Date(createdAt);
  subscriptionEnd.setDate(createdAt.getDate() + 30); // اشتراک ۳۰ روزه

  const daysRemaining = Math.max(
    0,
    Math.ceil((subscriptionEnd - new Date()) / (1000 * 60 * 60 * 24))
  );

  const basePrice = user.basePrice || 850000; // پیش‌فرض
  const programPrice = user.programPrice || 350000; // پیش‌فرض
  const totalPrice = includeProgram ? basePrice + programPrice : basePrice;

  return (
    <DashboardLayout>
      <div
        className="p-4 md:p-8 min-h-screen rounded-4xl bg-[#0f1115] text-right"
        dir="rtl"
      >
        {/* Header - وضعیت مالی */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
            گزارش <span className="text-yellow-400">وضعیت مالی</span>
          </h1>
          <p className="text-gray-500 text-[10px] font-black mt-3 flex items-center gap-2 uppercase tracking-[0.4em]">
            <ShieldCheck size={14} className="text-yellow-400" /> FINANCIAL
            STATUS & SUBSCRIPTION
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* بخش اول: کارت‌های وضعیت (Stats) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* تاریخ ثبت‌نام */}
              <div className="bg-[#1a1d23] border border-gray-800 p-6 rounded-[2rem] relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-gray-500 text-[10px] font-black mb-2 uppercase tracking-widest">
                    تاریخ ثبت‌نام
                  </p>
                  <h3 className="text-white text-2xl font-black italic flex items-center gap-3">
                    <UserPlus className="text-yellow-400" size={24} />{" "}
                    {joinDate}
                  </h3>
                </div>
                <Calendar
                  className="absolute -bottom-4 -left-4 text-gray-800/20 group-hover:text-yellow-400/5 transition-colors"
                  size={120}
                />
              </div>

              {/* ماه‌های حضور */}
              <div className="bg-[#1a1d23] border border-gray-800 p-6 rounded-[2rem] relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-gray-500 text-[10px] font-black mb-2 uppercase tracking-widest">
                    سابقه خدمت (ماه):
                  </p>
                  <h3 className="text-white text-2xl font-black italic flex items-center gap-3">
                    <TrendingUp className="text-blue-400" size={24} />{" "}
                    {monthsActive} ماه فعال
                  </h3>
                </div>
                <Clock
                  className="absolute -bottom-4 -left-4 text-gray-800/20 group-hover:text-blue-400/5 transition-colors"
                  size={120}
                />
              </div>
            </div>

            {/* وضعیت اشتراک فعلی - نوار پیشرفت */}
            <div className="bg-[#1a1d23] border border-gray-800 p-8 rounded-[2.5rem] relative">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h4 className="text-white font-black italic text-xl">
                    اشتراک فعلی
                  </h4>
                  <p className="text-gray-500 text-xs font-bold mt-1">
                    لاین عملیاتی تا پایان دوره
                  </p>
                </div>
                <div className="text-left">
                  <span className="text-yellow-400 text-4xl font-black italic">
                    {daysRemaining}
                  </span>
                  <span className="text-gray-500 text-xs font-black mr-2">
                    روز باقی‌مانده
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-4 bg-gray-900 rounded-full overflow-hidden p-1 border border-gray-800">
                <div
                  className="h-full bg-gradient-to-l from-yellow-400 to-yellow-600 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.3)]"
                  style={{ width: `${(daysRemaining / 30) * 100}%` }}
                ></div>
              </div>

              <div className="flex justify-between mt-3 text-[10px] font-black text-gray-600 uppercase tracking-tighter">
                <span>START DAY</span>
                <span>EXPIRATION GATE</span>
              </div>
            </div>
          </div>

          {/* ستون کناری: تمدید و آپشن‌ها */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
              <h3 className="text-black font-black italic text-xl mb-8 flex items-center gap-2">
                <ShoppingCart size={24} /> تمدید ظرفیت
              </h3>

              {/* گزینه مربی */}
              <div
                onClick={() => setIncludeProgram(!includeProgram)}
                className={`p-6 rounded-3xl border-2 transition-all cursor-pointer mb-8 ${
                  includeProgram
                    ? "border-black bg-gray-50"
                    : "border-gray-100 bg-white"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div
                    className={`p-2 rounded-xl ${
                      includeProgram
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Dumbbell size={20} />
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      includeProgram
                        ? "border-black bg-black"
                        : "border-gray-200"
                    }`}
                  >
                    {includeProgram && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
                <h4 className="text-black font-black text-sm italic">
                  برنامه تمرینی مربی
                </h4>
                <p className="text-gray-400 text-[10px] font-bold mt-1 uppercase">
                  طراحی نقشه نبرد توسط مربی اختصاصی
                </p>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-gray-400 text-[10px] font-black italic">
                    هزینه افزوده:
                  </span>
                  <span className="text-black font-black text-sm italic">
                    {programPrice.toLocaleString()} ت
                  </span>
                </div>
              </div>

              {/* فاکتور نهایی */}
              <div className="space-y-3 mb-8">
                <div className="flex justify-between text-xs font-bold text-gray-500">
                  <span>شهریه پایه (یک ماه):</span>
                  <span>{basePrice.toLocaleString()} ت</span>
                </div>
                {includeProgram && (
                  <div className="flex justify-between text-xs font-bold text-blue-600">
                    <span>برنامه تمرینی اختصاصی:</span>
                    <span>+{programPrice.toLocaleString()} ت</span>
                  </div>
                )}
                <div className="pt-4 border-t-2 border-dashed border-gray-200 flex justify-between items-center">
                  <span className="text-black font-black text-lg italic">
                    مجموع پرداخت:
                  </span>
                  <div className="text-left">
                    <span className="text-black font-black text-2xl italic">
                      {totalPrice.toLocaleString()}
                    </span>
                    <span className="text-gray-400 text-[10px] font-black mr-1">
                      تومان
                    </span>
                  </div>
                </div>
              </div>

              {/* دکمه پرداخت */}
              <button className="w-full bg-black hover:bg-yellow-400 text-white hover:text-black font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 text-lg group">
                تایید و انتقال به سبد خرید
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-[-4px] transition-transform"
                />
              </button>

              <p className="text-center text-gray-400 text-[9px] font-black mt-6 uppercase tracking-widest italic">
                Secure Payment Gateway Access
              </p>
            </div>

            {/* کارت راهنما */}
            <div className="bg-[#1a1d23] border border-gray-800 p-6 rounded-3xl">
              <p className="text-gray-500 text-[10px] font-bold leading-loose">
                * توجه: در صورت تمدید پیش از پایان دوره، روزهای باقی‌مانده به
                دوره جدید شما اضافه خواهد شد.
                <br />
                ** برنامه‌های مربی تا ۴۸ ساعت پس از پرداخت صادر می‌شوند.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

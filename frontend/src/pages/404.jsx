"use client";

import React from "react";
import Link from "next/link";
import { Dumbbell, Home, AlertOctagon, ChevronLeft } from "lucide-react";

const ErrorPage = () => {
  return (
    <section className="min-h-screen bg-[#0f1115] flex items-center justify-center p-6 overflow-hidden relative">
      {/* المان‌های گرافیکی پس‌زمینه (تزئینی) */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-yellow-400/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-yellow-400/5 rounded-full blur-[120px]"></div>

      <div className="container max-w-2xl relative z-10">
        <div className="text-center">
          {/* بخش عدد 404 با استایل خشن */}
          <div className="relative inline-block mb-8">
            <h1 className="text-[12rem] md:text-[18rem] font-black italic leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-yellow-700 select-none opacity-20">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <AlertOctagon
                size={120}
                className="text-yellow-400 animate-pulse"
                strokeWidth={1.5}
              />
            </div>
          </div>

          {/* محتوای متنی */}
          <div className="space-y-4 -mt-10 md:-mt-20">
            <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter">
              مسیر رو <span className="text-yellow-400">اشتباه اومدی!</span>
            </h2>

            <div className="flex items-center justify-center gap-2 text-gray-500 uppercase tracking-[0.3em] text-xs font-bold mb-6">
              <Dumbbell size={14} className="text-yellow-400" />
              <span>Wrong Training Zone</span>
              <Dumbbell size={14} className="text-yellow-400" />
            </div>

            <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed font-medium">
              قهرمان، صفحه‌ای که دنبالش می‌گردی توی لیست تمرینات امروز نیست.
              شاید جابجاش کردیم یا کلاً از برنامه حذف شده!
            </p>
          </div>

          {/* دکمه‌های عملیاتی */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="group relative w-full sm:w-auto bg-yellow-400 hover:bg-yellow-500 text-black px-10 py-5 rounded-2xl font-black text-sm italic uppercase transition-all shadow-[0_15px_30px_rgba(250,204,21,0.2)] flex items-center justify-center gap-2 overflow-hidden"
            >
              <Home size={18} />
              <span>بازگشت به خانه / Home</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </Link>

            <button
              onClick={() => window.history.back()}
              className="w-full sm:w-auto bg-transparent hover:bg-gray-800 text-white border border-gray-700 px-10 py-5 rounded-2xl font-black text-sm italic uppercase transition-all flex items-center justify-center gap-2"
            >
              <ChevronLeft size={18} />
              <span>برگشت به عقب</span>
            </button>
          </div>

          {/* فوتر کوچک */}
          <p className="mt-16 text-gray-600 text-[10px] uppercase tracking-widest font-bold">
            Iron Gym Management System • Version 2025
          </p>
        </div>
      </div>

      {/* استایل متحرک خطوط پس‌زمینه (اختیاری) */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="h-full w-full shadow-[inset_0_0_100px_rgba(0,0,0,1)] bg-[linear-gradient(to_right,#232323_1px,transparent_1px),linear-gradient(to_bottom,#232323_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>
    </section>
  );
};

export default ErrorPage;

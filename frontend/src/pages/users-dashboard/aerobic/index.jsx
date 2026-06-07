"use client";

import React, { useState, useRef } from "react";
import {
  Wind,
  QrCode,
  Zap,
  Timer,
  Flame,
  CreditCard,
  Target,
  ChevronLeft,
  Calendar,
  Check,
  Circle,
  Loader2,
  X,
  Download,
  Maximize2,
} from "lucide-react";
import DashboardLayout from "../layout";
import { QRCodeSVG } from "qrcode.react";

export default function AdvancedAerobicBooking() {
  const [selectedMachines, setSelectedMachines] = useState(["Treadmill"]);
  const [selectedDay, setSelectedDay] = useState("دوشنبه");
  const [selectedTime, setSelectedTime] = useState(20);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const ticketRef = useRef(null); // برای قابلیت دانلود در آینده

  const daysOfWeek = [
    { day: "شنبه", date: "۱۲ دی" },
    { day: "یکشنبه", date: "۱۳ دی" },
    { day: "دوشنبه", date: "۱۴ دی" },
    { day: "سه‌شنبه", date: "۱۵ دی" },
    { day: "چهارشنبه", date: "۱۶ دی" },
    { day: "پنج‌شنبه", date: "۱۷ دی" },
    { day: "جمعه", date: "۱۸ دی" },
  ];

  const machines = [
    {
      id: "Treadmill",
      name: "تردمیل VIP",
      icon: <Wind size={24} />,
      desc: "چربی‌سوزی حداکثری",
    },
    {
      id: "Bike",
      name: "دوچرخه ثابت",
      icon: <Flame size={24} />,
      desc: "تقویت عضلات پا",
    },
    {
      id: "Elliptical",
      name: "الپتیکال",
      icon: <Zap size={24} />,
      desc: "تمرین کل بدن",
    },
  ];

  const toggleMachine = (id) => {
    if (selectedMachines.includes(id)) {
      setSelectedMachines(selectedMachines.filter((m) => m !== id));
    } else {
      setSelectedMachines([...selectedMachines, id]);
    }
  };

  // شبیه‌سازی درگاه پرداخت
  const handlePaymentSimulation = () => {
    setIsPurchasing(true);

    // اینجا در آینده کد ریدایرکت به درگاه قرار می‌گیرد
    // فعلاً شبیه‌سازی رفت و برگشت از درگاه با موفقیت:
    setTimeout(() => {
      const newCode = `IRN-${Math.random()
        .toString(36)
        .substr(2, 6)
        .toUpperCase()}`;
      setTicketData({
        code: newCode,
        machine: selectedMachines.join(" + "),
        time: selectedTime,
        day: selectedDay,
      });
      setIsPurchasing(false);
    }, 2500);
  };

  const downloadTicket = () => {
    alert(
      "در حال آماده‌سازی فایل تصویر بلیت... (نیاز به کتابخانه html-to-image)"
    );
    // منطق دانلود اینجا قرار می‌گیرد
  };

  return (
    <DashboardLayout>
      <div
        className="p-4 md:p-8 min-h-screen rounded-4xl bg-[#0f1115] text-right"
        dir="rtl"
      >
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
              تجهیزات <span className="text-yellow-400">هوازی</span>
            </h1>
            <p className="text-gray-500 text-[10px] md:text-xs font-black mt-3 flex items-center gap-2 uppercase tracking-[0.2em] md:tracking-[0.4em]">
              <Target size={14} className="text-yellow-400" /> MULTI-UNIT
              RESERVATION SYSTEM
            </p>
          </div>
          {ticketData && (
            <button
              onClick={() => setTicketData(null)}
              className="text-gray-600 hover:text-white text-[10px] font-black uppercase border-b border-gray-800"
            >
              لغو رزرو فعلی و خرید جدید
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ستون اصلی: فرم انتخاب */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <div className="bg-[#1a1d23] rounded-[2rem] md:rounded-[3rem] border border-gray-800 p-6 md:p-10 shadow-2xl relative overflow-hidden">
              {/* انتخاب روز */}
              <div className="mb-10">
                <p className="text-gray-500 text-[10px] font-black uppercase mb-6 flex items-center gap-2">
                  <Calendar size={14} /> جدول زمانی عملیات:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-2 md:gap-3 text-center">
                  {daysOfWeek.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedDay(item.day)}
                      className={`p-3 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                        selectedDay === item.day
                          ? "bg-yellow-400 border-yellow-400 text-black scale-105"
                          : "bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-700"
                      }`}
                    >
                      <span className="text-[9px] font-black uppercase">
                        {item.day}
                      </span>
                      <span className="text-[10px] font-bold font-mono">
                        {item.date}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* انتخاب دستگاه */}
              <div className="mb-10">
                <p className="text-gray-500 text-[10px] font-black uppercase mb-6 flex items-center gap-2">
                  <Zap size={14} /> انتخاب واحدهای عملیاتی (چند انتخابی):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                  {machines.map((m) => {
                    const isActive = selectedMachines.includes(m.id);
                    return (
                      <div
                        key={m.id}
                        onClick={() => toggleMachine(m.id)}
                        className={`cursor-pointer p-5 md:p-6 rounded-[2rem] border-2 transition-all relative group ${
                          isActive
                            ? "bg-gray-800 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.1)]"
                            : "bg-gray-900 border-gray-800 hover:border-gray-700"
                        }`}
                      >
                        <div
                          className={`absolute top-4 left-4 ${
                            isActive ? "text-yellow-400" : "text-gray-700"
                          }`}
                        >
                          {isActive ? (
                            <Check size={18} strokeWidth={4} />
                          ) : (
                            <Circle size={18} />
                          )}
                        </div>
                        <div
                          className={`mb-3 ${
                            isActive ? "text-yellow-400" : "text-gray-500"
                          }`}
                        >
                          {m.icon}
                        </div>
                        <h4
                          className={`font-black italic text-base md:text-lg ${
                            isActive ? "text-white" : "text-gray-500"
                          }`}
                        >
                          {m.name}
                        </h4>
                        <p className="text-[9px] text-gray-600 font-bold mt-1 uppercase leading-tight">
                          {m.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* انتخاب تایم */}
              <div className="mb-10 text-center sm:text-right">
                <p className="text-gray-500 text-[10px] font-black uppercase mb-6 flex items-center justify-center sm:justify-start gap-2">
                  <Timer size={14} /> مدت زمان تمرین:
                </p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-3 md:gap-4">
                  {[15, 20, 30, 45, 60].map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTime(t)}
                      className={`h-12 w-12 md:h-14 md:w-16 rounded-xl md:rounded-2xl border-2 font-black italic transition-all flex items-center justify-center ${
                        selectedTime === t
                          ? "bg-white border-white text-black scale-110 shadow-lg"
                          : "bg-gray-800 border-gray-700 text-gray-500 hover:text-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* فوتر خرید */}
              {!ticketData && (
                <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="text-center md:text-right">
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
                      آماده استقرار در یگان:
                    </p>
                    <p className="text-white font-bold text-sm mt-1">
                      {selectedMachines.length} واحد / {selectedDay} /{" "}
                      {selectedTime} دقیقه
                    </p>
                  </div>
                  <button
                    disabled={isPurchasing || selectedMachines.length === 0}
                    onClick={handlePaymentSimulation}
                    className={`w-full md:w-auto px-10 py-4 md:py-5 rounded-2xl font-black text-base md:text-lg transition-all flex items-center justify-center gap-4 active:scale-95 shadow-xl ${
                      isPurchasing
                        ? "bg-gray-800 text-gray-600 cursor-wait"
                        : "bg-yellow-400 hover:bg-white text-black"
                    }`}
                  >
                    {isPurchasing ? (
                      <>
                        <Loader2 className="animate-spin" size={20} /> در حال
                        انتقال به درگاه...
                      </>
                    ) : (
                      <>
                        تایید و پرداخت <CreditCard size={20} />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ستون کناری: نمایش بلیت */}
          <div className="space-y-6">
            <h3 className="text-white font-black italic uppercase text-lg tracking-tighter flex items-center justify-between">
              بلیت فعال
              <span
                className={`px-2 py-1 rounded text-[9px] ${
                  ticketData
                    ? "bg-green-500 text-black"
                    : "bg-gray-800 text-gray-600"
                }`}
              >
                {ticketData ? "READY" : "LOCKED"}
              </span>
            </h3>

            {ticketData ? (
              <div
                ref={ticketRef}
                className="bg-gradient-to-b from-[#1a1d23] to-[#0f1115] border border-yellow-400/30 rounded-[2.5rem] p-8 relative animate-in fade-in slide-in-from-bottom-4 duration-700"
              >
                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-black px-4 py-1 rounded-full text-[10px] font-black italic">
                  OFFICIAL ACCESS
                </div>

                <div className="text-center mt-6">
                  <div
                    onClick={() => setIsModalOpen(true)}
                    className="bg-white p-3 rounded-2xl inline-block mb-6 cursor-zoom-in relative group"
                  >
                    <QRCodeSVG value={ticketData.code} size={140} />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all rounded-2xl opacity-0 group-hover:opacity-100">
                      <Maximize2 className="text-black bg-white rounded-full p-1" />
                    </div>
                  </div>
                  <h2 className="text-white text-3xl font-black tracking-[0.2em] font-mono mb-2">
                    {ticketData.code}
                  </h2>
                  <p className="text-gray-500 text-[10px] font-bold uppercase italic tracking-widest">
                    IRON GYM UNIT SCANNER
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-800/50 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 font-bold uppercase tracking-tighter">
                      Machine:
                    </span>
                    <span className="text-white font-black italic">
                      {ticketData.machine}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 font-bold uppercase tracking-tighter">
                      Duration:
                    </span>
                    <span className="text-yellow-400 font-black italic">
                      {ticketData.time} MIN
                    </span>
                  </div>
                </div>

                <button
                  onClick={downloadTicket}
                  className="w-full mt-6 py-3 bg-gray-900 border border-gray-800 text-gray-400 rounded-xl text-[10px] font-black uppercase hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"
                >
                  <Download size={14} /> دانلود نسخه آفلاین
                </button>
              </div>
            ) : (
              <div className="bg-[#1a1d23] border-2 border-dashed border-gray-800 rounded-[2.5rem] p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center text-gray-800 mb-4">
                  <QrCode size={32} />
                </div>
                <p className="text-gray-600 font-black italic text-sm uppercase leading-tight tracking-tighter">
                  پس از اتمام عملیات پرداخت
                  <br />
                  کد دسترسی اینجا ظاهر می‌شود
                </p>
              </div>
            )}
          </div>
        </div>

        {/* مودال نمایش بزرگ QR Code */}
        {isModalOpen && ticketData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative bg-white p-8 md:p-12 rounded-[3rem] max-w-sm w-full text-center shadow-[0_0_50px_rgba(255,255,255,0.1)]">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute -top-12 right-1/2 translate-x-1/2 md:top-6 md:right-6 text-white md:text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={32} />
              </button>

              <div className="mb-6">
                <p className="text-black text-[10px] font-black uppercase tracking-[0.3em] mb-4 italic italic">
                  Scan for entry
                </p>
                <QRCodeSVG
                  value={ticketData.code}
                  size={250}
                  className="mx-auto"
                />
              </div>

              <h3 className="text-black text-4xl font-black font-mono tracking-widest border-t-2 border-dashed border-gray-200 pt-6">
                {ticketData.code}
              </h3>
              <p className="text-gray-400 text-[9px] mt-2 font-black uppercase italic">
                Valid for: {ticketData.day}
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

"use client";
import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Dumbbell,
  History,
  LockKeyhole,
  UserRoundCheck,
  Instagram,
  Send,
  Phone,
} from "lucide-react"; // استفاده از لوسید آیکون
import AdminLoginForm from "../forms/AdminLoginForm";

const fitnessTips = [
  {
    icon: <Dumbbell className="w-5 h-5" />,
    text: "برای حفظ سلامت، لطفاً پس از تمرین <span class='text-yellow-400 font-bold'>وزنه‌ها را در جای خود</span> قرار دهید.",
  },
  {
    icon: <LockKeyhole className="w-5 h-5" />,
    text: "جهت امنیت حساب، <span class='text-yellow-400 font-bold'>رمز عبور</span> خود را در اختیار سایر ورزشکاران قرار ندهید.",
  },
  {
    icon: <UserRoundCheck className="w-5 h-5" />,
    text: "پس از اتمام کار با سیستم رزرو، حتماً از حساب خود <span class='text-yellow-400 font-bold'>خارج شوید</span>.",
  },
  {
    icon: <History className="w-5 h-5" />,
    text: "تاریخ اعتبار <span class='text-yellow-400 font-bold'>بیمه ورزشی</span> خود را از طریق پنل چک کنید.",
  },
];

export default function AdminLoginArea() {
  return (
    <section
      className="fixed inset-0 bg-[#0f1115] flex flex-col lg:flex-row overflow-hidden font-sans"
      dir="rtl"
    >
      {/* بخش راست: فرم و محتوا */}
      <section className="w-full lg:w-[45%] p-6 lg:p-12 flex flex-col justify-between h-screen z-10 bg-[#0f1115] shadow-2xl">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10 justify-center lg:justify-start">
            <div className="bg-yellow-400 p-2 rounded-xl">
              <Dumbbell className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-white text-2xl font-black italic tracking-tighter">
              IRON <span className="text-yellow-400">GYM</span>
            </h1>
          </div>

          {/* Warning Message */}
          <div className="mt-8 bg-yellow-400/10 border-r-4 border-yellow-400 text-gray-200 p-4 rounded-xl flex items-start gap-3 w-full animate-pulse-slow">
            <ShieldAlert className="text-yellow-400 shrink-0 w-6 h-6" />
            <p className="text-[13px] leading-relaxed">
              ورزشکار گرامی، جهت جلوگیری از سوءاستفاده از{" "}
              <span className="font-bold text-yellow-400">کمد اختصاصی</span> و
              اعتبار اشتراک، ورود دو مرحله‌ای را فعال کنید.
            </p>
          </div>

          {/* Fitness Tips */}
          <ul className="space-y-6 mt-12 hidden md:block">
            {fitnessTips.map((item, i) => (
              <li key={i} className="flex items-start gap-4 group">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-800 text-yellow-400 group-hover:bg-yellow-400 group-hover:text-black transition-all duration-300">
                  {item.icon}
                </div>
                <h3
                  className="text-gray-400 text-[14px] mt-2 group-hover:text-white transition-colors"
                  dangerouslySetInnerHTML={{ __html: item.text }}
                />
              </li>
            ))}
          </ul>
        </div>

        {/* Social Medias & Footer */}
        <div className="mt-auto">
          <div className="flex items-center gap-4 mb-6 justify-center lg:justify-start">
            <Link
              href="#"
              className="p-3 bg-gray-800 rounded-full text-gray-400 hover:bg-yellow-400 hover:text-black transition-all"
            >
              <Instagram size={20} />
            </Link>
            <Link
              href="#"
              className="p-3 bg-gray-800 rounded-full text-gray-400 hover:bg-blue-500 hover:text-white transition-all"
            >
              <Send size={20} />
            </Link>
            <Link
              href="#"
              className="p-3 bg-gray-800 rounded-full text-gray-400 hover:bg-green-500 hover:text-white transition-all"
            >
              <Phone size={20} />
            </Link>
          </div>

          <p className="text-gray-500 text-xs text-center lg:text-right border-t border-gray-800 pt-4 leading-loose">
            پورتال مدیریت هوشمند باشگاه بدنسازی | پشتیبانی فنی: ۰۲۱-۱۲۳۴۵۶{" "}
            <br />
            تمام حقوق برای مجموعه ورزشی محفوظ است.
          </p>
        </div>
      </section>

      {/* بخش فرم (شناور در وسط برای موبایل و دسکتاپ) */}
      <div className="absolute inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md">
          <AdminLoginForm />
        </div>
      </div>

      {/* بخش چپ: تصویر پس‌زمینه حرفه‌ای */}
      <section className="hidden lg:block lg:w-[55%] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1115] via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-yellow-400/10 mix-blend-overlay z-10" />
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"
          alt="Gym Background"
          className="h-screen w-full object-cover scale-105 hover:scale-100 transition-transform duration-[10s]"
        />
        {/* متن روی تصویر */}
        <div className="absolute bottom-12 left-12 z-20 text-white">
          <h2 className="text-6xl font-black italic opacity-20 select-none">
            NO PAIN NO GAIN
          </h2>
        </div>
      </section>

      <style jsx global>{`
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </section>
  );
}

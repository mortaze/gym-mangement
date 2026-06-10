"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Menu,
  Bell,
  Settings,
  LogOut,
  ShieldCheck,
  Zap,
  ChevronDown,
} from "lucide-react";
import { useListUsersQuery } from "@/redux/features/userApi"; // استفاده از الگوی پروژه
import Link from "next/link";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import ThemeToggle from "@/components/ThemeToggle";

export default function Header({ onOpenSidebar }) {
  const [showProfileInfo, setShowProfileInfo] = useState(false);
  const profileRef = useRef(null);

  // گرفتن اطلاعات کاربر از redux hook (همان الگوی MyProfilePage)
  const { data, isLoading, isError } = useListUsersQuery();
  const user = Array.isArray(data) && data.length > 0 ? data[0] : null;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileInfo(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = user?.name || "کاربر مهمان";
  const displayRole =
    typeof user?.role === "string" ? user.role : user?.role?.name || "کاربر";
  const isActive = user?.status === "active";

  const router = useRouter();

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "خروج از حساب",
      text: "آیا مطمئن هستید که می‌خواهید خارج شوید؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله، خارج شو",
      cancelButtonText: "انصراف",
      confirmButtonColor: "#facc15", // زرد
      cancelButtonColor: "#374151", // خاکستری
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("currentUser");

      // ریدایرکت امن به صفحه اصلی
      router.replace("/");
    }
  };

  return (
    <header className="flex items-center justify-between px-6 mb-3 py-4 bg-[var(--bg-header)] backdrop-blur-md border border-[var(--border)] rounded-[2rem] sticky top-4 z-50 shadow-2xl transition-all duration-500 hover:border-yellow-400/30">
      {/* سمت چپ: کنترل موبایل و تایتل سیستم */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="md:hidden p-3 bg-yellow-400 text-black rounded-xl hover:scale-95 transition-transform"
          aria-label="Menu"
        >
          <Menu size={20} strokeWidth={3} />
        </button>

        <div className="flex flex-col">
          <h2 className="text-[var(--text-muted)] text-xs font-black uppercase tracking-[0.3em] opacity-50 leading-none">
            Command Center
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="hidden md:block text-xl font-black italic text-white uppercase tracking-tighter">
              پنل <span className="text-yellow-400">مدیریت {displayRole}</span>
            </span>
          </div>
        </div>
      </div>

      {/* سمت راست: نوتیفیکیشن و پروفایل */}
      <div className="flex items-center gap-4 lg:gap-8">
        <ThemeToggle />

        {/* بخش پروفایل داینامیک */}
        <div ref={profileRef} className="relative">
          <div
            className="flex items-center gap-4 p-1 pr-4 bg-gray-900/80 border border-[var(--border)] rounded-full cursor-pointer hover:border-yellow-400/50 transition-all group shadow-lg"
            onClick={() => setShowProfileInfo((s) => !s)}
          >
            {/* اطلاعات متنی (نمایش در حالت بزرگ‌تر) */}
            <div className="flex flex-col text-right hidden lg:flex">
              <span className="text-white font-black italic text-sm tracking-tight group-hover:text-yellow-400 transition-colors">
                {displayName}
              </span>
              <span className="text-[9px] text-[var(--text-muted)] uppercase font-black tracking-widest flex items-center gap-1 justify-end">
                {displayRole}{" "}
                <ShieldCheck size={10} className="text-yellow-400" />
              </span>
            </div>

            {/* آواتار */}
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-400 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity"></div>

              {user?.profileImage ? (
                <Image
                  src={user.profileImage}
                  width={64}
                  height={1}
                  alt={displayName}
                  className="rounded-full border-2 border-yellow-400 relative z-10 grayscale-[50%] group-hover:grayscale-0 transition-all"
                  unoptimized
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-800 border-2 border-yellow-400 flex items-center justify-center text-yellow-400 font-black">
                  {displayName.charAt(0)}
                </div>
              )}

              {/* وضعیت آنلاین/آفلاین کوچک */}
              <div
                className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#1a1d23] z-20 ${
                  isActive ? "bg-green-500" : "bg-gray-500"
                }`}
                title={isActive ? "فعال" : "غیرفعال"}
              />
            </div>

            <ChevronDown
              size={14}
              className={`text-[var(--text-muted)] transition-transform duration-300 ${
                showProfileInfo ? "rotate-180" : ""
              }`}
            />
          </div>

          {/* دراپ‌دان منو */}
          {showProfileInfo && (
            <div className="absolute left-0 lg:right-0 mt-4 bg-[var(--bg-card)] border border-[var(--border)] p-2 rounded-2xl shadow-[var(--shadow)] w-64 animate-in fade-in zoom-in duration-200 z-50">
              <div className="p-3 border-b border-[var(--border)] mb-2">
                <p className="text-[var(--text-muted)] text-[9px] uppercase font-black tracking-widest mb-1">
                  وضعیت عملیاتی
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className={`${
                      isActive ? "text-green-400" : "text-[var(--text-dim)]"
                    } font-bold uppercase italic`}
                  >
                    {isActive ? "فعال" : "غیرفعال"}
                  </span>
                  <div className="flex items-center gap-2 text-green-400 text-xs font-bold uppercase italic">
                    <Zap size={12} /> Ready for Training
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] mb-2">
                <ThemeToggle compact />
                <button className="relative p-2 rounded-xl text-[var(--text-dim)] hover:text-yellow-400 hover:bg-gray-800/50 transition-all">
                  <Bell size={16} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>
              </div>

              <div className="space-y-1 text-right">
                <Link
                  href="/users-dashboard/profile"
                  className="w-full flex items-center justify-end gap-3 p-3 text-[var(--text-dim)] hover:bg-yellow-400 hover:text-black rounded-xl transition-all text-sm font-bold italic"
                >
                  مشاهده پروفایل
                </Link>

                <Link
                  href="/users-dashboard/profile/edit"
                  className="w-full flex items-center justify-end gap-3 p-3 text-[var(--text-dim)] hover:bg-yellow-400 hover:text-black rounded-xl transition-all text-sm font-bold italic"
                >
                  ویرایش اطلاعات
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-end gap-3 p-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all text-sm font-bold italic border border-transparent hover:border-red-400/20"
                >
                  خروج از حساب
                </button>

                <div className="pt-2 border-t border-[var(--border)]">
                  <p className="text-[11px] text-[var(--text-muted)]">
                    ایمیل:{" "}
                    <span className="text-white text-[11px] font-bold">
                      {" "}
                      {user?.email || "—"}
                    </span>
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1">
                    کد عضویت:{" "}
                    <span className="text-white text-[11px] font-bold">
                      {" "}
                      {user?.employeeCode || "—"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

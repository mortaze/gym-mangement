// frontend\src\pages\trainers-dashboard\components\Header.jsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import {
  Menu,
  Bell,
  Settings,
  LogOut,
  ShieldCheck,
  Zap,
  ChevronDown,
} from "lucide-react";

/**
 * Header component:
 * - می‌خونه currentUser از sessionStorage
 * - با _id به http://localhost:7000/api/users درخواست می‌زنه و کاربر رو پیدا می‌کنه
 * - اطلاعات رو در هدر نمایش می‌ده و امکان خروج داره
 */

export default function Header({ onOpenSidebar }) {
  const [showProfileInfo, setShowProfileInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverUser, setServerUser] = useState(null); // اطلاعات کامل از API
  const [clientUser, setClientUser] = useState(null); // اطلاعات از sessionStorage
  const profileRef = useRef(null);
  const router = useRouter();

  // خواندن currentUser از sessionStorage هنگام اولین mount
  useEffect(() => {
    try {
      const raw =
        typeof window !== "undefined"
          ? sessionStorage.getItem("currentUser")
          : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        setClientUser(parsed);
      } else {
        setClientUser(null);
      }
    } catch (e) {
      console.error("Failed to parse currentUser from sessionStorage:", e);
      setClientUser(null);
    }
  }, []);

  // اگر clientUser داشتیم، از API لیست کاربران رو بگیر و کاربر با همان _id رو پیدا کن
  useEffect(() => {
    let mounted = true;
    const fetchUserFromApi = async () => {
      if (!clientUser || !clientUser._id) return;
      setLoading(true);
      try {
        // درخواست به endpoint اصلی
        const res = await fetch("http://localhost:7000/api/users");
        if (!res.ok) {
          throw new Error(`خطا از سرور: ${res.status}`);
        }
        const data = await res.json();

        // فرض می‌کنیم data آرایه‌ای از کاربران است؛ سعی می‌کنیم بر اساس _id پیدا کنیم
        let found = null;
        if (Array.isArray(data)) {
          found = data.find((u) => String(u._id) === String(clientUser._id));
        } else if (data && Array.isArray(data.users)) {
          // بعضی APIها داده‌ها را در { users: [...] } برمی‌گردانند
          found = data.users.find(
            (u) => String(u._id) === String(clientUser._id),
          );
        } else if (data && data._id) {
          // شاید endpoint تک کاربر برگردونه
          found = String(data._id) === String(clientUser._id) ? data : null;
        }

        // اگر پیدا نشد، تلاش کن با employeeCode هم پیدا کنی (فقط برای احتیاط)
        if (!found && clientUser.employeeCode && Array.isArray(data)) {
          found = data.find(
            (u) => String(u.employeeCode) === String(clientUser.employeeCode),
          );
        }

        if (mounted) {
          if (found) {
            setServerUser(found);
          } else {
            console.warn("User not found on API with _id:", clientUser._id);
            setServerUser(null);
          }
        }
      } catch (err) {
        console.error("Failed to fetch users from API:", err);
        if (mounted) setServerUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUserFromApi();

    return () => {
      mounted = false;
    };
  }, [clientUser]);

  // بستن منو هنگام کلیک بیرون
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileInfo(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // هندلر خروج
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
      // پاک‌سازی کل session و local
      try {
        if (typeof window !== "undefined") {
          sessionStorage.clear();
          sessionStorage.clear();
        }
      } catch (e) {
        console.error("Error clearing storage:", e);
      }
      // ریدایرکت امن به صفحه اصلی
      router.replace("/");
    }
  };

  // اطلاعاتی که نمایش داده می‌شود: اگر serverUser هست از آن استفاده کن، وگرنه از clientUser
  const displayUser = serverUser || clientUser || {};
  const displayName = displayUser.name || "کاربر مهمان";
  const displayRole = displayUser.role || "—";
  const displayEmail = displayUser.email || "—";
  const profileImage = displayUser.profileImage || null;
  const isActive = displayUser.status === "active" || true; // اگر سرور وضعیت نداد، فرض کن فعال

  return (
    <header className="flex items-center justify-between px-6 mb-3 py-4 bg-[#1a1d23]/50 backdrop-blur-md border border-gray-800 rounded-[2rem] sticky top-4 z-50 shadow-2xl transition-all duration-500 hover:border-yellow-400/30">
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
          <h2 className="text-white text-xs font-black uppercase tracking-[0.3em] opacity-50 leading-none">
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
        {/* نوتیفیکیشن‌های سیستمی */}
        <div className="relative hidden sm:block">
          <button className="p-3 bg-gray-800/50 text-gray-400 hover:text-yellow-400 hover:bg-gray-800 rounded-2xl transition-all relative group">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>

        {/* بخش پروفایل */}
        <div ref={profileRef} className="relative">
          <div
            className="flex items-center gap-4 p-1 pr-4 bg-gray-900/80 border border-gray-800 rounded-full cursor-pointer hover:border-yellow-400/50 transition-all group shadow-lg"
            onClick={() => setShowProfileInfo((s) => !s)}
          >
            <div className="flex flex-col text-right hidden lg:flex">
              <span className="text-white font-black italic text-sm tracking-tight group-hover:text-yellow-400 transition-colors">
                {loading ? "در حال بارگذاری..." : displayName}
              </span>
              <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-1 justify-end">
                {displayRole}{" "}
                <ShieldCheck size={10} className="text-yellow-400" />
              </span>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-yellow-400 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity"></div>
              {profileImage ? (
                <Image
                  src={profileImage}
                  width={48}
                  height={48}
                  alt={displayName}
                  className="rounded-full border-2 border-yellow-400 relative z-10 grayscale-[50%] group-hover:grayscale-0 transition-all"
                  unoptimized
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-800 border-2 border-yellow-400 flex items-center justify-center text-yellow-400 font-black">
                  {displayName.charAt(0)}
                </div>
              )}

              <div
                className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#1a1d23] z-20 ${
                  isActive ? "bg-green-500" : "bg-gray-500"
                }`}
                title={isActive ? "فعال" : "غیرفعال"}
              />
            </div>

            <ChevronDown
              size={14}
              className={`text-gray-500 transition-transform duration-300 ${
                showProfileInfo ? "rotate-180" : ""
              }`}
            />
          </div>

          {/* دراپ‌دان منو */}
          {showProfileInfo && (
            <div className="absolute left-0 lg:right-0 mt-4 bg-[#1a1d23] border border-gray-800 p-2 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-56 animate-in fade-in zoom-in duration-200 z-50">
              <div className="p-3 border-b border-gray-800 mb-2">
                <p className="text-gray-500 text-[9px] uppercase font-black tracking-widest mb-1">
                  وضعیت عملیاتی
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className={`${isActive ? "text-green-400" : "text-gray-400"} font-bold uppercase italic`}
                  >
                    {isActive ? "فعال" : "غیرفعال"}
                  </span>
                  <div className="flex items-center gap-2 text-green-400 text-xs font-bold uppercase italic">
                    <Zap size={12} /> Ready for Service
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-right">
                <button className="w-full flex items-center justify-end gap-3 p-3 text-gray-400 hover:bg-yellow-400 hover:text-black rounded-xl transition-all text-sm font-bold italic">
                  تنظیمات امنیتی <Settings size={16} />
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-end gap-3 p-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all text-sm font-bold italic border border-transparent hover:border-red-400/20"
                >
                  خروج از حساب <LogOut size={16} />
                </button>

                <div className="pt-2 border-t border-gray-800">
                  <p className="text-[11px] text-gray-500">
                    ایمیل:
                    <span className="text-white text-[11px] font-bold">
                      {" "}
                      {displayEmail}
                    </span>
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    کد عضویت:
                    <span className="text-white text-[11px] font-bold">
                      {" "}
                      {displayUser.employeeCode || "—"}
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

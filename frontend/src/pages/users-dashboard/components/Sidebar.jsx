"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Dumbbell,
  Coffee,
  CalendarDays,
  CreditCard,
  ChevronDown,
  ChevronUp,
  X,
  Zap,
  Info,
  UserRound,
} from "lucide-react"; // استفاده از لوسید آیکون

const menuItems = [
  {
    label: "داشبورد",
    icon: <LayoutDashboard size={20} />,
    href: "/users-dashboard",
  },
  {
    label: "پروفایل من",
    icon: <Info size={20} />,
    href: "/users-dashboard/profile",
  },
  {
    label: "امور مالی",
    icon: <CreditCard size={20} />,
    href: "/users-dashboard/finance",
  },
  {
    label: "حضور و غیاب",
    icon: <CalendarDays size={20} />,
    href: "/users-dashboard/presence",
  },
  {
    label: "برنامه تمرینی",
    icon: <UserRound size={20} />,
    href: "/users-dashboard/trainers",
    subMenu: [
      {
        label: "برنامه تمرینی من",
        icon: <Dumbbell size={16} />,
        href: "/users-dashboard/trainers",
      },
      {
        label: "درخواست برنامه تمرینی",
        icon: <Dumbbell size={16} />,
        href: "/users-dashboard/trainers/request-plan",
      },
    ],
  },
  {
    label: "هوازی",
    icon: <Dumbbell size={20} />,
    href: "/users-dashboard/aerobic",
  },

  {
    label: "بوفه و رستوران",
    icon: <Coffee size={20} />,
    href: "/users-dashboard/cafe",
  },
];

function MenuItem({ item, pathname, onClose, level = 0 }) {
  const [open, setOpen] = useState(false);

  // باز کردن خودکار زیرمنو اگر یکی از آیتم‌های زیر آن فعال باشد
  useEffect(() => {
    if (item.subMenu && pathname) {
      const matchSub = item.subMenu.some(
        (sub) => pathname === sub.href || pathname.startsWith(sub.href + "/"),
      );
      if (matchSub) setOpen(true);
    }
  }, [pathname, item.subMenu]);

  // بررسی اینکه لینک فعلی فعال است یا نه
  const isActive = item.subMenu
    ? false // خود منوی والد با subMenu هیچوقت به طور مستقیم فعال نشود
    : pathname === item.href;

  const paddingRight = 16 + level * 12;

  if (item.subMenu) {
    return (
      <li className="list-none">
        <div
          className={`flex items-center justify-between rounded-xl p-3 mb-1 transition-all duration-200 cursor-pointer ${
            open
              ? "bg-yellow-400/10 text-yellow-400"
              : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
          }`}
          style={{ paddingRight }}
          onClick={() => setOpen(!open)}
        >
          <div className="flex items-center gap-3 flex-1">
            {item.icon}
            <span className="text-[14px] font-medium">{item.label}</span>
          </div>
          {item.subMenu.length > 0 && (
            <button onClick={() => setOpen(!open)}>
              {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>

        {open && (
          <ul className="mt-1 space-y-1 overflow-hidden transition-all">
            {item.subMenu.map((sub, i) => (
              <MenuItem
                key={i}
                item={sub}
                pathname={pathname}
                onClose={onClose}
                level={level + 1}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }

  // لینک عادی
  return (
    <li className="list-none">
      <Link
        href={item.href}
        className={`flex items-center gap-3 rounded-xl p-3 mb-1 transition-all duration-200 ${
          isActive
            ? "bg-yellow-400 text-black font-bold shadow-[0_0_15px_rgba(250,204,21,0.3)]"
            : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
        }`}
        style={{ paddingRight }}
        onClick={onClose}
      >
        {item.icon}
        <span className="text-[14px]">{item.label}</span>
      </Link>
    </li>
  );
}

export default function Sidebar({ isMobileOpen, onClose }) {
  const pathname = usePathname() || "";

  useEffect(() => {
    const sidebarLogo = document.getElementById("sidebarLogo");
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("mainContent");

    const toggleSidebar = () => {
      if (window.innerWidth >= 1024) {
        sidebar.classList.toggle("lg:w-20");
        sidebar.classList.toggle("lg:w-64");
        if (mainContent) {
          mainContent.classList.toggle("lg:mr-20");
          mainContent.classList.toggle("lg:mr-64");
        }
        // پنهان کردن متن‌ها در حالت جمع شده
        const texts = document.querySelectorAll(".sidebar-text");
        texts.forEach((t) => t.classList.toggle("hidden"));
      }
    };

    sidebarLogo?.addEventListener("click", toggleSidebar);
    return () => sidebarLogo?.removeEventListener("click", toggleSidebar);
  }, []);
  let roleTitle = "کاربر";
  if (pathname.includes("trainers-dashboard")) {
    roleTitle = "مربی";
  } else if (pathname.includes("manager-dashboard")) {
    if (pathname.includes("users")) {
      roleTitle = "کاربر";
    } else if (pathname.includes("cafe")) {
      roleTitle = "مدیر کافه";
    } else {
      roleTitle = "مدیر سیستم";
    }
  }
  return (
    <div
      id="sidebar"
      className={`fixed top-0 right-0 h-full w-56 z-[60] bg-[#0f1115] border-l border-gray-800 text-white flex flex-col transition-all duration-300 transform ${
        isMobileOpen ? "translate-x-0" : "translate-x-full"
      } lg:translate-x-0 lg:flex`}
      dir="rtl"
    >
      {/* بخش لوگو */}
      <div className="flex items-center justify-between p-6 mb-4">
        <div
          id="sidebarLogo"
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="bg-yellow-400 p-2 rounded-lg group-hover:rotate-12 transition-transform">
            <Zap size={20} className="text-black" />
          </div>
          <span className="sidebar-text font-black italic text-xl tracking-tighter">
            IRON <span className="text-yellow-400">GYM</span>
          </span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>
      </div>

      {/* منوها */}
      <nav className="flex-1 overflow-y-auto px-4 custom-scrollbar">
        <p className="sidebar-text text-[10px] uppercase tracking-widest text-gray-500 mb-4 mr-2">
          منوی اصلی
        </p>
        <ul className="space-y-1">
          {menuItems.map((item, i) => (
            <MenuItem
              key={i}
              item={item}
              pathname={pathname}
              onClose={onClose}
            />
          ))}
        </ul>
      </nav>

      {/* فوتر سایدبار (پروفایل کوتاه) */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 p-2 bg-gray-900/50 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center text-black font-bold">
            AD
          </div>
          <div className="sidebar-text">
            <p className="text-sm font-bold">{roleTitle}</p>
            <p className="text-[10px] text-gray-500">خوش آمدید</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

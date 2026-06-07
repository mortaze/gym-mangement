"use client";

import React from "react";
import { useListUsersQuery } from "../../../redux/features/userApi";
import moment from "moment-jalaali";
import {
  User,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  Edit3,
  Lock,
  ArrowRight,
  Zap,
} from "lucide-react";
import Link from "next/link";
import DashboardLayout from "../layout";

export default function MyProfilePage() {
  const { data, isLoading, isError } = useListUsersQuery();

  // محافظت کامل از کرش
  const user = Array.isArray(data) && data.length > 0 ? data[0] : null;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-24 text-yellow-400 font-black animate-pulse">
          <Zap size={48} className="mb-4 animate-bounce" />
          در حال بارگذاری پروفایل...
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !user) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-24 text-red-500 font-black">
          خطا در دریافت اطلاعات کاربر
        </div>
      </DashboardLayout>
    );
  }

  const isActive = user.status === "active";

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 min-h-screen bg-[#0f1115] rounded-[2.5rem] border border-gray-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link
            href="/dashboard"
            className="p-3 bg-gray-800 text-yellow-400 hover:bg-yellow-400 hover:text-black transition-all rounded-xl"
          >
            <ArrowRight size={22} />
          </Link>

          <div>
            <h2 className="text-3xl font-black text-white italic uppercase">
              پروفایل <span className="text-yellow-400">من</span>
            </h2>
            <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">
              My Profile
            </p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="max-w-3xl mx-auto bg-[#1a1d23] border border-gray-800 rounded-3xl p-6 shadow-2xl">
          {/* Top */}
          <div className="flex flex-col sm:flex-row gap-6 items-center border-b border-gray-800 pb-6 mb-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-2xl bg-gray-800 flex items-center justify-center border-2 border-yellow-400 overflow-hidden shadow-lg">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name || "User"}
                    className="w-full h-full object-fill"
                  />
                ) : (
                  <span className="text-yellow-400 text-4xl font-black">
                    {user.name?.charAt(0) || "U"}
                  </span>
                )}
              </div>

              {/* Status Indicator */}
              <span
                className={`absolute -bottom-2 -right-2 w-5 h-5 rounded-full border-4 border-[#1a1d23] ${
                  isActive
                    ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"
                    : "bg-gray-500"
                }`}
              />
            </div>

            <div className="text-center sm:text-right">
              <h3 className="text-2xl font-black text-white">
                {user.name || "—"}
              </h3>

              <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">
                {typeof user.role === "string" ? user.role : "User"}
              </p>

              <span
                className={`inline-block mt-3 px-4 py-1 rounded-lg text-[11px] font-bold uppercase ${
                  isActive
                    ? "bg-yellow-400 text-black"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                {isActive ? "Active Member" : "Inactive"}
              </span>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-300">
            <Info icon={User} label="کد عضویت" value={user.employeeCode} />
            <Info icon={Phone} label="شماره تماس" value={user.contactNumber} />
            <Info icon={MapPin} label="آدرس" value={user.address} />
            <Info icon={ShieldCheck} label="نقش" value={user.role} />

            <div className="sm:col-span-2">
              <Info
                icon={Calendar}
                label="تاریخ عضویت"
                value={
                  user.createdAt
                    ? moment(user.createdAt).format("jYYYY/jMM/jDD")
                    : "-"
                }
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link
              href="/users-dashboard/profile/edit"
              className="flex-1 flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-600 text-black py-4 rounded-2xl font-black transition-all"
            >
              <Lock size={18} />
              تغییر رمز عبور/ ویرایش اطلاعات
              <Edit3 size={18} />
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

/* ---------- Component ---------- */

function Info({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 bg-gray-800/50 p-4 rounded-xl">
      <Icon size={18} className="text-yellow-400" />
      <span>
        {label}: {value || "—"}
      </span>
    </div>
  );
}

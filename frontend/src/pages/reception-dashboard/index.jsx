"use client";

import React, { useState } from "react";
import {
  useListUsersQuery,
  useDeleteUserMutation,
} from "../../redux/features/userApi";
import moment from "moment-jalaali";
import {
  Edit3,
  Trash2,
  UserPlus,
  Search,
  ArrowRight,
  User,
  ShieldCheck,
  Phone,
  MapPin,
  Calendar,
  Zap,
} from "lucide-react"; // استفاده از لوسید برای هماهنگی با سبک فلاح
import Link from "next/link";
import DashboardLayout from "./layout";
import Swal from "sweetalert2";

// کارت کاربران برای موبایل با استایل باشگاه فلاح
const UserCard = ({ user, index, handleDelete }) => {
  const isActive = user.status === "active";

  return (
    <div className="bg-[#1a1d23] p-5 rounded-2xl border border-gray-800 hover:border-yellow-400/50 transition-all duration-300 shadow-xl group">
      <div className="flex justify-between items-start mb-4 border-b border-gray-800 pb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-14 h-14 object-cover rounded-xl border-2 border-yellow-400"
              />
            ) : (
              <div className="w-14 h-14 flex items-center justify-center bg-gray-800 text-yellow-400 rounded-xl border-2 border-gray-700 text-xl font-black">
                {user.name.charAt(0)}
              </div>
            )}
            <div
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#1a1d23] ${
                isActive ? "bg-green-500" : "bg-gray-500"
              }`}
            ></div>
          </div>
          <div>
            <p className="font-black text-white group-hover:text-yellow-400 transition-colors">
              {user.name}
            </p>
            <p className="text-[11px] text-gray-500 uppercase tracking-wider">
              ID: {user.employeeCode} | {user.role.name}
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tighter ${
            isActive ? "bg-yellow-400 text-black" : "bg-gray-700 text-gray-300"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="space-y-3 text-[13px] text-gray-400">
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-yellow-400" />
          <span>{user.contactNumber || "بدون شماره"}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-yellow-400" />
          <span className="truncate">{user.address || "بدون آدرس"}</span>
        </div>
        <div className="flex items-center gap-2 border-t border-gray-800/50 pt-2 mt-2">
          <Calendar size={14} className="text-gray-500" />
          <span className="text-[11px]">
            آخرین تغییر رمز:{" "}
            {user.passwordChangedAt
              ? new Date(user.passwordChangedAt).toLocaleDateString("fa-IR")
              : "---"}
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-5">
        <Link
          href={`/dashboard/users/${user._id}/edit`}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg text-xs transition-all font-bold"
        >
          <Edit3 size={14} /> ویرایش
        </Link>
        <button
          onClick={() => handleDelete(user._id)}
          className="flex-1 flex items-center justify-center gap-2 bg-red-900/20 hover:bg-red-600 text-red-500 hover:text-white p-2 rounded-lg text-xs transition-all font-bold border border-red-900/50"
        >
          <Trash2 size={14} /> حذف
        </button>
      </div>
    </div>
  );
};

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, isLoading, isError, refetch } = useListUsersQuery();
  const [deleteUser] = useDeleteUserMutation();

  const users = Array.isArray(data)
    ? data.filter((u) => u.role === "Member" || u.role === "Reception")
    : [];

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "آیا مطمئن هستید؟",
      text: "عضویت این کاربر لغو و اطلاعات حذف خواهد شد!",
      icon: "warning",
      background: "#1a1d23",
      color: "#fff",
      showCancelButton: true,
      confirmButtonColor: "#facc15",
      cancelButtonColor: "#374151",
      confirmButtonText: "بله، حذف کن",
      cancelButtonText: "انصراف",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await deleteUser(id).unwrap();
        Swal.fire({
          title: "حذف شد!",
          icon: "success",
          background: "#1a1d23",
          color: "#fff",
          confirmButtonColor: "#facc15",
        });
        refetch();
      } catch (err) {
        Swal.fire("خطا!", "مشکلی در حذف رخ داد.", "error");
      }
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading)
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 text-yellow-400 font-black animate-pulse">
          <Zap size={48} className="mb-4 animate-bounce" />
          در حال فراخوانی لیست ورزشکاران...
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 min-h-screen bg-[#0f1115] rounded-[2.5rem] border border-gray-800 shadow-2xl">
        {/* Header - Falah Gym Style */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-3 bg-gray-800 text-yellow-400 hover:bg-yellow-400 hover:text-black transition-all rounded-xl shadow-lg"
            >
              <ArrowRight size={24} />
            </Link>
            <div>
              <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">
                مدیریت <span className="text-yellow-400">ورزشکاران</span>
              </h2>
              <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest">
                User Management System
              </p>
            </div>
          </div>

          <Link
            href="/reception-dashboard/users/create"
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-4 rounded-2xl text-sm font-black transition-all shadow-[0_10px_20px_rgba(250,204,21,0.2)] active:scale-95"
          >
            <UserPlus size={18} /> افزودن جدید
          </Link>
        </div>

        {/* Search Bar - Falah Gym Style */}
        <div className="mb-8 relative group">
          <input
            type="text"
            placeholder="جستجو بر اساس نام، کد عضویت یا مشخصات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1a1d23] border border-gray-800 text-white rounded-2xl p-4 pr-12 focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/10 transition-all shadow-inner"
          />
          <Search
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-400 transition-colors"
            size={20}
          />
        </div>

        {/* Desktop Table - Falah Gym Style */}
        <div className="hidden lg:block overflow-hidden bg-[#1a1d23] rounded-3xl border border-gray-800 shadow-2xl">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-800/50 text-gray-400 text-[11px] uppercase tracking-[0.2em] border-b border-gray-700">
                <th className="py-5 px-6 font-black">رتبه</th>
                <th className="py-5 px-6 font-black">ورزشکار</th>
                <th className="py-5 px-6 font-black">کد عضویت</th>
                <th className="py-5 px-6 font-black">تماس</th>
                <th className="py-5 px-6 font-black">نقش</th>
                <th className="py-5 px-6 font-black">تاریخ عضویت</th>
                <th className="py-5 px-6 font-black text-center">وضعیت</th>
                <th className="py-5 px-6 font-black text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-20 text-gray-600 font-bold italic text-xl"
                  >
                    ⚠️ هیچ ورزشکاری در این لیست یافت نشد
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr
                    key={user._id}
                    className="hover:bg-yellow-400/5 transition-colors group"
                  >
                    <td className="py-4 px-6 font-mono text-gray-500 text-xs">
                      {(index + 1).toString().padStart(2, "0")}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            className="w-10 h-10 rounded-lg object-cover border border-gray-700"
                            alt=""
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-yellow-400 font-bold text-xs border border-gray-700">
                            {user.name.charAt(0)}
                          </div>
                        )}
                        <span className="font-bold text-gray-200 group-hover:text-white">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-400 font-mono text-[12px]">
                      {user.employeeCode}
                    </td>
                    <td className="py-4 px-6 text-gray-400 text-[12px]">
                      {user.contactNumber || "---"}
                    </td>
                    <td className="py-4 px-6">
                      <span className="flex items-center gap-1.5 text-xs text-gray-300 bg-gray-800 px-2 py-1 rounded-md w-fit">
                        <ShieldCheck size={12} className="text-blue-400" />{" "}
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-400 font-mono text-[12px]">
                      {user.createdAt
                        ? moment(user.createdAt).format("jYYYY/jMM/jDD")
                        : "-"}
                    </td>

                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-block w-2.5 h-2.5 rounded-full ${
                          user.status === "active"
                            ? "bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                            : "bg-gray-600"
                        }`}
                      ></span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center gap-2">
                        <Link
                          href={`/reception-dashboard/users/${user._id}/edit`}
                          className="p-2 bg-gray-800 text-gray-400 hover:text-yellow-400 hover:bg-gray-700 rounded-lg transition-all"
                        >
                          <Edit3 size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="p-2 bg-gray-800 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* کارت موبایل - Falah Gym Style */}
        <div className="lg:hidden grid grid-cols-1 gap-4">
          {filteredUsers.map((user, index) => (
            <UserCard
              key={user._id}
              user={user}
              index={index}
              handleDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

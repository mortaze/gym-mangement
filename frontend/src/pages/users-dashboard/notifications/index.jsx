"use client";
import React, { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../layout";
import { API_BASE_URL } from "@/config/api";
import {
  Bell, CheckCheck, Trash2, MessageCircle, CreditCard,
  Dumbbell, CalendarDays, AlertTriangle, Activity, Loader2,
  MailOpen,
} from "lucide-react";
import Swal from "sweetalert2";

const TYPE_CONFIG = {
  workout_assigned: { icon: <Dumbbell size={16} />, color: "text-yellow-400", label: "برنامه تمرینی" },
  class_reminder: { icon: <CalendarDays size={16} />, color: "text-blue-400", label: "یادآوری کلاس" },
  payment_confirmed: { icon: <CreditCard size={16} />, color: "text-green-400", label: "پرداخت" },
  membership_expiry: { icon: <AlertTriangle size={16} />, color: "text-red-400", label: "اشتراک" },
  message_received: { icon: <MessageCircle size={16} />, color: "text-purple-400", label: "پیام" },
  progress_update: { icon: <Activity size={16} />, color: "text-cyan-400", label: "پیشرفت" },
  system: { icon: <Bell size={16} />, color: "text-gray-400", label: "سیستم" },
};

const typeConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.system;

export default function NotificationsPage() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [markingAll, setMarkingAll] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? sessionStorage.getItem("currentUser") : null;
    const u = raw ? JSON.parse(raw) : null;
    setUser(u);
    if (u?._id) {
      fetch(`${API_BASE_URL}/notifications/${u._id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            setNotifications(data.notifications || []);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const filtered = useMemo(() => {
    if (filter === "unread") return notifications.filter((n) => !n.read);
    if (filter === "read") return notifications.filter((n) => n.read);
    return notifications;
  }, [notifications, filter]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const markAsRead = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    if (!user?._id) return;
    setMarkingAll(true);
    try {
      await fetch(`${API_BASE_URL}/notifications/read-all/${user._id}`, { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    } finally {
      setMarkingAll(false);
    }
  };

  const formatTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "همین حالا";
    if (minutes < 60) return `${minutes} دقیقه پیش`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ساعت پیش`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} روز پیش`;
    return d.toLocaleDateString("fa-IR", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-screen items-center justify-center rounded-[2rem] bg-[#0f1115]">
          <div className="flex flex-col items-center gap-3 text-yellow-400">
            <Loader2 size={40} className="animate-spin" />
            <span className="font-black text-lg">در حال بارگذاری اعلان‌ها...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen rounded-[2rem] bg-[#0f1115] p-4 md:p-8" dir="rtl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative rounded-2xl bg-yellow-400 p-3 text-black">
              <Bell size={24} />
              {unreadCount > 0 && (
                <span className="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white md:text-3xl">مرکز اعلان‌ها</h1>
              <p className="text-xs font-bold text-gray-500 mt-0.5">
                {unreadCount > 0
                  ? `${unreadCount.toLocaleString("fa-IR")} اعلان خوانده نشده`
                  : "همه اعلان‌ها خوانده شده"}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              disabled={markingAll}
              className="flex items-center gap-2 rounded-2xl bg-yellow-400 px-5 py-2.5 text-sm font-black text-black transition-all hover:bg-yellow-500 disabled:opacity-50"
            >
              {markingAll ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCheck size={16} />
              )}
              علامت همه به عنوان خوانده شده
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="mb-6 flex gap-2">
          {[
            { key: "all", label: "همه", count: notifications.length },
            { key: "unread", label: "خوانده نشده", count: unreadCount },
            { key: "read", label: "خوانده شده", count: notifications.length - unreadCount },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`rounded-2xl px-4 py-2.5 text-sm font-black transition-all ${
                filter === tab.key
                  ? "bg-yellow-400 text-black"
                  : "border border-gray-800 bg-[#1a1d23] text-gray-400 hover:border-yellow-400/40 hover:text-white"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="mr-2 rounded-lg bg-gray-900 px-2 py-0.5 text-[10px]">
                  {tab.count.toLocaleString("fa-IR")}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notifications list */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <MailOpen size={48} className="mb-4 opacity-30" />
              <p className="text-lg font-black">اعلانی وجود ندارد</p>
              <p className="mt-1 text-sm text-gray-600">
                زمانی که اعلانی دریافت کنید اینجا نمایش داده می‌شود
              </p>
            </div>
          ) : (
            filtered.map((n) => {
              const cfg = typeConfig(n.type);
              return (
                <div
                  key={n._id}
                  onClick={() => !n.read && markAsRead(n._id)}
                  className={`group flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all ${
                    n.read
                      ? "border-gray-800 bg-[#1a1d23]/50 opacity-70"
                      : "border-yellow-400/20 bg-[#1a1d23] hover:border-yellow-400/40"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900 ${cfg.color}`}
                  >
                    {cfg.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-black text-white text-sm">{n.title}</h4>
                        {n.message && (
                          <p className="mt-1 text-xs font-bold text-gray-400 line-clamp-2">
                            {n.message}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 text-[10px] font-bold text-gray-600">
                        {formatTime(n.createdAt)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${cfg.color} bg-gray-900`}>
                        {cfg.label}
                      </span>
                      {!n.read && (
                        <span className="h-2 w-2 rounded-full bg-yellow-400" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

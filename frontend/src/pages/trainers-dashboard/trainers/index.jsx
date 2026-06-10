"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "../layout";
import moment from "moment-jalaali";
import Link from "next/link";
import {
  Dumbbell,
  Calendar,
  Image as ImageIcon,
  CreditCard,
  Ruler,
  Weight,
  ArrowLeft,
  Zap,
} from "lucide-react";
import { API_BASE_URL, API_ORIGIN } from "@/config/api";

const statusLabelMap = {
  pending: "در انتظار صدور",
  in_progress: "در انتظار صدور",
  approved: "تأیید شده",
  rejected: "رد شده",
};

function requestStatusLabel(req) {
  if (req.trainingPlan) return "برنامه صادر شد";
  return statusLabelMap[req.status] || req.status || "در انتظار صدور";
}

export default function TrainingRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const raw = typeof window !== "undefined" ? sessionStorage.getItem("currentUser") : null;
      const currentUser = raw ? JSON.parse(raw) : null;
      const url = currentUser?._id ? `${API_BASE_URL}/training-requests/trainer/${currentUser._id}` : `${API_BASE_URL}/training-requests`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setRequests(data.requests);
      console.log("====================================");
      console.log(data);
      console.log("====================================");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  /* =========================
      Loading State
  ========================= */
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-24 text-yellow-400 font-black animate-pulse">
          <Zap size={52} className="mb-4 animate-bounce" />
          در حال بارگذاری درخواست‌های تمرینی...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 min-h-screen bg-[var(--bg-body)] rounded-[2.5rem] border border-[var(--border)] shadow-2xl">
        {/* ================= Header ================= */}
        <div className="flex items-center gap-4 mb-10">
          <div className="p-4 bg-yellow-400 text-[var(--text-body)] rounded-2xl shadow-lg">
            <Dumbbell size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-[var(--text-body)] uppercase tracking-tight">
              درخواست‌های برنامه تمرینی
            </h2>
            <p className="text-[var(--text-muted)] text-xs mt-1 uppercase tracking-widest">
              Training Requests Management
            </p>
          </div>
        </div>

        {/* ================= Empty State ================= */}
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-[var(--text-muted)]">
            <Dumbbell size={64} className="mb-6 opacity-40" />
            <p className="font-black text-xl italic">
              هنوز درخواستی وجود ندارد
            </p>
            <p className="text-sm mt-2 text-[var(--text-muted)]">
              پس از ثبت درخواست توسط کاربران، این بخش نمایش داده می‌شود
            </p>
          </div>
        ) : (
          /* ================= Cards ================= */
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {requests.map((req) => (
              <div
                key={req._id}
                className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] hover:border-yellow-400/60 transition-all shadow-xl overflow-hidden group"
              >
                {/* ===== Card Header ===== */}
                <div className="p-5 border-b border-[var(--border)] flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 flex items-center justify-center bg-gray-800 rounded-xl text-yellow-400 font-black text-lg border border-[var(--border)]">
                      {req.userId?.name?.charAt(0) || "؟"}
                    </div>
                    <div>
                      <p className="text-[var(--text-body)] font-black leading-tight">
                        {req.userId?.name || "—"}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] mt-1 flex items-center gap-1">
                        <Calendar size={12} />
                        {moment(req.createdAt).format("jYYYY/jMM/jDD")}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide
                    ${
                      req.status === "pending"
                        ? "bg-yellow-400 text-[var(--text-body)]"
                        : req.status === "approved"
                          ? "bg-green-500 text-[var(--text-body)]"
                          : "bg-red-500 text-white"
                    }`}
                  >
                    {requestStatusLabel(req)}
                  </span>
                </div>

                {/* ===== Card Body ===== */}
                <div className="p-5 space-y-4 text-[13px] text-[var(--text-dim)]">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Ruler size={14} className="text-yellow-400" />
                      <span>قد: {req.height} cm</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Weight size={14} className="text-yellow-400" />
                      <span>وزن: {req.weight} kg</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <CreditCard size={14} className="text-yellow-400" />
                    <span>
                      {req.paymentMethod} – {Number(req.amount || 0).toLocaleString()} تومان
                    </span>
                  </div>

                  {/* ===== Photos ===== */}
                  {req.photos?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-[var(--text-muted)] text-xs">
                        <ImageIcon size={14} />
                        تصاویر ارسالی
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {req.photos.map((p, idx) => (
                          <img
                            key={idx}
                            src={`${API_ORIGIN}/uploads/${p}`}
                            alt=""
                            className="w-20 h-20 object-cover rounded-xl border border-[var(--border)] hover:scale-105 transition-transform"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ===== Card Footer ===== */}
                <div className="p-5 border-t border-[var(--border)] flex justify-end">
                  <Link
                    href={`/trainers-dashboard/trainers/${req._id}/show`}
                    className="flex items-center gap-2 bg-gray-800 hover:bg-yellow-400 hover:text-[var(--text-body)] text-yellow-400 px-4 py-2 rounded-xl text-xs font-black transition-all"
                  >
                    مشاهده جزئیات
                    <ArrowLeft size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

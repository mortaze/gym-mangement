"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useRouter } from "next/router";
import { Check, Clipboard, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { notifyError, notifySuccess } from "@/utils/toast";
import { useGetLoginGuidesQuery, useLoginUserMutation } from "@/redux/features/auth/authApi";
import { getDashboardPath, ROLE_LABELS, normalizeRole, persistAuth } from "@/utils/auth";
import ErrorMsg from "../common/error-msg";

const schema = Yup.object({
  loginIdentifier: Yup.string().required("شناسه ورود الزامی است").min(2, "شناسه خیلی کوتاه است"),
  password: Yup.string().required("رمز عبور الزامی است").min(6, "حداقل ۶ کاراکتر"),
});

export default function UnifiedLoginForm() {
  const [showPass, setShowPass] = useState(false);
  const [copied, setCopied] = useState("");
  const router = useRouter();
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const { data: guideData, isLoading: guideLoading, isError: guideError } = useGetLoginGuidesQuery();
  const guides = Array.isArray(guideData?.guides) ? guideData.guides : [];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { loginIdentifier: "", password: "" },
  });

  const copyToClipboard = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      setTimeout(() => setCopied(""), 1600);
    } catch (error) {
      notifyError("امکان کپی در این مرورگر وجود ندارد");
    }
  };

  const fillIdentifier = (identifier) => {
    setValue("loginIdentifier", identifier, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    try {
      const identifier = String(data.loginIdentifier || "").trim();
      const response = await loginUser({
        loginIdentifier: identifier,
        password: data.password,
      }).unwrap();

      const user = response.user ? { ...response.user, role: normalizeRole(response.user.role) } : null;
      if (!response.token || !user) {
        notifyError("اطلاعات احراز هویت از سرور کامل دریافت نشد");
        return;
      }

      persistAuth(response.token, user);
      const redirectPath = response.redirectTo || getDashboardPath(user.role);
      notifySuccess(`ورود موفق | ${ROLE_LABELS[user.role] || "کاربر"}`);
      router.replace(redirectPath);
    } catch (err) {
      notifyError(err?.data?.message || "ورود ناموفق؛ شناسه یا رمز عبور را بررسی کنید");
    }
  };

  return (
    <section className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-[#151923]/95 p-5 shadow-2xl shadow-black/40 backdrop-blur sm:p-8 lg:p-10">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-yellow-400 text-black shadow-lg shadow-yellow-400/20">
          <LockKeyhole size={30} />
        </div>
        <h1 className="text-2xl font-black text-white sm:text-3xl lg:text-4xl">ورود به سامانه مدیریت باشگاه</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm font-bold leading-7 text-gray-400 sm:text-base">
          شناسه ورود و رمز عبور خود را وارد کنید. سیستم نقش شما را از دیتابیس تشخیص داده و به داشبورد مربوطه هدایت می‌کند.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="mb-2 block text-xs font-black text-gray-400">شناسه ورود</label>
          <input
            {...register("loginIdentifier")}
            placeholder="شناسه ورود"
            autoComplete="username"
            className="w-full rounded-2xl border border-gray-800 bg-[#0f1115] px-4 py-4 font-bold text-white outline-none transition focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/10"
          />
          <ErrorMsg msg={errors.loginIdentifier?.message} />
        </div>

        <div className="relative">
          <label className="mb-2 block text-xs font-black text-gray-400">رمز عبور</label>
          <input
            {...register("password")}
            type={showPass ? "text" : "password"}
            placeholder="رمز عبور"
            autoComplete="current-password"
            className="w-full rounded-2xl border border-gray-800 bg-[#0f1115] px-4 py-4 pl-12 font-bold text-white outline-none transition focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/10"
          />
          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-4 top-[43px] text-gray-500 transition hover:text-yellow-400" aria-label="نمایش یا مخفی‌سازی رمز عبور">
            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <ErrorMsg msg={errors.password?.message} />
        </div>

        <button type="submit" disabled={isLoading} className="w-full rounded-2xl bg-yellow-400 py-4 text-sm font-black text-black shadow-lg shadow-yellow-400/20 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 sm:text-base">
          {isLoading ? "در حال احراز هویت..." : "ورود به سامانه"}
        </button>
      </form>

      <aside className="mt-7 rounded-3xl border border-yellow-400/20 bg-[#0f1115] p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-400">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h2 className="text-base font-black text-white sm:text-lg">راهنمای ورود آزمایشی</h2>
            <p className="text-[11px] font-bold text-gray-500">شناسه‌ها به‌صورت داینامیک از MongoDB خوانده می‌شوند؛ رمز عبور نمایش داده نمی‌شود.</p>
          </div>
        </div>

        {guideLoading && <p className="rounded-2xl bg-white/5 p-4 text-sm font-bold text-gray-400">در حال دریافت شناسه‌ها از دیتابیس...</p>}
        {guideError && <p className="rounded-2xl bg-red-500/10 p-4 text-sm font-bold text-red-300">امکان دریافت راهنمای ورود از سرور وجود ندارد.</p>}
        {!guideLoading && !guideError && guides.length === 0 && (
          <p className="rounded-2xl bg-white/5 p-4 text-sm font-bold leading-7 text-gray-400">برای نقش‌های هدف، کاربر فعالی در MongoDB یافت نشد.</p>
        )}

        {guides.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {guides.map((guide) => (
              <div key={`${guide.role}-${guide.identifier}`} className="rounded-2xl border border-gray-800 bg-white/[0.03] p-4 transition hover:border-yellow-400/50">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="font-black text-white">{guide.label || ROLE_LABELS[guide.role] || guide.role}</h3>
                  <span className="rounded-full bg-yellow-400/10 px-2 py-1 text-[10px] font-black text-yellow-400">{guide.role}</span>
                </div>
                <CopyRow label="شناسه ورود" value={guide.identifier} copied={copied} onCopy={copyToClipboard} />
                <button type="button" onClick={() => fillIdentifier(guide.identifier)} className="mt-3 w-full rounded-xl border border-gray-700 py-2 text-xs font-black text-gray-300 transition hover:border-yellow-400 hover:text-yellow-400">
                  استفاده از شناسه
                </button>
              </div>
            ))}
          </div>
        )}
      </aside>
    </section>
  );
}

function CopyRow({ label, value, copied, onCopy }) {
  const isCopied = copied === value;
  return (
    <div className="mb-2 flex items-center justify-between gap-2 rounded-xl bg-white/5 px-3 py-2">
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-gray-500">{label}</p>
        <p className="truncate text-xs font-black text-gray-100" dir="ltr">{value}</p>
      </div>
      <button type="button" onClick={() => onCopy(value)} className="shrink-0 rounded-lg p-2 text-gray-500 transition hover:bg-yellow-400 hover:text-black" aria-label={`کپی ${label}`}>
        {isCopied ? <Check size={16} /> : <Clipboard size={16} />}
      </button>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useRouter } from "next/router";
import { Check, Clipboard, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { notifyError, notifySuccess } from "@/utils/toast";
import { useLoginUserMutation } from "@/redux/features/auth/authApi";
import ErrorMsg from "../common/error-msg";

const ROLE_REDIRECTS = {
  admin: "/admin-dashboard",
  Admin: "/admin-dashboard",
  manager: "/admin-dashboard",
  trainer: "/trainers-dashboard",
  Trainer: "/trainers-dashboard",
  member: "/member-dashboard",
  Member: "/member-dashboard",
  user: "/member-dashboard",
  reception: "/reception-dashboard",
  Reception: "/reception-dashboard",
  cafe: "/cafe-dashboard",
  CafeManager: "/cafe-dashboard",
  finance: "/manager-dashboard/finance",
  Finance: "/manager-dashboard/finance",
};

const ROLE_LABELS = {
  admin: "مدیر سیستم",
  Admin: "مدیر سیستم",
  trainer: "مربی",
  Trainer: "مربی",
  member: "ورزشکار",
  Member: "ورزشکار",
  user: "ورزشکار",
  reception: "پذیرش",
  Reception: "پذیرش",
  cafe: "مدیر کافه",
  CafeManager: "مدیر کافه",
  finance: "مالی",
  Finance: "مالی",
};

const DEMO_ACCOUNTS = [
  { title: "مدیر سیستم", identifier: "ADMIN001", password: "Admin@123456", badge: "admin" },
  { title: "ورزشکار", identifier: "9300000000", password: "Admin@123456", badge: "member" },
  { title: "مربی", identifier: "9300000001", password: "Admin@123456", badge: "trainer" },
  { title: "پذیرش", identifier: "9300000002", password: "Admin@123456", badge: "reception" },
  { title: "مدیر کافه", identifier: "9300000400", password: "Admin@123456", badge: "cafe" },
];

const schema = Yup.object({
  loginIdentifier: Yup.string().required("شناسه ورود الزامی است").min(2, "شناسه خیلی کوتاه است"),
  password: Yup.string().required("رمز عبور الزامی است").min(6, "حداقل ۶ کاراکتر"),
});

export default function UnifiedLoginForm() {
  const [showPass, setShowPass] = useState(false);
  const [copied, setCopied] = useState("");
  const router = useRouter();
  const [loginUser, { isLoading }] = useLoginUserMutation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { loginIdentifier: "", password: "" },
  });

  const normalizeInput = (value) => String(value || "").trim();

  const copyToClipboard = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      setTimeout(() => setCopied(""), 1600);
    } catch (error) {
      notifyError("امکان کپی در این مرورگر وجود ندارد");
    }
  };

  const fillDemo = (account) => {
    setValue("loginIdentifier", account.identifier, { shouldValidate: true });
    setValue("password", account.password, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    try {
      const identifier = normalizeInput(data.loginIdentifier);
      const response = await loginUser({
        loginIdentifier: identifier,
        employeeCode: identifier,
        username: identifier,
        email: identifier,
        password: data.password,
      }).unwrap();

      const user = response.user;
      if (!user) {
        notifyError("اطلاعات کاربر دریافت نشد");
        return;
      }

      const redirectPath = response.redirectTo || ROLE_REDIRECTS[user.role] || ROLE_REDIRECTS[String(user.role || "").toLowerCase()];
      if (!redirectPath) {
        notifyError("برای نقش این کاربر داشبورد تعریف نشده است");
        return;
      }

      const safeUser = {
        _id: user._id,
        name: user.name,
        role: user.role,
        profileImage: user.profileImage,
        email: user.email,
        employeeCode: user.employeeCode,
        height: user.height,
        weight: user.weight,
        bmi: user.bmi,
      };
      sessionStorage.setItem("currentUser", JSON.stringify(safeUser));
      notifySuccess(`ورود موفق | ${ROLE_LABELS[user.role] || "کاربر"}`);
      router.replace(redirectPath);
    } catch (err) {
      notifyError(err?.data?.message || "ورود ناموفق؛ شناسه یا رمز عبور را بررسی کنید");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#312e81_0%,#0f1115_35%,#07080c_100%)] px-4 py-8" dir="rtl">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-start gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[2rem] border border-white/10 bg-[#151923]/90 p-5 shadow-2xl backdrop-blur md:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-yellow-400 text-black shadow-lg shadow-yellow-400/20">
              <LockKeyhole size={30} />
            </div>
            <h1 className="text-2xl font-black text-white md:text-4xl">ورود یکپارچه باشگاه</h1>
            <p className="mt-3 text-xs font-bold leading-6 text-gray-400 md:text-sm">
              شناسه ورود و رمز عبور را وارد کنید؛ سیستم نقش را از دیتابیس می‌خواند و شما را خودکار به داشبورد مربوطه هدایت می‌کند.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-black text-gray-400">شناسه ورود</label>
              <input
                {...register("loginIdentifier")}
                placeholder="مثال: ADMIN001 یا 9300000000"
                autoComplete="username"
                className="w-full rounded-2xl border border-gray-800 bg-[#0f1115] px-4 py-4 font-bold text-white outline-none transition focus:border-yellow-400"
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
                className="w-full rounded-2xl border border-gray-800 bg-[#0f1115] px-4 py-4 pl-12 font-bold text-white outline-none transition focus:border-yellow-400"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-4 top-[43px] text-gray-500 hover:text-yellow-400">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <ErrorMsg msg={errors.password?.message} />
            </div>

            <button type="submit" disabled={isLoading} className="w-full rounded-2xl bg-yellow-400 py-4 text-sm font-black text-black shadow-lg shadow-yellow-400/20 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60">
              {isLoading ? "در حال احراز هویت..." : "ورود و هدایت خودکار"}
            </button>
          </form>
        </section>

        <aside className="rounded-[2rem] border border-yellow-400/20 bg-[#151923]/80 p-5 shadow-2xl md:p-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-400">
              <ShieldCheck />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">راهنمای ورود آزمایشی</h2>
              <p className="text-[11px] font-bold text-gray-500">فقط برای محیط تست و ارائه دانشگاهی</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {DEMO_ACCOUNTS.map((account) => (
              <div key={account.identifier} className="rounded-2xl border border-gray-800 bg-[#0f1115] p-4 transition hover:border-yellow-400/50">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="font-black text-white">{account.title}</h3>
                  <span className="rounded-full bg-yellow-400/10 px-2 py-1 text-[10px] font-black text-yellow-400">{account.badge}</span>
                </div>
                <CopyRow label="شناسه ورود" value={account.identifier} copied={copied} onCopy={copyToClipboard} />
                <CopyRow label="رمز عبور" value={account.password} copied={copied} onCopy={copyToClipboard} />
                <button type="button" onClick={() => fillDemo(account)} className="mt-3 w-full rounded-xl border border-gray-700 py-2 text-xs font-black text-gray-300 transition hover:border-yellow-400 hover:text-yellow-400">
                  پر کردن فرم
                </button>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function CopyRow({ label, value, copied, onCopy }) {
  const isCopied = copied === value;
  return (
    <div className="mb-2 flex items-center justify-between gap-2 rounded-xl bg-white/5 px-3 py-2">
      <div>
        <p className="text-[10px] font-bold text-gray-500">{label}</p>
        <p className="text-xs font-black text-gray-100" dir="ltr">{value}</p>
      </div>
      <button type="button" onClick={() => onCopy(value)} className="rounded-lg p-2 text-gray-500 transition hover:bg-yellow-400 hover:text-black" aria-label={`کپی ${label}`}>
        {isCopied ? <Check size={16} /> : <Clipboard size={16} />}
      </button>
    </div>
  );
}

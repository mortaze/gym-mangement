"use client";

import React from "react";
import { Dumbbell, Users, TrendingUp, LayoutDashboard, Target, ChevronDown, Sparkles, BarChart3, CalendarCheck } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "مدیریت هوشمند اعضا",
    desc: "ثبت‌نام، تمدید و مدیریت پروفایل اعضا با چند کلیک ساده",
  },
  {
    icon: Dumbbell,
    title: "برنامه تمرینی شخصی‌ساز",
    desc: "طراحی و اختصاص برنامه تمرینی اختصاصی به هر عضو",
  },
  {
    icon: BarChart3,
    title: "گزارش‌گیری لحظه‌ای",
    desc: "نمودارها و آمار دقیق از درآمد، حضور و غیاب و عملکرد",
  },
  {
    icon: CalendarCheck,
    title: "نوبت‌دهی هوشمند",
    desc: "مدیریت جلسات و زمان‌بندی تمرینات به صورت خودکار",
  },
];

const stats = [
  { value: "۱۰۰+", label: "باشگاه فعال" },
  { value: "۵,۰۰۰+", label: "عضو ثبت‌نامی" },
  { value: "۹۹٪", label: "رضایت مشتریان" },
];

export default function GymIntroSection() {
  const scrollToLogin = () => {
    document.getElementById("login-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="relative min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,#2f2a14_0%,#101318_40%,#07080c_100%)] font-sans text-[var(--text-body)]"
      dir="rtl"
    >
      {/* Glow orbs */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-yellow-400/10 blur-[150px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-yellow-400/5 blur-[120px]" />

      {/* Grid pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full text-center">
          {/* Brand badge */}
          <div className="mx-auto mb-8 flex w-fit items-center gap-3 rounded-full border border-yellow-400/20 bg-white/5 px-5 py-3 shadow-2xl shadow-black/30 backdrop-blur">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-400 text-[var(--text-body)]">
              <Dumbbell size={24} strokeWidth={3} />
            </span>
            <span className="text-lg font-black italic tracking-tighter sm:text-xl">
              IRON <span className="text-yellow-400">GYM</span>
            </span>
          </div>

          {/* Tagline */}
          <div className="mb-4 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-[0.3em] text-yellow-400/80">
            <Sparkles size={14} />
            <span>سامانه مدیریت هوشمند باشگاه</span>
            <Sparkles size={14} />
          </div>

          {/* Main heading */}
          <h1 className="text-4xl font-black leading-tight sm:text-5xl md:text-7xl lg:text-8xl">
            <span>آیرون</span>{" "}
            <span className="text-yellow-400">جیم</span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[var(--text-dim)] sm:text-lg md:text-xl">
            با سامانه مدیریت باشگاه آیرون جیم، تمام فرآیندهای مدیریت باشگاه خود را به صورت هوشمند و یکپارچه انجام دهید.
            از ثبت‌نام اعضا تا برنامه‌های تمرینی، همه در یک پلتفرم.
          </p>

          {/* CTA button */}
          <button
            onClick={scrollToLogin}
            className="group relative mx-auto mt-10 inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-yellow-400 px-10 py-5 text-sm font-black uppercase italic text-[var(--text-body)] shadow-[0_15px_35px_rgba(250,204,21,0.25)] transition-all hover:bg-yellow-500"
          >
            <Target size={20} />
            <span>ورود به سامانه</span>
            <div className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 group-hover:translate-y-0" />
          </button>

          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/10 pt-10">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-black text-[var(--text-body)] sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-xs font-bold text-[var(--text-muted)] sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features grid */}
        <div className="mt-20 grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-[var(--border)] bg-white/[0.03] p-5 transition-all hover:border-yellow-400/50 hover:bg-white/[0.06]"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400 transition-all group-hover:bg-yellow-400 group-hover:text-[var(--text-body)]">
                <feature.icon size={22} />
              </div>
              <h3 className="mb-2 text-sm font-black text-[var(--text-body)]">{feature.title}</h3>
              <p className="text-xs leading-relaxed text-[var(--text-muted)]">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="mt-16 flex animate-bounce flex-col items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">اسکرول</span>
          <ChevronDown size={16} className="text-[var(--text-muted)]" />
        </div>
      </div>
    </section>
  );
}

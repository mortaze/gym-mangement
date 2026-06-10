"use client";
import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ className = "", size = 20, compact = false }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        className={`relative flex h-8 w-14 items-center rounded-full transition-all duration-500 ${
          isDark ? "bg-gray-800" : "bg-gray-200"
        } ${className}`}
        aria-label={isDark ? "حالت روشن" : "حالت تیره"}
      >
        <span
          className={`absolute flex h-6 w-6 items-center justify-center rounded-full transition-all duration-500 ${
            isDark
              ? "translate-x-1 bg-[var(--bg-card)] text-yellow-400"
              : "translate-x-7 bg-[var(--bg-card)] text-yellow-500 shadow-md"
          }`}
        >
          {isDark ? <Moon size={12} /> : <Sun size={12} />}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`p-3 rounded-2xl transition-all duration-300 relative group ${
        isDark
          ? "bg-gray-800/50 text-[var(--text-dim)] hover:text-yellow-400 hover:bg-gray-800"
          : "bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-yellow-500 hover:bg-gray-200 shadow-sm"
      } ${className}`}
      aria-label={isDark ? "حالت روشن" : "حالت تیره"}
    >
      <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
        isDark ? "bg-yellow-400/0 group-hover:bg-yellow-400/10" : "bg-yellow-400/0 group-hover:bg-yellow-400/20"
      }`} />
      <span className="relative z-10 block transition-transform duration-500" style={{ transform: isDark ? "rotate(0deg)" : "rotate(360deg)" }}>
        {isDark ? <Moon size={size} /> : <Sun size={size} />}
      </span>
    </button>
  );
}

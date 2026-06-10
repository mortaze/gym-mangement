"use client";

import React, { useEffect, useState } from "react";
import {
  Coffee,
  Beef,
  Zap,
  Apple,
  Droplets,
  Flame,
  Target,
  Search,
  FlameIcon,
  PlusIcon,
  Pencil,
} from "lucide-react";

import DashboardLayout from "../layout";
import Link from "next/link";
import { API_BASE_URL } from "@/config/api";
import { getCafeMenuImage } from "@/utils/cafe-menu";

export default function CafeMenuPage() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("همه");
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 1, name: "همه", icon: <Target size={18} /> },
    { id: 2, name: "پروتئین", icon: <Beef size={18} /> },
    { id: 3, name: "نوشیدنی", icon: <Droplets size={18} /> },
    { id: 4, name: "انرژی‌زا", icon: <Zap size={18} /> },
    { id: 5, name: "میان وعده", icon: <Apple size={18} /> },
    { id: 6, name: "قهوه", icon: <Coffee size={18} /> },
  ];

  // 🔥 Fetch menu from API
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/menu`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("خطا در دریافت منو:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const filteredProducts =
    activeCategory === "همه"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <DashboardLayout>
      <div
        className="p-3 sm:p-4 md:p-8 min-h-screen rounded-4xl bg-[var(--bg-body)] text-right overflow-x-hidden"
        dir="rtl"
      >
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 md:gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--text-body)] italic tracking-tighter uppercase leading-none break-words">
              کافه <span className="text-yellow-400">نئون</span>
            </h1>
            <p className="text-[var(--text-muted)] text-[10px] font-black mt-3 flex items-center gap-2 uppercase tracking-[0.15em] sm:tracking-[0.4em]">
              <FlameIcon size={14} className="text-yellow-400" />
              TACTICAL REFUELING STATION
            </p>
          </div>

          <Link
            href="/manager-dashboard/cafe-menu/create"
            className="flex w-full md:w-auto items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-[var(--text-body)] font-bold uppercase px-5 py-3 rounded-2xl shadow-lg transition-all"
          >
            <PlusIcon size={16} /> ایجاد آیتم
          </Link>
        </div>

        {/* Categories */}
        <div className="flex max-w-full overflow-x-auto overscroll-x-contain pb-4 gap-3 no-scrollbar mb-8 sm:mb-10 border-b border-[var(--border)]/50">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-black italic text-xs md:text-sm whitespace-nowrap transition-all
                ${
                  activeCategory === cat.name
                    ? "bg-yellow-400 text-[var(--text-body)] scale-105 shadow-lg"
                    : "bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border)] hover:border-[var(--border)]"
                }`}
            >
              {cat.icon}
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search (UI only for now) */}
        <div className="relative mb-8 w-full max-w-md">
          <Search
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            size={18}
          />
          <input
            type="text"
            placeholder="جستجوی سریع سوخت..."
            className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl py-4 pr-12 pl-4 text-[var(--text-body)] text-sm font-bold focus:outline-none focus:border-yellow-400 italic"
          />
        </div>

        {/* Loading */}
        {loading && (
          <p className="text-[var(--text-muted)] font-bold italic text-center py-20">
            در حال بارگذاری منو...
          </p>
        )}

        {/* Products */}
        {/* Products */}
        {!loading && (
          <div className="grid min-w-0 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2rem] overflow-hidden hover:border-yellow-400/50 transition-all shadow-xl"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  {/* Edit Icon */}
                  <Link
                    href={`cafe-menu/${product._id}/edit`}
                    className="absolute cursor-pointer top-4 left-4 z-10 bg-[var(--bg-overlay)]/70 border border-yellow-400/40 text-yellow-400 p-2 rounded-full hover:bg-yellow-400 hover:text-[var(--text-body)] transition-all"
                  >
                    <Pencil size={14} />
                  </Link>

                  <img
                    src={getCafeMenuImage(product.img)}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                  />

                  <div className="absolute top-4 right-4 bg-[var(--bg-overlay)]/70 text-[var(--text-body)] px-3 py-1 rounded-full text-[10px] font-black italic flex items-center gap-1">
                    <Flame size={12} className="text-orange-500" />
                    {product.kcal} KCAL
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-yellow-400 text-[9px] font-black uppercase tracking-widest">
                      {product.category}
                    </p>
                    <span className="text-[var(--text-muted)] font-mono text-[10px]">
                      #{product.productId}
                    </span>
                  </div>

                  <h3 className="text-[var(--text-body)] font-black italic text-lg mb-4">
                    {product.name}
                  </h3>

                  <div className="border-t border-[var(--border)] pt-4">
                    <p className="text-[var(--text-muted)] text-[10px] font-bold mb-1">
                      قیمت واحد:
                    </p>
                    <span className="text-[var(--text-body)] font-black text-xl italic">
                      {product.price.toLocaleString()}
                    </span>
                    <span className="text-[var(--text-muted)] text-[10px] mr-2">
                      تومان
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20 bg-[var(--bg-card)] rounded-[3rem] border-2 border-dashed border-[var(--border)]">
            <Coffee size={48} className="mx-auto text-[var(--text-body)] mb-4" />
            <p className="text-[var(--text-muted)] font-black italic">
              موردی در این دسته یافت نشد یگان!
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

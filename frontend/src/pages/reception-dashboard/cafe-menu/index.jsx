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
        const res = await fetch("http://localhost:7000/api/menu");
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
        className="p-4 md:p-8 min-h-screen rounded-4xl bg-[#0f1115] text-right"
        dir="rtl"
      >
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
              کافه <span className="text-yellow-400">نئون</span>
            </h1>
            <p className="text-gray-500 text-[10px] font-black mt-3 flex items-center gap-2 uppercase tracking-[0.4em]">
              <FlameIcon size={14} className="text-yellow-400" />
              TACTICAL REFUELING STATION
            </p>
          </div>

          <Link
            href="/manager-dashboard/cafe-menu/create"
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold uppercase px-5 py-3 rounded-2xl shadow-lg transition-all"
          >
            <PlusIcon size={16} /> ایجاد آیتم
          </Link>
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar mb-10 border-b border-gray-800/50">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-black italic text-xs md:text-sm whitespace-nowrap transition-all
                ${
                  activeCategory === cat.name
                    ? "bg-yellow-400 text-black scale-105 shadow-lg"
                    : "bg-[#1a1d23] text-gray-500 border border-gray-800 hover:border-gray-600"
                }`}
            >
              {cat.icon}
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search (UI only for now) */}
        <div className="relative mb-8 max-w-md">
          <Search
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            size={18}
          />
          <input
            type="text"
            placeholder="جستجوی سریع سوخت..."
            className="w-full bg-[#1a1d23] border border-gray-800 rounded-2xl py-4 pr-12 pl-4 text-white text-sm font-bold focus:outline-none focus:border-yellow-400 italic"
          />
        </div>

        {/* Loading */}
        {loading && (
          <p className="text-gray-500 font-bold italic text-center py-20">
            در حال بارگذاری منو...
          </p>
        )}

        {/* Products */}
        {/* Products */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-[#1a1d23] border border-gray-800 rounded-[2rem] overflow-hidden hover:border-yellow-400/50 transition-all shadow-xl"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  {/* Edit Icon */}
                  <Link
                    href={`cafe-menu/${product._id}/edit`}
                    className="absolute cursor-pointer top-4 left-4 z-10 bg-black/70 border border-yellow-400/40 text-yellow-400 p-2 rounded-full hover:bg-yellow-400 hover:text-black transition-all"
                  >
                    <Pencil size={14} />
                  </Link>

                  <img
                    src={`http://localhost:7000/uploads/${product.img}`}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                  />

                  <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-[10px] font-black italic flex items-center gap-1">
                    <Flame size={12} className="text-orange-500" />
                    {product.kcal} KCAL
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-yellow-400 text-[9px] font-black uppercase tracking-widest">
                      {product.category}
                    </p>
                    <span className="text-gray-600 font-mono text-[10px]">
                      #{product.productId}
                    </span>
                  </div>

                  <h3 className="text-white font-black italic text-lg mb-4">
                    {product.name}
                  </h3>

                  <div className="border-t border-gray-800 pt-4">
                    <p className="text-gray-500 text-[10px] font-bold mb-1">
                      قیمت واحد:
                    </p>
                    <span className="text-white font-black text-xl italic">
                      {product.price.toLocaleString()}
                    </span>
                    <span className="text-gray-500 text-[10px] mr-2">
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
          <div className="text-center py-20 bg-[#1a1d23] rounded-[3rem] border-2 border-dashed border-gray-800">
            <Coffee size={48} className="mx-auto text-gray-700 mb-4" />
            <p className="text-gray-500 font-black italic">
              موردی در این دسته یافت نشد یگان!
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

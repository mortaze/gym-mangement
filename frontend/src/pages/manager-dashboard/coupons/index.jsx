"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "../layout";
import { API_BASE_URL } from "@/config/api";
import { Plus, Edit3, Trash2, Gift, Search, X, Save } from "lucide-react";
import Swal from "sweetalert2";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [cRes, aRes] = await Promise.all([
        fetch(`${API_BASE_URL}/coupons`),
        fetch(`${API_BASE_URL}/coupons/analytics/summary`),
      ]);
      const cData = await cRes.json();
      const aData = await aRes.json();
      if (cData.success) setCoupons(cData.coupons || []);
      if (aData.success) setAnalytics(aData.analytics);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    const result = await Swal.fire({ title: "حذف کد تخفیف؟", text: "این عملیات قابل بازگشت نیست", icon: "warning", showCancelButton: true, confirmButtonText: "حذف", cancelButtonText: "انصراف", background: "#11141b", color: "#fff", confirmButtonColor: "#ef4444" });
    if (!result.isConfirmed) return;
    const res = await fetch(`${API_BASE_URL}/coupons/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) load();
    else Swal.fire({ icon: "error", title: "خطا", text: data.message, background: "#11141b", color: "#fff" });
  };

  const saveCoupon = async (form) => {
    const url = editing ? `${API_BASE_URL}/coupons/${editing._id}` : `${API_BASE_URL}/coupons`;
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (data.success) {
      setShowModal(false);
      setEditing(null);
      await Swal.fire({ icon: "success", title: editing ? "به‌روزرسانی شد" : "ایجاد شد", background: "#11141b", color: "#fff" });
      load();
    } else Swal.fire({ icon: "error", title: "خطا", text: data.message, background: "#11141b", color: "#fff" });
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 min-h-screen bg-[#0f1115] rounded-[2rem]" dir="rtl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">مدیریت کدهای تخفیف</h1>
            <p className="text-gray-500 text-sm mt-1">ایجاد و مدیریت کدهای تخفیف و هدیه برای اعضا</p>
          </div>
          <button onClick={() => { setEditing(null); setShowModal(true); }} className="bg-yellow-400 text-black px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-yellow-500 transition-all">
            <Plus size={18} /> کد جدید
          </button>
        </div>

        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatBox label="کل کدها" value={analytics.total} />
            <StatBox label="فعال" value={analytics.active} />
            <StatBox label="هدیه" value={analytics.gift} />
            <StatBox label="مصرف شده" value={analytics.totalUsed} />
          </div>
        )}

        {loading ? <p className="text-yellow-400">در حال بارگذاری...</p> : (
          <div className="overflow-x-auto rounded-[2rem] border border-gray-800 bg-[#1a1d23]">
            <table className="w-full min-w-[800px] text-right text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="p-4">کد</th>
                  <th className="p-4">نوع</th>
                  <th className="p-4">مقدار</th>
                  <th className="p-4">مصرف/حداکثر</th>
                  <th className="p-4">انقضا</th>
                  <th className="p-4">وضعیت</th>
                  <th className="p-4">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c._id} className="border-b border-gray-800 text-gray-200 last:border-b-0">
                    <td className="p-4">
                      <span className="font-black text-yellow-400">{c.code}</span>
                      {c.isGift && <Gift size={14} className="inline mr-2 text-purple-400" />}
                    </td>
                    <td className="p-4">{c.type === "percentage" ? "درصدی" : "مبلغ ثابت"}</td>
                    <td className="p-4 font-black text-white">
                      {c.type === "percentage" ? `${c.value}%` : `${c.value.toLocaleString()} تومان`}
                    </td>
                    <td className="p-4">{c.usedCount}/{c.maxUses || "∞"}</td>
                    <td className="p-4">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("fa-IR") : "بدون انقضا"}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${c.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                        {c.isActive ? "فعال" : "غیرفعال"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditing(c); setShowModal(true); }} className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-xl transition-all"><Edit3 size={16} /></button>
                        <button onClick={() => remove(c._id)} className="bg-gray-800 hover:bg-red-500/20 text-red-400 p-2 rounded-xl transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && <CouponModal editing={editing} onSave={saveCoupon} onClose={() => { setShowModal(false); setEditing(null); }} />}
    </DashboardLayout>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="bg-[#1a1d23] border border-gray-800 rounded-2xl p-4 text-center">
      <p className="text-gray-500 text-xs font-bold">{label}</p>
      <p className="text-white text-2xl font-black mt-1">{value}</p>
    </div>
  );
}

function CouponModal({ editing, onSave, onClose }) {
  const [form, setForm] = useState(editing || {
    code: "", type: "percentage", value: 0, minPurchase: 0, maxUses: 0, expiresAt: "", isActive: true, isGift: false, description: "",
  });

  const submit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      value: Number(form.value),
      minPurchase: Number(form.minPurchase),
      maxUses: Number(form.maxUses),
      expiresAt: form.expiresAt || null,
    };
    if (editing) delete payload.code;
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#1a1d23] border border-gray-800 rounded-[2rem] p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-white">{editing ? "ویرایش کد تخفیف" : "کد تخفیف جدید"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {!editing && <Input label="کد تخفیف" value={form.code} onChange={(v) => setForm({ ...form, code: v })} required placeholder="مثال: SUMMER1403" />}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-1">نوع</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-3 text-white text-sm focus:border-yellow-400 outline-none">
                <option value="percentage">درصدی</option>
                <option value="fixed">مبلغ ثابت</option>
              </select>
            </div>
            <Input label="مقدار" type="number" value={form.value} onChange={(v) => setForm({ ...form, value: Number(v) })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="حداقل خرید (تومان)" type="number" value={form.minPurchase} onChange={(v) => setForm({ ...form, minPurchase: Number(v) })} />
            <Input label="حداکثر مصرف" type="number" value={form.maxUses} onChange={(v) => setForm({ ...form, maxUses: Number(v) })} />
          </div>
          <Input label="تاریخ انقضا (اختیاری)" type="date" value={form.expiresAt ? form.expiresAt.slice(0, 10) : ""} onChange={(v) => setForm({ ...form, expiresAt: v })} />
          <Input label="توضیحات (اختیاری)" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-gray-400 text-sm font-bold cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-yellow-400" />
              فعال
            </label>
            <label className="flex items-center gap-2 text-gray-400 text-sm font-bold cursor-pointer">
              <input type="checkbox" checked={form.isGift} onChange={(e) => setForm({ ...form, isGift: e.target.checked })} className="accent-yellow-400" />
              کد هدیه
            </label>
          </div>
          <button type="submit" className="w-full bg-yellow-400 text-black py-3 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-yellow-500 transition-all">
            <Save size={18} /> {editing ? "به‌روزرسانی" : "ایجاد کد"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required, placeholder }) {
  return (
    <div>
      <label className="block text-gray-400 text-sm font-bold mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} placeholder={placeholder} className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-3 text-white text-sm focus:border-yellow-400 outline-none" />
    </div>
  );
}

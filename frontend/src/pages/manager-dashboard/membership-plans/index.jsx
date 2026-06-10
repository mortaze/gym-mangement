"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "../layout";
import { API_BASE_URL } from "@/config/api";
import { Plus, Edit3, Trash2, Copy, ToggleLeft, ToggleRight, History, X, Save } from "lucide-react";
import Swal from "sweetalert2";

export default function MembershipPlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showHistory, setShowHistory] = useState(null);
  const [history, setHistory] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/membership-plans`);
      const data = await res.json();
      if (data.success) setPlans(data.plans || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggle = async (id) => {
    const res = await fetch(`${API_BASE_URL}/membership-plans/${id}/toggle`, { method: "PATCH" });
    const data = await res.json();
    if (data.success) load();
    else Swal.fire({ icon: "error", title: "خطا", text: data.message, background: "#11141b", color: "#fff" });
  };

  const duplicate = async (id) => {
    const res = await fetch(`${API_BASE_URL}/membership-plans/${id}/duplicate`, { method: "POST" });
    const data = await res.json();
    if (data.success) {
      await Swal.fire({ icon: "success", title: "کپی شد", background: "#11141b", color: "#fff" });
      load();
    } else Swal.fire({ icon: "error", title: "خطا", text: data.message, background: "#11141b", color: "#fff" });
  };

  const remove = async (id) => {
    const result = await Swal.fire({ title: "حذف طرح؟", text: "این عملیات قابل بازگشت نیست", icon: "warning", showCancelButton: true, confirmButtonText: "حذف", cancelButtonText: "انصراف", background: "#11141b", color: "#fff", confirmButtonColor: "#ef4444" });
    if (!result.isConfirmed) return;
    const res = await fetch(`${API_BASE_URL}/membership-plans/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) load();
    else Swal.fire({ icon: "error", title: "خطا", text: data.message, background: "#11141b", color: "#fff" });
  };

  const savePlan = async (form) => {
    const url = editing
      ? `${API_BASE_URL}/membership-plans/${editing._id}`
      : `${API_BASE_URL}/membership-plans`;
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

  const viewHistory = async (id) => {
    const res = await fetch(`${API_BASE_URL}/membership-plans/${id}/pricing-history`);
    const data = await res.json();
    if (data.success) { setHistory(data.history || []); setShowHistory(id); }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 min-h-screen bg-[#0f1115] rounded-[2rem]" dir="rtl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">مدیریت طرح‌های عضویت</h1>
            <p className="text-gray-500 text-sm mt-1">ایجاد، ویرایش و مدیریت طرح‌های فروش باشگاه</p>
          </div>
          <button onClick={() => { setEditing(null); setShowModal(true); }} className="bg-yellow-400 text-black px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-yellow-500 transition-all">
            <Plus size={18} /> طرح جدید
          </button>
        </div>

        {loading ? <p className="text-yellow-400">در حال بارگذاری...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {plans.map((p) => (
              <div key={p._id} className={`bg-[#1a1d23] border rounded-[2rem] p-6 ${p.isActive ? "border-gray-800" : "border-red-900/50 opacity-70"}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-black text-lg">{p.title}</h3>
                    {p.subtitle && <p className="text-gray-500 text-xs mt-0.5">{p.subtitle}</p>}
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${p.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                    {p.isActive ? "فعال" : "غیرفعال"}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm"><span className="text-gray-500">قیمت</span><span className="text-white font-black">{p.price.toLocaleString()} تومان</span></div>
                  {p.discount > 0 && <div className="flex justify-between text-sm"><span className="text-gray-500">تخفیف</span><span className="text-green-400 font-black">{p.discount.toLocaleString()} تومان</span></div>}
                  <div className="flex justify-between text-sm"><span className="text-gray-500">قیمت نهایی</span><span className="text-yellow-400 font-black">{p.effectivePrice.toLocaleString()} تومان</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">مدت</span><span className="text-white font-black">{p.durationMonths} ماه</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">جلسات</span><span className="text-white font-black">{p.totalSessions}</span></div>
                  {p.badge && <span className="inline-block mt-1 bg-yellow-400/10 text-yellow-400 text-[10px] px-2 py-0.5 rounded-full font-black">{p.badge}</span>}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button onClick={() => { setEditing(p); setShowModal(true); }} className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-xl transition-all"><Edit3 size={16} /></button>
                  <button onClick={() => toggle(p._id)} className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-xl transition-all">{p.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}</button>
                  <button onClick={() => duplicate(p._id)} className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-xl transition-all"><Copy size={16} /></button>
                  <button onClick={() => remove(p._id)} className="bg-gray-800 hover:bg-red-500/20 text-red-400 p-2 rounded-xl transition-all"><Trash2 size={16} /></button>
                  <button onClick={() => viewHistory(p._id)} className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-xl transition-all"><History size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && <PlanModal editing={editing} onSave={savePlan} onClose={() => { setShowModal(false); setEditing(null); }} />}
      {showHistory && <HistoryModal history={history} onClose={() => { setShowHistory(null); setHistory([]); }} />}
    </DashboardLayout>
  );
}

function PlanModal({ editing, onSave, onClose }) {
  const [form, setForm] = useState(editing || {
    title: "", subtitle: "", price: 0, discount: 0, durationMonths: 1, totalSessions: 10, badge: "", priority: 0, description: "", features: "", isActive: true,
  });

  const submit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      price: Number(form.price),
      discount: Number(form.discount),
      durationMonths: Number(form.durationMonths),
      totalSessions: Number(form.totalSessions),
      priority: Number(form.priority),
      features: form.features ? form.features.split("\n").map(s => s.trim()).filter(Boolean) : [],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#1a1d23] border border-gray-800 rounded-[2rem] p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-white">{editing ? "ویرایش طرح" : "طرح جدید"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Input label="عنوان طرح" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
          <Input label="زیرعنوان (اختیاری)" value={form.subtitle} onChange={(v) => setForm({ ...form, subtitle: v })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="قیمت (تومان)" type="number" value={form.price} onChange={(v) => setForm({ ...form, price: Number(v) })} required />
            <Input label="تخفیف (تومان)" type="number" value={form.discount} onChange={(v) => setForm({ ...form, discount: Number(v) })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="مدت (ماه)" type="number" value={form.durationMonths} onChange={(v) => setForm({ ...form, durationMonths: Number(v) })} required />
            <Input label="تعداد جلسات" type="number" value={form.totalSessions} onChange={(v) => setForm({ ...form, totalSessions: Number(v) })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="برچسب (مثلاً پرفروش)" value={form.badge} onChange={(v) => setForm({ ...form, badge: v })} />
            <Input label="اولویت" type="number" value={form.priority} onChange={(v) => setForm({ ...form, priority: Number(v) })} />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-bold mb-1">توضیحات</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-3 text-white text-sm focus:border-yellow-400 outline-none" rows={2} />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-bold mb-1">ویژگی‌ها (هر خط یک ویژگی)</label>
            <textarea value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-3 text-white text-sm focus:border-yellow-400 outline-none" rows={3} placeholder="دسترسی به تمام دستگاه‌ها&#10;مربی شخصی&#10;برنامه تغذیه" />
          </div>
          <button type="submit" className="w-full bg-yellow-400 text-black py-3 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-yellow-500 transition-all">
            <Save size={18} /> {editing ? "به‌روزرسانی" : "ایجاد طرح"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required }) {
  return (
    <div>
      <label className="block text-gray-400 text-sm font-bold mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-3 text-white text-sm focus:border-yellow-400 outline-none" />
    </div>
  );
}

function HistoryModal({ history, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#1a1d23] border border-gray-800 rounded-[2rem] p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-white">تاریخچه قیمت</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        {history.length === 0 ? <p className="text-gray-500">تغییری ثبت نشده</p> : (
          <div className="space-y-3">
            {history.map((h, i) => (
              <div key={i} className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                <div className="flex justify-between text-sm"><span className="text-gray-500">قبلی</span><span className="text-red-400 font-black line-through">{h.oldPrice.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">جدید</span><span className="text-green-400 font-black">{h.newPrice.toLocaleString()}</span></div>
                {h.reason && <p className="text-gray-500 text-xs mt-2">دلیل: {h.reason}</p>}
                <p className="text-gray-600 text-[10px] mt-1">{new Date(h.createdAt).toLocaleDateString("fa-IR")}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

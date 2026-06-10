"use client";

import React, { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../layout";
import { API_BASE_URL } from "@/config/api";
import {
  TrendingUp,
  Weight,
  Calendar,
  Activity,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Target,
  Loader,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const PERSIAN_MONTHS = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];

function toJalali(date) {
  const d = new Date(date);
  const greg = new Date(d.getTime() + 3.5 * 60 * 60 * 1000);
  const year = greg.getFullYear();
  const month = greg.getMonth() + 1;
  const day = greg.getDate();
  const jMonth = month > 9 ? month - 9 : month + 3;
  const jYear = month > 9 ? year - 621 : year - 622;
  const jDay = day;
  return { year: jYear, month: jMonth, day: jDay, monthName: PERSIAN_MONTHS[jMonth - 1] || "" };
}

export default function ProgressPage() {
  const [trainer, setTrainer] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [weightLogs, setWeightLogs] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? sessionStorage.getItem("currentUser") : null;
    const u = raw ? JSON.parse(raw) : null;
    setTrainer(u);
    if (u?._id) {
      fetch(`${API_BASE_URL}/programs/trainer/${u._id}/students`)
        .then((r) => r.json())
        .then((d) => { if (d.success) setStudents(d.students || []); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loadStudentData = async (studentId) => {
    setLoading(true);
    try {
      const [wRes, pRes] = await Promise.all([
        fetch(`${API_BASE_URL}/weight-logs/trend/${studentId}?days=90`),
        fetch(`${API_BASE_URL}/programs/user/${studentId}`),
      ]);
      const wData = await wRes.json();
      const pData = await pRes.json();
      if (wData.success) setWeightLogs(wData.logs || []);
      if (pData.success) setPrograms(pData.trainingPrograms || []);
    } finally {
      setLoading(false);
    }
  };

  const selectStudent = (s) => {
    setSelectedStudent(s);
    loadStudentData(s._id);
  };

  const weightChartData = useMemo(() => {
    return weightLogs
      .filter((l) => l.weight)
      .map((l) => ({
        date: toJalali(l.date),
        weight: l.weight,
        bodyFat: l.bodyFat,
      }))
      .reverse();
  }, [weightLogs]);

  const latestWeight = weightLogs[0]?.weight || selectedStudent?.weight || "—";
  const initialWeight = weightLogs[weightLogs.length - 1]?.weight || selectedStudent?.weight;
  const weightChange = latestWeight !== "—" && initialWeight ? (latestWeight - initialWeight).toFixed(1) : null;

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 min-h-screen bg-[#0f1115] rounded-[2.5rem] border border-gray-800 shadow-2xl" dir="rtl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-yellow-400 text-black rounded-2xl shadow-lg">
            <TrendingUp size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">پیگیری پیشرفت</h2>
            <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest">Progress Tracking</p>
          </div>
        </div>

        {!selectedStudent ? (
          <StudentSelector students={students} onSelect={selectStudent} loading={loading} />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-[#1a1d23] rounded-[2rem] p-4 border border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-yellow-400 font-black text-lg border border-gray-700">
                  {selectedStudent.name?.charAt(0) || "?"}
                </div>
                <div>
                  <p className="text-white font-black">{selectedStudent.name}</p>
                  <p className="text-xs text-gray-500">{selectedStudent.employeeCode}</p>
                </div>
              </div>
              <button
                onClick={() => { setSelectedStudent(null); setWeightLogs([]); setPrograms([]); }}
                className="text-gray-400 hover:text-white text-sm font-black flex items-center gap-1"
              >
                <ChevronRight size={16} /> تغییر
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={<Weight size={18} />} label="وزن فعلی" value={latestWeight !== "—" ? `${latestWeight} kg` : "—"} />
              <StatCard icon={<TrendingUp size={18} />} label="تغییر وزن" value={weightChange ? `${weightChange > 0 ? "+" : ""}${weightChange} kg` : "—"} color={weightChange > 0 ? "text-red-400" : weightChange < 0 ? "text-green-400" : "text-gray-400"} />
              <StatCard icon={<Target size={18} />} label="BMI" value={selectedStudent?.bmi || "—"} />
              <StatCard icon={<Activity size={18} />} label="امتیاز پیشرفت" value={`${selectedStudent?.progressScore || 0}%`} />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-yellow-400 font-black animate-pulse">در حال بارگذاری...</div>
            ) : (
              <>
                {weightChartData.length > 1 && (
                  <div className="bg-[#1a1d23] rounded-[2rem] p-6 border border-gray-800">
                    <h3 className="text-white font-black text-lg flex items-center gap-2 mb-6">
                      <Weight className="text-yellow-400" size={20} /> روند وزن
                    </h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weightChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2d3139" vertical={false} />
                          <XAxis
                            dataKey="date"
                            tickFormatter={(d) => `${d.monthName} ${d.day}`}
                            stroke="#4b5563"
                            fontSize={11}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis stroke="#4b5563" fontSize={11} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#0f1115", border: "1px solid #374151", borderRadius: "15px", textAlign: "right" }}
                            labelFormatter={(d) => `${d.year}/${d.month}/${d.day}`}
                          />
                          <Line type="monotone" dataKey="weight" stroke="#facc15" strokeWidth={3} dot={{ fill: "#facc15", r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {programs.length > 0 && (
                  <div className="bg-[#1a1d23] rounded-[2rem] p-6 border border-gray-800">
                    <h3 className="text-white font-black text-lg flex items-center gap-2 mb-6">
                      <Dumbbell className="text-yellow-400" size={20} /> برنامه‌های تمرینی
                    </h3>
                    <div className="space-y-4">
                      {programs.slice(0, 5).map((p) => {
                        const score = p.progressScore || 0;
                        return (
                          <div key={p._id} className="bg-gray-900/70 rounded-2xl p-4 border border-gray-800">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="text-white font-black text-sm">{p.title}</p>
                                <p className="text-gray-500 text-xs">{p.weekDays?.length || p.trainingDays} روز • {p.exercises?.length} تمرین</p>
                              </div>
                              <span className={`text-sm font-black ${score >= 70 ? "text-green-400" : score >= 40 ? "text-yellow-400" : "text-red-400"}`}>
                                {score}%
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${score >= 70 ? "bg-green-400" : score >= 40 ? "bg-yellow-400" : "bg-red-400"}`}
                                style={{ width: `${score}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {weightChartData.length <= 1 && programs.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-500 bg-[#1a1d23] rounded-[2rem] border border-gray-800">
                    <Activity size={48} className="mb-4 opacity-40" />
                    <p className="font-black text-lg">هنوز داده‌ای ثبت نشده</p>
                    <p className="text-sm mt-1 text-gray-600">پس از ثبت وزن و شروع برنامه، اطلاعات اینجا نمایش داده می‌شود</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function StudentSelector({ students, onSelect, loading }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.trim().toLowerCase();
    return students.filter((s) => s.name?.toLowerCase().includes(q) || s.employeeCode?.toLowerCase().includes(q));
  }, [students, search]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-yellow-400 font-black animate-pulse">
        <Loader size={40} className="animate-spin mb-4" />
        در حال بارگذاری...
      </div>
    );
  }

  return (
    <div className="bg-[#1a1d23] rounded-[2rem] border border-gray-800 p-6">
      <h3 className="text-white font-black text-lg mb-4">انتخاب ورزشکار</h3>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="جستجوی ورزشکار..."
        className="w-full bg-[#0f1115] border border-gray-800 rounded-2xl py-3 px-4 text-white text-sm outline-none focus:border-yellow-400 mb-4"
      />
      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-8">نتیجه‌ای یافت نشد</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((s) => (
            <button
              key={s._id}
              onClick={() => onSelect(s)}
              className="flex items-center gap-3 bg-gray-900 rounded-2xl p-4 border border-gray-800 hover:border-yellow-400/40 transition-all text-right"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-yellow-400 font-black border border-gray-700">
                {s.name?.charAt(0) || "?"}
              </div>
              <div>
                <p className="text-white font-black text-sm">{s.name}</p>
                <p className="text-[10px] text-gray-500">{s.employeeCode}</p>
              </div>
              <ChevronLeft size={16} className="mr-auto text-gray-500" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color = "text-white" }) {
  return (
    <div className="bg-[#1a1d23] border border-gray-800 rounded-2xl p-4">
      <div className="text-yellow-400 mb-2">{icon}</div>
      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">{label}</p>
      <p className={`text-xl font-black mt-0.5 ${color}`}>{value}</p>
    </div>
  );
}

"use client";

import Head from "next/head";
import {
  FaCircle,
  FaFileAlt,
  FaHome,
  FaUserPlus,
  FaMapMarkedAlt,
  FaCheckCircle,
  FaCommentDots,
  FaClock,
} from "react-icons/fa";

export default function DashboardPage() {
  const stats = [
    {
      title: "تعداد سندهای رسمی امروز",
      value: "۱۲",
      desc: "+۳ نسبت به دیروز",
    },
    {
      title: "ثبت‌های امروز",
      value: "۲۵",
      desc: "+۵ ثبت جدید",
    },
    {
      title: "ثبت‌های این ماه",
      value: "۴۵۰",
      desc: "+۲۰ نسبت به ماه گذشته",
    },
    {
      title: "ثبت‌های سال جاری",
      value: "۵,۲۰۰",
      desc: "+۳۵۰ نسبت به سال گذشته",
    },
  ];

  const notifications = [
    "ثبت ملک جدید توسط کاربر",
    "سند رسمی صادر شد",
    "ثبت قرارداد جدید",
    "تایید پرداخت هزینه ثبت",
    "نظر جدید از کاربران",
  ];

  const activities = [
    {
      icon: <FaFileAlt />,
      title: "سند رسمی صادر شد: #۱۲۳۴",
      time: "۵ دقیقه پیش",
      detail: "مالک: محمد رضایی",
    },
    {
      icon: <FaHome />,
      title: "ملک جدید ثبت شد: پلاک ۵۲",
      time: "۱۵ دقیقه پیش",
      detail: "آدرس: تهران، سعادت‌آباد",
    },
    {
      icon: <FaUserPlus />,
      title: "ثبت نام کاربر جدید: علی احمدی",
      time: "۳۰ دقیقه پیش",
      detail: "سطح: کاربر عادی",
    },
    {
      icon: <FaCheckCircle />,
      title: "قرارداد تایید شد: #۵۶۷۸",
      time: "۴۵ دقیقه پیش",
      detail: "نوع: اجاره",
    },
    {
      icon: <FaCommentDots />,
      title: "نظر جدید ثبت شد",
      time: "۱ ساعت پیش",
      detail: "کاربر: سارا کریمی",
    },
    {
      icon: <FaClock />,
      title: "ثبت فعالیت روزانه",
      time: "۲ ساعت پیش",
      detail: "تعداد ثبت: ۱۲",
    },
  ];

  return (
    <>
      <Head>
        <title>داشبورد سامانه مستغلات</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="pt-4">
        {/* آمار کلی */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {stats.map((item, i) => (
            <div key={i} className="bg-gray-700 p-4 rounded-xl shadow">
              <h3 className="text-sm text-gray-400 mb-1">{item.title}</h3>
              <div className="text-xl font-bold">{item.value}</div>
              <div className="text-green-400 text-sm mt-1">{item.desc}</div>
            </div>
          ))}
        </div>

        {/* نمودار و اعلان‌ها */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2 bg-gray-700 p-4 rounded-xl shadow">
            <div className="flex justify-between mb-2">
              <span className="text-green-400 font-semibold">
                نمودار ثبت‌ها (روز/ماه/سال)
              </span>
              <span className="text-sm text-gray-400">۱۴۰۳</span>
            </div>
            <div className="h-48 flex items-center justify-center bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg text-gray-400">
              (جایگاه نمودار ثبت‌ها)
            </div>
          </div>
          <div className="bg-gray-700 p-4 rounded-xl shadow">
            <h4 className="text-green-400 font-semibold mb-2">اعلانات اخیر</h4>
            <ul className="space-y-2">
              {notifications.map((text, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <FaCircle className="text-green-400 text-xs" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* فعالیت‌ها */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((item, i) => (
            <div key={i} className="bg-gray-700 p-4 rounded-xl shadow">
              <div className="flex items-center gap-3 mb-2">
                {item.icon}
                <div>
                  <div className="font-semibold">{item.title}</div>
                  <div className="text-xs text-gray-400">{item.time}</div>
                </div>
              </div>
              <div className="text-green-400 text-sm">{item.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

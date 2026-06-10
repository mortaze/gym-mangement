<div align="center">

# 🏋️ سیستم مدیریت باشگاه (Gym Management System)

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.2.0-61dafb)
![Next.js](https://img.shields.io/badge/Next.js-13.2.4-black)
![Express](https://img.shields.io/badge/Express-4.x-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8)

**یک سیستم مدیریت جامع و تمام‌نقص برای باشگاه‌های ورزشی، با پشتیبانی از نقش‌های مختلف کاربری، مدیریت برنامه‌های تمرینی، رژیم غذایی، حضور و غیاب، پیام‌رسانی، و داشبوردهای تحلیلی.**

</div>

---

## 📋 فهرست مطالب

- [معرفی کلی](#معرفی-کلی)
- [ویژگی‌های اصلی](#ویژگی‌های-اصلی)
- [نقش‌ها و دسترسی‌ها](#نقش‌ها-و-دسترسی‌ها)
- [اسکرین‌شات‌ها](#اسکرین‌شات‌ها)
- [معماری پروژه](#معماری-پروژه)
- [تکنولوژی‌های استفاده شده](#تکنولوژی‌های-استفاده-شده)
- [ساختار پروژه](#ساختار-پروژه)
  - [ساختار بک‌اند](#ساختار-بک‌اند)
  - [ساختار فرانت‌اند](#ساختار-فرانت‌اند)
- [مدل‌های داده](#مدل‌های-داده)
- [API Endpoints](#api-endpoints)
- [راهنمای نصب و راه‌اندازی](#راهنمای-نصب-و-راه‌اندازی)
- [متغیرهای محیطی](#متغیرهای-محیطی)
- [راهنمای استقرار (Deployment)](#راهنمای-استقرار-deployment)
- [احراز هویت و امنیت](#احراز-هویت-و-امنیت)
- [سیستم تم (Dark/Light)](#سیستم-تم-darklight)
- [نقشه راه آینده](#نقشه-راه-آینده)
- [مشارکت در پروژه](#مشارکت-در-پروژه)

---

## 🔰 معرفی کلی

این پروژه یک **سیستم مدیریت جامع باشگاه ورزشی** تحت وب است که با معماری **کلاین-سرور (Client-Server)** طراحی شده است. این سیستم تمامی نیازهای یک باشگاه مدرن را از ثبت‌نام اعضا و مدیریت برنامه‌های تمرینی گرفته تا مدیریت مالی، حضور و غیاب، کافه، و پیام‌رسانی داخلی پوشش می‌دهد.

پروژه به صورت **کاملاً فارسی** و **RTL** طراحی شده و از تقویم شمسی (جلالی) پشتیبانی می‌کند.

### چرا این سیستم؟

- ✅ **مدیریت یکپارچه**: تمامی بخش‌های باشگاه در یک پلتفرم واحد
- ✅ **نقش‌های متنوع**: دسترسی‌های مجزا برای مدیر، مربی، کاربر، پذیرش و کافه
- ✅ **رابط کاربری مدرن**: تم تاریک/روشن، واکنش‌گرا و کاربرپسند
- ✅ **آنالیز و گزارش**: داشبوردهای تحلیلی با نمودارهای پیشرفته
- ✅ **فارسی و شمسی**: پشتیبانی کامل از زبان فارسی و تاریخ جلالی

---

## ✨ ویژگی‌های اصلی

### 🎯 مدیریت اعضا
- ثبت‌نام و مدیریت پروفایل اعضا با کد پرسنلی یکتا
- ثبت وزن، اندازه‌گیری‌های بدنی و شاخص BMI
- تاریخچه کامل فعالیت‌های هر عضو
- جستجو و فیلتر پیشرفته کاربران

### 📋 برنامه‌های تمرینی و تغذیه
- طراحی و اختصاص برنامه تمرینی شخصی‌سازی شده توسط مربی
- برنامه‌های تغذیه با وعده‌های غذایی کامل (صبحانه، میان‌وعده، ناهار، قبل تمرین، بعد تمرین، شام)
- ثبت پیشرفت روزانه تمرینات و گزارش‌دهی
- امکان کپی و شخصی‌سازی برنامه‌ها

### 📅 کلاس‌ها و نوبت‌دهی
- تعریف و مدیریت کلاس‌های گروهی
- رزرو کلاس توسط اعضا
- صف انتظار (Waiting List) برای کلاس‌های پرظرفیت
- QR Code برای ثبت حضور در کلاس
- مشاهده تاریخچه کلاس‌های رزرو شده

### 🏪 مدیریت کافه
- منوی دیجیتال کافه با دسته‌بندی و تصاویر
- نمایش کالری و قیمت هر محصول
- مدیریت وضعیت موجودی (موجود/ناموجود)
- شماره‌گذاری خودکار محصولات

### 💰 مدیریت مالی
- خرید و تمدید عضویت با طرح‌های متنوع
- تخفیف‌ها و کوپن‌های تبلیغاتی
- صورتحساب (Invoice) خودکار
- سیستم پرداخت آنلاین (از طریق Stripe) و نقدی
- گزارش‌های درآمدی و تحلیل روند مالی

### 🏋️ تجهیزات
- ثبت و مدیریت تجهیزات باشگاه با کد یکتا
- شاخص سلامت تجهیزات (Health Index 0-100)
- ثبت سوابق تعمیر و نگهداری
- وضعیت عملیاتی (فعال/نیاز به تعمیر/از کار افتاده)
- هشدار گارانتی

### 📍 حضور و غیاب
- ثبت حضور اعضا با جستجوی کد پرسنلی
- مشاهده تاریخچه حضور و غیاب
- مدیریت پرسنل (ورود/خروج)
- گزارش‌گیری از حضور در باشگاه

### 💬 پیام‌رسانی داخلی
- چت خصوصی بین کاربران
- سیستم اعلان‌ها (Notifications)
- اعلان‌های خودکار (انقضای عضویت، تأیید پرداخت، یادآوری کلاس و...)
- نشان دادن تعداد پیام‌های خوانده‌نشده

### 📊 داشبورد تحلیلی
- نمای کلی از آمار باشگاه (اعضا، مربیان، کلاس‌ها، درآمد)
- روند رشد عضویت
- هیت مپ کلاس‌ها
- عملکرد مربیان
- نمودارهای تعاملی با Recharts

### 🎨 مدیریت ظاهر
- تم تاریک و روشن (Dark/Light Mode)
- ذخیره تنظیمات در localStorage
- طراحی واکنش‌گرا (Responsive) برای موبایل و دسکتاپ
- انیمیشن‌ها و افکت‌های بصری

---

## 👥 نقش‌ها و دسترسی‌ها

| نقش | وظایف اصلی | داشبورد |
|------|-----------|---------|
| **مدیر (Admin/Manager)** | مدیریت کامل سیستم، کاربران، مربیان، مالی، تنظیمات و... | `manager-dashboard` |
| **مربی (Trainer/Coach)** | مدیریت برنامه تمرینی و تغذیه اعضا، کلاس‌ها، پیگیری پیشرفت | `trainers-dashboard` |
| **کاربر/عضو (Member/User)** | مشاهده برنامه، رزرو کلاس، پیام، خرید اشتراک و... | `users-dashboard` |
| **پذیرش (Reception)** | ثبت حضور، مدیریت کاربران، عضویت‌ها | `reception-dashboard` |
| **مدیر کافه (Cafe Manager)** | مدیریت منوی کافه، محصولات و قیمت‌ها | `cafe-dashboard` |

> هر نقش به داشبورد مخصوص خود هدایت می‌شود و دسترسی‌های مجزا دارد. نقش‌ها قابل شخصی‌سازی و ترکیب هستند.

---

## 🏗 معماری پروژه

```
┌─────────────────────────────────────────────────────────────────┐
│                    کلاینت (Next.js 13)                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│  │  Pages   │  │  Redux   │  │  Themes  │  │   Components   │  │
│  │ (Router) │  │ (State)  │  │ (D/L)    │  │   (Reusable)   │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────────┘  │
│                        │                        │               │
│                        ▼                        ▼               │
│              ┌──────────────────────────────────────┐            │
│              │   RTK Query (fetchBaseQuery + JWT)    │            │
│              └──────────────────────────────────────┘            │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTP/HTTPS
                             │ Bearer Token
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   سرور (Express.js)                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│  │  Routes  │  │Controller│  │ Services │  │   Middleware    │  │
│  │ (19 file)│  │   (8)    │  │   (4)    │  │ (Auth, Multer) │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────────┘  │
│                        │                                        │
│                        ▼                                        │
│              ┌──────────────────────┐                           │
│              │   Mongoose (ODM)     │                           │
│              │  19 Models / Schemas │                           │
│              └──────────────────────┘                           │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
              ┌──────────────────────────┐
              │     MongoDB Atlas         │
              │     (NoSQL Database)      │
              └──────────────────────────┘
```

### اصول معماری:
- **معماری سه لایه**: Route → Controller/Service → Model
- **مدیریت حالت**: Redux Toolkit + RTK Query برای کش و همگام‌سازی
- **احراز هویت**: JWT با middleware محافظت از مسیرها
- **مدیریت خطا**: Error handler مرکزی با کلاس‌های خطای سفارشی
- **آپلود فایل**: Multer با ذخیره‌سازی محلی (سازگار با Vercel `/tmp`)
- **اعتبارسنجی**: Mongoose Validation + express-validator

---

## 🛠 تکنولوژی‌های استفاده شده

### فرانت‌اند (Frontend)

| تکنولوژی | کاربرد |
|----------|--------|
| **Next.js 13.2.4** | چارچوب اصلی فرانت‌اند (Pages Router) |
| **React 18.2** | کتابخانه ساخت رابط کاربری |
| **Redux Toolkit / RTK Query** | مدیریت state و درخواست‌های API |
| **Tailwind CSS v4** | فریمورک CSS کاربردی |
| **React Hook Form + Yup** | مدیریت فرم‌ها و اعتبارسنجی |
| **Recharts** | نمودارها و گراف‌های تحلیلی |
| **Leaflet / react-leaflet** | نقشه تعاملی |
| **Tiptap** | ویرایشگر متن پیشرفته |
| **react-toastify** | نوتیفیکیشن‌های toast |
| **Sweetalert2** | دیالوگ‌ها و مودال‌های زیبا |
| **Lucide React / React Icons** | آیکون‌ها |
| **qrcode.react** | تولید QR Code |
| **moment-jalaali** | تاریخ و زمان شمسی |
| **Stripe** | پرداخت آنلاین |
| **Bootstrap** | تکمیل کننده Tailwind |

### بک‌اند (Backend)

| تکنولوژی | کاربرد |
|----------|--------|
| **Express.js** | چارچوب سرور |
| **Mongoose** | ODM برای MongoDB |
| **bcryptjs** | هش کردن رمز عبور |
| **jsonwebtoken** | تولید و تأیید JWT |
| **Multer** | آپلود فایل |
| **Cloudinary** | آپلود ابری تصاویر |
| **Nodemailer** | ارسال ایمیل |
| **Winston + Morgan** | لاگینگ |
| **Stripe** | درگاه پرداخت |
| **express-validator** | اعتبارسنجی ورودی |
| **dayjs / moment-jalaali** | تاریخ شمسی |

### دیتابیس و زیرساخت

| تکنولوژی | کاربرد |
|----------|--------|
| **MongoDB Atlas** | دیتابیس ابری |
| **Vercel** | پلتفرم استقرار (هر دو بخش) |

---

## 📁 ساختار پروژه

### ساختار بک‌اند (Backend)

```
backend/
├── index.js                         # نقطه ورود اصلی و تنظیمات Express
├── config/
│   ├── auth.js                      # توابع احراز هویت JWT
│   ├── db.js                        # اتصال MongoDB
│   ├── email.js                     # تنظیمات Nodemailer
│   └── secret.js                    # دسترسی متمرکز به متغیرهای محیطی
├── controller/
│   ├── admin.controller.js          # مدیریت ادمین‌ها
│   ├── cafeMenu.controller.js       # مدیریت منوی کافه
│   ├── equipment.controller.js      # مدیریت تجهیزات
│   ├── trainingRequest.controller.js # مدیریت درخواست‌های تمرینی
│   ├── upload.controller.js         # آپلود فایل
│   └── user.controller.js           # مدیریت کاربران
├── errors/
│   ├── api-error.js                 # کلاس خطای سفارشی
│   ├── handle-cast-error.js         # مدیریت CastError مونگوس
│   └── handle-validation-error.js   # مدیریت ValidationError مونگوس
├── lib/
│   └── logger.js                    # لاگر وینستون
├── middleware/
│   ├── authMiddleware.js            # محافظت JWT و احراز نقش
│   ├── documentUploader.js          # آپلود اسناد (ZIP/RAR)
│   ├── global-error-handler.js      # مدیریت خطای مرکزی
│   ├── requestLogger.js             # لاگ درخواست‌ها
│   └── uploader.js                  # آپلود تصاویر
├── model/                           # ۱۹ مدل مونگوس
│   ├── Admin.js
│   ├── Attendance.js
│   ├── AuditLog.js
│   ├── CafeMenu.js
│   ├── ClassSession.js
│   ├── Coupon.js
│   ├── equipment.js
│   ├── Invoice.js
│   ├── Membership.js
│   ├── MembershipPlan.js
│   ├── Message.js
│   ├── Notification.js
│   ├── NutritionProgram.js
│   ├── Payment.js
│   ├── PricingHistory.js
│   ├── TrainingProgram.js
│   ├── TrainingRequest.js
│   ├── User.js
│   └── WeightLog.js
├── routes/                          # ۱۹ فایل مسیر
│   ├── admin.routes.js
│   ├── analytics.routes.js
│   ├── auditLog.routes.js
│   ├── auth.routes.js
│   ├── CafeMenu.routes.js
│   ├── class.routes.js
│   ├── coupon.routes.js
│   ├── equipment.routes.js
│   ├── invoice.routes.js
│   ├── membership.routes.js
│   ├── membershipPlan.routes.js
│   ├── message.routes.js
│   ├── notification.routes.js
│   ├── program.routes.js
│   ├── trainingRequest.routes.js
│   ├── uploadDocument.routes.js
│   ├── uploadFile.routes.js
│   ├── user.routes.js
│   └── weightLog.routes.js
├── services/
│   ├── cafeMenu.service.js
│   ├── equipment.service.js
│   ├── trainingRequest.service.js
│   └── user.service.js
├── uploads/
│   ├── CafeMenu/
│   ├── TrainingRequest/
│   └── owners/
└── utils/
    ├── cloudinary.js
    ├── membership.js
    ├── token.js
    └── uploadPaths.js
```

### ساختار فرانت‌اند (Frontend)

```
frontend/src/
├── pages/
│   ├── _app.jsx                     # Providerها، Theme، AuthGate
│   ├── _document.jsx
│   ├── index.jsx                    # صفحه ورود
│   ├── 404.jsx
│   ├── forgot.jsx                   # فراموشی رمز عبور
│   ├── admin-dashboard/             # داشبورد مدیریتی ساده
│   ├── manager-dashboard/           # داشبورد کامل مدیریت
│   │   ├── index.jsx
│   │   ├── layout.jsx
│   │   ├── auth/LoginPage.jsx
│   │   ├── components/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── MetaBox.jsx
│   │   │   └── Map.jsx
│   │   ├── analytics/
│   │   ├── audit-logs/
│   │   ├── cafe-menu/
│   │   ├── classes/
│   │   ├── coupons/
│   │   ├── equipment/
│   │   ├── finance/
│   │   ├── membership-plans/
│   │   ├── messages/
│   │   ├── presence/
│   │   ├── trainers/
│   │   └── users/
│   ├── users-dashboard/             # داشبورد کاربران
│   │   ├── index.jsx
│   │   ├── layout.jsx
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── MetaBox.jsx
│   │   ├── aerobic/
│   │   ├── cafe/
│   │   ├── classes/
│   │   ├── finance/
│   │   ├── messages/
│   │   ├── notifications/
│   │   ├── presence/
│   │   ├── profile/
│   │   ├── trainers/
│   │   └── workout/
│   ├── trainers-dashboard/          # داشبورد مربیان
│   │   ├── index.jsx
│   │   ├── layout.jsx
│   │   ├── auth/LoginPage.jsx
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── MetaBox.jsx
│   │   │   └── Map.jsx
│   │   ├── cafe-menu/
│   │   ├── classes/
│   │   ├── messages/
│   │   ├── my-students/
│   │   ├── presence/
│   │   ├── progress/
│   │   ├── trainers/
│   │   └── workout-builder/
│   ├── reception-dashboard/         # داشبورد پذیرش
│   │   ├── index.jsx
│   │   ├── layout.jsx
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── MetaBox.jsx
│   │   │   └── Map.jsx
│   │   ├── cafe-menu/
│   │   ├── messages/
│   │   └── users/
│   ├── cafe-dashboard/              # داشبورد کافه
│   │   ├── index.jsx
│   │   ├── layout.jsx
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── MetaBox.jsx
│   │   │   └── DashboardPage.jsx
│   │   ├── create/
│   │   ├── [id]/edit/
│   │   ├── messages/
│   │   └── profile/
│   └── forget-password/[token].jsx
├── redux/
│   ├── store.js                     # پیکربندی Redux Store
│   ├── api/
│   │   └── apiSlice.js             # پایه RTK Query
│   └── features/
│       ├── auth/
│       │   ├── authSlice.js        # state احراز هویت
│       │   └── authApi.js          # API احراز هویت
│       ├── userApi.js
│       ├── roleApi.js
│       ├── equipmentApi.js
│       ├── trainingRequestApi.js
│       ├── ownerApi.js
│       └── propertyDraftSlice.js
├── components/
│   ├── ThemeToggle.jsx              # دکمه تغییر تم
│   ├── MessagingPanel.js            # پنل پیام‌رسانی
│   ├── Skeleton.js                  # لودینگ اسکلتون
│   └── ... (سایر کامپوننت‌ها)
├── contexts/
│   └── ThemeContext.jsx             # context تم تاریک/روشن
├── styles/
│   ├── globals.css                  # متغیرهای CSS و Tailwind
│   └── dashboard.css
├── config/
│   └── api.js                      # تنظیمات API
├── hooks/
│   ├── use-auth-check.js           # بررسی خودکار احراز هویت
│   └── usePropertyStepper.js       # استپر فرم
└── utils/
    ├── auth.js                     # توابع احراز هویت
    ├── cafe-menu.js
    ├── localstorage.js
    └── toast.js
```

---

## 📦 مدل‌های داده (19 مدل)

| مدل | توضیحات | فیلدهای کلیدی |
|-----|---------|---------------|
| **User** | کاربران سیستم | نام، کد پرسنلی (یکتا)، نقش، وضعیت، BMI، تاریخ تولد شمسی |
| **Admin** | مدیران سیستم | ایمیل، نقش مدیریتی، وضعیت، تصویر |
| **Attendance** | حضور و غیاب | کاربر، عضویت، زمان ورود، ثبت‌کننده |
| **AuditLog** | لاگ عملیات | کاربر، عملیات، منبع، جزئیات، IP |
| **CafeMenu** | منوی کافه | کد محصول (auto-increment)، دسته، نام، قیمت، کالری |
| **ClassSession** | جلسات کلاس | عنوان، مربی، تاریخ، ظرفیت، شرکت‌کنندگان، صف انتظار |
| **Coupon** | کوپن تخفیف | کد، نوع (درصدی/ثابت)، مقدار، محدودیت استفاده، انقضا |
| **Equipment** | تجهیزات | کد تجهیزات، نام، برند، شاخص سلامت، گارانتی، لاگ تعمیرات |
| **Invoice** | صورتحساب | شماره فاکتور، کاربر، مبلغ، تخفیف، وضعیت |
| **Membership** | عضویت | کاربر، طرح، تاریخ شروع/پایان، جلسات باقی‌مانده |
| **MembershipPlan** | طرح‌های عضویت | عنوان، مدت، قیمت، تخفیف، ویژگی‌ها، جلسات |
| **Message** | پیام‌ها | فرستنده، گیرنده، متن، وضعیت خوانده شدن |
| **Notification** | اعلان‌ها | کاربر، نوع، عنوان، متن، لینک |
| **NutritionProgram** | برنامه غذایی | کاربر، مربی، وعده‌های غذایی، وضعیت |
| **Payment** | پرداخت‌ها | کاربر، مبلغ، روش، وضعیت، تأییدکننده |
| **PricingHistory** | تاریخچه قیمت | طرح، قیمت قدیم/جدیم، تخفیف، تغییردهنده |
| **TrainingProgram** | برنامه تمرینی | کاربر، مربی، روزهای تمرین، تمرینات، لاگ روزانه |
| **TrainingRequest** | درخواست تمرین | کاربر، مربی، اهداف، BMI، عکس‌ها، وضعیت |
| **WeightLog** | ثبت وزن | کاربر، وزن، چربی بدن، اندازه‌گیری‌ها، تاریخ |

---

## 🌐 API Endpoints

### احراز هویت (`/api/auth`)
| متد | مسیر | توضیحات |
|-----|------|---------|
| POST | `/login` | ورود با کد پرسنلی/ایمیل/نام کاربری |
| POST | `/register` | ثبت‌نام کاربر جدید |
| GET | `/login-guides` | راهنمای ورود با نمونه نقش‌ها |
| GET | `/me` |获取 اطلاعات کاربر جاری |
| GET | `/admin-only` | مسیر آزمایشی مدیریتی |

### کاربران (`/api/users`)
| متد | مسیر | توضیحات |
|-----|------|---------|
| GET | `/` | لیست کاربران |
| POST | `/` | ایجاد کاربر جدید |
| GET | `/:id` | جزئیات کاربر |
| PUT | `/:id` | بروزرسانی کاربر |
| DELETE | `/:id` | حذف کاربر |
| GET | `/employee/:code` | جستجو با کد پرسنلی |
| PATCH | `/:id/status` | تغییر وضعیت کاربر |

### طرح‌های عضویت (`/api/membership-plans`)
| متد | مسیر | توضیحات |
|-----|------|---------|
| GET | `/` | لیست طرح‌ها |
| POST | `/` | ایجاد طرح جدید |
| PATCH | `/:id/toggle` | فعال/غیرفعال کردن طرح |
| POST | `/:id/duplicate` | کپی طرح |

### کلاس‌ها (`/api/classes`)
| متد | مسیر | توضیحات |
|-----|------|---------|
| GET | `/` | لیست کلاس‌ها |
| POST | `/` | ایجاد کلاس جدید |
| POST | `/:id/book` | رزرو کلاس |
| POST | `/:id/attendance` | ثبت حضور در کلاس |
| GET | `/user/:userId/bookings` | کلاس‌های رزرو شده کاربر |

### تجهیزات (`/api/equipment`)
| متد | مسیر | توضیحات |
|-----|------|---------|
| GET | `/` | لیست تجهیزات |
| POST | `/` | ثبت تجهیزات جدید |
| POST | `/:id/maintenance` | ثبت تعمیرات |

### منوی کافه (`/api/menu`)
| متد | مسیر | توضیحات |
|-----|------|---------|
| GET | `/` | لیست محصولات |
| POST | `/` | افزودن محصول جدید |
| PUT | `/:id` | بروزرسانی محصول |
| DELETE | `/:id` | حذف محصول |

### برنامه‌ها (`/api/programs`)
| متد | مسیر | توضیحات |
|-----|------|---------|
| POST | `/training` | ایجاد برنامه تمرینی |
| POST | `/nutrition` | ایجاد برنامه غذایی |
| GET | `/user/:userId` | برنامه‌های یک کاربر |
| PATCH | `/:id/daily-log` | ثبت تمرین روزانه |

### تحلیل (`/api/analytics`)
| متد | مسیر | توضیحات |
|-----|------|---------|
| GET | `/overview` | نمای کلی آمار |
| GET | `/revenue-trend` | روند درآمد |
| GET | `/membership-growth` | رشد عضویت |
| GET | `/class-heatmap` | هیت مپ کلاس‌ها |
| GET | `/trainer-performance` | عملکرد مربیان |

> 💡 **19 فایل مسیر** با بیش از **70 endpoint** در پروژه وجود دارد.

---

## 🚀 راهنمای نصب و راه‌اندازی

### پیش‌نیازها
- **Node.js** نسخه 16 یا بالاتر
- **npm** یا **yarn**
- **MongoDB** (محلی یا MongoDB Atlas)
- حساب **Cloudinary** (برای آپلود تصاویر - اختیاری)

### 1️⃣ کلون کردن پروژه

```bash
git clone https://github.com/your-username/gym-management.git
cd gym-mangement-main
```

### 2️⃣ نصب وابستگی‌ها

```bash
# بک‌اند
cd backend
npm install

# فرانت‌اند
cd ../frontend
npm install
```

### 3️⃣ تنظیم متغیرهای محیطی

**بک‌اند** - فایل `backend/.env` ایجاد کنید:

```env
PORT=7000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/gym?retryWrites=true
JWT_SECRET=your_jwt_secret_key
CORS_ORIGIN=http://localhost:3000
```

**فرانت‌اند** - فایل `frontend/.env.local` ایجاد کنید:

```env
NEXT_PUBLIC_API_URL=http://localhost:7000/
```

### 4️⃣ اجرای پروژه

```bash
# ترمینال ۱ - بک‌اند
cd backend
npm run dev

# ترمینال ۲ - فرانت‌اند
cd frontend
npm run dev
```

اکنون برنامه در آدرس‌های زیر در دسترس است:
- **فرانت‌اند**: `http://localhost:3000`
- **بک‌اند API**: `http://localhost:7000`

---

## 🔐 متغیرهای محیطی

### بک‌اند (`backend/.env`)

| متغیر | توضیحات | پیش‌فرض |
|-------|---------|---------|
| `PORT` | پورت سرور | `7000` |
| `MONGO_URI` | اتصال MongoDB | ضروری |
| `JWT_SECRET` | کلید رمزنگاری JWT | ضروری |
| `CORS_ORIGIN` | دامنه‌های مجاز CORS | `http://localhost:3000` |
| `NODE_ENV` | محیط اجرا | `development` |
| `EMAIL_SERVICE` | سرویس ایمیل | - |
| `EMAIL_USER` | نام کاربری ایمیل | - |
| `EMAIL_PASS` | رمز ایمیل | - |
| `CLOUDINARY_NAME` | نام Cloudinary | - |
| `CLOUDINARY_API_KEY` | کلید API Cloudinary | - |
| `CLOUDINARY_API_SECRET` | راز API Cloudinary | - |
| `STRIPE_KEY` | کلید Stripe | - |
| `UPLOAD_ROOT` | مسیر آپلود | `/tmp/uploads` |

### فرانت‌اند (`frontend/.env.local`)

| متغیر | توضیحات | پیش‌فرض |
|-------|---------|---------|
| `NEXT_PUBLIC_API_URL` | آدرس API | `http://localhost:7000/` |

---

## 🌐 راهنمای استقرار (Deployment)

### استقرار در Vercel

پروژه برای استقرار در **Vercel** بهینه شده است. فایل `vercel.json` در بک‌اند موجود است.

#### بک‌اند:
1. پروژه را به GitHub متصل کنید
2. در Vercel، پروژه جدید ایجاد کنید
3. مسیر روت را `backend/` تنظیم کنید
4. متغیرهای محیطی را در Vercel Dashboard تنظیم کنید
5. Deploy کنید

#### فرانت‌اند:
1. در Vercel پروژه جدید با مسیر `frontend/` ایجاد کنید
2. متغیر `NEXT_PUBLIC_API_URL` را به URL بک‌اند مستقر شده تنظیم کنید
3. Deploy کنید

> **نکته**: مسیرهای آپلود در Vercel به `/tmp/` تنظیم شده‌اند. برای محیط تولید، استفاده از **Cloudinary** یا سرویس S3 توصیه می‌شود.

---

## 🔒 احراز هویت و امنیت

### نحوه احراز هویت
1. کاربر با کد پرسنلی/ایمیل و رمز عبور وارد می‌شود
2. سرور یک **JWT Token** صادر می‌کند
3. توکن در `localStorage` مرورگر ذخیره می‌شود
4. تمام درخواست‌های API با هدر `Authorization: Bearer <token>` ارسال می‌شوند
5. **middleware محافظت** (`protect()`) توکن را تأیید می‌کند
6. **middleware احراز نقش** (`authorize()`) دسترسی بر اساس نقش را بررسی می‌کند

### نقش‌های قابل قبول (با نام‌های معادل)
- `admin` / `manager`
- `trainer` / `coach`
- `member` / `user`
- `reception`
- `cafe` / `cafeManager`
- `finance`

### قابلیت‌های امنیتی
- هش کردن رمز عبور با bcryptjs
- توکن‌های احراز هویت با انقضا
- محافظت در برابر CSRF (CORS)
- اعتبارسنجی ورودی
- رمز عبور قابل بازیابی با توکن یکبارمصرف

---

## 🌓 سیستم تم (Dark/Light)

پروژه از سیستم تم دوگانه پشتیبانی می‌کند:

- **پیش‌فرض**: تم تاریک (Dark)
- **ذخیره‌سازی**: در `localStorage` با کلید `gym-theme`
- **تغییر تم**: از طریق کامپوننت `ThemeToggle` یا برنامه‌نویسی
- **پیاده‌سازی**: از طریق متغیرهای CSS (CSS Custom Properties)

### متغیرهای CSS اصلی

```css
/* Dark Theme */
.dark {
  --bg-body: #0f0f0f;
  --bg-card: #1a1a1a;
  --bg-sidebar: #111111;
  --text-body: #ffffff;
  --accent: #facc15;
}

/* Light Theme */
.light {
  --bg-body: #f5f5f5;
  --bg-card: #ffffff;
  --bg-sidebar: #ffffff;
  --text-body: #1a1a1a;
  --accent: #facc15;
}
```

---

## 🗺 نقشه راه آینده

- [ ] **نسخه موبایل (PWA)**: قابلیت نصب به عنوان اپلیکیشن موبایل
- [ ] **WebSocket**: جایگزینی سیستم پیام‌رسانی REST با WebSocket برای پیام‌های بلادرنگ
- [ ] **دستیار هوشمند**: پیشنهاد برنامه تمرینی هوشمند بر اساس اهداف کاربر
- [ ] **گزارش‌گیری PDF**: خروجی گرفتن از برنامه‌ها و گزارش‌ها به صورت PDF
- [ ] **سیستم مربی آنلاین**: امکان مربیگری آنلاین و نظارت از راه دور
- [ ] **مدیریت انبار**: سیستم مدیریت موجودی مکمل کافه
- [ ] **چند زبانه**: پشتیبانی از زبان‌های انگلیسی و عربی
- [ ] **فروشگاه آنلاین**: فروش محصولات باشگاه و مکمل‌ها

---

## 🤝 مشارکت در پروژه

از مشارکت شما استقبال می‌شود! لطفاً مراحل زیر را دنبال کنید:

1. Fork کنید
2. برنچ جدید ایجاد کنید (`git checkout -b feature/YourFeature`)
3. تغییرات را commit کنید (`git commit -m 'Add YourFeature'`)
4. Push کنید (`git push origin feature/YourFeature`)
5. Pull Request باز کنید

### نکات مشارکت
- کد تمیز و خوانا بنویسید
- خطاها را مدیریت کنید
- کامنت‌های فارسی بنویسید
- از اصول DRY پیروی کنید
- apiSlice موجود را گسترش دهید، از ایجاد api جدید خودداری کنید

---

<div align="center">

**ساخته شده با ❤️ برای جامعه ورزشی ایران**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

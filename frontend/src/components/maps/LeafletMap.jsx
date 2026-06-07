"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- اصلاح آیکون‌های Leaflet ---
const fixLeafletIcons = () => {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
};

// --- کامپوننت کمکی: کلیک روی نقشه ---
function MapClickHelper({ setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return null;
}

// --- کامپوننت کمکی جدید: پرش نقشه به مختصات جدید ---
// وقتی مختصات دستی عوض میشه، این کامپوننت نقشه رو میبره اونجا
function MapRecenter({ position }) {
  const map = useMap();
  useEffect(() => {
    // flyTo یک انیمیشن نرم برای رفتن به نقطه جدید انجام میدهد
    map.flyTo([position.lat, position.lng], map.getZoom());
  }, [position.lat, position.lng, map]);
  return null;
}

export default function Map({
  isOpen,
  onClose,
  onConfirm,
  initialLat,
  initialLng,
  mapProvider = "OpenStreetMap",
}) {
  const defaultLat = 35.6892; // تهران
  const defaultLng = 51.389;

  const [position, setPosition] = useState({
    lat: defaultLat,
    lng: defaultLng,
  });

  // تنظیم اولیه و فیکس آیکون
  useEffect(() => {
    fixLeafletIcons();
    if (isOpen) {
      setPosition({
        lat: parseFloat(initialLat) || defaultLat,
        lng: parseFloat(initialLng) || defaultLng,
      });
    }
  }, [isOpen, initialLat, initialLng]);

  const markerRef = useRef(null);

  // هندلر درگ کردن مارکر
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          setPosition(marker.getLatLng());
        }
      },
    }),
    []
  );

  // هندلرهای تغییر دستی اینپوت‌ها
  const handleLatChange = (e) => {
    // تبدیل مقدار ورودی به عدد اعشاری
    const val = parseFloat(e.target.value);
    // اگر عدد معتبر بود، استیت را آپدیت کن
    if (!isNaN(val)) {
      setPosition((prev) => ({ ...prev, lat: val }));
    }
  };

  const handleLngChange = (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      setPosition((prev) => ({ ...prev, lng: val }));
    }
  };

  const tileProviders = {
    OpenStreetMap: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: "&copy; OpenStreetMap",
    },
    "Google Map": {
      url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
      attribution: "© Google",
    },
    Sanad: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: "Sanad",
    },
  };

  const provider = tileProviders[mapProvider] || tileProviders["OpenStreetMap"];

  const handleConfirm = () => {
    onConfirm(position);
    onClose();
  };

  if (!isOpen) return null;

  // استایل مشترک برای اینپوت‌ها
  const inputClasses =
    "w-full p-3 rounded-xl border-2 border-slate-200 bg-white text-lg font-mono font-bold text-slate-700 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 transition-all outline-none text-left dir-ltr shadow-sm hover:border-cyan-200";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm transition-all duration-300">
      {/* باکس اصلی مودال */}
      <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300 border-4 border-white/50 ring-1 ring-slate-200/50">
        {/* --- هدر رنگی --- */}
        <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 relative overflow-hidden">
          {/* یک افکت نوری پس زمینه */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500"></div>

          <div className="flex items-center gap-4 z-10">
            <div className="bg-gradient-to-br from-cyan-400 to-blue-600 p-3 rounded-2xl shadow-lg shadow-cyan-200/50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-blue-800">
                انتخاب موقعیت دقیق
              </h2>
              <p className="text-sm text-slate-500 font-medium">
                منبع نقشه: <span className="text-blue-600">{mapProvider}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors z-10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* --- نقشه --- */}
        <div className="relative w-full h-[450px] bg-slate-100 group border-y-2 border-cyan-400/30">
          <MapContainer
            center={[position.lat, position.lng]}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
            className="z-10"
          >
            <TileLayer url={provider.url} attribution={provider.attribution} />

            {/* اضافه کردن کامپوننت‌های کمکی */}
            <MapClickHelper setPosition={setPosition} />
            <MapRecenter position={position} />

            <Marker
              draggable={true}
              eventHandlers={eventHandlers}
              position={position}
              ref={markerRef}
            >
              <Popup className="font-bold">📍 موقعیت انتخابی</Popup>
            </Marker>
          </MapContainer>

          {/* راهنمای شناور */}
          <div className="absolute top-4 right-4 z-[400] bg-white/95 backdrop-blur px-4 py-2 rounded-xl shadow-md text-sm font-medium text-slate-700 border border-cyan-100 pointer-events-none flex items-center gap-2">
            <span className="text-xl">👇</span> برای تغییر، کلیک کنید یا پین را
            بکشید
          </div>
        </div>

        {/* --- پنل ویرایش مختصات (X, Y) --- */}
        <div className="bg-gradient-to-b from-slate-50 to-white p-6 relative">
          {/* یک جداکننده تزئینی */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-cyan-200 rounded-full"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* ورودی طول جغرافیایی (X) */}
            <div className="relative group">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">
                <span className="bg-cyan-100 text-cyan-700 p-1 rounded">X</span>
                Longitude (طول)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any" // اجازه ورود اعداد اعشاری با هر دقتی
                  value={position.lng}
                  onChange={handleLngChange}
                  className={inputClasses}
                />
                {/* آیکون تزئینی داخل اینپوت */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-300 group-focus-within:text-cyan-500 transition-colors pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* ورودی عرض جغرافیایی (Y) */}
            <div className="relative group">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">
                <span className="bg-blue-100 text-blue-700 p-1 rounded">Y</span>
                Latitude (عرض)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={position.lat}
                  onChange={handleLatChange}
                  className={inputClasses}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* دکمه‌ها */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-xl border-2 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition font-bold text-sm"
            >
              انصراف
            </button>
            {/* دکمه گرادینت دار */}
            <button
              onClick={handleConfirm}
              className="px-10 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600 shadow-xl shadow-cyan-200/40 transition font-bold text-sm flex items-center gap-3 transform active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              تایید نهایی موقعیت
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

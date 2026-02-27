"use client";

import { useState } from "react";

const tabs = [
  { id: "description", label: "توضیح محصول" },
  { id: "specs", label: "مشخصات و ویژگی ها" },
  { id: "reviews", label: "نقد و بررسی کاربران" },
  { id: "questions", label: "پرسش و پاسخ" },
];

export default function ProductTabs() {
  const [activeTab, setActiveTab] = useState("description");

  return (
    <div className="mt-16 bg-white rounded-3xl shadow-2xl overflow-hidden">

      {/* سر تیتر تب‌ها */}
      <div className="border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px text-lg font-bold text-center">
          {tabs.map((tab) => (
            <li key={tab.id} className="mr-2">
              <button
                onClick={() => setActiveTab(tab.id)}
                className={`inline-block py-6 px-8 border-b-4 transition-all duration-300 ${activeTab === tab.id
                    ? "text-primary border-primary"
                    : "text-gray-500 border-transparent hover:text-primary hover:border-primary/60"
                  }`}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* محتوای تب */}
      <div className="p-8 lg:p-12">

        {/* توضیح محصول — استاتیک */}
        {activeTab === "description" && (
          <div className="prose max-w-none text-gray-700 leading-8 text-lg">
            <p>
              این محصول یک انتخاب حرفه‌ای برای مصرف روزانه است. کیفیت ساخت بالا،
              مواد اولیه درجه یک و عملکرد تضمین‌شده از ویژگی‌های اصلی آن است.
            </p>
            <p>
              مناسب برای استفاده بلندمدت و کاملاً تست شده در شرایط واقعی.
              اگر دنبال کیفیت و دوام هستید، این گزینه مناسب شماست.
            </p>
          </div>
        )}

        {/* مشخصات — استاتیک */}
        {activeTab === "specs" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex flex-col bg-gray-50 p-4 rounded-lg shadow-sm">
              <span className="text-gray-500 text-sm">وزن</span>
              <span className="font-semibold text-gray-800">1.2 کیلوگرم</span>
            </div>
            <div className="flex flex-col bg-gray-50 p-4 rounded-lg shadow-sm">
              <span className="text-gray-500 text-sm">جنس</span>
              <span className="font-semibold text-gray-800">کامپوزیت تقویت شده</span>
            </div>
            <div className="flex flex-col bg-gray-50 p-4 rounded-lg shadow-sm">
              <span className="text-gray-500 text-sm">کشور سازنده</span>
              <span className="font-semibold text-gray-800">آلمان</span>
            </div>
            <div className="flex flex-col bg-gray-50 p-4 rounded-lg shadow-sm">
              <span className="text-gray-500 text-sm">گارانتی</span>
              <span className="font-semibold text-gray-800">18 ماه</span>
            </div>
            <div className="flex flex-col bg-gray-50 p-4 rounded-lg shadow-sm">
              <span className="text-gray-500 text-sm">گارانتی</span>
              <span className="font-semibold text-gray-800">18 ماه</span>
            </div>
            <div className="flex flex-col bg-gray-50 p-4 rounded-lg shadow-sm">
              <span className="text-gray-500 text-sm">گارانتی</span>
              <span className="font-semibold text-gray-800">18 ماه</span>
            </div>
            <div className="flex flex-col bg-gray-50 p-4 rounded-lg shadow-sm">
              <span className="text-gray-500 text-sm">گارانتی</span>
              <span className="font-semibold text-gray-800">18 ماه</span>
            </div>
            <div className="flex flex-col bg-gray-50 p-4 rounded-lg shadow-sm">
              <span className="text-gray-500 text-sm">گارانتی</span>
              <span className="font-semibold text-gray-800">18 ماه</span>
            </div>
            <div className="flex flex-col bg-gray-50 p-4 rounded-lg shadow-sm">
              <span className="text-gray-500 text-sm">گارانتی</span>
              <span className="font-semibold text-gray-800">18 ماه</span>
            </div>
            <div className="flex flex-col bg-gray-50 p-4 rounded-lg shadow-sm">
              <span className="text-gray-500 text-sm">گارانتی</span>
              <span className="font-semibold text-gray-800">18 ماه</span>
            </div>
            <div className="flex flex-col bg-gray-50 p-4 rounded-lg shadow-sm">
              <span className="text-gray-500 text-sm">گارانتی</span>
              <span className="font-semibold text-gray-800">18 ماه</span>
            </div>
            <div className="flex flex-col bg-gray-50 p-4 rounded-lg shadow-sm">
              <span className="text-gray-500 text-sm">گارانتی</span>
              <span className="font-semibold text-gray-800">18 ماه</span>
            </div>
            <div className="flex flex-col bg-gray-50 p-4 rounded-lg shadow-sm">
              <span className="text-gray-500 text-sm">گارانتی</span>
              <span className="font-semibold text-gray-800">18 ماه</span>
            </div>
            <div className="flex flex-col bg-gray-50 p-4 rounded-lg shadow-sm">
              <span className="text-gray-500 text-sm">گارانتی</span>
              <span className="font-semibold text-gray-800">18 ماه</span>
            </div>
            <div className="flex flex-col bg-gray-50 p-4 rounded-lg shadow-sm">
              <span className="text-gray-500 text-sm">گارانتی</span>
              <span className="font-semibold text-gray-800">18 ماه</span>
            </div>
            <div className="flex flex-col bg-gray-50 p-4 rounded-lg shadow-sm">
              <span className="text-gray-500 text-sm">گارانتی</span>
              <span className="font-semibold text-gray-800">18 ماه</span>
            </div>
          </div>
        )}


        {/* نقد و بررسی — استاتیک */}
        {activeTab === "reviews" && (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500">
              هنوز نظری ثبت نشده است
            </p>
            <button className="mt-6 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition">
              اولین نفر باشید که نظر می‌دهید
            </button>
          </div>
        )}

        {/* پرسش — استاتیک */}
        {activeTab === "questions" && (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500">
              هنوز سوالی پرسیده نشده است
            </p>
            <button className="mt-6 bg-green-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-green-700 transition">
              پرسش خود را مطرح کنید
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

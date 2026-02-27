"use client";

import Image from "next/image";
import { LiaOpencart } from "react-icons/lia";

import { CiShoppingCart, CiHeart, CiStar } from "react-icons/ci";
import ProductGallery from "./ProductSlider";

export default function ProductHeader() {

  const images = [
    "/images/p1.jpg",
    "/images/p2.jpg",
    "/images/p3.jpg",
  ];

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mt-8">
      <div className="flex flex-col lg:flex-row gap-10 p-5 lg:p-10">

        {/* محتوا – سمت چپ */}
        <div className="w-full order-2 lg:order-2 flex flex-col gap-7">

          {/* عنوان + قلب */}
          <div className="flex flex-col lg:flex-row gap-6 justify-between">

            {/* ===== سمت راست — عنوان + بج‌ها + امتیاز ===== */}
            <div className="flex-1 flex flex-col gap-4">

              {/* عنوان */}
              <h1 className="text-2xl font-bold text-black/85 leading-snug">
                استون پروتئین حیوانی
              </h1>

              {/* بج‌ها */}
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-2 rounded-full text-xs font-bold text-white bg-blue-600">
                  جدید
                </span>
                <span className="px-4 py-2 rounded-full text-xs font-bold text-white bg-orange-600">
                  پرفروش
                </span>
                <span className="px-4 py-2 rounded-full text-xs font-bold text-white bg-purple-600">
                  پیشنهاد ویژه
                </span>
              </div>

              {/* امتیاز */}
              <div className="flex items-center gap-3">
                <div className="flex">
                  {[0, 1, 2, 3, 4].map(i => (
                    <CiStar key={i} size={22} className="text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <span className="text-gray-500 text-sm">
                  (128 نظر)
                </span>
              </div>

            </div>

            {/* ===== سمت چپ — یادداشت فروشنده ===== */}
            <div className="lg:w-[250px] shrink-0">

              <div className="
      border border-orange-300
      bg-orange-50
      text-orange-800
      rounded-2xl
      px-4 py-3
      text-sm
      leading-6
      shadow-sm
    ">
                <span className="font-bold">یادداشت فروشنده:</span>
                <p className="mt-1 text-justify">
                  ارسال فقط برای خریداران دارای مجوز آزمایشگاهی انجام می‌شود.ارسال فقط برای خریداران دارای مجوز آزمایشگاهی انجام می‌شود.ارسال فقط برای خریداران دارای مجوز آزمایشگاهی انجام می‌شود.ارسال فقط برای خریداران دارای مجوز آزمایشگاهی انجام می‌شود.
                </p>
              </div>

            </div>

          </div>


          {/* واریانت — استاتیک */}
          <div>
            <h3 className="font-bold text-lg mb-3">انتخاب گزینه</h3>
            <div className="flex flex-wrap gap-2">
              <button className="px-5 py-2 rounded-xl border-2 border-indigo-600 bg-indigo-50 text-indigo-700 text-sm font-medium">
                بسته کوچک
              </button>
              <button className="px-5 py-2 rounded-xl border-2 border-gray-300 text-sm font-medium">
                بسته متوسط
              </button>
              <button className="px-5 py-2 rounded-xl border-2 border-gray-300 text-sm font-medium">
                بسته بزرگ
              </button>
            </div>
          </div>

          {/* قیمت — استاتیک */}
          {/* 6 باکس ویژگی کلیدی */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

              <div className="rounded-xl border border-gray-200 p-4 text-center bg-gray-50">
                <div className="text-xs text-gray-500 mb-1">تاریخ انقضا</div>
                <div className="font-bold text-gray-800">2029-12-1</div>
              </div>

              <div className="rounded-xl border border-gray-200 p-4 text-center bg-gray-50">
                <div className="text-xs text-gray-500 mb-1">تاریخ تولید</div>
                <div className="font-bold text-gray-800">2026-12-1</div>
              </div>

              <div className="rounded-xl border border-gray-200 p-4 text-center bg-gray-50">
                <div className="text-xs text-gray-500 mb-1">دسته‌بندی</div>
                <div className="font-bold text-gray-800">مواد اولیه</div>
              </div>

              <div className="rounded-xl border border-gray-200 p-4 text-center bg-gray-50">
                <div className="text-xs text-gray-500 mb-1">کشور سازنده</div>
                <div className="font-bold text-gray-800">آلمان</div>
              </div>

              <div className="rounded-xl border border-gray-200 p-4 text-center bg-gray-50">
                <div className="text-xs text-gray-500 mb-1">برند</div>
                <div className="font-bold text-gray-800">آلمان</div>
              </div>

              <div className="rounded-xl border border-gray-200 p-4 text-center bg-gray-50">
                <div className="text-xs text-gray-500 mb-1">کد محصول</div>
                <div className="font-bold text-gray-800">ch-112</div>
              </div>

            </div>
          </div>



          {/* موجودی — استاتیک */}


          {/* تعداد — استاتیک */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              className={`relative mt-3 overflow-hidden inline-block px-6 py-2.5 bg-linear-to-br from-primary to-blue-600 text-white
                        rounded-3xl text-base transition font-semibold  before:absolute before:inset-0 before:-translate-x-full before:bg-linear-to-r before:from-transparent before:via-white/40                      before:to-transparent before:skew-x-[-25deg] before:transition-transform                before:duration-700 hover:before:translate-x-full`}
            >
              درخواست خرید<LiaOpencart className="inline-block ml-1" />
            </button>
          </div>

          {/* توضیح کوتاه — استاتیک */}
          <div className="pt-5 border-t">
            <h3 className="font-bold text-lg mb-2">توضیح کوتاه</h3>
            <p className="text-gray-600 leading-7 text-sm lg:text-base">
              یک مکمل کامل و باکیفیت برای افزایش انرژی و سلامت حیوانات خانگی.
              مناسب برای مصرف روزانه و دارای تاییدیه آزمایشگاهی.
            </p>
          </div>

        </div>

        {/* گالری – سمت راست — استاتیک */}
        <div className="w-full order-1 lg:order-1 flex justify-center">
          <div className="w-full max-w-[520px]">
            <ProductGallery
              images={images}
              title="استون پروتئین حیوانی"
            />
          </div>
        </div>

      </div>
    </div>
  );
}

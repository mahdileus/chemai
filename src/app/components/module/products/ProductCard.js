"use client";
import Image from "next/image";
import Link from "next/link";

export default function ProductCard({ product }) {
  const discount = 0;

  return (
    <div className="w-full bg-white border border-gray-200 rounded-3xl overflow-hidden hover:shadow-xl transition">

      <div className="flex flex-col md:flex-row h-full">

        {/* ===== تصویر — سمت راست ===== */}
        <div className="relative md:w-1/3 h-56 md:h-auto bg-white border-b md:border-b-0 md:border-l border-gray-100">
          {/* ===== ریبون مورب ===== */}
          <div className="absolute rotate-45 top-3 -right-8  z-10">
            <span className="
    bg-primary
    text-white
    text-xs
    font-bold
    px-10 py-1
    shadow-lg
    tracking-wide
  ">
              بشکه 
            </span>
          </div>

          <Link href="/product">
            <Image
              src="/images/p-1.jpg"
              alt="test"
              fill
              className="object-contain p-6"
            />
          </Link>

          {discount > 0 && (
            <span className="absolute top-4 right-0 bg-secondery text-white text-xs rounded-l-full px-3 py-1 shadow">
              {discount}٪
            </span>
          )}
        </div>

        {/* ===== محتوا — سمت چپ ===== */}
        <div className="md:w-2/3 p-6 flex flex-col justify-between">

          {/* عنوان */}
          <Link href="/product">
            <h3 className="text-xl font-bold text-gray-800 hover:text-primary transition mb-4 line-clamp-1">
              استون (Acetone)
            </h3>
          </Link>

          {/* مشخصات — گرید باکس باکس */}
          <div className="grid grid-cols-2 gap-3 text-sm">

            {[
              ["دسته بندی", "مواد اولیه"],
              ["گرید", "آرایشی"],
              ["فرم", "مایع"],
              ["تولید", "2026-1-12"],
              ["انقضا", "2029-1-12"],
              ["تولید کننده", "چرم سانا"],
            ].map(([k, v], i) => (
              <div
                key={i}
                className="flex justify-between items-center border border-gray-200 rounded-xl px-3 py-2 bg-gray-50"
              >
                <span className="text-blue-900 font-medium">{k}</span>
                <span className="text-orange-500 font-semibold">{v}</span>
              </div>
            ))}
          </div>

          {/* دکمه‌ها */}
          <div className="flex gap-3 mt-6">

            <Link
              href="#"
              className="flex-1 text-center py-2 rounded-2xl text-sm font-medium 
                  relative overflow-hidden
    inline-block
    bg-linear-to-br from-primary to-blue-600
    text-white px-6 
    transition
    before:absolute before:inset-0
    before:-translate-x-full
    before:bg-linear-to-r
    before:from-transparent
    before:via-white/40
    before:to-transparent
    before:skew-x-[-25deg]
    before:transition-transform before:duration-700
    hover:before:translate-x-full"
            >
              فرم آنالیز
            </Link>

            <Link
              href="/product"
              className="flex-1 text-center py-2 rounded-2xl text-sm font-medium 
               hover:opacity-90
                  relative overflow-hidden
    inline-block
    bg-linear-to-bl from-secondery to-orange-600
    text-white px-6 
    transition
    before:absolute before:inset-0
    before:-translate-x-full
    before:bg-linear-to-r
    before:from-transparent
    before:via-white/40
    before:to-transparent
    before:skew-x-[-25deg]
    before:transition-transform before:duration-700
    hover:before:translate-x-full"
            >
              مشاهده
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
}
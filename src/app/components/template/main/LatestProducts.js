"use client";

import { useEffect, useRef, useState } from "react";
import ProductCard from "../../module/products/ProductCard";
import Link from "next/link";
import { HiOutlineArrowLongLeft } from "react-icons/hi2";
import { CiBeaker1 } from "react-icons/ci";
import AdvancedSearch from "../shop/AdvancedSearch";
export default function LatestProduct() {

  // 🔹 فعلا استاتیک — بعداً API می‌خونی
  const allProducts = Array.from({ length: 30 }, (_, i) => ({ id: i + 1 }));

  const [visibleCount, setVisibleCount] = useState(6);
  const loaderRef = useRef(null);

  // 🔹 اینفینیتی اسکرول
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 6, allProducts.length));
        }
      },
      { threshold: 1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, []);

  const visibleProducts = allProducts.slice(0, visibleCount);

  return (
    <div className="container mt-20">

      {/* ===== هدر سکشن ===== */}
      {/* ===== هدر سکشن ===== */}
      <div className="mb-10 space-y-6">

        {/* ردیف عنوان */}
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 text-blue-600 p-2.5 shadow-xl"
            style={{ clipPath: "polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)" }}>
            <CiBeaker1 size={32} />
          </div>

          <h2 className="text-black/85 text-xl md:text-2xl font-bold">
            آخرین محصولات
          </h2>
        </div>

        {/* ردیف کنترل‌ها */}
        <div className="flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">

          {/* ===== سرچ باکس — استاتیک ===== */}
          <div className="relative w-full xl:max-w-md">
            <input
              type="text"
              placeholder="جستجوی محصول..."
              className="w-full pr-4 pl-4 py-3 rounded-2xl border border-gray-200 
                   focus:border-primary focus:ring-2 focus:ring-primary/20 
                   outline-none transition"
            />
          </div>

          {/* ===== فیلتر + سورت + مشاهده همه ===== */}
          <div className="flex flex-wrap gap-3">

            {/* مرتب‌سازی */}
            <AdvancedSearch/>
          </div>
        </div>
      </div>


      {/* ===== لیست محصولات ===== */}
      <div className="grid gap-6 md:grid-cols-2">
        {visibleProducts.map((p) => (
          <ProductCard key={p.id} />
        ))}
      </div>

      {/* ===== لودر اینفینیتی ===== */}
      {visibleCount < allProducts.length && (
        <div ref={loaderRef} className="text-center py-10 text-gray-400">
          در حال بارگذاری محصولات بیشتر...
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";

export default function ProductGallery() {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const mainSwiperRef = useRef(null);

  // ✅ تصاویر کاملاً استاتیک
  const gallery = [
    "/images/p-1.jpg",
    "/images/p-5.jpg",
    "/images/p-3.jpg",
    "/images/p-4.jpg",
    "/images/p-2.jpg",
  ];

  const title = "محصول نمونه";

  return (
    <div className="w-full product-gallery flex flex-col gap-6">
      
      {/* تصویر اصلی */}
      <div className="w-full h-[280px] sm:h-[360px] md:h-[420px] lg:h-[520px] rounded-3xl bg-white border border-gray-200 overflow-hidden">
        <Swiper
          modules={[Navigation, Thumbs]}
          navigation
          onSwiper={(swiper) => (mainSwiperRef.current = swiper)}
          thumbs={{
            swiper:
              thumbsSwiper && !thumbsSwiper.destroyed
                ? thumbsSwiper
                : null,
          }}
          className="w-full h-full"
        >
          {gallery.map((src, i) => (
            <SwiperSlide key={i}>
              <div className="w-full h-full flex items-center justify-center bg-white relative">
                <Image
                  src={src}
                  alt={`${title} - ${i}`}
                  fill
                  className="object-contain p-4"
                  priority={i === 0}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Thumbnails */}
      <div className="w-full">
        <Swiper
          onSwiper={setThumbsSwiper}
          spaceBetween={12}
          slidesPerView={4}
          watchSlidesProgress
          modules={[Thumbs]}
          breakpoints={{
            0: { slidesPerView: 3 },
            640: { slidesPerView: 4 },
            1024: { slidesPerView: 5 },
          }}
        >
          {gallery.map((src, i) => (
            <SwiperSlide key={i}>
              <div className="w-full aspect-square rounded-xl border overflow-hidden bg-white hover:border-primary transition relative">
                <Image
                  src={src}
                  alt={`${title} thumb ${i}`}
                  fill
                  className="object-cover border border-gray-200 rounded-xl"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .product-gallery .swiper-button-next,
        .product-gallery .swiper-button-prev {
          color: #4f46e5 !important;
        }

        .product-gallery .swiper-button-next:hover,
        .product-gallery .swiper-button-prev:hover {
          color: #4338ca !important;
        }

        .product-gallery .swiper-slide-thumb-active div {
          border-color: #4f46e5 !important;
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.15);
        }
      `}</style>
    </div>
  );
}

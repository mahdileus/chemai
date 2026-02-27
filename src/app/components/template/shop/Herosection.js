"use client"
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

// Modules
import { Pagination } from "swiper/modules";

export default function Herosection() {
  return (
<div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">

  {/* SLIDER */}
  <div className="md:col-span-2 w-full h-[450px]">  {/* ارتفاع ثابت */}
    <Swiper
      pagination={{ dynamicBullets: true }}
      modules={[Pagination]}
      className="w-full h-full rounded-xl overflow-hidden"
    >
      <SwiperSlide>
        <img src="/images/000.jpg" className="w-full h-full object-cover" />
      </SwiperSlide>
      <SwiperSlide>
        <img src="/images/000.jpg" className="w-full h-full object-cover" />
      </SwiperSlide>
      <SwiperSlide>
        <img src="/images/000.jpg" className="w-full h-full object-cover" />
      </SwiperSlide>
    </Swiper>
  </div>

  {/* TWO SIDE BOXES */}
  <div className="hidden md:flex flex-col gap-4 h-[450px]"> {/* ارتفاع برابر با اسلایدر */}
    
    <div className="w-full h-[50%] rounded-xl overflow-hidden">
          <Swiper
      pagination={{ dynamicBullets: true }}
      modules={[Pagination]}
      className="w-full h-full rounded-xl overflow-hidden"
    >
      <SwiperSlide>
        <img src="/images/000.jpg" className="w-full h-full object-cover" />
      </SwiperSlide>
      <SwiperSlide>
        <img src="/images/000.jpg" className="w-full h-full object-cover" />
      </SwiperSlide>
      <SwiperSlide>
        <img src="/images/000.jpg" className="w-full h-full object-cover" />
      </SwiperSlide>
    </Swiper>
    </div>

    <div className="w-full h-[50%] rounded-xl overflow-hidden">
          <Swiper
      pagination={{ dynamicBullets: true }}
      modules={[Pagination]}
      className="w-full h-full rounded-xl overflow-hidden"
    >
      <SwiperSlide>
        <img src="/images/000.jpg" className="w-full h-full object-cover" />
      </SwiperSlide>
      <SwiperSlide>
        <img src="/images/000.jpg" className="w-full h-full object-cover" />
      </SwiperSlide>
      <SwiperSlide>
        <img src="/images/000.jpg" className="w-full h-full object-cover" />
      </SwiperSlide>
    </Swiper>
    </div>

  </div>

</div>

  );
}

"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { FaQuoteRight } from "react-icons/fa";
import "swiper/css";
import "swiper/css/autoplay";

const testimonials = [
  {
    name: "سارا محمدی",
    text: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است ",
  },
  {
    name: "مهدی فراهانی",
    text: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است ",
  },
  {
    name: "الهام رضایی",
    text: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است ",
  },
  {
    name: "آرمان کریمی",
    text: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است ",
  },
  {
    name: "زهرا رضوانی",
    text: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است ",
  },
  {
    name: "حمید نظری",
    text: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است ",
  },
  {
    name: "پریسا احمدی",
    text: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است ",
  },
  {
    name: "کامران موسوی",
    text: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است ",
  },
  {
    name: "فرزانه کرمی",
    text: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است ",
  },
  {
    name: "رضا توکلی",
    text: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است ",
  }
];


export default function CommentBox() {
  return (
    <section className="w-full py-20 overflow-hidden bg-linear-to-br from-primary to-blue-600 my-20">
      <h2 className="text-4xl font-bold text-white text-center">
        نظرات کاربران درباره  <strong>کمای </strong>
      </h2>
      <p className="text-center text-gray-100 mb-8 mt-3 ">لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است </p>
      <Swiper
        modules={[Autoplay]}
        slidesPerView={1.2}
        spaceBetween={24}
        loop={true}
        speed={2500}
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        }}
        breakpoints={{
          640: { slidesPerView: 2.2 },
          768: { slidesPerView: 3.2 },
          1024: { slidesPerView: 4.2 },
          1280: { slidesPerView: 5.2 },
        }}
        className="overflow-visible! px-4"
      >
        {testimonials.map((item, index) => (
          <SwiperSlide key={index} className="flex h-full">
            <div className="bg-white backdrop:blur-3xl  border border-primary shadow-md rounded-xl p-4 flex flex-col justify-between w-full min-h-[200px] max-h-[200px] h-full">
              <FaQuoteRight className="text-primary text-lg mb-2" />
              <p className="text-sm text-gray-800 leading-relaxed line-clamp-3">
                {item.text}
              </p>
              <span className="text-xs font-bold text-primary mt-4">
                {item.name}
              </span>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

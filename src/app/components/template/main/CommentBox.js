"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { FaQuoteRight } from "react-icons/fa";
import "swiper/css";
import "swiper/css/autoplay";

const testimonials = [
  {
    name: "سارا محمدی",
    text: "قبل از کمای برای هر استعلام باید ده تا تماس می‌گرفتم؛ الان قیمت‌ها و شرایط خرید رو یکجا می‌بینم و سریع تصمیم می‌گیرم.",
  },
  {
    name: "مهدی فراهانی",
    text: "شفافیت تأمین‌کننده‌ها عالیه؛ هم کیفیت مشخصه هم سابقه. خرید برای ما که تولیدی هستیم خیلی کم‌ریسک‌تر شده.",
  },
  {
    name: "الهام رضایی",
    text: "مقایسه قیمت و شرایط بین چند فروشنده تو یک صفحه، دقیقاً همون چیزیه که همیشه بازار کم داشت.",
  },
  {
    name: "آرمان کریمی",
    text: "لجستیک کمای واقعاً نجات‌دهنده‌ست؛ هماهنگی حمل و پیگیری‌ها خیلی کمتر شده و تحویل‌ها منظم‌تره.",
  },
  {
    name: "زهرا رضوانی",
    text: "از استعلام تا سفارش و تحویل، همه‌چیز متمرکز و مرتب پیش میره. حس می‌کنی یک تیم کنارته نه یک سایت ساده.",
  },
  {
    name: "حمید نظری",
    text: "برای فروشنده‌ها هم عالیه؛ درخواست‌ها هدفمندتره و مشتری دقیقاً می‌دونه چی می‌خواد. زمان مذاکره نصف شد.",
  },
  {
    name: "پریسا احمدی",
    text: "پلتفرم محتوایی و توضیحات محصول کمک می‌کنه بهتر انتخاب کنم، مخصوصاً وقتی چند گرید و فرم مختلف وجود داره.",
  },
  {
    name: "کامران موسوی",
    text: "به‌جای پیام‌های پراکنده و تماس‌های بی‌پایان، همه تعامل‌ها تو یک روند شفاف جمع شده. این یعنی حرفه‌ای بودن.",
  },
  {
    name: "فرزانه کرمی",
    text: "کمای باعث شد خرید مواد اولیه برای مجموعه ما قابل پیش‌بینی‌تر بشه؛ هم هزینه‌ها کنترل شد هم زمان تامین.",
  },
  {
    name: "رضا توکلی",
    text: "تجربه خرید امن و سریع بود؛ هم قیمت رقابتی گرفتم هم کیفیت مطابق چیزی بود که ثبت شده بود.",
  },
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

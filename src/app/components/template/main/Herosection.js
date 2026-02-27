"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import AboutHeader from "./AboutUs";
import SearchBox from "./SearchBox";
import Link from "next/link";

export default function HeroToNext() {
  const wrapRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });

  const y = useTransform(scrollYProgress, [0.15, 1], [0, 680]);

  // فقط کمی کوچک شود
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.75]);

  // فقط کمی به چپ
  const x = useTransform(scrollYProgress, [0, 1], [0, -350]);



  return (
    <div ref={wrapRef} className="relative">

      <section className="min-h-screen relative -mt-30">

        {/* split background */}
<div className="absolute inset-0">
  <svg
    className="w-full h-full"
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
  >
    <defs>
      {/* حالا سمت چپ نارنجی */}
      <linearGradient id="orangeGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="var(--color-secondery)" />
        <stop offset="100%" stopColor="#ea580c" />
      </linearGradient>

      {/* حالا سمت راست آبی */}
      <linearGradient id="blueGrad" x1="1" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--color-primary)" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
    </defs>

    {/* سمت چپ (نارنجی) با مرز S شکل */}
    <path
      d="
        M0 0
        H50
        C60 14, 40 30, 50 50
        C60 70, 40 86, 50 100
        H0
        Z
      "
      fill="url(#orangeGrad)"
    />

    {/* سمت راست (آبی) */}
    <path
      d="
        M100 0
        H50
        C60 14, 40 30, 50 50
        C60 70, 40 86, 50 100
        H100
        Z
      "
      fill="url(#blueGrad)"
    />
  </svg>
</div>
        {/* محتوا */}
        <div className="relative py-16 container mx-auto px-4 min-h-screen flex flex-col items-center justify-center text-center">

          <h1 className="text-white text-4xl md:text-4xl font-medium mt-32 mb-4 ">

            کِمای(CHEMAI)، بازارگاه تخصصی مواد شیمیایی
          </h1>
          <p className="text-white mb-4"> اتصال مستقیم تامین کنندگان و خریداران مواد اولیه. بدون واسطه، با قیمت شفاف و فرایند مطمئن. </p>

          <div className="w-full max-w-xl mb-12">
            <SearchBox />
          </div>

          {/* تصویر */}
          <motion.div
            style={{ y, scale, x }}
            className="w-full flex justify-center sticky top-40 z-20"
          >
            <img
              src="/images/Market-1.png"
              className="w-full hidden md:block max-w-3xl h-auto select-none pointer-events-none"
            />
          </motion.div>

        </div>

      </section>

      {/* ================= SECTION TWO ================= */}
      <section className="min-h-screen relative ">
        <div className="container mx-auto px-4 min-h-screen grid grid-cols-1 md:grid-cols-2 items-center gap-10">

          {/* متن سکشن دوم */}
          <div className="font-yekan-bakh relative overflow-hidden order-1">
            <AboutHeader />
            <div className="flex items-center justify-center md:justify-start gap-4 -mt-8">
              <Link
                href="/shop"
                className="
    relative overflow-hidden
    inline-block
    bg-linear-to-br from-primary to-blue-600
    text-white px-6 py-2.5 rounded-3xl text-base
    transition
    before:absolute before:inset-0
    before:-translate-x-full
    before:bg-linear-to-r
    before:from-transparent
    before:via-white/40
    before:to-transparent
    before:skew-x-[-25deg]
    before:transition-transform before:duration-700
    hover:before:translate-x-full
  "
              >
                مشاهده بازار
              </Link>

              <Link
                href="/login-register"
                className="
    relative overflow-hidden
    inline-block
    bg-linear-to-bl from-secondery to-orange-600
    text-white px-6 py-2.5 rounded-3xl text-base
    transition
    before:absolute before:inset-0
    before:-translate-x-full
    before:bg-linear-to-r
    before:from-transparent
    before:via-white/40
    before:to-transparent
    before:skew-x-[-25deg]
    before:transition-transform before:duration-700
    hover:before:translate-x-full
  "
              >
                ورود به کِمای
              </Link>

            </div>
          </div>

          {/* ستون راست — محل لندینگ عکس */}
          <div className="order-2 flex justify-center md:justify-end">
            {/* خالی می‌ماند — عکس sticky از بالا وارد می‌شود */}
          </div>

        </div>
      </section>

    </div>
  );
}

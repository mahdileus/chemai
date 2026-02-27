"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { FaFlask, FaNewspaper, FaBell, FaArrowLeft, FaCheck } from "react-icons/fa";
import Link from "next/link";

function pad2(n) {
  const s = String(n);
  return s.length === 1 ? "0" + s : s;
}

function diffParts(target) {
  const now = new Date();
  const t = new Date(target);
  const ms = Math.max(0, t.getTime() - now.getTime());
  const sec = Math.floor(ms / 1000);
  const days = Math.floor(sec / 86400);
  const hrs = Math.floor((sec % 86400) / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const secs = sec % 60;
  return { days, hrs, mins, secs, done: ms === 0 };
}

export default function NewsComingSoon({ phase2Eta = "2026-04-01T00:00:00Z" }) {
  const reduceMotion = useReducedMotion();
  const [email, setEmail] = useState("");
  const [ok, setOk] = useState(false);

  // ✅ مهم: تایمر فقط روی کلاینت شروع شود تا SSR/CSR یکی باشد
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState({ days: 0, hrs: 0, mins: 0, secs: 0, done: false });

  useEffect(() => {
    setMounted(true);
    setTime(diffParts(phase2Eta));

    const id = setInterval(() => {
      setTime(diffParts(phase2Eta));
    }, 1000);

    return () => clearInterval(id);
  }, [phase2Eta]);

  const ticker = useMemo(
    () => [
      "فاز ۲: اتاق خبر کِما در حال آماده‌سازی است…",
      "دسته‌بندی اخبار صنعت شیمی + تحلیل قیمت‌ها",
      "نوتیفیکیشن‌های هوشمند برای تغییرات بازار",
      "خبرهای تامین‌کننده‌ها و استانداردها (MSDS/COA)",
    ],
    []
  );

  const onSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setOk(true);
    setEmail("");
    setTimeout(() => setOk(false), 2500);
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute -inset-24 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.10),transparent_40%),radial-gradient(circle_at_50%_90%,rgba(255,255,255,0.08),transparent_45%)]" />
        <div className="absolute inset-0 opacity-70 bg-[linear-gradient(120deg,rgba(234,88,12,0.35),rgba(37,99,235,0.35))]" />
        <div className="absolute inset-0 opacity-[0.15] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      {/* Wave */}
      <svg className="absolute bottom-0 left-0 w-full h-32 opacity-60" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path
          fill="rgba(255,255,255,0.12)"
          d="M0,224L80,234.7C160,245,320,267,480,256C640,245,800,203,960,170.7C1120,139,1280,117,1360,106.7L1440,96L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
        />
      </svg>

      <div className="relative container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
          {/* Main card */}
          <div className="relative rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_12px_50px_rgba(0,0,0,0.18)] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/15">
              <div className="flex items-center gap-2 text-white/90">
                <span className="inline-flex w-9 h-9 items-center justify-center rounded-2xl bg-white/10 border border-white/15">
                  <FaNewspaper />
                </span>
                <div className="leading-tight">
                  <div className="text-sm opacity-80">صفحه اخبار</div>
                  <div className="text-base font-semibold">به‌زودی در فاز ۲</div>
                </div>
              </div>

              <Link href="/" className="text-white/85 hover:text-white inline-flex items-center gap-2 text-sm">
                برگشت <FaArrowLeft className="opacity-80" />
              </Link>
            </div>

            <div className="px-6 py-7">
              <div className="flex items-start gap-4">
                <motion.div
                  initial={reduceMotion ? false : { rotate: -6, y: 0 }}
                  animate={reduceMotion ? undefined : { rotate: [-6, 6, -6], y: [0, -3, 0] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                  className="shrink-0"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
                    <FaFlask className="text-2xl" />
                  </div>
                </motion.div>

                <div className="text-white">
                  <h1 className="text-2xl md:text-3xl font-semibold">اتاق خبر کِما در حال ساخت است</h1>
                  <p className="mt-2 text-white/80 leading-7">
                    توی فاز ۲، اخبار و تحلیل‌های تخصصی صنعت شیمی رو با دسته‌بندی، فیلترهای هوشمند و نوتیفیکیشن‌های دقیق می‌بینی.
                  </p>

                  {/* Ticker */}
                  <div className="mt-5 rounded-2xl border border-white/15 bg-black/10 overflow-hidden">
                    <div className="px-4 py-2 text-xs text-white/70 border-b border-white/10">Lab Ticker</div>
                    <div className="relative h-10 overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 left-0 flex items-center gap-10 whitespace-nowrap px-4 text-sm text-white/85"
                        animate={reduceMotion ? undefined : { x: ["0%", "-50%"] }}
                        transition={reduceMotion ? undefined : { duration: 18, repeat: Infinity, ease: "linear" }}
                      >
                        {[...ticker, ...ticker].map((t, i) => (
                          <span key={i} className="inline-flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
                            {t}
                          </span>
                        ))}
                      </motion.div>
                    </div>
                  </div>

                  {/* CTA */}
                  <form onSubmit={onSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder="ایمیل برای دریافت خبر شروع فاز ۲"
                        className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-white/50 outline-none focus:border-white/40"
                      />
                    </div>
                    <button
                      type="submit"
                      className="rounded-2xl px-5 py-3 bg-white text-black font-medium hover:opacity-90 transition inline-flex items-center justify-center gap-2"
                    >
                      <FaBell />
                      خبرم کن
                    </button>
                  </form>

                  {ok && (
                    <div className="mt-3 inline-flex items-center gap-2 text-sm text-white/90">
                      <FaCheck />
                      ثبت شد! به محض فعال شدن صفحه خبر می‌دیم.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          </div>

          {/* Side card */}
          <div className="relative rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_12px_50px_rgba(0,0,0,0.18)] p-6 text-white overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="text-sm opacity-80">ETA فاز ۲</div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-black/15 border border-white/15">v2</span>
            </div>

            {/* ✅ SSR-safe: قبل از mount فقط placeholder ثابت نشان بده */}
            <div className="mt-3 grid grid-cols-4 gap-2 text-center">
              {[
                { label: "روز", value: mounted ? time.days : "—" },
                { label: "ساعت", value: mounted ? pad2(time.hrs) : "—" },
                { label: "دقیقه", value: mounted ? pad2(time.mins) : "—" },
                { label: "ثانیه", value: mounted ? pad2(time.secs) : "—" },
              ].map((c) => (
                <div key={c.label} className="rounded-2xl border border-white/15 bg-black/10 px-2 py-3">
                  <div className="text-xl font-semibold tabular-nums">{c.value}</div>
                  <div className="mt-1 text-[11px] opacity-75">{c.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-2 text-sm text-white/85">
              <div className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-white/70" />
                دسته‌بندی اخبار: بازار، استانداردها، تامین‌کننده‌ها
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-white/70" />
                فیلترهای سریع و سرچ هوشمند
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-white/70" />
                نوتیفیکیشن تغییرات مهم (اختیاری)
              </div>
            </div>

            <div className="mt-6 text-xs text-white/65 leading-6">
              * این بخش فعلاً نمایشی است و در فاز ۲ توسعه کامل می‌شود.
            </div>

            <div className="absolute -left-12 -top-12 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
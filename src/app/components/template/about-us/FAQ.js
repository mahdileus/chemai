"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";

function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function FAQ({ faqs: faqsProp }) {
    const reduceMotion = useReducedMotion();
    const [open, setOpen] = useState(0);

    const faqs = useMemo(
        () =>
            faqsProp ?? [
                {
                    q: "کِمای دقیقاً چه مشکلی را حل می‌کند؟",
                    a: "کِمای فرایند خرید و فروش مواد شیمیایی را شفاف و سریع می‌کند: مقایسه تامین‌کننده‌ها، استعلام تا سفارش، و کاهش پیگیری‌های اضافی.",
                    tone: "blue",
                },
                {
                    q: "چطور می‌توانم چند تامین‌کننده را با هم مقایسه کنم؟",
                    a: "در هر محصول، پیشنهادهای تامین‌کننده‌های مختلف با قیمت، شرایط خرید و مشخصات کنار هم نمایش داده می‌شود تا انتخاب سریع‌تر و دقیق‌تر انجام شود.",
                    tone: "orange",
                },
                {
                    q: "لجستیک کِمای شامل چه چیزهایی می‌شود؟",
                    a: "کِمای تلاش می‌کند هماهنگی ارسال و تحویل را ساده‌تر کند؛ از برنامه‌ریزی تا پیگیری مرحله‌ای، تا دغدغه‌ی حمل‌ونقل کمتر شود.",
                    tone: "blue",
                },
                {
                    q: "برای فروشندگان/تامین‌کنندگان چه مزیتی دارد؟",
                    a: "با نمایش حرفه‌ای محصولات و تعامل محتوایی، لیدهای هدفمندتر دریافت می‌کنید و مشتری‌ها با آگاهی بیشتر وارد مذاکره می‌شوند.",
                    tone: "orange",
                },
                {
                    q: "آیا قیمت‌ها به‌روز و قابل اعتماد هستند؟",
                    a: "قیمت‌ها بر اساس پیشنهادهای تامین‌کننده‌ها ثبت می‌شوند و شما می‌توانید همزمان شرایط خرید و کیفیت را هم بررسی و مقایسه کنید.",
                    tone: "blue",
                },
                {
                    q: "آیا خریدار می‌تواند قبل از خرید نهایی، پیش‌فاکتور یا جزئیات سفارش را ببیند؟",
                    a: "بله، قبل از نهایی شدن خرید می‌توانید جزئیات سفارش، شرایط خرید و اطلاعات تامین‌کننده را بررسی کنید تا تصمیم‌گیری شفاف‌تر و با ریسک کمتر انجام شود.",
                    tone: "orange",
                },
                {
                    q: "اگر چند فروشنده برای یک محصول وجود داشته باشد، انتخاب بهترین گزینه چطور انجام می‌شود؟",
                    a: "کِمای پیشنهادهای چند تامین‌کننده را کنار هم نمایش می‌دهد تا بر اساس قیمت، شرایط خرید، کیفیت و مشخصات محصول بهترین گزینه را سریع‌تر انتخاب کنید.",
                    tone: "blue",
                },
            ],
        [faqsProp]
    );

    return (
        <section className="bg-white py-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                            <span className="h-2 w-2 rounded-full bg-blue-500" />
                            سوالات متداول
                        </div>
                        <h3 className="mt-3 text-xl md:text-2xl font-semibold text-slate-900">
                            جواب‌های کوتاه، تصمیم‌گیری سریع‌تر
                        </h3>
                    </div>
                </div>

                {/* Layout: هم‌تراز + مینیمال */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* FAQ list */}
                    <div className="space-y-2">
                        {faqs.map((item, idx) => {
                            const isOpen = open === idx;
                            const tone = item.tone === "orange" ? "orange" : "blue";

                            return (
                                <div
                                    key={item.q}
                                    className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-sm"
                                >
                                    <button
                                        type="button"
                                        onClick={() => setOpen(isOpen ? -1 : idx)}
                                        className="w-full text-right px-4 py-4 md:px-5 md:py-4 flex gap-3 items-start"
                                    >
                                        {/* مینیمال: خط باریک کنار سوال */}
                                        <div className="mt-1 w-1 shrink-0">
                                            <motion.div
                                                className={cn(
                                                    "w-1 rounded-full",
                                                    tone === "blue" ? "bg-blue-500" : "bg-orange-500"
                                                )}
                                                initial={false}
                                                animate={{
                                                    height: isOpen ? 26 : 14,
                                                    opacity: isOpen ? 1 : 0.5,
                                                }}
                                                transition={{
                                                    duration: reduceMotion ? 0 : 0.2,
                                                    ease: "easeOut",
                                                }}
                                            />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="font-medium text-slate-900 leading-7">
                                                    {item.q}
                                                </div>

                                                {/* مینیمال: + کوچیک */}
                                                <motion.div
                                                    initial={false}
                                                    animate={{ rotate: isOpen ? 45 : 0 }}
                                                    transition={{ duration: reduceMotion ? 0 : 0.18 }}
                                                    className="shrink-0 mt-0.5 text-slate-500"
                                                    aria-hidden
                                                >
                                                    <span className="text-xl leading-none">+</span>
                                                </motion.div>
                                            </div>

                                            <AnimatePresence initial={false}>
                                                {isOpen && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{
                                                            duration: reduceMotion ? 0 : 0.22,
                                                            ease: "easeOut",
                                                        }}
                                                    >
                                                        <p className="mt-2 text-sm leading-7 text-slate-600">
                                                            {item.a}
                                                        </p>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Image: هم‌تراز با لیست + مرتب */}
                    <div className="lg:sticky lg:top-24 self-start">
                        <div className="rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-sm p-4">
                            <img
                                src="/images/FAQ-2 (1).png"
                                alt="FAQ"
                                className="w-full max-w-md mx-auto h-auto"
                            />
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
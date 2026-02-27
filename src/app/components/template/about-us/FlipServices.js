"use client";
import { useState } from "react";

export default function FlipServices({ techs }) {
    const [openId, setOpenId] = useState(null);

    return (
        <section className=" py-12">
            <div className="container mx-auto px-4">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <h3 className="text-xl md:text-2xl font-semibold text-slate-900">
                            سرویس‌های کِمای
                        </h3>
                        <p className="mt-2 text-slate-600">
                            روی هر کارت کلیک کن تا توضیح کامل‌تر نمایش داده شود.
                        </p>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {techs.map((t, idx) => {
                        const isOpen = openId === idx;
                        return (
                            <button
                                key={t.name}
                                type="button"
                                onClick={() => setOpenId(isOpen ? null : idx)}
                                className="group text-right"
                            >
                                <div
                                    className={`
                    relative h-full min-h-[240px]
                    rounded-3xl border border-slate-200
                    bg-white/70 backdrop-blur-md
                    shadow-sm
                    p-5
                    transition
                    hover:shadow-md
                    overflow-hidden
                  `}
                                >
                                    {/* accent */}
                                    <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/15 blur-2xl opacity-0 group-hover:opacity-100 transition" />
                                    <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-secondery/15 blur-2xl opacity-0 group-hover:opacity-100 transition" />

                                    {!isOpen ? (
                                        <>
                                            <div className="flex items-center justify-between">
                                                <div className="text-slate-900">{t.icon}</div>
                                                <span className="text-xs rounded-full border border-slate-200 bg-white/60 px-2 py-1 text-slate-600">
                                                    جزئیات
                                                </span>
                                            </div>
                                            <h4 className="mt-4 font-semibold text-slate-900">{t.name}</h4>
                                            <p className="mt-2 text-sm leading-7 text-slate-600">
                                                {t.description}
                                            </p>

                                            <div className="mt-5 inline-flex items-center gap-2 text-sm text-blue-700">
                                                بیشتر بخوانید
                                                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-semibold text-slate-900">{t.name}</h4>
                                                <span className="text-xs rounded-full border border-slate-200 bg-white/60 px-2 py-1 text-slate-600">
                                                    بستن
                                                </span>
                                            </div>
                                            <p className="mt-3 text-sm leading-7 text-slate-600">
                                                {t.backDesc}
                                            </p>
                                            <div className="mt-4 flex gap-2">
                                                <span className="text-xs px-2 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700">
                                                    B2B
                                                </span>
                                                <span className="text-xs px-2 py-1 rounded-full border border-orange-200 bg-orange-50 text-orange-700">
                                                    شفافیت
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
"use client";

import { useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";
import Image from "next/image";

const faqs = [
    {
        question:"لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده ؟",
        answer: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد کتابهای زیادی در شصت و سه درصد گذشته حال و آینده ",
    },
    {
        question:"لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده ؟",
        answer: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد کتابهای زیادی در شصت و سه درصد گذشته حال و آینده ",
    },
    {
        question:"لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده ؟",
        answer: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد کتابهای زیادی در شصت و سه درصد گذشته حال و آینده ",
    },
    {
        question:"لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده ؟",
        answer: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد کتابهای زیادی در شصت و سه درصد گذشته حال و آینده ",
    },
    {
        question:"لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده ؟",
        answer: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد کتابهای زیادی در شصت و سه درصد گذشته حال و آینده ",
    }
];

export default function FAQAccordion() {
    const [openIndex, setOpenIndex] = useState(null);

    const toggle = (index) => {
        setOpenIndex(index === openIndex ? null : index);
    };

    return (
        <section className="w-full py-20">
            <div className=" max-w-6xl mx-auto px-4 md:px-8 space-y-10">
                <h2 className="text-4xl font-bold text-primary text-center">
                    سوالات متداول درباره  <strong>کمای </strong>
                </h2>
                <div className="flex flex-col md:flex-row md:justify-between items-center gap-10">
                    {/* آکاردئون */}
                    {/* آکاردئون */}
                    <div className="w-full md:max-w-[48%] order-2 md:order-1 space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="border border-primary rounded-xl overflow-hidden shadow transition-all"
                            >
                                <button
                                    onClick={() => toggle(index)}
                                    className="w-full px-4 py-3 flex justify-between items-center text-right text-gray-700 text-base font-medium"
                                >
                                    {faq.question}
                                    {openIndex === index ? (
                                        <FaMinus className="text-primary" />
                                    ) : (
                                        <FaPlus className="text-primary" />
                                    )}
                                </button>
                                {openIndex === index && (
                                    <div className="px-4 pb-4 text-sm text-primary leading-loose">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* تصویر */}
                    <div className="relative w-full md:max-w-[48%] h-[400px] order-1 md:order-2 flex justify-center">

                        <Image
                            src="/images/Questions.png"
                            alt="سوالات متداول"
                            fill
                            className="object-contain rounded-3xl"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

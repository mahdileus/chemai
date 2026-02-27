// app/page.js
import React from 'react';
import { LiaOpencart } from "react-icons/lia";

export default function Plans() {
    return (
        <div className="min-h-screen container my-12">
            <h2 className="text-4xl font-bold text-primary text-center">
                پلن های <strong className="text-orange-500">کمای</strong>
            </h2>
            <p className="text-center text-gray-700 mb-8 mt-3 ">تمام فرایند خرید مواد شیمیایی، از استعلام قیمت تا تحویل، در یک پلتفرم امن و شفاف</p>
            <div className="">
                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {/* Basic Plan */}
                    <div className="flex flex-col items-center bg-white text-center border border-gray-200 rounded-xl p-6">

                        {/* آیکون */}
                        <img
                            src="/icons/hydrogen.png"
                            alt="basic plan"
                            className="w-16 h-16 object-contain mb-4"
                        />

                        <h2 className="text-2xl font-bold text-gray-800">هیدروژن</h2>

                        <p className="text-3xl font-bold text-gray-900 mt-2">سالانه</p>

                        <p className="text-sm text-gray-600 my-2">
                            این طرح برای همنوعان تنبل من که کار را به آهستگی انجام می‌دهند عالی است.
                        </p>
                        <h4 className='font-bold text-2xl text-secondery'>رایگان</h4>


                        <button className="relative mt-3 overflow-hidden inline-block px-6 py-2.5
    bg-linear-to-br from-primary to-blue-600 text-white rounded-3xl text-base
    transition font-semibold before:absolute before:inset-0 before:-translate-x-full
    before:bg-linear-to-r before:from-transparent before:via-white/40 before:to-transparent
    before:skew-x-[-25deg] before:transition-transform before:duration-700
    hover:before:translate-x-full">

                            خرید                     
                        </button>

                    </div>

                    <div className="flex flex-col items-center text-center border bg-white border-gray-200 rounded-xl p-6">

                        {/* آیکون */}
                        <img
                            src="/icons/carbon.png"
                            alt="basic plan"
                            className="w-16 h-16 object-contain mb-4"
                        />

                        <h2 className="text-2xl font-bold text-gray-800">کربن</h2>

                        <p className="text-3xl font-bold text-gray-900 mt-2">سالانه</p>

                        <p className="text-sm text-gray-600 my-2">
                            این طرح برای همنوعان تنبل من که کار را به آهستگی انجام می‌دهند عالی است.
                        </p>
                        <h4 className='font-bold text-2xl text-secondery'>6,000,000</h4>

                        <button className="relative mt-3 overflow-hidden inline-block px-6 py-2.5
    bg-linear-to-br from-primary to-blue-600 text-white rounded-3xl text-base
    transition font-semibold before:absolute before:inset-0 before:-translate-x-full
    before:bg-linear-to-r before:from-transparent before:via-white/40 before:to-transparent
    before:skew-x-[-25deg] before:transition-transform before:duration-700
    hover:before:translate-x-full">

                            خرید
                        </button>

                    </div>

                    {/* Premium Plan */}
                    <div className="flex flex-col items-center text-center border bg-white border-gray-200 rounded-xl p-6">

                        {/* آیکون */}
                        <img
                            src="/icons/silver.png"
                            alt="basic plan"
                            className="w-16 h-16 object-contain mb-4"
                        />

                        <h2 className="text-2xl font-bold text-gray-800">نقره</h2>

                        <p className="text-3xl font-bold text-gray-900 mt-2">سالانه</p>

                        <p className="text-sm text-gray-600 my-2">
                            این طرح برای همنوعان تنبل من که کار را به آهستگی انجام می‌دهند عالی است.
                        </p>
                        <h4 className='font-bold text-2xl text-secondery'>12,000,000</h4>


                        <button className="relative mt-3 overflow-hidden inline-block px-6 py-2.5
    bg-linear-to-br from-primary to-blue-600 text-white rounded-3xl text-base
    transition font-semibold before:absolute before:inset-0 before:-translate-x-full
    before:bg-linear-to-r before:from-transparent before:via-white/40 before:to-transparent
    before:skew-x-[-25deg] before:transition-transform before:duration-700
    hover:before:translate-x-full gap-4">

                            خرید
                        </button>

                    </div>

                    {/* Ultra Plan */}
                    <div className="flex flex-col items-center text-center border bg-white border-gray-200 rounded-xl p-6">

                        {/* آیکون */}
                        <img
                            src="/icons/gold.png"
                            alt="basic plan"
                            className="w-16 h-16 object-contain mb-4"
                        />

                        <h2 className="text-2xl font-bold text-gray-800">طلا</h2>

                        <p className="text-3xl font-bold text-gray-900 mt-2">سالانه</p>

                        <p className="text-sm text-gray-600 my-2">
                            این طرح برای همنوعان تنبل من که کار را به آهستگی انجام می‌دهند عالی است.
                        </p>
                        <h4 className='font-bold text-2xl text-secondery'>18,000,000</h4>


                        <button className="relative mt-3 overflow-hidden inline-block px-6 py-2.5
    bg-linear-to-br from-primary to-blue-600 text-white rounded-3xl text-base
    transition font-semibold before:absolute before:inset-0 before:-translate-x-full
    before:bg-linear-to-r before:from-transparent before:via-white/40 before:to-transparent
    before:skew-x-[-25deg] before:transition-transform before:duration-700
    hover:before:translate-x-full">

                         خرید

                        </button>

                    </div>
                </div>

                {/* Features Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <tbody>
                            <tr className=" border-gray-200 font-black text-xl" >
                                <td className="p-4 text-black/85">نوع پلن </td>
                                <td className="p-4 text-center"><span className="text-green-500">هیدروژن</span></td>
                                <td className="p-4 text-center"><span className="text-black">کربن</span></td>
                                <td className="p-4 text-center"><span className="text-gray-500">نقره</span></td>
                                <td className="p-4 text-center"><span className="text-yellow-500">طلا</span></td>
                            </tr>
                            <tr className="border-t border-gray-200">
                                <td className="p-4 text-gray-700">تعداد محصول</td>
                                <td className="p-4 text-center"><span className="text-green-500">5</span></td>
                                <td className="p-4 text-center"><span className="text-green-500">15</span></td>
                                <td className="p-4 text-center"><span className="text-green-500">30</span></td>
                                <td className="p-4 text-center"><span className="text-green-500">نامحدود</span></td>
                            </tr>
                            <tr className="border-t border-gray-200">
                                <td className="p-4 text-gray-700">اسانسور در ماه</td>
                                <td className="p-4 text-center">1 محصول</td>
                                <td className="p-4 text-center">4 محصول</td>
                                <td className="p-4 text-center">8 محصول</td>
                                <td className="p-4 text-center">15 محصول</td>
                            </tr>
                            <tr className="border-t border-gray-200">
                                <td className="p-4 text-gray-700">مناقصه و مزایده</td>
                                <td className="p-4 text-center"><span className="text-red-500">❌</span></td>
                                <td className="p-4 text-center">2 محصول</td>
                                <td className="p-4 text-center">5 محصول</td>
                                <td className="p-4 text-center">10 محصول</td>
                            </tr>
                            <tr className="border-t border-gray-200">
                                <td className="p-4 text-gray-700">بازاریابی پیامکی   </td>
                                <td className="p-4 text-center"><span className="text-red-500">❌</span></td>
                                <td className="p-4 text-center">10 محصول</td>
                                <td className="p-4 text-center">10 محصول</td>
                                <td className="p-4 text-center">10 محصول</td>
                            </tr>
                            <tr className="border-t border-gray-200">
                                <td className="p-4 text-gray-700">تبلیغات بنری</td>
                                <td className="p-4 text-center"><span className="text-red-500">❌</span></td>
                                <td className="p-4 text-center">2 بنر</td>
                                <td className="p-4 text-center">4 بنر</td>
                                <td className="p-4 text-center">8 بنر</td>

                            </tr>
                            <tr className="border-t border-gray-200">
                                <td className="p-4 text-gray-700">اعتبار کمای</td>
                                <td className="p-4 text-center"><span className="text-red-500">❌</span></td>
                                <td className="p-4 text-center">B</td>
                                <td className="p-4 text-center">A</td>
                                <td className="p-4 text-center">A+</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
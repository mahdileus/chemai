"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import swal from "sweetalert";
import { MdDelete } from 'react-icons/md';
import { MdModeEdit } from 'react-icons/md';
import { useState } from "react";

export default function FinancialAffair({ }) {
    const router = useRouter();
    const [visible, setVisible] = useState(true);

    if (!visible) return null;

    return (
        <>
            <div className="border border-[#e6f0ff] rounded-xl overflow-hidden  p-4 mb-4 hidden md:flex items-center justify-around text-[#e6f0ff]">
                <h3 className="text-gray-700">41512543594</h3>
                <h4 className="text-gray-700">09 آذر 1404</h4>
                <h4 className="text-gray-700"> 21:55 </h4>
                <h4 className="bg-green-100 rounded-full p-1.5 text-green-600"> پرداخت اقساطی </h4>
                <div className=" text-primary font-bold ">
                    20,000,000 تومان
                </div>
            </div>
            <div className="border border-[#e6f0ff] rounded-xl overflow-hidden  p-4 mb-4 flex md:hidden flex-col items-center justify-around text-[#e6f0ff]">
                <div className="flex items-center justify-between gap-10">
                    <h4 className="bg-green-100 rounded-full p-1.5 text-green-600"> پرداخت اقساطی </h4>
                    <div className=" text-primary font-bold ">
                        20,000,000 تومان
                    </div>
                </div>
                <div className="mt-2 flex items-center justify-between gap-10 ">
                    <h4 className="text-gray-700">کدپیگیری</h4>
                <h3 className="text-gray-700">41512543594</h3>

                </div>
                <div className="mt-2 flex items-center justify-between gap-10 ">
                    <h4 className="text-gray-700">تاریخ</h4>
                <h3 className="text-gray-700">09 آذر 1404</h3>

                </div>
                <div className="mt-2 flex items-center justify-between gap-10 ">
                    <h4 className="text-gray-700">ساعت</h4>
                <h3 className="text-gray-700">21:55</h3>
                </div>
            </div>
            <div className="border border-[#e6f0ff] rounded-xl overflow-hidden  p-4 mb-4 flex md:hidden flex-col items-center justify-around text-[#e6f0ff]">
                <div className="flex items-center justify-between gap-10">
                    <h4 className="bg-green-100 rounded-full p-1.5 text-green-600"> پرداخت اقساطی </h4>
                    <div className=" text-primary font-bold ">
                        20,000,000 تومان
                    </div>
                </div>
                <div className="mt-2 flex items-center justify-between gap-10 ">
                    <h4 className="text-gray-700">کدپیگیری</h4>
                <h3 className="text-gray-700">41512543594</h3>

                </div>
                <div className="mt-2 flex items-center justify-between gap-10 ">
                    <h4 className="text-gray-700">تاریخ</h4>
                <h3 className="text-gray-700">09 آذر 1404</h3>

                </div>
                <div className="mt-2 flex items-center justify-between gap-10 ">
                    <h4 className="text-gray-700">ساعت</h4>
                <h3 className="text-gray-700">21:55</h3>
                </div>
            </div>
            <div className="border border-[#e6f0ff] rounded-xl overflow-hidden  p-4 mb-4 flex md:hidden flex-col items-center justify-around text-[#e6f0ff]">
                <div className="flex items-center justify-between gap-10">
                    <h4 className="bg-green-100 rounded-full p-1.5 text-green-600"> پرداخت اقساطی </h4>
                    <div className=" text-primary font-bold ">
                        20,000,000 تومان
                    </div>
                </div>
                <div className="mt-2 flex items-center justify-between gap-10 ">
                    <h4 className="text-gray-700">کدپیگیری</h4>
                <h3 className="text-gray-700">41512543594</h3>

                </div>
                <div className="mt-2 flex items-center justify-between gap-10 ">
                    <h4 className="text-gray-700">تاریخ</h4>
                <h3 className="text-gray-700">09 آذر 1404</h3>

                </div>
                <div className="mt-2 flex items-center justify-between gap-10 ">
                    <h4 className="text-gray-700">ساعت</h4>
                <h3 className="text-gray-700">21:55</h3>
                </div>
            </div>
            <div className="border border-[#e6f0ff] rounded-xl overflow-hidden  p-4 mb-4 flex md:hidden flex-col items-center justify-around text-[#e6f0ff]">
                <div className="flex items-center justify-between gap-10">
                    <h4 className="bg-green-100 rounded-full p-1.5 text-green-600"> پرداخت اقساطی </h4>
                    <div className=" text-primary font-bold ">
                        20,000,000 تومان
                    </div>
                </div>
                <div className="mt-2 flex items-center justify-between gap-10 ">
                    <h4 className="text-gray-700">کدپیگیری</h4>
                <h3 className="text-gray-700">41512543594</h3>

                </div>
                <div className="mt-2 flex items-center justify-between gap-10 ">
                    <h4 className="text-gray-700">تاریخ</h4>
                <h3 className="text-gray-700">09 آذر 1404</h3>

                </div>
                <div className="mt-2 flex items-center justify-between gap-10 ">
                    <h4 className="text-gray-700">ساعت</h4>
                <h3 className="text-gray-700">21:55</h3>
                </div>
            </div>
            <div className="border border-[#e6f0ff] rounded-xl overflow-hidden  p-4 mb-4 hidden md:flex items-center justify-around text-[#e6f0ff]">
                <h3 className="text-gray-700">5275274257</h3>
                <h4 className="text-gray-700">30 دی 1383</h4>
                <h4 className="text-gray-700"> 14:55 </h4>
                <h4 className="bg-green-100 rounded-full p-1.5 text-green-600"> پرداخت نقدی </h4>
                <div className=" text-primary font-bold ">
                    40,000,000 تومان
                </div>
            </div>
            <div className="border border-[#e6f0ff] rounded-xl overflow-hidden  p-4 mb-4 hidden md:flex items-center justify-around text-[#e6f0ff]">
                <h3 className="text-gray-700">525785757</h3>
                <h4 className="text-gray-700">18 آذر 1404</h4>
                <h4 className="text-gray-700"> 02:55 </h4>
                <h4 className="bg-red-100 rounded-full p-1.5 text-red-600"> پرداخت ناموفق </h4>
                <div className=" text-primary font-bold">
                    10,000,000 تومان
                </div>
            </div>

        </>
    );
}

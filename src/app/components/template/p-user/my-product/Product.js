"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import swal from "sweetalert";
import { MdDelete } from 'react-icons/md';
import { MdModeEdit } from 'react-icons/md';
import { useState } from "react";

export default function Product({ }) {
    const router = useRouter();
    const [visible, setVisible] = useState(true);

    if (!visible) return null;

    return (
        <div className="flex flex-col bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition p-4 mb-4 md:flex-row md:items-center">
            {/* تصویر محصول */}
            <div className="h-48 md:h-32 md:w-48 shrink-0 mb-4 md:mb-0 md:mr-4">
                <img
                    src="/images/oil.png"
                    alt=""
                    className="w-full h-full object-cover rounded-lg"
                />
            </div>

            {/* اطلاعات محصول */}
            <div className="flex flex-col justify-between w-full">
                <div className="flex items-center justify-between">
                    <div>
                        <Link
                            href={"#"}
                            className="text-lg font-semibold text-secondery hover:underline text-right"
                        >
                            عنوان تستی
                        </Link>
                    </div>
                    <div className="flex items-center justify-end gap-4 mt-2 md:mt-0">
                        <span className="text-red-400 hover:text-red-500 text-2xl cursor-pointer">
                            <MdDelete />
                        </span>
                        <span className="text-secondery hover:text-secondery/90 text-2xl cursor-pointer">
                            <MdModeEdit />
                        </span>
                    </div>
                </div>
                <p className="text-sm text-gray-600 mt-1 text-right line-clamp-2">
                    لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است، و برای شرایط فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد...
                </p>
                <div className="flex items-center justify-between">
                    <div className=" text-primary font-bold mt-2">
                        20,000,000 تومان
                    </div>
                    <div className=" text-primary font-medium mt-2 text-base">
                        دسته بندی : <span className="text-gray-700 font-light">تست</span>
                    </div>

                </div>

            </div>
        </div>
    );
}

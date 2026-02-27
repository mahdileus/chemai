import MobileHeader from "./MobileHeader";
import Nav from "./Nav";
import Link from "next/link";
import {
    CiUser,
} from "react-icons/ci";

export default function Navbar({ isLogin }) {
    return (
        <div className="container py-4">
            <div className="hidden container py-3 relative z-4 mx-auto rounded-full backdrop-blur-2xl lg:flex bg-[#f5f5f53d] items-center justify-around md:px-10">
                <div className="flex justify-around items-center gap-3">
                    <div>
                        <img src="/images/logo-white-2.png" width={110} />
                    </div>

                    <div className="lg:pr-2 xl:pr-8">
                        <Nav />
                    </div>
                </div>
                <div  >
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex justify-between items-center gap-4">
                            <div className="flex flex-col justify-center">
                                <p className="text-white font-yekan-bakh bg-linear-to-br from-primary to-blue-600 text-center rounded-full  ">پشتیبانی</p>
                                <a href="tel:09125673763 " className="text-white font-yekan-bakh mt-2">09001887188</a>
                            </div>
                        </div>
                        {!isLogin ? (
                            <Link
                                href="/login-register"
                                className="border-none
    relative overflow-hidden
    bg-linear-to-br from-primary to-blue-600
    text-white px-6 py-2.5 
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
  
               font-medium text-lg p-2.5 rounded-3xl hidden md:flex justify-between items-center"
                            >
                                <CiUser className="text-white" />
                                <p className="text-sm font-dana font-medium lg:text-base">
                                    ورود / ثبت‌نام
                                </p>
                            </Link>
                        ) : (<Link
                            href="/p-user/dashboard"
                            className=" font-medium text-lg border-none
    relative overflow-hidden
    bg-linear-to-br from-primary to-blue-600
    text-white px-6 py-2.5 
    transition
    before:absolute before:inset-0
    before:-translate-x-full
    before:bg-linear-to-r
    before:from-transparent
    before:via-white/40
    before:to-transparent
    before:skew-x-[-25deg]
    before:transition-transform before:duration-700
    hover:before:translate-x-fullp-2.5 rounded-full hidden md:flex justify-between items-center"
                        >
                            <CiUser className="text-white" />
                            <p className="text-sm font-dana font-medium lg:text-base">
                                حساب کاربری
                            </p>
                        </Link>)}
                    </div>

                </div>

            </div>
            <MobileHeader isLogin={isLogin} />
        </div>


    );
}

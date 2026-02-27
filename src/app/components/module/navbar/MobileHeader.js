"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { CiMenuFries, CiUser } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import { PiTelegramLogo, PiInstagramLogo, PiYoutubeLogo } from "react-icons/pi";
import MobileNav from "./MobileNav";

export default function MobileHeader({ isLogin }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [isMobileMenuOpen]);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className="relative container">
            {/* Overlay blur background */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 z-9998"
                    onClick={toggleMobileMenu}
                ></div>
            )}

            <nav className="block md:hidden w-full py-5 pr-3 pl-1 mx-auto bg-primary rounded-xl sticky top-3 shadow-md z-[9999]">
                <div className="px-5 flex flex-wrap items-center justify-between mx-auto">
                    <button className="p-2" onClick={toggleMobileMenu} type="button">
                        <CiMenuFries className="text-2xl text-white" />
                    </button>

                    <div>
                        <Link href="/" className="block cursor-pointer text-primary font-kalameh font-bold text-xl">
                            <img
                                src="/images/logo-white-2.png"
                                width={110}
                                alt="chemai"

                            />
                        </Link>
                    </div>

                </div>
            </nav>

            {/* Mobile Menu Boxed */}
            <div
                className={`fixed top-6 right-0 bottom-6 w-[65%] bg-white shadow-xl transform transition-transform duration-300 ease-in-out rounded-2xl overflow-hidden ${isMobileMenuOpen ? "translate-x-0 right-6" : "translate-x-full"
                    } z-[9999] flex flex-col justify-between lg:hidden`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <Link href="/" >
                        <div>
                            <img src="/images/chemai-multi.png" width={110} />
                        </div>
                    </Link>
                    <button onClick={toggleMobileMenu} className="text-secondery hover:text-red-500">
                        <IoMdClose className="text-2xl text-red-500" />
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    <MobileNav onClick={() => setIsMobileMenuOpen(false)} />
                </div>

                {/* Bottom Part */}
                <div className="p-4 border-t border-gray-200 bg-white mt-auto">
                    <div className="flex gap-x-2 items-center justify-center mb-4">
                        <div className="bg-light-blue text-xl text-primary p-1.5 cursor-pointer rounded-xl">
                            <PiInstagramLogo />
                        </div>
                        <div className="bg-light-blue text-xl text-primary p-1.5 cursor-pointer rounded-xl">
                            <PiTelegramLogo />
                        </div>
                        <div className="bg-light-blue text-xl text-primary p-1.5 cursor-pointer rounded-xl">
                            <PiYoutubeLogo />
                        </div>
                    </div>
                    {!isLogin ? (
                        <Link
                            href="/login-register"
                            className="block bg-primary text-center text-cream w-full px-8 py-3 rounded-md hover:bg-secondery font-dana"
                        >
                            <CiUser className="text-white" />
                            <p className="text-sm font-dana lg:text-base text-white -mt-4">
                                ورود / ثبت‌نام
                            </p>
                        </Link>
                    ) : (<Link
                        href="/p-user/dashboard"
                        className="block bg-primary text-center text-cream w-full px-8 py-3 rounded-md hover:bg-secondery font-dana"
                    >
                        <CiUser className="text-white" />
                        <p className="text-sm font-dana lg:text-base text-white -mt-4">
                            حساب کاربری
                        </p>
                    </Link>)}
                </div>
            </div>
        </div>
    );
}

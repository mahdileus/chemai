"use client";

import Link from "next/link";
import Sms from "./Sms";
import { showSwal } from "@/utils/helpers";
import { validateEmail, validatePhone } from "@/utils/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert";

export default function Login({ showRegisterForm }) {
  const router = useRouter();

  const [isLoginWithOtp, setIsLoginWithOtp] = useState(false);
  const [password, setPassword] = useState("");
  const [phoneOrEmail, setPhoneOrEmail] = useState("");

  const hideOtpForm = () => setIsLoginWithOtp(false);

  const loginWithPassword = async (event) => {
    event.preventDefault();

    if (!phoneOrEmail) return showSwal("لطفا شماره تماس یا ایمیل را وارد کنید", "error", "چشم");

    const isValidEmail = validateEmail(phoneOrEmail);
    const isValidPhone = validatePhone(phoneOrEmail);
    if (!isValidEmail && !isValidPhone) {
      return showSwal("ایمیل یا شماره همراه صحیح نیست", "error", "تلاش مجدد");
    }

    if (!password || password.length < 6) {
      return showSwal("پسورد را وارد کنید", "error", "تلاش مجدد");
    }

    const res = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneOrEmail, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return showSwal(data?.message || "ورود ناموفق بود", "error", "تلاش مجدد");
    }

    // ✅ بعد از ست شدن کوکی‌ها، نقش را از me بگیر
    const meRes = await fetch("/api/auth/session/me", { method: "GET" });
    const meData = await meRes.json().catch(() => ({}));
    const role = meData?.data?.role;

    Swal({
      title: "با موفقیت وارد شدید",
      icon: "success",
      buttons: "ورود به پنل کاربری",
    }).then(() => {
      if (role === "ADMIN") router.replace("/p-admin");
      else router.replace("/p-user");
    });
  };

  const handleLoginWithOtp = async () => {
    const isValidPhone = validatePhone(phoneOrEmail);
    const isValidEmail = validateEmail(phoneOrEmail);

    if (isValidEmail) {
      return showSwal("ورود با کد تایید فقط با شماره موبایل امکان‌پذیر است", "error", "متوجه شدم");
    }

    if (!isValidPhone) {
      return showSwal("شماره تماس وارد شده معتبر نیست", "error", "تلاش مجدد ");
    }

    // ✅ API جدید OTP request
    const res = await fetch("/api/auth/otp/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phoneOrEmail, purpose: "login" }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 201) {
      showSwal("کد با موفقیت ارسال شد", "success", "ادامه");
      setIsLoginWithOtp(true);
    } else if (res.status === 404) {
      showSwal("کاربری با این شماره یافت نشد", "error", "تلاش مجدد");
    } else {
      showSwal(data?.message || "ارسال کد با خطا مواجه شد", "error", "تلاش مجدد");
    }
  };

  return (
    <>
      {!isLoginWithOtp ? (
        <div className="w-full flex items-center justify-center px-6 py-12 relative z-10">
          <div className="w-full relative max-w-md bg-white p-8 rounded-2xl shadow-xl border border-white/40 z-30">
            <h2 className="text-2xl font-bold text-primary text-center mb-8">ورود به حساب</h2>

            <form className="space-y-4">
              <input
                type="text"
                placeholder="شماره موبایل یا ایمیل"
                value={phoneOrEmail}
                onChange={(event) => setPhoneOrEmail(event.target.value)}
                className="w-full border border-primary rounded-lg px-4 py-2 bg-white/70 backdrop-blur-sm focus:outline-none focus:border-[#3F72AF]"
              />

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="رمز عبور"
                className="w-full border border-primary rounded-lg px-4 py-2 bg-white/70 backdrop-blur-sm focus:outline-none focus:border-[#3F72AF]"
              />

              <button
                type="submit"
                className="w-full bg-primary text-white py-2 rounded-lg cursor-pointer hover:bg-primary/90 transition duration-200"
                onClick={loginWithPassword}
              >
                ورود
              </button>

              <button
                type="button"
                className="w-full border border-primary cursor-pointer text-primary hover:text-white py-2 rounded-lg hover:bg-primary transition duration-200"
                onClick={handleLoginWithOtp}
              >
                ورود با کد یکبار مصرف
              </button>

              <p className="text-sm text-center text-gray-700 mt-4">
                حساب کاربری ندارید؟{" "}
                <Link href="" className="text-primary hover:underline cursor-pointer" onClick={showRegisterForm}>
                  ثبت‌نام کنید
                </Link>
              </p>

              <Link href="/" className="text-sm text-center py-1 block text-red-500 hover:underline cursor-pointer">
                لغو
              </Link>
            </form>
          </div>
        </div>
      ) : (
        <Sms hideOtpForm={hideOtpForm} phone={phoneOrEmail} purpose="login" />
      )}
    </>
  );
}
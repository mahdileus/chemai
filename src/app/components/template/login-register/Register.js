"use client";

import { useState } from "react";
import Sms from "./Sms";
import { showSwal } from "@/utils/helpers";
import { validateEmail, validatePassword, validatePhone } from "@/utils/auth-client";
import Swal from "sweetalert";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Register = ({ showloginForm }) => {
  const router = useRouter();

  const [isRegisterWithPass, setIsRegisterWithPass] = useState(false);
  const [isRegisterWithOtp, setIsRegisterWithOtp] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [nationalCode, setNationalCode] = useState("");
  const [password, setPassword] = useState("");

  const hideOtpForm = () => setIsRegisterWithOtp(false);

  const signUp = async () => {
    if (!firstName.trim()) return showSwal("نام را وارد بکنید", "error", "تلاش مجدد");
    if (!lastName.trim()) return showSwal("نام خانوادگی را وارد بکنید", "error", "تلاش مجدد");

    const isValidPhone = validatePhone(phone);
    if (!isValidPhone) return showSwal("شماره تماس وارد شده معتبر نیست", "error", "تلاش مجدد ");

    if (email) {
      const isValidEmail = validateEmail(email);
      if (!isValidEmail) return showSwal("ایمیل وارد شده معتبر نیست", "error", "تلاش مجدد ");
    }

    const isValidPassword = validatePassword(password);
    if (!isValidPassword) return showSwal("پسورد وارد شده قابل حدس هست", "error", "تلاش مجدد ");

    const user = { lastName, firstName, phone, email, password, nationalCode };

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });

    if (res.status === 201) {
      Swal({
        title: "ثبت نام با موفقیت انجام شد",
        icon: "success",
        buttons: "ورود به پنل کاربری",
      }).then(() => router.replace("/p-user"));
    } else if (res.status === 409 || res.status === 422) {
      showSwal("کاربری با این اطلاعات از قبل وجود دارد", "error", "تلاش مجدد");
    } else {
      const data = await res.json().catch(() => ({}));
      showSwal(data?.message || "خطا در ثبت نام", "error", "تلاش مجدد");
    }
  };

  const sendOtp = async () => {
    if (!firstName.trim()) return showSwal("نام را وارد بکنید", "error", "تلاش مجدد");
    if (!lastName.trim()) return showSwal("نام خانوادگی را وارد بکنید", "error", "تلاش مجدد");

    const isValidPhone = validatePhone(phone);
    if (!isValidPhone) return showSwal("شماره تماس وارد شده معتبر نیست", "error", "تلاش مجدد ");

    // ✅ API جدید
    const res = await fetch("/api/auth/otp/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, purpose: "signup" }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 201) {
      const swal = (await import("sweetalert")).default;
      swal({
        title: "کد تایید ارسال شد",
        icon: "success",
        buttons: "ادامه",
      }).then(() => setIsRegisterWithOtp(true));
    } else if (res.status === 409) {
      const swal = (await import("sweetalert")).default;
      swal({
        title: "این شماره قبلاً ثبت‌نام شده است",
        icon: "error",
        buttons: "رفتن به ورود",
      }).then(() => showloginForm());
    } else {
      showSwal(data?.message || "ارسال کد با خطا مواجه شد", "error", "تلاش مجدد");
    }
  };

  return (
    <>
      {isRegisterWithOtp ? (
        <Sms
          hideOtpForm={hideOtpForm}
          phone={phone}
          purpose="signup"
          signupPayload={{ firstName, lastName, email, nationalCode }}
        />
      ) : (
        <div className="w-full flex items-center justify-center px-6 py-12 relative z-10">
          <div className="w-full relative max-w-md bg-white p-8 rounded-2xl shadow-xl border border-white/40 z-30">
            <p className="text-2xl font-kalameh font-bold text-center py-1 block text-primary">ثبت نام</p>

            <form className="space-y-4">
              <input
                className="w-full border border-primary rounded-lg px-4 py-2 bg-white/70 backdrop-blur-sm focus:outline-none focus:border-[#3F72AF]"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                type="text"
                placeholder="نام"
                required
              />
              <input
                className="w-full border border-primary rounded-lg px-4 py-2 bg-white/70 backdrop-blur-sm focus:outline-none focus:border-[#3F72AF]"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                type="text"
                placeholder="نام خانوادگی"
                required
              />
              <input
                className="w-full border border-primary rounded-lg px-4 py-2 bg-white/70 backdrop-blur-sm focus:outline-none focus:border-[#3F72AF]"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="text"
                placeholder="شماره موبایل"
                required
              />
              <input
                className="w-full border border-primary rounded-lg px-4 py-2 bg-white/70 backdrop-blur-sm focus:outline-none focus:border-[#3F72AF]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="ایمیل (دلخواه)"
              />
              <input
                className="w-full border border-primary rounded-lg px-4 py-2 bg-white/70 backdrop-blur-sm focus:outline-none focus:border-[#3F72AF]"
                value={nationalCode}
                onChange={(e) => setNationalCode(e.target.value)}
                type="number"
                placeholder="کدملی"
                required
              />

              {isRegisterWithPass && (
                <input
                  className="w-full border border-primary rounded-lg px-4 py-2 bg-white/70 backdrop-blur-sm focus:outline-none focus:border-[#3F72AF]"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="رمز عبور"
                  required
                />
              )}

              <p
                className="w-full bg-primary text-white text-center py-2 rounded-lg hover:bg-primary/90 transition duration-200 cursor-pointer"
                onClick={sendOtp}
              >
                ثبت نام با کد تایید
              </p>

              <button
                type="button"
                className="w-full border border-primary cursor-pointer text-primary hover:text-white py-2 rounded-lg hover:bg-primary transition duration-200"
                onClick={() => (isRegisterWithPass ? signUp() : setIsRegisterWithPass(true))}
              >
                ثبت نام با رمزعبور
              </button>

              <p
                className="text-sm text-center py-1 block text-primary hover:underline cursor-pointer"
                onClick={showloginForm}
              >
                برگشت به ورود
              </p>
            </form>

            <Link href="/" className="text-sm text-center py-1 block text-red-500 hover:underline cursor-pointer">
              لغو
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default Register;
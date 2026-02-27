"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { showSwal } from "@/utils/helpers";
import swal from "sweetalert";
import { useRouter } from "next/navigation";

const Sms = ({ hideOtpForm, phone, purpose = "signup", signupPayload }) => {
  const inputsRef = useRef([]);
  const router = useRouter();

  // ✅ 6-digit OTP
  const DIGITS = 5;

  const [codeArray, setCodeArray] = useState(Array(DIGITS).fill(""));
  const [resendTimer, setResendTimer] = useState(120);
  const [resendCount, setResendCount] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  const normalizedPhone = useMemo(() => String(phone || "").trim(), [phone]);

  const startTimer = (duration) => {
    setResendTimer(duration);
    setIsResendDisabled(true);
  };

  useEffect(() => {
    if (resendTimer <= 0) {
      setIsResendDisabled(false);
      return;
    }

    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setIsResendDisabled(false);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendTimer]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleResendCode = async () => {
    if (!normalizedPhone || !/^09\d{9}$/.test(normalizedPhone)) {
      return showSwal("شماره موبایل وارد شده معتبر نیست", "error", "تلاش مجدد");
    }

    try {
      const res = await fetch("/api/auth/otp/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizedPhone, purpose }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        swal({ title: "کد جدید ارسال شد", icon: "success", buttons: "تأیید" });

        const newResendCount = resendCount + 1;
        setResendCount(newResendCount);

        // هر بار resend، تایمر بیشتر
        startTimer(120 + newResendCount * 60);

        setCodeArray(Array(DIGITS).fill(""));
        inputsRef.current[0]?.focus();
        return;
      }

      if (res.status === 404) return showSwal("ابتدا درخواست کد بدهید", "error", "تلاش مجدد");
      if (res.status === 429) return showSwal("تعداد درخواست‌ها زیاد است. کمی بعد تلاش کنید.", "error", "باشه");

      return showSwal(data?.message || "خطا در ارسال مجدد کد", "error", "تلاش مجدد");
    } catch {
      showSwal("خطا در ارتباط با سرور", "error", "تلاش مجدد");
    }
  };

  const verifyCode = async () => {
    const code = codeArray.join("");

    if (!normalizedPhone || !/^09\d{9}$/.test(normalizedPhone)) {
      return showSwal("شماره موبایل وارد شده معتبر نیست", "error", "تلاش مجدد");
    }

    if (!code || !new RegExp(`^\\d{${DIGITS}}$`).test(code)) {
      return showSwal(`کد تأیید باید یک عدد ${DIGITS} رقمی باشد`, "error", "تلاش مجدد");
    }

    const payload = {
      phone: normalizedPhone,
      purpose, // signup | login | change_phone
      code,
      ...(purpose === "signup" ? signupPayload : {}),
    };

    const res = await fetch("/api/auth/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      // پیام‌های رایج از API
      if (res.status === 400 && data?.message?.includes("expired"))
        return showSwal("کد وارد شده منقضی شده", "error", "تلاش مجدد");

      if (res.status === 400 && data?.message?.includes("invalid"))
        return showSwal("کد وارد شده معتبر نیست", "error", "تلاش مجدد");

      if (res.status === 429) return showSwal("تلاش بیش از حد. کمی بعد دوباره تلاش کنید.", "error", "باشه");

      return showSwal(data?.message || "خطا در تایید کد", "error", "تلاش مجدد");
    }

    const successMsg = purpose === "login" ? "ورود با موفقیت انجام شد" : "ثبت‌نام با موفقیت انجام شد";
    swal({
      title: successMsg,
      icon: "success",
      buttons: "ورود به پنل کاربری",
    }).then(() => {
      // اگر role برگشت دادیم:
      const role = data?.data?.role;
      if (role === "ADMIN") router.replace("/p-admin");
      else router.replace("/p-user");
    });
  };

  const handleInputChange = (index, e) => {
    const val = e.target.value;

    // اگر paste شد (مثلاً چند رقم)
    if (/^\d+$/.test(val) && val.length > 1) {
      const digits = val.slice(0, DIGITS).split("");
      const newCode = Array(DIGITS).fill("");
      for (let i = 0; i < digits.length; i++) newCode[i] = digits[i];
      setCodeArray(newCode);
      const nextIndex = Math.min(digits.length, DIGITS - 1);
      inputsRef.current[nextIndex]?.focus();
      return;
    }

    if (/^\d$/.test(val)) {
      const newCode = [...codeArray];
      newCode[index] = val;
      setCodeArray(newCode);

      if (index < inputsRef.current.length - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    } else {
      const newCode = [...codeArray];
      newCode[index] = "";
      setCodeArray(newCode);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !codeArray[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div className="w-full flex items-center justify-center px-6 py-12 relative z-10">
      <div className="w-full relative max-w-md bg-white p-8 rounded-2xl shadow-xl border border-white/40 z-30">
        <p className="text-2xl font-kalameh font-bold text-center text-primary">کد تایید</p>
        <span className="text-sm text-center block text-secondery mt-2">
          لطفاً کد تأیید ارسال شده را وارد کنید
        </span>
        <span className="text-xl text-center block text-primary mt-1">{normalizedPhone}</span>

        <form className="space-y-4 mt-6">
          <div className="flex justify-center gap-2" dir="ltr">
            {Array.from({ length: DIGITS }).map((_, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={DIGITS} // برای paste کمک می‌کنه
                value={codeArray[i]}
                onChange={(e) => handleInputChange(i, e)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-12 text-center text-xl border border-primary/60 rounded-lg bg-white/70 backdrop-blur-sm focus:outline-none focus:border-primary"
              />
            ))}
          </div>

          <button
            onClick={verifyCode}
            type="button"
            className="w-full border border-primary text-primary hover:text-white py-2 rounded-lg hover:bg-primary transition duration-200 cursor-pointer"
          >
            ثبت کد تایید
          </button>

          <p
            onClick={isResendDisabled ? undefined : handleResendCode}
            className={`text-md text-center ${
              isResendDisabled ? "text-primary cursor-not-allowed" : "text-primary cursor-pointer hover:underline"
            }`}
          >
            {isResendDisabled ? `ارسال مجدد کد بعد از ${formatTime(resendTimer)}` : "ارسال مجدد کد یکبار مصرف"}
          </p>

          <p onClick={hideOtpForm} className="text-sm text-center text-red-500 hover:underline cursor-pointer">
            لغو
          </p>
        </form>
      </div>
    </div>
  );
};

export default Sms;
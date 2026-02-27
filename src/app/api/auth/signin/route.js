import {
  generateAccessToken,
  generateRefreshToken,
  verifyPassword,
  persistRefreshToken,
} from "@/utils/auth-server";

import { validateEmail, validatePhone } from "@/utils/auth-client";

import UserModel from "@/models/User";
import connectToDB from "@/configs/db";
import { NextResponse } from "next/server";

const cookieBase = {
  httpOnly: true,
  path: "/",
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
};

// ساده: همه شماره‌ها رو به فرم 09xxxxxxxxx تبدیل کن
const normalizePhone = (input) => {
  let p = String(input || "").trim();
  if (p.startsWith("+98")) p = "0" + p.slice(3);
  if (p.startsWith("98")) p = "0" + p.slice(2);
  return p;
};

export async function POST(req) {
  try {
    await connectToDB();

    const body = await req.json();
    const { phoneOrEmail, password } = body;

    if (!phoneOrEmail || !password || String(password).length < 6) {
      return NextResponse.json(
        { message: "اطلاعات ورود نامعتبر است" },
        { status: 400 }
      );
    }

    const isEmail = validateEmail(phoneOrEmail);
    const isPhone = validatePhone(phoneOrEmail);

    if (!isEmail && !isPhone) {
      return NextResponse.json(
        { message: "ایمیل/شماره نامعتبر است" },
        { status: 400 }
      );
    }

    const query = isEmail
      ? { email: String(phoneOrEmail).trim().toLowerCase() }
      : { phone: normalizePhone(phoneOrEmail) };

    const user = await UserModel.findOne(query).select(
      "+password _id phone email role status isBlocked blockedUntil firstName lastName name"
    );

    // پیام یکسان برای امنیت
    if (!user) {
      return NextResponse.json(
        { message: "ایمیل/شماره یا رمز عبور اشتباه است" },
        { status: 401 }
      );
    }

    // وضعیت‌ها
    if (user.status && user.status !== "ACTIVE") {
      return NextResponse.json(
        { message: "حساب کاربری غیرفعال است" },
        { status: 403 }
      );
    }

    if (user.isBlocked && user.blockedUntil && user.blockedUntil > new Date()) {
      return NextResponse.json(
        { message: "حساب کاربری موقتاً مسدود است" },
        { status: 403 }
      );
    }

    const ok = await verifyPassword(password, user.password);
    if (!ok) {
      return NextResponse.json(
        { message: "ایمیل/شماره یا رمز عبور اشتباه است" },
        { status: 401 }
      );
    }

    // ✅ توکن‌ها بهتره sub و role داشته باشن
    const accessToken = generateAccessToken({
      sub: String(user._id),
      phone: user.phone,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      sub: String(user._id),
      phone: user.phone,
      role: user.role,
    });

    // ✅ ذخیره امن refresh (hash)
    await persistRefreshToken({ userId: user._id, refreshToken });

    const res = NextResponse.json({ message: "ورود با موفقیت انجام شد" });

    res.cookies.set("token", accessToken, {
      ...cookieBase,
      maxAge: 60 * 60, // 1h
    });

    res.cookies.set("refreshToken", refreshToken, {
      ...cookieBase,
      maxAge: 60 * 60 * 24 * 45, // 45 روز
    });

    return res;
  } catch (err) {
    console.log("Signin Error ->", err);
    return NextResponse.json(
      { message: "خطا در سرور" },
      { status: 500 }
    );
  }
}
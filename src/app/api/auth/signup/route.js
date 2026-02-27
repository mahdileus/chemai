import crypto from "crypto";
import connectToDB from "@/configs/db";
import UserModel from "@/models/User";
import {
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
  persistRefreshToken,
} from "@/utils/auth-server";
import { createDefaultSubscription } from "@/services/subscription.service";
import { roles } from "@/utils/constants";
import { validateEmail, validatePhone, validatePassword } from "@/utils/auth-client";
import { NextResponse } from "next/server";

const cookieBase = {
  httpOnly: true,
  path: "/",
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
};

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

    const firstName = (body.firstName || "").trim();
    const lastName = (body.lastName || "").trim();
    const phone = normalizePhone(body.phone || "");
    const email = body.email ? String(body.email).trim().toLowerCase() : "";
    const password = body.password || "";
    const nationalCode = body.nationalCode ? String(body.nationalCode).trim() : undefined;

    if (firstName.length < 2) {
      return NextResponse.json({ message: "نام معتبر نیست", field: "firstName" }, { status: 400 });
    }
    if (lastName.length < 2) {
      return NextResponse.json({ message: "نام خانوادگی معتبر نیست", field: "lastName" }, { status: 400 });
    }
    if (!validatePhone(phone)) {
      return NextResponse.json({ message: "شماره موبایل معتبر نیست", field: "phone" }, { status: 400 });
    }
    if (email && !validateEmail(email)) {
      return NextResponse.json({ message: "ایمیل معتبر نیست", field: "email" }, { status: 400 });
    }
    if (!validatePassword(password)) {
      return NextResponse.json({ message: "رمز عبور معتبر نیست", field: "password" }, { status: 400 });
    }

    const or = [{ phone }];
    if (email) or.push({ email });

    const existingUser = await UserModel.findOne({ $or: or }).select("_id");
    if (existingUser) {
      return NextResponse.json({ message: "ایمیل یا شماره موبایل قبلاً ثبت شده است." }, { status: 409 });
    }

    const isFirstUser = (await UserModel.countDocuments({})) === 0;
    const role = isFirstUser ? roles.ADMIN : roles.USER;

    // ✅ سرور تولید می‌کند (کلاینت نباید بفرستد)
    const chemaiCode = `ch-${crypto.randomBytes(3).toString("hex")}`;

    const user = await UserModel.create({
      phone,
      email: email || undefined,
      password: await hashPassword(password),
      role,
      firstName,
      lastName,
      nationalCode,
      chemaiCode, // اگر در مدل auto-generate 100% مطمئنی، می‌تونی حذفش کنی
    });

    await createDefaultSubscription(user._id);

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

    await persistRefreshToken({ userId: user._id, refreshToken });

    const res = NextResponse.json({ message: "ثبت‌نام با موفقیت انجام شد" }, { status: 201 });

    res.cookies.set("token", accessToken, { ...cookieBase, maxAge: 60 * 60 });
    res.cookies.set("refreshToken", refreshToken, { ...cookieBase, maxAge: 60 * 60 * 24 * 45 });

    return res;
  } catch (err) {
    console.log("Signup Error ->", err);
    return NextResponse.json({ message: "خطا در سرور" }, { status: 500 });
  }
}
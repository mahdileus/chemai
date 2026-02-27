// app/api/auth/otp/verify/route.js
import crypto from "crypto";
import connectToDB from "@/configs/db";
import Otp from "@/models/Otp";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { createDefaultSubscription } from "@/services/subscription.service";
import {
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
  persistRefreshToken,
} from "@/utils/auth-server";

const normalizePhone = (input) => {
  let p = String(input || "").trim();
  if (p.startsWith("+98")) p = "0" + p.slice(3);
  if (p.startsWith("98")) p = "0" + p.slice(2);
  return p;
};

const hashCode = (code) =>
  crypto.createHash("sha256").update(String(code)).digest("hex");

export async function POST(req) {
  await connectToDB();

  const body = await req.json();
  const phone = normalizePhone(body.phone);
  const purpose = body.purpose || "login";
  const code = String(body.code || "").trim();

  if (!phone || !/^\d{5}$/.test(code)) {
    return NextResponse.json(
      { success: false, message: "phone/code invalid" },
      { status: 400 }
    );
  }

  const otp = await Otp.findOne({ phone, purpose }).select(
    "+codeHash expiresAt attempts blockedUntil"
  );
  if (!otp)
    return NextResponse.json(
      { success: false, message: "otp not found" },
      { status: 404 }
    );

  const now = new Date();

  if (otp.blockedUntil && otp.blockedUntil > now) {
    return NextResponse.json(
      { success: false, message: "otp blocked" },
      { status: 429 }
    );
  }

  if (otp.expiresAt <= now) {
    return NextResponse.json(
      { success: false, message: "otp expired" },
      { status: 400 }
    );
  }

  const incomingHash = hashCode(code);
  if (incomingHash !== otp.codeHash) {
    const attempts = (otp.attempts || 0) + 1;
    const update = { attempts };

    if (attempts >= 5) {
      update.blockedUntil = new Date(now.getTime() + 10 * 60 * 1000);
    }

    await Otp.updateOne({ _id: otp._id }, { $set: update });
    return NextResponse.json(
      { success: false, message: "otp invalid" },
      { status: 400 }
    );
  }

  // ✅ OTP درست → پاکش کن
  await Otp.deleteOne({ _id: otp._id });

  // user موجود؟
  let user = await User.findOne({ phone }).select(
    "_id phone role firstName lastName email chemaiCode"
  );

  // signup: اگر کاربر وجود ندارد بساز
  if (!user && purpose === "signup") {
    const firstName = String(body.firstName || "کاربر").trim();
    const lastName = String(body.lastName || "-").trim();
    const email = body.email ? String(body.email).trim().toLowerCase() : undefined;
    const nationalCode = body.nationalCode ? String(body.nationalCode).trim() : undefined;

    // ✅ اولین کاربر = ADMIN
    const isFirstUser = (await User.countDocuments({})) === 0;
    const role = isFirstUser ? "ADMIN" : "USER";

    // ✅ chemaiCode را درست بساز (بدون وابستگی به body)
    const chemaiCode = `ch-${crypto.randomBytes(3).toString("hex")}`;

    user = await User.create({
      phone,
      firstName,
      lastName,
      email,
      nationalCode,
      role,
      chemaiCode, // اگر در مدل auto-generate داری می‌تونی این خط رو حذف کنی
    });

    await createDefaultSubscription(user._id);
  }

  // login: اگر کاربر وجود ندارد => خطا
  if (!user && purpose === "login") {
    return NextResponse.json(
      { success: false, message: "user not found" },
      { status: 404 }
    );
  }

  if (!user) {
    return NextResponse.json(
      { success: false, message: "invalid flow" },
      { status: 400 }
    );
  }

  // ✅ صدور توکن
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
  await setAuthCookies({ accessToken, refreshToken });

  return NextResponse.json(
    {
      success: true,
      message: "authenticated",
      data: {
        _id: user._id,
        phone: user.phone,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        chemaiCode: user.chemaiCode,
      },
    },
    { status: 200 }
  );
}
import crypto from "crypto";
import UserModel from "@/models/User";
import connectToDB from "@/configs/db";
import { verifyAccessToken, verifyRefreshToken, generateAccessToken } from "@/utils/auth-server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const hashToken = (t) => crypto.createHash("sha256").update(t).digest("hex");

export async function POST() {
  await connectToDB();

  const cookieStore = await cookies(); // ✅ Next 15+
  const accessTokenCookie = cookieStore.get("token");
  const refreshTokenCookie = cookieStore.get("refreshToken");

  // 1) اگر access معتبر است، همان user را بده (اختیاری ولی مطابق کد خودت)
  if (accessTokenCookie?.value) {
    const accessPayload = verifyAccessToken(accessTokenCookie.value);
    const query = accessPayload?.sub
      ? { _id: accessPayload.sub }
      : accessPayload?.phone
        ? { phone: accessPayload.phone }
        : null;

    if (query) {
      const user = await UserModel.findOne(query).select(
        "_id phone email role name firstName lastName addresses avatar status isBlocked blockedUntil"
      );

      if (user) {
        // احترام به وضعیت‌ها
        if (user.status && user.status !== "ACTIVE") {
          const res = NextResponse.json({ success: false, data: null, message: "user inactive" }, { status: 403 });
          res.cookies.delete("token");
          res.cookies.delete("refreshToken");
          return res;
        }
        if (user.isBlocked && user.blockedUntil && user.blockedUntil > new Date()) {
          return NextResponse.json({ success: false, data: null, message: "user blocked" }, { status: 403 });
        }

        return NextResponse.json({ success: true, data: user, message: "ok" });
      }
    }
  }

  // 2) اگر refresh نیست -> 401 و پاکسازی
  if (!refreshTokenCookie?.value) {
    const res = NextResponse.json({ success: false, data: null, message: "unauthorized" }, { status: 401 });
    res.cookies.delete("token");
    res.cookies.delete("refreshToken");
    return res;
  }

  // 3) verify refresh
  const refreshPayload = verifyRefreshToken(refreshTokenCookie.value);
  const query = refreshPayload?.sub
    ? { _id: refreshPayload.sub }
    : refreshPayload?.phone
      ? { phone: refreshPayload.phone }
      : null;

  if (!query) {
    const res = NextResponse.json({ success: false, data: null, message: "invalid refresh token" }, { status: 403 });
    res.cookies.delete("token");
    res.cookies.delete("refreshToken");
    return res;
  }

  // 4) user + refreshTokenHash از DB برای مقایسه
  const user = await UserModel.findOne(query).select(
    "_id phone email role name firstName lastName addresses avatar status isBlocked blockedUntil refreshTokenHash"
  );

  if (!user) {
    const res = NextResponse.json({ success: false, data: null, message: "user not found" }, { status: 404 });
    res.cookies.delete("token");
    res.cookies.delete("refreshToken");
    return res;
  }

  // احترام به وضعیت‌ها
  if (user.status && user.status !== "ACTIVE") {
    const res = NextResponse.json({ success: false, data: null, message: "user inactive" }, { status: 403 });
    res.cookies.delete("token");
    res.cookies.delete("refreshToken");
    return res;
  }
  if (user.isBlocked && user.blockedUntil && user.blockedUntil > new Date()) {
    const res = NextResponse.json({ success: false, data: null, message: "user blocked" }, { status: 403 });
    res.cookies.delete("token");
    res.cookies.delete("refreshToken");
    return res;
  }

  // ✅ مقایسه hash refresh cookie با DB
  // اگر هنوز refreshTokenHash رو به User اضافه نکردی، این قسمت fail میشه => باید اضافه کنی
  if (!user.refreshTokenHash || user.refreshTokenHash !== hashToken(refreshTokenCookie.value)) {
    const res = NextResponse.json({ success: false, data: null, message: "invalid session" }, { status: 403 });
    res.cookies.delete("token");
    res.cookies.delete("refreshToken");
    return res;
  }

  // 5) access جدید
  const newAccessToken = generateAccessToken({
    sub: String(user._id),
    phone: user.phone,
    role: user.role,
  });

  const res = NextResponse.json({
    success: true,
    data: {
      _id: user._id,
      phone: user.phone,
      email: user.email,
      role: user.role,
      name: user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      addresses: user.addresses || [],
      avatar: user.avatar,
    },
    message: "refreshed",
  });

  res.cookies.set("token", newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60, // 1h
  });

  return res;
}
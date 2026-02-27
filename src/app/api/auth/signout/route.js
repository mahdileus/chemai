import crypto from "crypto";
import connectToDB from "@/configs/db";
import UserModel from "@/models/User";
import { verifyAccessToken, verifyRefreshToken } from "@/utils/auth-server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const hashToken = (t) => crypto.createHash("sha256").update(t).digest("hex");

export async function POST() {
  await connectToDB();

  const cookieStore = await cookies(); // ✅ Next 15+
  const access = cookieStore.get("token")?.value || "";
  const refresh = cookieStore.get("refreshToken")?.value || "";

  // تلاش برای پیدا کردن کاربر از access یا refresh
  const accessPayload = access ? verifyAccessToken(access) : null;
  const refreshPayload = refresh ? verifyRefreshToken(refresh) : null;

  const query =
    accessPayload?.sub ? { _id: accessPayload.sub }
    : accessPayload?.phone ? { phone: accessPayload.phone }
    : refreshPayload?.sub ? { _id: refreshPayload.sub }
    : refreshPayload?.phone ? { phone: refreshPayload.phone }
    : null;

  if (query) {
    // refreshTokenHash رو پاک کن تا refresh قدیمی بی‌اثر بشه
    await UserModel.updateOne({ ...query }, { $set: { refreshTokenHash: "" } });
  }

  const res = NextResponse.json({ success: true, message: "خروج با موفقیت انجام شد" });

  res.cookies.delete("token");
  res.cookies.delete("refreshToken");

  return res;
}
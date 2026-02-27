import connectToDB from "@/configs/db";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken, verifyPassword, hashPassword } from "@/utils/auth-server";

export async function POST(req) {
  await connectToDB();

  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ success: false, message: "invalid input" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return NextResponse.json({ success: false, message: "unauthorized" }, { status: 401 });

  const payload = verifyAccessToken(token);
  if (!payload?.sub) return NextResponse.json({ success: false, message: "unauthorized" }, { status: 401 });

  const user = await User.findById(payload.sub).select("+password");
  if (!user) return NextResponse.json({ success: false, message: "user not found" }, { status: 404 });

  if (!user.password) {
    return NextResponse.json({ success: false, message: "no password set (use /password/set)" }, { status: 400 });
  }

  const ok = await verifyPassword(currentPassword, user.password);
  if (!ok) return NextResponse.json({ success: false, message: "wrong current password" }, { status: 401 });

  user.password = await hashPassword(newPassword);

  // ✅ اختیاری ولی امن‌تر: invalidate refresh
  user.refreshTokenHash = "";
  user.refreshToken = "";

  await user.save();

  return NextResponse.json({ success: true, message: "password changed" }, { status: 200 });
}
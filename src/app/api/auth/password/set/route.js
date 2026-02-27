import connectToDB from "@/configs/db";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken, hashPassword } from "@/utils/auth-server";

export async function POST(req) {
  await connectToDB();

  const { newPassword } = await req.json();
  if (!newPassword) return NextResponse.json({ success: false, message: "newPassword required" }, { status: 400 });

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return NextResponse.json({ success: false, message: "unauthorized" }, { status: 401 });

  const payload = verifyAccessToken(token);
  if (!payload?.sub) return NextResponse.json({ success: false, message: "unauthorized" }, { status: 401 });

  const user = await User.findById(payload.sub).select("+password");
  if (!user) return NextResponse.json({ success: false, message: "user not found" }, { status: 404 });

  // اگر قبلاً پسورد داشته، بهتره بره change-password
  if (user.password) {
    return NextResponse.json({ success: false, message: "password already set" }, { status: 409 });
  }

  user.password = await hashPassword(newPassword);
  await user.save();

  return NextResponse.json({ success: true, message: "password set" }, { status: 200 });
}
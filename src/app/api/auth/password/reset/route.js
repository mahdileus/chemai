import crypto from "crypto";
import connectToDB from "@/configs/db";
import Otp from "@/models/Otp";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { hashPassword } from "@/utils/auth-server";

const normalizePhone = (input) => {
  let p = String(input || "").trim();
  if (p.startsWith("+98")) p = "0" + p.slice(3);
  if (p.startsWith("98")) p = "0" + p.slice(2);
  return p;
};

const hashCode = (code) => crypto.createHash("sha256").update(String(code)).digest("hex");

export async function POST(req) {
  await connectToDB();

  const { phone, code, newPassword } = await req.json();
  const normalizedPhone = normalizePhone(phone);
  const otpCode = String(code || "").trim();

  if (!normalizedPhone || !/^\d{5}$/.test(otpCode) || !newPassword) {
    return NextResponse.json({ success: false, message: "invalid input" }, { status: 400 });
  }

  const purpose = "reset_password";
  const otp = await Otp.findOne({ phone: normalizedPhone, purpose }).select("+codeHash expiresAt attempts blockedUntil");
  if (!otp) return NextResponse.json({ success: false, message: "otp not found" }, { status: 404 });

  const now = new Date();
  if (otp.blockedUntil && otp.blockedUntil > now) {
    return NextResponse.json({ success: false, message: "otp blocked" }, { status: 429 });
  }
  if (otp.expiresAt <= now) {
    return NextResponse.json({ success: false, message: "otp expired" }, { status: 400 });
  }

  const incomingHash = hashCode(otpCode);
  if (incomingHash !== otp.codeHash) {
    const attempts = (otp.attempts || 0) + 1;
    const update = { attempts };
    if (attempts >= 5) update.blockedUntil = new Date(now.getTime() + 10 * 60 * 1000);
    await Otp.updateOne({ _id: otp._id }, { $set: update });
    return NextResponse.json({ success: false, message: "otp invalid" }, { status: 400 });
  }

  // otp ok
  await Otp.deleteOne({ _id: otp._id });

  const user = await User.findOne({ phone: normalizedPhone }).select("_id");
  if (!user) return NextResponse.json({ success: false, message: "user not found" }, { status: 404 });

  const hashed = await hashPassword(newPassword);

  // ✅ reset password + invalidate sessions
  await User.updateOne(
    { _id: user._id },
    { $set: { password: hashed, refreshTokenHash: "", refreshToken: "" } }
  );

  return NextResponse.json({ success: true, message: "password reset" }, { status: 200 });
}
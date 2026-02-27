// app/api/auth/otp/request/route.js
import crypto from "crypto";
import connectToDB from "@/configs/db";
import Otp from "@/models/Otp";
import User from "@/models/User";
import { NextResponse } from "next/server";

const OTP_TTL_MIN = 5;          // ✅ 5 دقیقه
const RESEND_COOLDOWN_SEC = 60; // جلوگیری از اسپم

const normalizePhone = (input) => {
  let p = String(input || "").trim();
  if (p.startsWith("+98")) p = "0" + p.slice(3);
  if (p.startsWith("98")) p = "0" + p.slice(2);
  return p;
};

const hashCode = (code) => crypto.createHash("sha256").update(String(code)).digest("hex");

const generateCode5 = () => Math.floor(10000 + Math.random() * 90000); // ✅ 5 رقمی

async function sendOtpViaIpPanel({ phone, code }) {
  const smsResponse = await fetch("http://ippanel.com/api/select", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      op: "pattern",
      user: process.env.IPPANEL_USER,
      pass: process.env.IPPANEL_PASS,
      fromNum: "3000505",
      toNum: phone,
      patternCode: "xxzh1ujyzj7uawp",
      inputData: [{ "verification-code": String(code) }],
    }),
  });

  const data = await smsResponse.json().catch(() => ({}));
  if (!smsResponse.ok) {
    throw new Error(data?.message || "IPPANEL_ERROR");
  }

  // بعضی وقت‌ها ippanel ok=1 یا status برمی‌گردونه؛
  // اگر خواستی دقیق‌ترش کنیم، خروجی واقعی رو چاپ کن.
  return data;
}

export async function POST(req) {
  await connectToDB();

  const { phone, purpose = "signup" } = await req.json();
  const normalizedPhone = normalizePhone(phone);

  if (!normalizedPhone) {
    return NextResponse.json({ success: false, message: "phone required" }, { status: 400 });
  }

  // قواعد بر اساس purpose
  if (purpose === "signup") {
    const exists = await User.findOne({ phone: normalizedPhone }).select("_id");
    if (exists) return NextResponse.json({ success: false, message: "phone already registered" }, { status: 409 });
  }

  if (purpose === "login") {
    const exists = await User.findOne({ phone: normalizedPhone }).select("_id");
    if (!exists) return NextResponse.json({ success: false, message: "user not found" }, { status: 404 });
  }

  // cooldown: اگر OTP قبلی خیلی تازه است، 429 بده
  const existingOtp = await Otp.findOne({ phone: normalizedPhone, purpose }).select("updatedAt blockedUntil");
  const now = new Date();

  if (existingOtp?.blockedUntil && existingOtp.blockedUntil > now) {
    return NextResponse.json({ success: false, message: "otp temporarily blocked" }, { status: 429 });
  }

  if (existingOtp?.updatedAt) {
    const diffSec = (now.getTime() - new Date(existingOtp.updatedAt).getTime()) / 1000;
    if (diffSec < RESEND_COOLDOWN_SEC) {
      return NextResponse.json({ success: false, message: "too many requests" }, { status: 429 });
    }
  }

  const code = generateCode5();
  const codeHash = hashCode(code);
  const expiresAt = new Date(now.getTime() + OTP_TTL_MIN * 60 * 1000);

  // ✅ upsert: یک OTP فعال برای phone+purpose
  await Otp.updateOne(
    { phone: normalizedPhone, purpose },
    { $set: { codeHash, expiresAt, attempts: 0, blockedUntil: null } },
    { upsert: true }
  );

  try {
    await sendOtpViaIpPanel({ phone: normalizedPhone, code });
  } catch (e) {
    // اگر ارسال SMS fail شد، OTP رو پاک کن تا کد “بی‌صاحب” نمونه
    await Otp.deleteOne({ phone: normalizedPhone, purpose });
    return NextResponse.json({ success: false, message: "sms failed" }, { status: 502 });
  }

  return NextResponse.json({ success: true, message: "otp sent", expiresAt }, { status: 201 });
}
// app/api/auth/otp/resend/route.js
import crypto from "crypto";
import connectToDB from "@/configs/db";
import Otp from "@/models/Otp";
import { NextResponse } from "next/server";

const OTP_TTL_MIN = 5;
const RESEND_COOLDOWN_SEC = 60;

const normalizePhone = (input) => {
  let p = String(input || "").trim();
  if (p.startsWith("+98")) p = "0" + p.slice(3);
  if (p.startsWith("98")) p = "0" + p.slice(2);
  return p;
};

const hashCode = (code) => crypto.createHash("sha256").update(String(code)).digest("hex");
const generateCode5 = () => Math.floor(10000 + Math.random() * 90000);

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
  if (!smsResponse.ok) throw new Error(data?.message || "IPPANEL_ERROR");
  return data;
}

export async function POST(req) {
  await connectToDB();

  const { phone, purpose = "signup" } = await req.json();
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) return NextResponse.json({ success: false, message: "phone required" }, { status: 400 });

  const otp = await Otp.findOne({ phone: normalizedPhone, purpose }).select("updatedAt blockedUntil");
  if (!otp) return NextResponse.json({ success: false, message: "otp not found, request again" }, { status: 404 });

  const now = new Date();

  if (otp.blockedUntil && otp.blockedUntil > now) {
    return NextResponse.json({ success: false, message: "otp temporarily blocked" }, { status: 429 });
  }

  const diffSec = (now.getTime() - new Date(otp.updatedAt).getTime()) / 1000;
  if (diffSec < RESEND_COOLDOWN_SEC) {
    return NextResponse.json({ success: false, message: "too many requests" }, { status: 429 });
  }

  const code = generateCode5();
  const codeHash = hashCode(code);
  const expiresAt = new Date(now.getTime() + OTP_TTL_MIN * 60 * 1000);

  await Otp.updateOne(
    { phone: normalizedPhone, purpose },
    { $set: { codeHash, expiresAt, attempts: 0, blockedUntil: null } }
  );

  try {
    await sendOtpViaIpPanel({ phone: normalizedPhone, code });
  } catch {
    return NextResponse.json({ success: false, message: "sms failed" }, { status: 502 });
  }

  return NextResponse.json({ success: true, message: "otp resent", expiresAt }, { status: 200 });
}
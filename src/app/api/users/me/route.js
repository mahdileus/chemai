// app/api/users/me/route.js
import connectToDB from "@/configs/db";
import User from "@/models/User";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/utils/auth-server";

const ACCESS_COOKIE_NAME = "token";

const pick = (obj, keys) => {
  const out = {};
  for (const k of keys) if (obj?.[k] !== undefined) out[k] = obj[k];
  return out;
};

export async function PATCH(req) {
  await connectToDB();

  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ success: false, message: "unauthorized" }, { status: 401 });

  const payload = verifyAccessToken(token);
  if (!payload?.sub) return NextResponse.json({ success: false, message: "unauthorized" }, { status: 401 });

  const body = await req.json();

  // ✅ مجازها
  const allowedTop = ["accountType", "nationalCode", "iban", "avatar"];
  const updateData = pick(body, allowedTop);

  // trim
  if (typeof updateData.nationalCode === "string") updateData.nationalCode = updateData.nationalCode.trim();
  if (typeof updateData.iban === "string") updateData.iban = updateData.iban.trim();
  if (typeof updateData.avatar === "string") updateData.avatar = updateData.avatar.trim();

  // legalInfo whitelist
  if (body.legalInfo && typeof body.legalInfo === "object") {
    const legalAllowed = ["companyName", "companyNationalId", "registrationNo", "economicCode"];
    const li = pick(body.legalInfo, legalAllowed);

    for (const [k, v] of Object.entries(li)) {
      updateData[`legalInfo.${k}`] = typeof v === "string" ? v.trim() : v;
    }
  }

  if (updateData.accountType && !["REAL", "LEGAL"].includes(updateData.accountType)) {
    return NextResponse.json({ success: false, message: "invalid accountType" }, { status: 400 });
  }

  const user = await User.findById(payload.sub).select("_id accountType legalInfo");
  if (!user) return NextResponse.json({ success: false, message: "user not found" }, { status: 404 });

  const effectiveAccountType = updateData.accountType || user.accountType;

  // LEGAL => companyName required
  if (effectiveAccountType === "LEGAL") {
    const companyName =
      (updateData["legalInfo.companyName"] ?? user.legalInfo?.companyName ?? "").toString().trim();
    if (!companyName) {
      return NextResponse.json(
        { success: false, message: "companyName is required for LEGAL accounts", field: "legalInfo.companyName" },
        { status: 400 }
      );
    }
  }

  // REAL => پاکسازی legalInfo
  if (updateData.accountType === "REAL") {
    updateData["legalInfo.companyName"] = "";
    updateData["legalInfo.companyNationalId"] = "";
    updateData["legalInfo.registrationNo"] = "";
    updateData["legalInfo.economicCode"] = "";
  }

  const updated = await User.findByIdAndUpdate(
    payload.sub,
    { $set: updateData },
    { new: true, select: "_id firstName lastName phone email chemaiCode accountType nationalCode iban legalInfo avatar" }
  );

  return NextResponse.json({ success: true, message: "profile updated", data: updated }, { status: 200 });
}
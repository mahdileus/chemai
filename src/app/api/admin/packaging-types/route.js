import connectToDB from "@/configs/db";
import PackagingType from "@/models/PackagingType";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/utils/require-admin";

export async function GET(req) {
  await connectToDB();
  const admin = await requireAdmin();
  if (!admin.ok) return admin.res;

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const isActive = searchParams.get("isActive");

  const filter = {};

  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { code: { $regex: q, $options: "i" } },
    ];
  }

  if (isActive === "true") filter.isActive = true;
  if (isActive === "false") filter.isActive = false;

  const items = await PackagingType.find(filter).sort({ createdAt: -1 }).lean();

  return NextResponse.json({ success: true, data: items }, { status: 200 });
}

export async function POST(req) {
  await connectToDB();
  const admin = await requireAdmin();
  if (!admin.ok) return admin.res;

  try {
    const body = await req.json();

    const title = String(body.title || "").trim();
    const code = String(body.code || "").trim().toUpperCase();

    if (!title || !code) {
      return NextResponse.json(
        { success: false, message: "title و code الزامی هستند" },
        { status: 400 }
      );
    }

    const exists = await PackagingType.findOne({ code }).select("_id");
    if (exists) {
      return NextResponse.json(
        { success: false, message: "کد تکراری است" },
        { status: 409 }
      );
    }

    const created = await PackagingType.create({
      title,
      code,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, message: "خطا در ساخت نوع بسته‌بندی" },
      { status: 500 }
    );
  }
}
import connectToDB from "@/configs/db";
import Grade from "@/models/Grade";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/utils/require-admin";

export async function GET(req) {
  await connectToDB();
  const admin = await requireAdmin();
  if (!admin.ok) return admin.res;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const isActive = searchParams.get("isActive");

  const filter = {};
  if (typeof isActive === "string") filter.isActive = isActive === "true";
  if (q) filter.title = { $regex: q.trim(), $options: "i" };

  const items = await Grade.find(filter).sort({ order: 1, createdAt: -1 }).lean();
  return NextResponse.json({ success: true, data: items }, { status: 200 });
}

export async function POST(req) {
  await connectToDB();
  const admin = await requireAdmin();
  if (!admin.ok) return admin.res;

  const body = await req.json();
  const title = String(body.title || "").trim();
  const code = String(body.code || "").trim();
  const order = Number(body.order || 0);
  const isActive = body.isActive !== undefined ? Boolean(body.isActive) : true;

  if (title.length < 2) {
    return NextResponse.json({ success: false, message: "title is required" }, { status: 400 });
  }

  const created = await Grade.create({ title, code, order, isActive });
  return NextResponse.json({ success: true, data: created }, { status: 201 });
}
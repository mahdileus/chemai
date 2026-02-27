import connectToDB from "@/configs/db";
import Country from "@/models/Country";
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

  const items = await Country.find(filter).sort({ order: 1, createdAt: -1 }).lean();
  return NextResponse.json({ success: true, data: items }, { status: 200 });
}

export async function POST(req) {
  await connectToDB();
  const admin = await requireAdmin();
  if (!admin.ok) return admin.res;

  const body = await req.json();
  const title = String(body.title || "").trim();
  const iso2 = String(body.iso2 || "").trim().toUpperCase();
  const iso3 = String(body.iso3 || "").trim().toUpperCase();
  const order = Number(body.order || 0);
  const isActive = body.isActive !== undefined ? Boolean(body.isActive) : true;

  if (title.length < 2) {
    return NextResponse.json({ success: false, message: "title is required" }, { status: 400 });
  }

  const created = await Country.create({ title, iso2, iso3, order, isActive });
  return NextResponse.json({ success: true, data: created }, { status: 201 });
}
import connectToDB from "@/configs/db";
import Manufacturer from "@/models/Manufacturer";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/utils/require-admin";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  await connectToDB();
  const admin = await requireAdmin();
  if (!admin.ok) return admin.res;

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ success: false, message: "invalid id" }, { status: 400 });

  const item = await Manufacturer.findById(id).lean();
  if (!item) return NextResponse.json({ success: false, message: "not found" }, { status: 404 });

  return NextResponse.json({ success: true, data: item }, { status: 200 });
}

export async function PATCH(req, { params }) {
  await connectToDB();
  const admin = await requireAdmin();
  if (!admin.ok) return admin.res;

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ success: false, message: "invalid id" }, { status: 400 });

  const body = await req.json();
  const update = {};

  if (body.title !== undefined) update.title = String(body.title || "").trim();
  if (body.brand !== undefined) update.brand = String(body.brand || "").trim();
  if (body.website !== undefined) update.website = String(body.website || "").trim();
  if (body.country !== undefined) update.country = body.country || null;
  if (body.order !== undefined) update.order = Number(body.order || 0);
  if (body.isActive !== undefined) update.isActive = Boolean(body.isActive);

  const updated = await Manufacturer.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
  if (!updated) return NextResponse.json({ success: false, message: "not found" }, { status: 404 });

  return NextResponse.json({ success: true, data: updated }, { status: 200 });
}

export async function DELETE(req, { params }) {
  await connectToDB();
  const admin = await requireAdmin();
  if (!admin.ok) return admin.res;

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ success: false, message: "invalid id" }, { status: 400 });

  await Manufacturer.findByIdAndDelete(id);
  return NextResponse.json({ success: true, message: "deleted" }, { status: 200 });
}
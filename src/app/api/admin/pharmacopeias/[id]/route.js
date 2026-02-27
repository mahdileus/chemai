import mongoose from "mongoose";
import connectToDB from "@/configs/db";
import Pharmacopeia from "@/models/Pharmacopeia";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/utils/require-admin";

export async function GET(req, { params }) {
  await connectToDB();
  const admin = await requireAdmin();
  if (!admin.ok) return admin.res;

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, message: "id نامعتبر" }, { status: 400 });
  }

  const item = await Pharmacopeia.findById(id).lean();
  if (!item) {
    return NextResponse.json({ success: false, message: "یافت نشد" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: item }, { status: 200 });
}

export async function PATCH(req, { params }) {
  await connectToDB();
  const admin = await requireAdmin();
  if (!admin.ok) return admin.res;

  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "id نامعتبر" }, { status: 400 });
    }

    const body = await req.json();
    const update = {};

    if (body.title !== undefined) update.title = String(body.title || "").trim();
    if (body.code !== undefined) update.code = String(body.code || "").trim().toUpperCase();
    if (body.isActive !== undefined) update.isActive = Boolean(body.isActive);

    if (update.code) {
      const duplicate = await Pharmacopeia.findOne({
        code: update.code,
        _id: { $ne: id },
      }).select("_id");

      if (duplicate) {
        return NextResponse.json(
          { success: false, message: "کد تکراری است" },
          { status: 409 }
        );
      }
    }

    const updated = await Pharmacopeia.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ success: false, message: "یافت نشد" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: "خطا در ویرایش فارماکوپه" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  await connectToDB();
  const admin = await requireAdmin();
  if (!admin.ok) return admin.res;

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ success: false, message: "invalid id" }, { status: 400 });

  await Pharmacopeia.findByIdAndDelete(id);
  return NextResponse.json({ success: true, message: "deleted" }, { status: 200 });
}
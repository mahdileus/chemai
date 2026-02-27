import { NextResponse } from "next/server";
import Department from "@/models/Department";
import connectToDB from "@/configs/db";

export async function PUT(req, { params }) {
  try {
    await connectToDB();
    const { id } = await params;
    const body = await req.json();

    const updated = await Department.findByIdAndUpdate(id, body, { new: true });

    return NextResponse.json({ ok: true, department: updated });
  } catch (err) {
    return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectToDB();
    const { id } = params;

    await Department.findByIdAndDelete(id);

    return NextResponse.json({ ok: true, message: "حذف شد" });
  } catch (err) {
    return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
  }
}

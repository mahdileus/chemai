import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Ticket from "@/models/Ticket"
import connectToDB from "@/configs/db";
import { authUser } from "@/utils/auth-server";

export async function POST(req) {
  try {
    await connectToDB();

    const user = await authUser();
    if (!user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const { title, body: text, department, priority } = data;

    if (!title?.trim() || !text?.trim() || !department)
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });

    if (!mongoose.Types.ObjectId.isValid(department))
      return NextResponse.json({ message: "Invalid department" }, { status: 400 });

    const ticket = await Ticket.create({
      title: title.trim(),
      body: text.trim(),
      department,
      priority: priority || "medium",
      user: user._id,
      replies: [
      ],
    });

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
export async function GET() {
  try {
    await connectToDB();
    const user = await authUser();

    if (!user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const tickets = await Ticket.find({ user: user._id })
      .select("title status priority department createdAt lastReplyAt")
      .populate("department", "name")
      .sort({ lastReplyAt: -1 })
      .lean();

    return NextResponse.json({ tickets });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

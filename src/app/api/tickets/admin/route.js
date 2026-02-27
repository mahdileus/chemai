import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";
import Ticket from "@/models/Ticket";
import "@/models/User";
import "@/models/Department";
import { authUser } from "@/utils/auth-server";

export async function GET() {
  await connectToDB();

  const user = await authUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const tickets = await Ticket.find({})
    .populate("user", "name email")
    .populate("department", "title")
    .sort({ lastReplyAt: -1, createdAt: -1 })
    .lean();

  return NextResponse.json({ tickets });
}

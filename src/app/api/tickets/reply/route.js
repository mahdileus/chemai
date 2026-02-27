import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Ticket from "@/models/Ticket"
import connectToDB from "@/configs/db";
import { authUser } from "@/utils/auth-server";
export async function POST(req) {
  await connectToDB();
  const user = await authUser();

  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { ticketID, message } = await req.json();

  await Ticket.updateOne(
    { _id: ticketID },
    {
      $push: {
        replies: {
          user: user._id,
          message,
          isAdmin: false,
          readByUser: true,
          readByAdmin: false,
        },
      },
      $set: {
        lastReplyAt: new Date(),
        status: "pending",
      },
    }
  );

  return NextResponse.json({ ok: true });
}

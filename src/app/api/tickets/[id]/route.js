import connectToDB from "@/configs/db";
import Ticket from "@/models/Ticket";
import { authUser } from "@/utils/auth-server";

import connectToDB from "@/configs/db";
import Ticket from "@/models/Ticket";
import { authUser } from "@/utils/auth-server";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  try {
    await connectToDB();

    const user = await authUser();
    if (!user)
      return Response.json({ message: "Unauthorized" }, { status: 401 });

    if (!mongoose.Types.ObjectId.isValid(params.id))
      return Response.json({ message: "Invalid id" }, { status: 400 });

    // ادمین همه را می‌بیند — کاربر فقط تیکت خودش
    const query =
      user.role === "admin"
        ? { _id: params.id }
        : { _id: params.id, user: user._id };

    // mark admin messages as read by user
    if (user.role !== "admin") {
      await Ticket.updateOne(
        { _id: params.id, user: user._id },
        {
          $set: {
            "replies.$[r].readByUser": true,
          },
        },
        {
          arrayFilters: [
            { "r.isAdmin": true, "r.readByUser": false }
          ],
        }
      );
    }

    const ticket = await Ticket.findOne(query)
      .populate("user", "name email")
      .populate("department", "name")
      .populate("assignedTo", "name email")
      .populate("replies.user", "name email")
      .lean();

    if (!ticket)
      return Response.json({ message: "Ticket not found" }, { status: 404 });

    return Response.json({ ticket });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    await connectToDB();
    const user = await authUser();

    if (!user)
      return Response.json({ message: "Unauthorized" }, { status: 401 });

    if (!mongoose.Types.ObjectId.isValid(params.id))
      return Response.json({ message: "Invalid id" }, { status: 400 });

    const { message } = await req.json();
    if (!message?.trim())
      return Response.json({ message: "Message required" }, { status: 400 });

    const ticket = await Ticket.findOne({
      _id: params.id,
      user: user._id,
    });

    if (!ticket)
      return Response.json({ message: "Ticket not found" }, { status: 404 });

    if (ticket.status === "closed")
      return Response.json({ message: "Ticket closed" }, { status: 400 });

    ticket.replies.push({
      user: user._id,
      message: message.trim(),
      isAdmin: false,
      readByUser: true,
      readByAdmin: false,
    });

    ticket.status = "pending";
    ticket.lastReplyAt = new Date();

    await ticket.save();

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectToDB();
    const user = await authUser();

    if (!user || user.role !== "admin")
      return Response.json({ message: "Admin only" }, { status: 403 });

    if (!mongoose.Types.ObjectId.isValid(params.id))
      return Response.json({ message: "Invalid id" }, { status: 400 });

    const { status } = await req.json();

    const allowed = ["open", "pending", "answered", "closed"];
    if (!allowed.includes(status))
      return Response.json({ message: "Invalid status" }, { status: 400 });

    const ticket = await Ticket.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );

    if (!ticket)
      return Response.json({ message: "Not found" }, { status: 404 });

    return Response.json({ ticket });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}


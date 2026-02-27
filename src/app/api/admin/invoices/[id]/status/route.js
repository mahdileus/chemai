// app/api/invoices/[id]/route.js
import connectToDB from "@/configs/db";
import Invoice from "@/models/Invoice";
import { NextResponse } from "next/server";
import { authUser } from "@/utils/auth-server";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  try {
    await connectToDB();

    const user = await authUser();
    if (!user?._id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid invoice id" }, { status: 400 });
    }

    const invoice = await Invoice.findById(id)
      .select(
        "invoiceNo orderDate status subtotal items buyer buyerSnapshot seller adminNote createdAt updatedAt"
      )
      .lean();

    if (!invoice) {
      return NextResponse.json({ success: false, message: "Invoice not found" }, { status: 404 });
    }

    const isAdmin = user.role === "ADMIN";
    const isOwner = String(invoice.buyer) === String(user._id);

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "ok",
        data: {
          _id: String(invoice._id),
          invoiceNo: invoice.invoiceNo,
          orderDate: invoice.orderDate,
          createdAt: invoice.createdAt,
          updatedAt: invoice.updatedAt,
          status: invoice.status,
          subtotal: invoice.subtotal,
          adminNote: invoice.adminNote || "",
          buyerSnapshot: invoice.buyerSnapshot || {},
          seller: invoice.seller ? String(invoice.seller) : null,
          items: (invoice.items || []).map((it) => ({
            productRef: String(it.productRef),
            productName: it.productName,
            packaging: it.packaging,
            requestedDate: it.requestedDate,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            totalPrice: it.totalPrice,
            notes: it.notes || "",
          })),
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.log("Get Invoice Error ->", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
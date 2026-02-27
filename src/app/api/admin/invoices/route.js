// app/api/admin/invoices/route.js
import connectToDB from "@/configs/db";
import Invoice from "@/models/Invoice";
import { NextResponse } from "next/server";
import { authUser } from "@/utils/auth-server";

export async function GET(req) {
  try {
    await connectToDB();

    const user = await authUser();
    if (!user?._id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);

    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 20)));
    const skip = (page - 1) * limit;

    const status = searchParams.get("status"); // optional
    const q = {};
    if (status) q.status = status;

    const [items, total] = await Promise.all([
      Invoice.find(q)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("invoiceNo orderDate status subtotal buyerSnapshot createdAt updatedAt adminNote items")
        .lean(),
      Invoice.countDocuments(q),
    ]);

    const data = items.map((inv) => ({
      _id: String(inv._id),
      invoiceNo: inv.invoiceNo,
      orderDate: inv.orderDate,
      createdAt: inv.createdAt,
      updatedAt: inv.updatedAt,
      status: inv.status,
      subtotal: inv.subtotal,
      adminNote: inv.adminNote || "",
      buyerName: `${inv?.buyerSnapshot?.firstName || ""} ${inv?.buyerSnapshot?.lastName || ""}`.trim(),
      buyerPhone: inv?.buyerSnapshot?.phone || "",
      itemCount: Array.isArray(inv.items) ? inv.items.length : 0,
      firstItemName: inv.items?.[0]?.productName || "",
    }));

    return NextResponse.json(
      {
        success: true,
        message: "ok",
        data,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.log("Admin List Invoices Error ->", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
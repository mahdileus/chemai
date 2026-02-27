// app/api/invoices/my/route.js
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

    const { searchParams } = new URL(req.url);

    // pagination (اختیاری)
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 10)));
    const skip = (page - 1) * limit;

    // فیلتر وضعیت (اختیاری)
    const status = searchParams.get("status"); // مثلا SUBMITTED
    const query = { buyer: user._id };
    if (status) query.status = status;

    const [items, total] = await Promise.all([
      Invoice.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("invoiceNo orderDate status subtotal items buyerSnapshot createdAt")
        .lean(),
      Invoice.countDocuments(query),
    ]);

    // خروجی سبک برای UI
    const data = items.map((inv) => ({
      _id: String(inv._id),
      invoiceNo: inv.invoiceNo,
      orderDate: inv.orderDate,
      createdAt: inv.createdAt,
      status: inv.status,
      subtotal: inv.subtotal,
      buyerName: `${inv?.buyerSnapshot?.firstName || ""} ${inv?.buyerSnapshot?.lastName || ""}`.trim(),
      // خلاصه آیتم‌ها برای لیست
      itemCount: Array.isArray(inv.items) ? inv.items.length : 0,
      firstItem: inv.items?.[0]
        ? {
            productName: inv.items[0].productName,
            quantity: inv.items[0].quantity,
            packaging: inv.items[0].packaging,
            requestedDate: inv.items[0].requestedDate,
          }
        : null,
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
    console.log("Get My Invoices Error ->", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
// app/api/invoices/route.js
import connectToDB from "@/configs/db";
import Invoice from "@/models/Invoice";
import Listing from "@/models/Listing";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import { authUser } from "@/utils/auth-server";
import mongoose from "mongoose";

function isValidDate(d) {
  const dt = new Date(d);
  return !Number.isNaN(dt.getTime());
}

function packagingToText(packaging) {
  // packaging: { type, amountPerPack, unit, description }
  if (!packaging) return "";
  const amount = packaging.amountPerPack ?? "";
  const unit = packaging.unit ?? "";
  const desc = packaging.description ? ` - ${packaging.description}` : "";
  return `${amount} ${unit}${desc}`.trim();
}

export async function POST(req) {
  try {
    await connectToDB();

    const user = await authUser();
    if (!user?._id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const items = Array.isArray(body.items) ? body.items : [];

    if (items.length === 0) {
      return NextResponse.json({ success: false, message: "items is required" }, { status: 400 });
    }

    // ✅ همه listingIdها را یکجا بگیر
    const listingIds = items.map((x) => x?.listingId).filter(Boolean);
    if (listingIds.length !== items.length) {
      return NextResponse.json({ success: false, message: "listingId is required for all items" }, { status: 400 });
    }

    // validate ids
    for (const lid of listingIds) {
      if (!mongoose.Types.ObjectId.isValid(lid)) {
        return NextResponse.json({ success: false, message: "invalid listingId", listingId: lid }, { status: 400 });
      }
    }

    const listings = await Listing.find({ _id: { $in: listingIds }, status: "ACTIVE" })
      .select("_id product seller price currency priceUnit packaging")
      .lean();

    const listingMap = new Map(listings.map((l) => [String(l._id), l]));

    // ✅ همه productId ها را هم یکجا
    const productIds = listings.map((l) => l.product).filter(Boolean);
    const products = await Product.find({ _id: { $in: productIds }, isActive: true })
      .select("_id title")
      .lean();
    const productMap = new Map(products.map((p) => [String(p._id), p]));

    const normalizedItems = [];

    for (const it of items) {
      const { listingId, quantity, requestedDate, notes = "" } = it || {};

      const listing = listingMap.get(String(listingId));
      if (!listing) {
        return NextResponse.json(
          { success: false, message: "listing not found or not ACTIVE", listingId },
          { status: 404 }
        );
      }

      const product = productMap.get(String(listing.product));
      if (!product) {
        return NextResponse.json(
          { success: false, message: "product not found or inactive", productId: String(listing.product) },
          { status: 404 }
        );
      }

      if (!isValidDate(requestedDate)) {
        return NextResponse.json({ success: false, message: "requestedDate is invalid" }, { status: 400 });
      }

      const qty = Number(quantity);
      if (!Number.isFinite(qty) || qty < 1) {
        return NextResponse.json({ success: false, message: "quantity must be >= 1" }, { status: 400 });
      }

      const unitPrice = Number(listing.price);
      const totalPrice = qty * unitPrice;

      normalizedItems.push({
        listingRef: listing._id,
        seller: listing.seller,

        productRef: listing.product,
        productName: product.title,

        packagingText: packagingToText(listing.packaging),
        requestedDate: new Date(requestedDate),

        quantity: qty,
        unitPrice,
        totalPrice,
        notes: String(notes || "").trim(),
      });
    }

    const subtotal = normalizedItems.reduce((sum, x) => sum + x.totalPrice, 0);

    const buyerSnapshot = {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
    };

    const invoice = await Invoice.create({
      buyer: user._id,
      buyerSnapshot,
      status: "SUBMITTED",
      items: normalizedItems,
      subtotal,
    });

    return NextResponse.json(
      {
        success: true,
        message: "invoice created",
        data: {
          _id: String(invoice._id),
          invoiceNo: invoice.invoiceNo,
          orderDate: invoice.orderDate,
          status: invoice.status,
          subtotal: invoice.subtotal,
          items: invoice.items,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.log("Create Invoice Error ->", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
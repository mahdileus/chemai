import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDB from "@/configs/db";

import Product from "@/models/Product";
import ProductVariant from "@/models/ProductVariant";

export const runtime = "nodejs";

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function variantPopulateQuery(query) {
  return query
    .populate("pharmacopeia", "title name slug")
    .populate("grade", "title name slug")
    .populate("form", "title name slug")
    .populate("manufacturer", "title name slug")
    .populate("originCountry", "title name code iso2 iso3")
    .populate("allowedPackagingTypes", "title code")
    .populate("product", "title slug category featuredImage");
}

export async function GET(req, context) {
  try {
    await connectToDB();

    const { id } = await context.params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { message: "شناسه محصول نامعتبر است." },
        { status: 400 }
      );
    }

    const product = await Product.findOne({ _id: id, isActive: true })
      .select("_id title")
      .lean();

    if (!product) {
      return NextResponse.json(
        { message: "محصول فعال پیدا نشد." },
        { status: 404 }
      );
    }

    const variants = await variantPopulateQuery(
      ProductVariant.find({ product: id, isActive: true }).sort({ createdAt: -1 })
    ).lean();

    return NextResponse.json({
      product,
      items: variants,
    });
  } catch (error) {
    console.error("GET /api/catalog/products/[id]/variants error:", error);
    return NextResponse.json(
      { message: "خطا در دریافت واریانت‌های محصول." },
      { status: 500 }
    );
  }
}
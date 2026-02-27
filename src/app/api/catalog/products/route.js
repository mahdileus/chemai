import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDB from "@/configs/db";
import Product from "@/models/Product";

export const runtime = "nodejs";

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function productPopulateQuery(query) {
  return query
    .populate("category", "title slug parent level")
    .populate("pharmacopeia", "title name slug")
    .populate("grade", "title name slug")
    .populate("form", "title name slug")
    .populate("manufacturer", "title name slug")
    .populate("originCountry", "title name code iso2 iso3")
    .populate("packagingType", "title code"); // چون گفتی در Product اوکی شد
}

export async function GET(req) {
  try {
    await connectToDB();

    const { searchParams } = new URL(req.url);

    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "20", 10), 1),
      100
    );

    const q = String(searchParams.get("q") || "").trim();
    const categoryId = String(searchParams.get("categoryId") || "").trim();

    const filter = { isActive: true };

    if (categoryId) {
      if (!isValidObjectId(categoryId)) {
        return NextResponse.json(
          { message: "شناسه دسته‌بندی نامعتبر است." },
          { status: 400 }
        );
      }
      filter.category = categoryId;
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { slug: { $regex: q, $options: "i" } },
        { casNumber: { $regex: q, $options: "i" } },
        { hsCode: { $regex: q, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      productPopulateQuery(
        Product.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .select(
            "_id title slug featuredImage category pharmacopeia grade form manufacturer originCountry packagingType casNumber hsCode isActive"
          )
      ).lean(),
      Product.countDocuments(filter),
    ]);

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/catalog/products error:", error);
    return NextResponse.json(
      { message: "خطا در دریافت محصولات کاتالوگ." },
      { status: 500 }
    );
  }
}
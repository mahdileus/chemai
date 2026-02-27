import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDB from "@/configs/db";
import { authUser } from "@/utils/auth-server";
import Product from "@/models/Product";
import Category from "@/models/Category";

export const runtime = "nodejs";

/* ----------------------------- Helpers ----------------------------- */

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function toSlug(input = "") {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeSpecs(specs) {
  if (!Array.isArray(specs)) return [];
  return specs
    .map((item) => ({
      label: String(item?.label ?? "").trim(),
      value: String(item?.value ?? "").trim(),
    }))
    .filter((item) => item.label && item.value);
}

function normalizeImages(images) {
  if (!Array.isArray(images)) return [];
  return images.map((url) => String(url ?? "").trim()).filter(Boolean);
}

async function requireAdmin() {
  await connectToDB();
  const user = await authUser();

  if (!user) {
    return { error: NextResponse.json({ message: "ابتدا وارد حساب شوید." }, { status: 401 }) };
  }

  if (user.role !== "ADMIN") {
    return { error: NextResponse.json({ message: "دسترسی غیرمجاز." }, { status: 403 }) };
  }

  return { user };
}

/* -------------------------------- GET ------------------------------- */
/**
 * GET /api/admin/products
 * Query:
 * page, limit, q, category, isActive
 */
export async function GET(req) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);

    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10), 1), 100);
    const q = String(searchParams.get("q") || "").trim();
    const category = String(searchParams.get("category") || "").trim();
    const isActiveParam = String(searchParams.get("isActive") || "").trim();

    const filter = {};

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { slug: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { casNumber: { $regex: q, $options: "i" } },
        { hsCode: { $regex: q, $options: "i" } },
      ];
    }

    if (category) {
      if (!isValidObjectId(category)) {
        return NextResponse.json({ message: "شناسه دسته‌بندی نامعتبر است." }, { status: 400 });
      }
      filter.category = category;
    }

    if (isActiveParam === "true") filter.isActive = true;
    if (isActiveParam === "false") filter.isActive = false;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "title slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
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
    console.error("GET /api/admin/products error:", error);
    return NextResponse.json({ message: "خطا در دریافت محصولات." }, { status: 500 });
  }
}

/* -------------------------------- POST ------------------------------ */
/**
 * POST /api/admin/products
 * body:
 * {
 *   title: string,
 *   slug?: string,
 *   category: ObjectId,
 *   description?: string,
 *   images?: string[],
 *   casNumber?: string,
 *   hsCode?: string,
 *   isActive?: boolean,
 *   specs?: [{ label, value }]
 * }
 */
export async function POST(req) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await req.json();

    const title = String(body?.title ?? "").trim();
    const category = String(body?.category ?? "").trim();

    let slug = String(body?.slug ?? "").trim();
    const description = String(body?.description ?? "").trim();
    const images = normalizeImages(body?.images);
    const casNumber = String(body?.casNumber ?? "").trim();
    const hsCode = String(body?.hsCode ?? "").trim();
    const isActive = typeof body?.isActive === "boolean" ? body.isActive : true;
    const specs = normalizeSpecs(body?.specs);

    if (!title) {
      return NextResponse.json({ message: "عنوان محصول الزامی است." }, { status: 400 });
    }

    if (!category || !isValidObjectId(category)) {
      return NextResponse.json({ message: "دسته‌بندی معتبر نیست." }, { status: 400 });
    }

    const categoryExists = await Category.exists({ _id: category });
    if (!categoryExists) {
      return NextResponse.json({ message: "دسته‌بندی پیدا نشد." }, { status: 404 });
    }

    slug = toSlug(slug || title);
    if (!slug) {
      return NextResponse.json({ message: "اسلاگ معتبر تولید نشد." }, { status: 400 });
    }

    const duplicateSlug = await Product.exists({ slug });
    if (duplicateSlug) {
      return NextResponse.json({ message: "این اسلاگ قبلاً ثبت شده است." }, { status: 409 });
    }

    const created = await Product.create({
      title,
      slug,
      category,
      description,
      images,
      casNumber: casNumber || undefined,
      hsCode: hsCode || undefined,
      isActive,
      specs,
    });

    const product = await Product.findById(created._id)
      .populate("category", "title slug")
      .lean();

    return NextResponse.json(
      {
        message: "محصول با موفقیت ایجاد شد.",
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/products error:", error);

    if (error?.code === 11000) {
      return NextResponse.json({ message: "اسلاگ تکراری است." }, { status: 409 });
    }

    return NextResponse.json({ message: "خطا در ایجاد محصول." }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDB from "@/configs/db";
import { authUser } from "@/utils/auth-server";
import Product from "@/models/Product";
import Category from "@/models/Category";
import ProductVariant from "@/models/ProductVariant";
import Listing from "@/models/Listing";

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
export async function GET(req, { params }) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const id = params.id;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: "شناسه محصول نامعتبر است." }, { status: 400 });
    }

    const product = await Product.findById(id).populate("category", "title slug").lean();

    if (!product) {
      return NextResponse.json({ message: "محصول پیدا نشد." }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("GET /api/admin/products/[id] error:", error);
    return NextResponse.json({ message: "خطا در دریافت محصول." }, { status: 500 });
  }
}

/* -------------------------------- PATCH ------------------------------ */
export async function PATCH(req, { params }) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const id = params.id;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: "شناسه محصول نامعتبر است." }, { status: 400 });
    }

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ message: "محصول پیدا نشد." }, { status: 404 });
    }

    const body = await req.json();
    const update = {};

    if (body.title !== undefined) {
      const title = String(body.title ?? "").trim();
      if (!title) {
        return NextResponse.json({ message: "عنوان محصول نمی‌تواند خالی باشد." }, { status: 400 });
      }
      update.title = title;
    }

    if (body.category !== undefined) {
      const category = String(body.category ?? "").trim();
      if (!isValidObjectId(category)) {
        return NextResponse.json({ message: "شناسه دسته‌بندی نامعتبر است." }, { status: 400 });
      }

      const categoryExists = await Category.exists({ _id: category });
      if (!categoryExists) {
        return NextResponse.json({ message: "دسته‌بندی پیدا نشد." }, { status: 404 });
      }

      update.category = category;
    }

    if (body.description !== undefined) {
      update.description = String(body.description ?? "").trim();
    }

    if (body.images !== undefined) {
      update.images = normalizeImages(body.images);
    }

    if (body.casNumber !== undefined) {
      update.casNumber = String(body.casNumber ?? "").trim();
    }

    if (body.hsCode !== undefined) {
      update.hsCode = String(body.hsCode ?? "").trim();
    }

    if (body.isActive !== undefined) {
      if (typeof body.isActive !== "boolean") {
        return NextResponse.json({ message: "فیلد isActive باید بولین باشد." }, { status: 400 });
      }
      update.isActive = body.isActive;
    }

    if (body.specs !== undefined) {
      update.specs = normalizeSpecs(body.specs);
    }

    // slug (اگر slug یا title تغییر کرد)
    if (body.slug !== undefined || body.title !== undefined) {
      const rawSlug = body.slug !== undefined ? String(body.slug ?? "").trim() : "";
      const sourceTitle = update.title ?? product.title;
      const nextSlug = toSlug(rawSlug || sourceTitle);

      if (!nextSlug) {
        return NextResponse.json({ message: "اسلاگ معتبر نیست." }, { status: 400 });
      }

      const duplicateSlug = await Product.exists({
        _id: { $ne: product._id },
        slug: nextSlug,
      });

      if (duplicateSlug) {
        return NextResponse.json({ message: "این اسلاگ قبلاً ثبت شده است." }, { status: 409 });
      }

      update.slug = nextSlug;
    }

    const updated = await Product.findByIdAndUpdate(product._id, update, {
      new: true,
      runValidators: true,
    })
      .populate("category", "title slug")
      .lean();

    return NextResponse.json({
      message: "محصول با موفقیت ویرایش شد.",
      product: updated,
    });
  } catch (error) {
    console.error("PATCH /api/admin/products/[id] error:", error);

    if (error?.code === 11000) {
      return NextResponse.json({ message: "اسلاگ تکراری است." }, { status: 409 });
    }

    return NextResponse.json({ message: "خطا در ویرایش محصول." }, { status: 500 });
  }
}

/* -------------------------------- DELETE ----------------------------- */
/**
 * پیش‌فرض: حذف نرم (isActive=false)
 * حذف واقعی فقط با ?hard=true و اگر وابستگی نداشته باشد
 */
export async function DELETE(req, { params }) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const id = params.id;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: "شناسه محصول نامعتبر است." }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const hardDelete = searchParams.get("hard") === "true";

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ message: "محصول پیدا نشد." }, { status: 404 });
    }

    if (!hardDelete) {
      product.isActive = false;
      await product.save();

      return NextResponse.json({
        message: "محصول غیرفعال شد (حذف نرم).",
        productId: String(product._id),
      });
    }

    // حذف واقعی فقط اگر وابستگی نداشته باشد
    const [variantCount, listingCount] = await Promise.all([
      ProductVariant.countDocuments({ product: id }),
      Listing.countDocuments({ product: id }),
    ]);

    if (variantCount > 0 || listingCount > 0) {
      return NextResponse.json(
        {
          message: "این محصول وابسته به Variant/Listing است و حذف واقعی ممکن نیست.",
          refs: { variantCount, listingCount },
        },
        { status: 409 }
      );
    }

    await Product.deleteOne({ _id: id });

    return NextResponse.json({
      message: "محصول به‌صورت کامل حذف شد.",
    });
  } catch (error) {
    console.error("DELETE /api/admin/products/[id] error:", error);
    return NextResponse.json({ message: "خطا در حذف محصول." }, { status: 500 });
  }
}
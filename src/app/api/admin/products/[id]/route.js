import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDB from "@/configs/db";
import { authUser } from "@/utils/auth-server";

import Product from "@/models/Product";
import Category from "@/models/Category";
import Pharmacopeia from "@/models/Pharmacopeia";
import Grade from "@/models/Grade";
import Form from "@/models/Form";
import Manufacturer from "@/models/Manufacturer";
import Country from "@/models/Country";
import PackagingType from "@/models/PackagingType";

import ProductVariant from "@/models/ProductVariant";
import Listing from "@/models/Listing";

export const runtime = "nodejs";

/* ----------------------------- Helpers ----------------------------- */

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function normalizeOptionalObjectId(value) {
  const v = String(value ?? "").trim();
  if (!v || v === "null" || v === "undefined") return null;
  if (!isValidObjectId(v)) return "__INVALID__";
  return v;
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
    return {
      error: NextResponse.json({ message: "ابتدا وارد حساب شوید." }, { status: 401 }),
    };
  }

  if (user.role !== "ADMIN") {
    return {
      error: NextResponse.json({ message: "دسترسی غیرمجاز." }, { status: 403 }),
    };
  }

  return { user };
}

function productPopulateQuery(query) {
  return query
    .populate("category", "title slug parent level")
    .populate("pharmacopeia", "title name slug")
    .populate("grade", "title name slug")
    .populate("form", "title name slug")
    .populate("manufacturer", "title name slug")
    .populate("originCountry", "title name code iso2 iso3")
    .populate("packagingType", "title code"); // اگر در Product schema داری
}

async function validateReferencedEntities({
  category,
  pharmacopeia,
  grade,
  form,
  manufacturer,
  originCountry,
  packagingType,
}) {
  if (category) {
    const categoryExists = await Category.exists({ _id: category });
    if (!categoryExists) return "دسته‌بندی پیدا نشد.";
  }

  if (pharmacopeia) {
    const exists = await Pharmacopeia.exists({ _id: pharmacopeia });
    if (!exists) return "فارماکوپه نامعتبر است.";
  }

  if (grade) {
    const exists = await Grade.exists({ _id: grade });
    if (!exists) return "گرید نامعتبر است.";
  }

  if (form) {
    const exists = await Form.exists({ _id: form });
    if (!exists) return "فرم نامعتبر است.";
  }

  if (manufacturer) {
    const exists = await Manufacturer.exists({ _id: manufacturer });
    if (!exists) return "سازنده نامعتبر است.";
  }

  if (originCountry) {
    const exists = await Country.exists({ _id: originCountry });
    if (!exists) return "کشور سازنده نامعتبر است.";
  }

  if (packagingType) {
    const exists = await PackagingType.exists({ _id: packagingType });
    if (!exists) return "نوع بسته‌بندی نامعتبر است.";
  }

  return null;
}

/* -------------------------------- GET ------------------------------- */
export async function GET(req, context) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { id } = await context.params; // ✅ مهم

    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: "شناسه محصول نامعتبر است." }, { status: 400 });
    }

    const product = await productPopulateQuery(Product.findById(id)).lean();

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
export async function PATCH(req, context) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { id } = await context.params; // ✅ مهم

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
      update.category = category;
    }

    if (body.shortDescription !== undefined) {
      update.shortDescription = String(body.shortDescription ?? "").trim();
    }

    if (body.description !== undefined) {
      update.description = String(body.description ?? "").trim();
    }

    if (body.featuredImage !== undefined) {
      update.featuredImage = String(body.featuredImage ?? "").trim();
    }

    if (body.images !== undefined) {
      update.images = normalizeImages(body.images);
    }

    if (body.pharmacopeia !== undefined) {
      const v = normalizeOptionalObjectId(body.pharmacopeia);
      if (v === "__INVALID__") {
        return NextResponse.json({ message: "فارماکوپه نامعتبر است." }, { status: 400 });
      }
      update.pharmacopeia = v;
    }

    if (body.grade !== undefined) {
      const v = normalizeOptionalObjectId(body.grade);
      if (v === "__INVALID__") {
        return NextResponse.json({ message: "گرید نامعتبر است." }, { status: 400 });
      }
      update.grade = v;
    }

    if (body.form !== undefined) {
      const v = normalizeOptionalObjectId(body.form);
      if (v === "__INVALID__") {
        return NextResponse.json({ message: "فرم نامعتبر است." }, { status: 400 });
      }
      update.form = v;
    }

    if (body.manufacturer !== undefined) {
      const v = normalizeOptionalObjectId(body.manufacturer);
      if (v === "__INVALID__") {
        return NextResponse.json({ message: "سازنده نامعتبر است." }, { status: 400 });
      }
      update.manufacturer = v;
    }

    if (body.originCountry !== undefined) {
      const v = normalizeOptionalObjectId(body.originCountry);
      if (v === "__INVALID__") {
        return NextResponse.json({ message: "کشور سازنده نامعتبر است." }, { status: 400 });
      }
      update.originCountry = v;
    }

    // اگر packagingType داخل Product schema داری
    if (body.packagingType !== undefined) {
      const v = normalizeOptionalObjectId(body.packagingType);
      if (v === "__INVALID__") {
        return NextResponse.json({ message: "نوع بسته‌بندی نامعتبر است." }, { status: 400 });
      }
      update.packagingType = v;
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

    // slug
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

    const refError = await validateReferencedEntities({
      category: update.category ?? String(product.category),
      pharmacopeia: update.pharmacopeia !== undefined ? update.pharmacopeia : product.pharmacopeia,
      grade: update.grade !== undefined ? update.grade : product.grade,
      form: update.form !== undefined ? update.form : product.form,
      manufacturer: update.manufacturer !== undefined ? update.manufacturer : product.manufacturer,
      originCountry:
        update.originCountry !== undefined ? update.originCountry : product.originCountry,
      packagingType:
        update.packagingType !== undefined ? update.packagingType : product.packagingType,
    });

    if (refError) {
      return NextResponse.json({ message: refError }, { status: 404 });
    }

    const updated = await productPopulateQuery(
      Product.findByIdAndUpdate(product._id, update, {
        new: true,
        runValidators: true,
      })
    ).lean();

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
export async function DELETE(req, context) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { id } = await context.params; // ✅ مهم

    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: "شناسه محصول نامعتبر است." }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const hardDelete = searchParams.get("hard") === "true";

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ message: "محصول پیدا نشد." }, { status: 404 });
    }

    // حذف نرم
    if (!hardDelete) {
      product.isActive = false;
      await product.save();

      return NextResponse.json({
        message: "محصول غیرفعال شد (حذف نرم).",
        productId: String(product._id),
      });
    }

    // حذف واقعی با بررسی وابستگی
    const [variantCount, listingCount] = await Promise.all([
      ProductVariant.countDocuments({ product: id }),
      Listing.countDocuments({ product: id }),
    ]);

    if (variantCount > 0 || listingCount > 0) {
      return NextResponse.json(
        {
          message: "این محصول به Variant یا Listing متصل است و حذف واقعی ممکن نیست.",
          refs: { variantCount, listingCount },
        },
        { status: 409 }
      );
    }

    await Product.deleteOne({ _id: id });

    return NextResponse.json({ message: "محصول به‌صورت کامل حذف شد." });
  } catch (error) {
    console.error("DELETE /api/admin/products/[id] error:", error);
    return NextResponse.json({ message: "خطا در حذف محصول." }, { status: 500 });
  }
}
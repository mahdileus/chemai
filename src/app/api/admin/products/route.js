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
      error: NextResponse.json(
        { message: "ابتدا وارد حساب شوید." },
        { status: 401 }
      ),
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
    .populate("packagingType", "title code");
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
    // مهم: اینجا باید packagingType باشد نه PackagingType
    const exists = await PackagingType.exists({ _id: packagingType });
    if (!exists) return "نوع بسته‌بندی نامعتبر است.";
  }

  return null;
}

/* -------------------------------- GET ------------------------------- */
/**
 * GET /api/admin/products
 */
export async function GET(req) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);

    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "20", 10), 1),
      100
    );

    const q = String(searchParams.get("q") || "").trim();
    const category = String(searchParams.get("category") || "").trim();
    const isActiveParam = String(searchParams.get("isActive") || "").trim();
    const pharmacopeia = String(searchParams.get("pharmacopeia") || "").trim();
    const grade = String(searchParams.get("grade") || "").trim();
    const form = String(searchParams.get("form") || "").trim();

    const filter = {};

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { slug: { $regex: q, $options: "i" } },
        { shortDescription: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { casNumber: { $regex: q, $options: "i" } },
        { hsCode: { $regex: q, $options: "i" } },
      ];
    }

    if (category) {
      if (!isValidObjectId(category)) {
        return NextResponse.json(
          { message: "شناسه دسته‌بندی نامعتبر است." },
          { status: 400 }
        );
      }
      filter.category = category;
    }

    if (pharmacopeia) {
      if (!isValidObjectId(pharmacopeia)) {
        return NextResponse.json(
          { message: "شناسه فارماکوپه نامعتبر است." },
          { status: 400 }
        );
      }
      filter.pharmacopeia = pharmacopeia;
    }

    if (grade) {
      if (!isValidObjectId(grade)) {
        return NextResponse.json(
          { message: "شناسه گرید نامعتبر است." },
          { status: 400 }
        );
      }
      filter.grade = grade;
    }

    if (form) {
      if (!isValidObjectId(form)) {
        return NextResponse.json(
          { message: "شناسه فرم نامعتبر است." },
          { status: 400 }
        );
      }
      filter.form = form;
    }

    if (isActiveParam === "true") filter.isActive = true;
    if (isActiveParam === "false") filter.isActive = false;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      productPopulateQuery(
        Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
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
    console.error("GET /api/admin/products error:", error);
    return NextResponse.json(
      { message: "خطا در دریافت محصولات." },
      { status: 500 }
    );
  }
}

/* -------------------------------- POST ------------------------------ */
/**
 * POST /api/admin/products
 */
export async function POST(req) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await req.json();

    // required
    const title = String(body?.title ?? "").trim();
    const category = String(body?.category ?? "").trim();

    // basic
    let slug = String(body?.slug ?? "").trim();
    const shortDescription = String(body?.shortDescription ?? "").trim();
    const description = String(body?.description ?? "").trim();

    // images
    const featuredImage = String(body?.featuredImage ?? "").trim();
    const images = normalizeImages(body?.images);

    // refs (optional)
    const pharmacopeia = normalizeOptionalObjectId(body?.pharmacopeia);
    const gradeRef = normalizeOptionalObjectId(body?.grade);
    const formRef = normalizeOptionalObjectId(body?.form);
    const manufacturer = normalizeOptionalObjectId(body?.manufacturer);
    const originCountry = normalizeOptionalObjectId(body?.originCountry);
    const packagingType = normalizeOptionalObjectId(body?.packagingType); // اگر در Product داری

    // codes / flags
    const casNumber = String(body?.casNumber ?? "").trim();
    const hsCode = String(body?.hsCode ?? "").trim();
    const isActive = typeof body?.isActive === "boolean" ? body.isActive : true;

    // specs
    const specs = normalizeSpecs(body?.specs);

    // validations
    if (!title) {
      return NextResponse.json(
        { message: "عنوان محصول الزامی است." },
        { status: 400 }
      );
    }

    if (!category || !isValidObjectId(category)) {
      return NextResponse.json(
        { message: "دسته‌بندی معتبر نیست." },
        { status: 400 }
      );
    }

    if (
      [
        pharmacopeia,
        gradeRef,
        formRef,
        manufacturer,
        originCountry,
        packagingType,
      ].includes("__INVALID__")
    ) {
      return NextResponse.json(
        { message: "یکی از فیلدهای انتخابی نامعتبر است." },
        { status: 400 }
      );
    }

    slug = toSlug(slug || title);
    if (!slug) {
      return NextResponse.json(
        { message: "اسلاگ معتبر تولید نشد." },
        { status: 400 }
      );
    }

    const duplicateSlug = await Product.exists({ slug });
    if (duplicateSlug) {
      return NextResponse.json(
        { message: "این اسلاگ قبلاً ثبت شده است." },
        { status: 409 }
      );
    }

    const refError = await validateReferencedEntities({
      category,
      pharmacopeia,
      grade: gradeRef,
      form: formRef,
      manufacturer,
      originCountry,
      packagingType,
    });

    if (refError) {
      return NextResponse.json({ message: refError }, { status: 404 });
    }

    const created = await Product.create({
      title,
      slug,
      category,

      shortDescription,
      description,

      featuredImage,
      images,

      pharmacopeia,
      grade: gradeRef,
      form: formRef,
      manufacturer,
      originCountry,
      packagingType, // اگر در مدل Product اضافه کردی

      casNumber,
      hsCode,
      isActive,

      specs,
    });

    const product = await productPopulateQuery(
      Product.findById(created._id)
    ).lean();

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
      return NextResponse.json(
        { message: "مقدار یکتا تکراری است (احتمالاً اسلاگ)." },
        { status: 409 }
      );
    }

    if (error?.name === "ValidationError") {
      return NextResponse.json(
        { message: "داده‌های ارسالی معتبر نیستند.", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "خطا در ایجاد محصول." }, { status: 500 });
  }
}
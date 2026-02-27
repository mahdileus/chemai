import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDB from "@/configs/db";
import { authUser } from "@/utils/auth-server";

import Listing from "@/models/Listing";
import Product from "@/models/Product";
import ProductVariant from "@/models/ProductVariant";

export const runtime = "nodejs";

/* ----------------------------- Helpers ----------------------------- */

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function normalizePositiveNumber(value, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return n;
}

function normalizeFiles(files) {
  if (!Array.isArray(files)) return [];
  return files
    .map((f) => ({
      url: String(f?.url ?? "").trim(),
      key: String(f?.key ?? "").trim(),
      mime: String(f?.mime ?? "").trim(),
      size: Number(f?.size ?? 0) || 0,
      uploadedAt: f?.uploadedAt ? new Date(f.uploadedAt) : undefined,
    }))
    .filter((f) => f.url);
}

function normalizeLots(lots) {
  if (!Array.isArray(lots)) return [];
  return lots.map((lot) => ({
    _id: lot?._id, // برای حفظ _id اگر از UI فرستادی
    lotNo: String(lot?.lotNo ?? "").trim(),
    mfgDate: lot?.mfgDate ? new Date(lot.mfgDate) : null,
    expDate: lot?.expDate ? new Date(lot.expDate) : null,
    originCountryText: String(lot?.originCountryText ?? "").trim(),
    manufacturerText: String(lot?.manufacturerText ?? "").trim(),
    availableQty: normalizePositiveNumber(lot?.availableQty, 0),
    qtyUnit: String(lot?.qtyUnit ?? "KG").trim().toUpperCase(),
    coaFiles: normalizeFiles(lot?.coaFiles),
    isActive: typeof lot?.isActive === "boolean" ? lot.isActive : true,
  }));
}

async function requireUser() {
  await connectToDB();
  const user = await authUser();

  if (!user) {
    return {
      error: NextResponse.json({ message: "ابتدا وارد حساب شوید." }, { status: 401 }),
    };
  }

  return { user };
}

function populateListingQuery(query) {
  return query
    .populate("product", "title slug featuredImage category")
    .populate("variant")
    .populate("packaging.type", "title code")
    .populate("seller", "firstName lastName companyName");
}

/* -------------------------------- GET ------------------------------- */
export async function GET(req, context) {
  try {
    const auth = await requireUser();
    if (auth.error) return auth.error;

    const userId = String(auth.user._id);
    const { id } = await context.params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: "شناسه آگهی نامعتبر است." }, { status: 400 });
    }

    const listing = await populateListingQuery(
      Listing.findOne({ _id: id, seller: userId })
    ).lean();

    if (!listing) {
      return NextResponse.json({ message: "آگهی پیدا نشد." }, { status: 404 });
    }

    return NextResponse.json({ listing });
  } catch (error) {
    console.error("GET /api/user/listings/[id] error:", error);
    return NextResponse.json({ message: "خطا در دریافت آگهی." }, { status: 500 });
  }
}

/* -------------------------------- PATCH ------------------------------ */
export async function PATCH(req, context) {
  try {
    const auth = await requireUser();
    if (auth.error) return auth.error;

    const userId = String(auth.user._id);
    const { id } = await context.params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: "شناسه آگهی نامعتبر است." }, { status: 400 });
    }

    const listing = await Listing.findOne({ _id: id, seller: userId });
    if (!listing) {
      return NextResponse.json({ message: "آگهی پیدا نشد." }, { status: 404 });
    }

    const body = await req.json();
    const update = {};

    // اجازه تغییر product/variant فعلاً نمی‌دهیم (برای سادگی و جلوگیری از ناسازگاری)
    // فقط داده‌های فروشنده قابل ویرایش باشد

    if (body.price !== undefined) {
      const price = Number(body.price);
      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json({ message: "قیمت نامعتبر است." }, { status: 400 });
      }
      update.price = price;
    }

    if (body.currency !== undefined) {
      update.currency = String(body.currency ?? "IRR").trim().toUpperCase();
    }

    if (body.priceUnit !== undefined) {
      update.priceUnit = String(body.priceUnit ?? "KG").trim().toUpperCase();
    }

    if (body.note !== undefined) {
      update.note = String(body.note ?? "").trim();
    }

    if (body.minOrderQty !== undefined) {
      update.minOrderQty = normalizePositiveNumber(body.minOrderQty, 0);
    }

    if (body.leadTimeDays !== undefined) {
      update.leadTimeDays = normalizePositiveNumber(body.leadTimeDays, 0);
    }

    if (body.description !== undefined) {
      update.description = String(body.description ?? "").trim();
    }

    if (body.status !== undefined) {
      const status = String(body.status ?? "").trim();
      const allowedStatuses = ["DRAFT", "ACTIVE", "PAUSED", "SOLD_OUT", "ARCHIVED"];
      if (!allowedStatuses.includes(status)) {
        return NextResponse.json({ message: "وضعیت نامعتبر است." }, { status: 400 });
      }
      update.status = status;
    }

    if (body.packaging !== undefined) {
      const p = body.packaging || {};
      const nextPackagingType = String(p?.type ?? listing.packaging?.type ?? "").trim();

      if (!isValidObjectId(nextPackagingType)) {
        return NextResponse.json({ message: "نوع بسته‌بندی نامعتبر است." }, { status: 400 });
      }

      const amountPerPack =
        p?.amountPerPack !== undefined
          ? Number(p.amountPerPack)
          : Number(listing.packaging?.amountPerPack ?? 0);

      if (!Number.isFinite(amountPerPack) || amountPerPack <= 0) {
        return NextResponse.json(
          { message: "مقدار هر بسته باید بیشتر از صفر باشد." },
          { status: 400 }
        );
      }

      // چک مجاز بودن packaging type داخل variant
      const variant = await ProductVariant.findById(listing.variant).select("allowedPackagingTypes").lean();
      if (!variant) {
        return NextResponse.json({ message: "واریانت آگهی نامعتبر است." }, { status: 400 });
      }

      const allowed = (variant.allowedPackagingTypes || []).map((x) => String(x));
      if (!allowed.includes(String(nextPackagingType))) {
        return NextResponse.json(
          { message: "نوع بسته‌بندی انتخاب‌شده برای این واریانت مجاز نیست." },
          { status: 400 }
        );
      }

      update.packaging = {
        type: nextPackagingType,
        amountPerPack,
        unit: String(p?.unit ?? listing.packaging?.unit ?? "KG").trim().toUpperCase(),
        description: String(p?.description ?? listing.packaging?.description ?? "").trim(),
      };
    }

    if (body.lots !== undefined) {
      update.lots = normalizeLots(body.lots);
    }

    const updated = await populateListingQuery(
      Listing.findByIdAndUpdate(listing._id, update, {
        new: true,
        runValidators: true,
      })
    ).lean();

    return NextResponse.json({
      message: "آگهی با موفقیت ویرایش شد.",
      listing: updated,
    });
  } catch (error) {
    console.error("PATCH /api/user/listings/[id] error:", error);
    return NextResponse.json({ message: "خطا در ویرایش آگهی." }, { status: 500 });
  }
}

/* -------------------------------- DELETE ----------------------------- */
// حذف نرم = آرشیو
export async function DELETE(req, context) {
  try {
    const auth = await requireUser();
    if (auth.error) return auth.error;

    const userId = String(auth.user._id);
    const { id } = await context.params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: "شناسه آگهی نامعتبر است." }, { status: 400 });
    }

    const listing = await Listing.findOne({ _id: id, seller: userId });
    if (!listing) {
      return NextResponse.json({ message: "آگهی پیدا نشد." }, { status: 404 });
    }

    listing.status = "ARCHIVED";
    await listing.save();

    return NextResponse.json({
      message: "آگهی آرشیو شد.",
      listingId: String(listing._id),
    });
  } catch (error) {
    console.error("DELETE /api/user/listings/[id] error:", error);
    return NextResponse.json({ message: "خطا در آرشیو آگهی." }, { status: 500 });
  }
}
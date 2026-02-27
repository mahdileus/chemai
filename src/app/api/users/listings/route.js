import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDB from "@/configs/db";
import { authUser } from "@/utils/auth-server";

import Listing from "@/models/Listing";
import Product from "@/models/Product";
import ProductVariant from "@/models/ProductVariant";
import Subscription from "@/models/Subscription";
import Plan from "@/models/Plan";

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

async function getActivePlanForUser(userId) {
  const now = new Date();

  // اشتراک فعال و منقضی‌نشده
  const activeSub = await Subscription.findOne({
    user: userId,
    status: "ACTIVE",
    startsAt: { $lte: now },
    endsAt: { $gte: now },
  })
    .populate("plan")
    .lean();

  if (activeSub?.plan) {
    return {
      source: "subscription",
      subscription: activeSub,
      plan: activeSub.plan,
      maxListings: activeSub.plan?.features?.maxListings ?? null,
    };
  }

  // fallback به پلن رایگان HYDROGEN
  const hydrogen = await Plan.findOne({
    code: "HYDROGEN",
    isActive: true,
  }).lean();

  if (hydrogen) {
    return {
      source: "fallback_hydrogen",
      subscription: null,
      plan: hydrogen,
      maxListings: hydrogen?.features?.maxListings ?? 5,
    };
  }

  // اگر رکورد HYDROGEN هم نبود، باز fallback هاردکد
  return {
    source: "fallback_hardcoded",
    subscription: null,
    plan: null,
    maxListings: 5,
  };
}

async function assertUserCanCreateListing(userId) {
  const planInfo = await getActivePlanForUser(userId);

  const maxListings = planInfo.maxListings; // null یعنی نامحدود
  if (maxListings == null) {
    return { ok: true, planInfo, activeCount: 0 };
  }

  const activeStatuses = ["DRAFT", "ACTIVE", "PAUSED", "SOLD_OUT"];

  const activeCount = await Listing.countDocuments({
    seller: userId,
    status: { $in: activeStatuses },
  });

  if (activeCount >= maxListings) {
    return {
      ok: false,
      code: "LISTING_LIMIT_REACHED",
      activeCount,
      maxListings,
      planInfo,
      message: `سقف مجاز آگهی‌های شما پر شده است. (${activeCount} از ${maxListings})`,
    };
  }

  return { ok: true, planInfo, activeCount, maxListings };
}


/* -------------------------------- POST ------------------------------ */
export async function POST(req) {
  try {
    const auth = await requireUser();
    if (auth.error) return auth.error;

    const userId = String(auth.user._id);

    // 1) چک پلن و سقف
    const canCreate = await assertUserCanCreateListing(userId);
    if (!canCreate.ok) {
      return NextResponse.json(
        {
          message: canCreate.message,
          code: canCreate.code,
          activeCount: canCreate.activeCount,
          maxListings: canCreate.maxListings,
          planCode:
            canCreate.planInfo?.plan?.code ||
            canCreate.planInfo?.subscription?.planCode ||
            "HYDROGEN",
        },
        { status: 409 }
      );
    }

    const body = await req.json();

    // 2) required fields
    const productId = String(body?.product ?? "").trim();
    const variantId = String(body?.variant ?? "").trim();

    if (!isValidObjectId(productId)) {
      return NextResponse.json({ message: "شناسه محصول نامعتبر است." }, { status: 400 });
    }

    if (!isValidObjectId(variantId)) {
      return NextResponse.json({ message: "شناسه واریانت نامعتبر است." }, { status: 400 });
    }

    // قیمت و بسته‌بندی (حداقل‌های ضروری)
    const price = Number(body?.price);
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ message: "قیمت نامعتبر است." }, { status: 400 });
    }

    const packagingTypeId = String(body?.packaging?.type ?? "").trim();
    if (!isValidObjectId(packagingTypeId)) {
      return NextResponse.json({ message: "نوع بسته‌بندی انتخاب‌شده نامعتبر است." }, { status: 400 });
    }

    const amountPerPack = Number(body?.packaging?.amountPerPack);
    if (!Number.isFinite(amountPerPack) || amountPerPack <= 0) {
      return NextResponse.json({ message: "مقدار هر بسته باید بیشتر از صفر باشد." }, { status: 400 });
    }

    // 3) واکشی product / variant
    const [product, variant] = await Promise.all([
      Product.findOne({ _id: productId, isActive: true }).lean(),
      ProductVariant.findOne({ _id: variantId, isActive: true }).lean(),
    ]);

    if (!product) {
      return NextResponse.json({ message: "محصول معتبر/فعال پیدا نشد." }, { status: 404 });
    }

    if (!variant) {
      return NextResponse.json({ message: "واریانت معتبر/فعال پیدا نشد." }, { status: 404 });
    }

    // 4) چک تعلق واریانت به محصول
    if (String(variant.product) !== String(product._id)) {
      return NextResponse.json(
        { message: "واریانت انتخاب‌شده متعلق به این محصول نیست." },
        { status: 400 }
      );
    }

    // 5) چک نوع بسته‌بندی مجاز در واریانت
    const allowedPackagingTypes = Array.isArray(variant.allowedPackagingTypes)
      ? variant.allowedPackagingTypes.map((id) => String(id))
      : [];

    if (!allowedPackagingTypes.includes(packagingTypeId)) {
      return NextResponse.json(
        { message: "نوع بسته‌بندی انتخاب‌شده برای این واریانت مجاز نیست." },
        { status: 400 }
      );
    }

    // 6) optional fields
    const currency = String(body?.currency ?? "IRR").trim().toUpperCase();
    const priceUnit = String(body?.priceUnit ?? "KG").trim().toUpperCase();
    const note = String(body?.note ?? "").trim();

    const minOrderQty = normalizePositiveNumber(body?.minOrderQty, 0);
    const leadTimeDays = normalizePositiveNumber(body?.leadTimeDays, 0);
    const description = String(body?.description ?? "").trim();

    const packaging = {
      type: packagingTypeId,
      amountPerPack,
      unit: String(body?.packaging?.unit ?? "KG").trim().toUpperCase(),
      description: String(body?.packaging?.description ?? "").trim(),
    };

    const lots = normalizeLots(body?.lots);

    const status = ["DRAFT", "ACTIVE", "PAUSED", "SOLD_OUT", "ARCHIVED"].includes(
      String(body?.status ?? "")
    )
      ? String(body.status)
      : "DRAFT";

    // 7) create listing
    const created = await Listing.create({
      product: product._id,
      variant: variant._id,
      seller: userId,

      price,
      currency,
      priceUnit,
      note,

      minOrderQty,
      leadTimeDays,
      description,

      packaging,
      lots,

      status,
    });

    const populated = await Listing.findById(created._id)
      .populate("product", "title slug featuredImage category")
      .populate("variant")
      .populate("seller", "firstName lastName companyName")
      .populate("packaging.type", "title code")
      .lean();

    return NextResponse.json(
      {
        message: "آگهی با موفقیت ایجاد شد.",
        listing: populated,
        plan: {
          code:
            canCreate.planInfo?.plan?.code ||
            canCreate.planInfo?.subscription?.planCode ||
            "HYDROGEN",
          maxListings: canCreate.maxListings ?? null,
          usedAfterCreate:
            canCreate.maxListings == null ? null : (canCreate.activeCount ?? 0) + 1,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/user/listings error:", error);

    if (error?.code === 11000) {
      return NextResponse.json(
        {
          message:
            "برای این واریانت قبلاً آگهی فعال/پیش‌نویس ثبت کرده‌اید.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({ message: "خطا در ایجاد آگهی." }, { status: 500 });
  }
}
export async function GET(req) {
  try {
    const auth = await requireUser();
    if (auth.error) return auth.error;

    const userId = String(auth.user._id);
    const { searchParams } = new URL(req.url);

    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "10", 10), 1), 100);

    const q = String(searchParams.get("q") || "").trim();
    const status = String(searchParams.get("status") || "").trim(); // optional

    const filter = { seller: userId };

    if (status && ["DRAFT", "ACTIVE", "PAUSED", "SOLD_OUT", "ARCHIVED"].includes(status)) {
      filter.status = status;
    }

    if (q) {
      // جستجو روی note / description و title محصول بعد از populate سخت است
      // پس فعلاً روی note/description خود listing جستجو می‌کنیم
      filter.$or = [
        { note: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Listing.find(filter)
        .sort({ bumpAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("product", "title slug featuredImage category")
        .populate("variant", "pharmacopeia grade form manufacturer originCountry")
        .populate("packaging.type", "title code")
        .lean(),
      Listing.countDocuments(filter),
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
    console.error("GET /api/user/listings error:", error);
    return NextResponse.json({ message: "خطا در دریافت آگهی‌های شما." }, { status: 500 });
  }
}
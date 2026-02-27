import mongoose from "mongoose";
const { Schema } = mongoose;

/** ثابت‌ها */
const UNIT_ENUM = ["KG", "G", "L", "ML", "PCS"];
const CURRENCY_ENUM = ["IRR", "USD", "EUR"];

/** فایل‌ها مثل COA */
const fileSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    key: { type: String, trim: true, default: "" }, // S3/Cloudinary id
    mime: { type: String, trim: true, default: "" },
    size: { type: Number, default: 0, min: 0 },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

/** بسته‌بندی انتخابی فروشنده */
const packagingSchema = new Schema(
  {
    type: {
      type: Schema.Types.ObjectId,
      ref: "PackagingType",
      required: true,
      index: true,
    },
    amountPerPack: { type: Number, required: true, min: 0 },
    unit: {
      type: String,
      trim: true,
      default: "KG",
      enum: UNIT_ENUM,
      index: true,
    },
    description: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

/** Lot / Batch اطلاعات واقعی (تاریخ‌ها + COA + مقدار) */
const lotSchema = new Schema(
  {
    lotNo: { type: String, trim: true, default: "" },

    mfgDate: { type: Date, default: null, index: true },
    expDate: { type: Date, default: null, index: true },

    // اگر خواستی در آینده واقعی‌ترش کنی، می‌تونه override کنه
    originCountryText: { type: String, trim: true, default: "" },
    manufacturerText: { type: String, trim: true, default: "" },

    availableQty: { type: Number, default: 0, min: 0 },
    qtyUnit: {
      type: String,
      trim: true,
      default: "KG",
      enum: UNIT_ENUM,
      index: true,
    },

    coaFiles: { type: [fileSchema], default: [] },
    isActive: { type: Boolean, default: true, index: true },
  },
  { _id: true, timestamps: true }
);

/** اعتبارسنجی منطقی تاریخ Lot */
lotSchema.pre("validate", function (next) {
  if (this.mfgDate && this.expDate && this.expDate <= this.mfgDate) {
    return next(new Error("expDate must be greater than mfgDate"));
  }
  next();
});

const listingSchema = new Schema(
  {
    // لینک به کاتالوگ/variant
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    variant: {
      type: Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: true,
      index: true,
    },

    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // قیمت‌گذاری
    price: { type: Number, required: true, min: 0, index: true },
    currency: {
      type: String,
      trim: true,
      default: "IRR",
      enum: CURRENCY_ENUM,
      index: true,
    },
    priceUnit: {
      type: String,
      trim: true,
      default: "KG",
      enum: UNIT_ENUM,
      index: true,
    },

    note: { type: String, trim: true, default: "" },

    // شرایط فروش
    minOrderQty: { type: Number, default: 0, min: 0, index: true },
    leadTimeDays: { type: Number, default: 0, min: 0 },
    description: { type: String, trim: true, default: "" },

    packaging: { type: packagingSchema, required: true },

    // Lotها (تاریخ تولید/انقضا + COA + موجودی)
    lots: { type: [lotSchema], default: [] },

    // وضعیت نمایش در بازارگاه
    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE", "PAUSED", "SOLD_OUT", "ARCHIVED"],
      default: "DRAFT",
      index: true,
    },

    // آسانسور (Bump)
    bumpAt: { type: Date, default: null, index: true },

    // آمار
    viewsCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

/** موجودی کل (virtual) */
listingSchema.virtual("totalAvailableQty").get(function () {
  if (!Array.isArray(this.lots)) return 0;
  return this.lots.reduce((sum, lot) => {
    if (!lot?.isActive) return sum;
    return sum + (Number(lot.availableQty) || 0);
  }, 0);
});

/** Index های کاربردی برای فیلتر و سرچ بازارگاه */
listingSchema.index({ status: 1, product: 1 });
listingSchema.index({ status: 1, variant: 1 });
listingSchema.index({ status: 1, seller: 1 });
listingSchema.index({ status: 1, bumpAt: -1, createdAt: -1 });
listingSchema.index({ status: 1, price: 1 });

/**
 * جلوگیری از duplicate آگهی:
 * هر فروشنده برای هر Variant فقط یک Listing غیرآرشیوی داشته باشد
 */
listingSchema.index(
  { seller: 1, variant: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["DRAFT", "ACTIVE", "PAUSED", "SOLD_OUT"] },
    },
  }
);

export default mongoose.models.Listing || mongoose.model("Listing", listingSchema);
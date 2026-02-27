import mongoose from "mongoose";
const { Schema } = mongoose;

const purchaseItemSnapshotSchema = new Schema(
  {
    productTitle: { type: String, trim: true, default: "" },
    variantInfo: {
      pharmacopeia: { type: String, trim: true, default: "" },
      grade: { type: String, trim: true, default: "" },
      form: { type: String, trim: true, default: "" },
      manufacturer: { type: String, trim: true, default: "" },
      originCountry: { type: String, trim: true, default: "" },
    },
    packaging: {
      typeTitle: { type: String, trim: true, default: "" }, // مثلا Drum
      amountPerPack: { type: Number, default: 0, min: 0 },
      unit: { type: String, trim: true, default: "KG" },
    },
    price: { type: Number, default: 0, min: 0 },
    currency: { type: String, trim: true, default: "IRR" },
    priceUnit: { type: String, trim: true, default: "KG" },
  },
  { _id: false }
);

const purchaseRequestSchema = new Schema(
  {
    buyer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    variant: { type: Schema.Types.ObjectId, ref: "ProductVariant", required: true, index: true },

    // مقدار درخواست شده
    requestedQty: { type: Number, required: true, min: 0 },
    qtyUnit: { type: String, trim: true, default: "KG" },

    // اگر بسته‌بندی انتخابی مهمه
    requestedPacksCount: { type: Number, default: 0, min: 0 },

    // توضیحات/شرایط
    note: { type: String, trim: true, default: "" },

    // snapshot از اطلاعات آگهی در زمان ثبت درخواست
    listingSnapshot: { type: purchaseItemSnapshotSchema, default: () => ({}) },

    status: {
      type: String,
      enum: [
        "SUBMITTED",          // ثبت شد
        "UNDER_REVIEW",       // بررسی ادمین
        "WAITING_SELLER",     // منتظر تایید فروشنده
        "APPROVED",           // تایید شد (آماده صدور/تایید پیش‌فاکتور)
        "REJECTED",           // رد شد
        "CANCELLED",          // خریدار لغو کرد
        "EXPIRED",            // منقضی شد
        "CONVERTED",          // تبدیل به سفارش/پیش‌فاکتور نهایی
      ],
      default: "SUBMITTED",
      index: true,
    },

    // تخصیص به ادمین (اختیاری)
    adminAssignee: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },

    // زمان‌های کاربردی
    expiresAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

purchaseRequestSchema.index({ buyer: 1, createdAt: -1 });
purchaseRequestSchema.index({ seller: 1, status: 1, createdAt: -1 });
purchaseRequestSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.PurchaseRequest ||
  mongoose.model("PurchaseRequest", purchaseRequestSchema);
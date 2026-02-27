import mongoose from "mongoose";
import crypto from "crypto";

const { Schema } = mongoose;

const legalInfoSchema = new Schema(
  {
    companyName: { type: String, trim: true },          // نام شرکت
    companyNationalId: { type: String, trim: true },    // شناسه ملی شرکت
    registrationNo: { type: String, trim: true },       // شماره ثبت
    economicCode: { type: String, trim: true },         // کد اقتصادی
  },
  { _id: false }
);

const walletSchema = new Schema(
  {
    balance: { type: Number, default: 0, min: 0 },      // موجودی کیف پول (ریال/تومان/هر واحد)
    locked: { type: Number, default: 0, min: 0 },       // موجودی بلوکه
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    // --- Identity / Auth ---
    phone: { type: String, required: true, unique: true, index: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },

    password: { type: String, select: false },

    role: {
      type: String,
      enum: ["USER", "ADMIN", "MODERATOR"],
      default: "USER",
      index: true,
    },

    // حقیقی / حقوقی
    accountType: { type: String, enum: ["REAL", "LEGAL"], default: "REAL", index: true },

    firstName: { type: String, trim: true, required: true },
    lastName: { type: String, trim: true, required: true },

    // کد ملی حقیقی (اختیاری + یونیک درست)
    nationalCode: { type: String, unique: true, sparse: true, trim: true },

    // حقوقی
    legalInfo: { type: legalInfoSchema, default: {} },

    // کد کِما: ch-xxxxx
    chemaiCode: { type: String, unique: true, index: true },

    // شماره شبا
    iban: { type: String, trim: true, default: "" },

    avatar: { type: String, default: "/images/default-avatar.png" },

    // --- Platform features ---
    // اعتبار (ادمین میده 1 تا 5)
    creditLevel: { type: Number, min: 1, max: 5, default: 1, index: true },

    // سکه
    coins: { type: Number, default: 0, min: 0 },

    // کیف پول
    wallet: { type: walletSchema, default: () => ({}) },

    // --- Relations (refs) ---
    // محصولات/آگهی‌هایی که کاربر گذاشته
    products: [{ type: Schema.Types.ObjectId, ref: "Product", index: true }],

    // آیتم‌های خریداری شده (اگر واقعاً نیاز داری اینجا نگه داری؛ معمولاً از Invoice/Order در میاد)
    purchasedItems: [{ type: Schema.Types.ObjectId, ref: "Product" }],

    // پلن‌های خریداری‌شده
    purchasedPlans: [{ type: Schema.Types.ObjectId, ref: "PlanPurchase", index: true }],

    // تیکت‌ها
    tickets: [{ type: Schema.Types.ObjectId, ref: "Ticket", index: true }],

    // نوتیف‌ها
    notifications: [{ type: Schema.Types.ObjectId, ref: "Notification", index: true }],

    // تخفیف‌ها/کوپن‌های اختصاصی
    discounts: [{ type: Schema.Types.ObjectId, ref: "DiscountGrant", index: true }],

    // فاکتورها (Invoice/Order)
    invoices: [{ type: Schema.Types.ObjectId, ref: "Invoice", index: true }],

    // تراکنش‌ها (Wallet/Payment)
    transactions: [{ type: Schema.Types.ObjectId, ref: "Transaction", index: true }],

    // آدرس‌ها (اگر داری)
    addresses: [{ type: Schema.Types.ObjectId, ref: "Address" }],

    // --- Refresh session ---
    // پیشنهاد: یک refreshToken ساده (برای MVP)
    refreshToken: { type: String, select: false, default: "" },
    refreshTokenHash: { type: String, select: false, default: "" },

    profileCompleted: { type: Boolean, default: false, index: true },
    profileBonusGivenAt: { type: Date, default: null },

    // وضعیت‌ها
    isBlocked: { type: Boolean, default: false, index: true },
    blockedUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

/**
 * پیشنهاد مهم:
 * اگر accountType=LEGAL → companyName باید پر باشد
 * اگر accountType=REAL → nationalCode می‌تواند اختیاری باشد (یا اجباری کنید)
 */
userSchema.pre("save", function (next) {
  if (this.accountType === "LEGAL") {
    if (!this.legalInfo?.companyName) {
      return next(new Error("companyName is required for LEGAL accounts"));
    }
  }
  next();
});
  userSchema.pre("save", function (next) {
  if (!this.chemaiCode) {
    this.chemaiCode = `ch-${crypto.randomBytes(3).toString("hex")}`;
  }
  next();
});

export default mongoose.models.User || mongoose.model("User", userSchema);
import mongoose from "mongoose";
const { Schema } = mongoose;

const transactionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // نوع تراکنش
    type: {
      type: String,
      enum: [
        "DEPOSIT",        // شارژ
        "WITHDRAW",       // برداشت
        "PAYMENT",        // پرداخت (خرید پلن/سفارش)
        "REFUND",         // برگشت پول
        "HOLD",           // بلوکه کردن
        "RELEASE",        // آزادسازی بلوکه
        "ADJUSTMENT",     // اصلاح دستی توسط ادمین
      ],
      required: true,
      index: true,
    },

    // تاثیر روی موجودی
    // amount همیشه مثبت ذخیره میشه، direction مشخص می‌کنه +/- به موجودی اعمال بشه
    direction: {
      type: String,
      enum: ["IN", "OUT"],
      required: true,
      index: true,
    },

    // مبلغ
    amount: { type: Number, required: true, min: 0 },

    currency: { type: String, trim: true, default: "IRR", index: true },

    // اگر تراکنش مربوط به چیزی است (پلن/سفارش/فاکتور...)
    refType: {
      type: String,
      enum: ["Plan", "Subscription", "Order", "Invoice", "ProformaInvoice", "PurchaseRequest", ""],
      default: "",
      index: true,
    },
    refId: { type: Schema.Types.ObjectId, default: null, index: true },

    // توضیحات
    description: { type: String, trim: true, default: "" },

    // وضعیت تراکنش (خصوصاً برای پرداخت درگاه یا برداشت)
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "CANCELLED"],
      default: "SUCCESS",
      index: true,
    },

    // اگه توسط ادمین انجام شد
    actor: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },

    // snapshot از موجودی بعد از اعمال (خیلی کمک می‌کنه برای دیباگ/گزارش)
    balanceAfter: { type: Number, default: null },
    lockedAfter: { type: Number, default: null },
  },
  { timestamps: true }
);

transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ refType: 1, refId: 1, createdAt: -1 });

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", transactionSchema);
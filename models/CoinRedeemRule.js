import mongoose from "mongoose";
const { Schema } = mongoose;

const coinRedeemRuleSchema = new Schema(
  {
    isActive: { type: Boolean, default: true, index: true },

    // مثال شما:
    // 100 coin => 1,000,000 تخفیف
    coinsPerUnit: { type: Number, required: true, min: 1 },      // 100
    discountPerUnit: { type: Number, required: true, min: 0 },   // 1000000
    currency: { type: String, trim: true, default: "IRR" },

    // محدودیت‌ها
    maxDiscountPerPurchase: { type: Number, default: 0, min: 0 }, // 0 یعنی نامحدود
    minCoinsToRedeem: { type: Number, default: 0, min: 0 },

    // برای اینکه rule تاریخچه‌دار باشه
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
  },
  { timestamps: true }
);

coinRedeemRuleSchema.index({ isActive: 1, startsAt: 1, endsAt: 1 });

export default mongoose.models.CoinRedeemRule ||
  mongoose.model("CoinRedeemRule", coinRedeemRuleSchema);
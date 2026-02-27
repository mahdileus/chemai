import mongoose from "mongoose";
const { Schema } = mongoose;

const subscriptionUsageSchema = new Schema(
  {
    // lift ماهانه
    liftUsed: { type: Number, default: 0, min: 0 },
    liftMonthKey: { type: String, trim: true, default: "" }, // مثل "2026-02"

    // tender/auction سالانه
    tenderAuctionUsed: { type: Number, default: 0, min: 0 },
    tenderYear: { type: Number, default: 0, min: 0 },

    // بنر سالانه
    bannersUsed: { type: Number, default: 0, min: 0 },
    bannerYear: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const subscriptionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    plan: { type: Schema.Types.ObjectId, ref: "Plan", required: true, index: true },
    planCode: {
      type: String,
      enum: ["HYDROGEN", "CARBON", "SILVER", "GOLD"],
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "CANCELLED"],
      default: "ACTIVE",
      index: true,
    },

    startsAt: { type: Date, required: true, index: true },
    endsAt: { type: Date, required: true, index: true },

    usage: { type: subscriptionUsageSchema, default: () => ({}) },

    // اگر پرداخت داری:
    paymentRef: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

// هر کاربر فقط یک subscription فعال داشته باشد
subscriptionSchema.index(
  { user: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "ACTIVE" } }
);

subscriptionSchema.index({ endsAt: 1, status: 1 });

export default mongoose.models.Subscription || mongoose.model("Subscription", subscriptionSchema);
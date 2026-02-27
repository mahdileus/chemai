import mongoose from "mongoose";
const { Schema } = mongoose;

const planFeaturesSchema = new Schema(
  {
    // سقف تعداد آگهی فعال (null یعنی نامحدود)
    maxListings: { type: Number, default: null, min: 0 },

    // آسانسور در ماه
    liftPerMonth: { type: Number, default: 0, min: 0 },

    // مناقصه + مزایده در سال (یا در دوره پلن سالانه)
    tenderAuctionPerYear: { type: Number, default: 0, min: 0 },

    // بنر بازارگاه در سال
    marketplaceBannerPerYear: { type: Number, default: 0, min: 0 },

    // بازاریابی پیامکی
    smsMarketing: { type: Boolean, default: false },

    // اعتبار کمایی
    chemaiCreditTier: {
      type: String,
      enum: ["NONE", "B", "A", "A_PLUS"],
      default: "NONE",
      index: true,
    },
  },
  { _id: false }
);

const planSchema = new Schema(
  {
    code: {
      type: String,
      enum: ["HYDROGEN", "CARBON", "SILVER", "GOLD"],
      required: true,
      unique: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    durationDays: { type: Number, default: 365, min: 1 },

    price: { type: Number, default: 0, min: 0 }, // قیمت سالانه (اگر داری)
    currency: { type: String, trim: true, default: "IRR" },

    features: { type: planFeaturesSchema, required: true },

    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

planSchema.index({ isActive: 1, sortOrder: 1 });

export default mongoose.models.Plan || mongoose.model("Plan", planSchema);
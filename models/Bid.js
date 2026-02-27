import mongoose from "mongoose";
const { Schema } = mongoose;

const bidSchema = new Schema(
  {
    tenderAuction: { type: Schema.Types.ObjectId, ref: "TenderAuction", required: true, index: true },

    bidder: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // برای TENDER bidder معمولاً seller است
    // برای AUCTION bidder معمولاً buyer است
    bidderRole: { type: String, enum: ["SELLER", "BUYER"], required: true, index: true },

    // قیمت پیشنهادی
    unitPrice: { type: Number, required: true, min: 0, index: true },
    currency: { type: String, trim: true, default: "IRR" },
    priceUnit: { type: String, trim: true, default: "KG" },

    // مقدار (گاهی bidder میگه من تا فلان مقدار می‌دم)
    qty: { type: Number, default: 0, min: 0 },
    qtyUnit: { type: String, trim: true, default: "KG" },

    note: { type: String, trim: true, default: "" },

    status: {
      type: String,
      enum: ["ACTIVE", "WITHDRAWN", "REJECTED", "ACCEPTED"],
      default: "ACTIVE",
      index: true,
    },
  },
  { timestamps: true }
);

// هر bidder برای هر tenderAuction فقط یک bid فعال داشته باشه (اختیاری)
bidSchema.index(
  { tenderAuction: 1, bidder: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "ACTIVE" } }
);

bidSchema.index({ tenderAuction: 1, createdAt: -1 });

export default mongoose.models.Bid || mongoose.model("Bid", bidSchema);
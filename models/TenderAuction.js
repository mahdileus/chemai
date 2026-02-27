import mongoose from "mongoose";
const { Schema } = mongoose;

const tenderAuctionSchema = new Schema(
  {
    type: { type: String, enum: ["TENDER", "AUCTION"], required: true, index: true },

    // owner بسته به نوع:
    // TENDER => requester (buyer)
    // AUCTION => seller
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // کالا
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    variant: { type: Schema.Types.ObjectId, ref: "ProductVariant", required: true, index: true },

    // مقدار
    qty: { type: Number, required: true, min: 0 },
    qtyUnit: { type: String, trim: true, default: "KG" },

    // شرایط کلی
    title: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    deliveryTerms: { type: String, trim: true, default: "" },
    paymentTerms: { type: String, trim: true, default: "" },

    // قیمت‌ها
    basePrice: { type: Number, default: 0, min: 0 }, // برای AUCTION مهمه (قیمت پایه)
    currency: { type: String, trim: true, default: "IRR", index: true },

    // محدودیت شرکت‌کنندگان (اختیاری)
    invitedSellers: [{ type: Schema.Types.ObjectId, ref: "User", index: true }], // برای TENDER خصوصی
    isPrivate: { type: Boolean, default: false, index: true },

    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "CLOSED", "AWARDED", "CANCELLED"],
      default: "DRAFT",
      index: true,
    },

    publishedAt: { type: Date, default: null, index: true },
    closesAt: { type: Date, required: true, index: true },

    // برنده
    winningBid: { type: Schema.Types.ObjectId, ref: "Bid", default: null, index: true },

    // خروجی به جریان خرید
    purchaseRequest: { type: Schema.Types.ObjectId, ref: "PurchaseRequest", default: null, index: true },
    proforma: { type: Schema.Types.ObjectId, ref: "ProformaInvoice", default: null, index: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", default: null, index: true },
  },
  { timestamps: true }
);

tenderAuctionSchema.index({ status: 1, closesAt: 1 });
tenderAuctionSchema.index({ type: 1, status: 1, createdAt: -1 });
tenderAuctionSchema.index({ owner: 1, status: 1, createdAt: -1 });

export default mongoose.models.TenderAuction ||
  mongoose.model("TenderAuction", tenderAuctionSchema);
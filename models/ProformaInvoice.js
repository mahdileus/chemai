import mongoose from "mongoose";
const { Schema } = mongoose;

const proformaItemSchema = new Schema(
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
      typeTitle: { type: String, trim: true, default: "" },
      amountPerPack: { type: Number, default: 0, min: 0 },
      unit: { type: String, trim: true, default: "KG" },
    },

    qty: { type: Number, required: true, min: 0 },
    qtyUnit: { type: String, trim: true, default: "KG" },

    unitPrice: { type: Number, required: true, min: 0 },
    currency: { type: String, trim: true, default: "IRR" },
    priceUnit: { type: String, trim: true, default: "KG" },

    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const proformaSchema = new Schema(
  {
    purchaseRequest: { type: Schema.Types.ObjectId, ref: "PurchaseRequest", required: true, unique: true, index: true },

    buyer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // شماره پیش‌فاکتور (بهتره سریالی باشه - فعلاً ساده)
    proformaNo: { type: String, required: true, unique: true, index: true },

    items: { type: [proformaItemSchema], default: [] },

    totals: {
      subtotal: { type: Number, default: 0, min: 0 },
      tax: { type: Number, default: 0, min: 0 },
      shipping: { type: Number, default: 0, min: 0 },
      grandTotal: { type: Number, default: 0, min: 0 },
    },

    status: {
      type: String,
      enum: ["ISSUED", "SENT", "CONFIRMED", "CANCELLED", "EXPIRED"],
      default: "ISSUED",
      index: true,
    },

    issuedBy: { type: Schema.Types.ObjectId, ref: "User", default: null }, // ادمین صادرکننده
    expiresAt: { type: Date, default: null, index: true },
    note: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

proformaSchema.index({ buyer: 1, createdAt: -1 });
proformaSchema.index({ seller: 1, status: 1, createdAt: -1 });
proformaSchema.index({ status: 1, expiresAt: 1 });

export default mongoose.models.ProformaInvoice ||
  mongoose.model("ProformaInvoice", proformaSchema);
import mongoose from "mongoose";

const { Schema } = mongoose;

const invoiceItemSchema = new Schema(
  {
    // ✅ Listing مبنا
    listingRef: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      index: true,
    },

    // ✅ فروشنده این آیتم
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ✅ محصول اصلی + snapshot
    productRef: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    productName: { type: String, required: true, trim: true }, // snapshot

    // ✅ نوع بسته بندی (snapshot)
    packaging: { type: String, trim: true, default: "" },

    // ✅ تاریخ درخواستی خریدار
    requestedDate: { type: Date, required: true, index: true },

    // ✅ تعداد و قیمت
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },

    notes: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const buyerSnapshotSchema = new Schema(
  {
    firstName: { type: String, trim: true, default: "" },
    lastName: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const invoiceSchema = new Schema(
  {
    invoiceNo: { type: String, unique: true, index: true },
    orderDate: { type: Date, default: Date.now, index: true },

    buyer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    buyerSnapshot: { type: buyerSnapshotSchema, default: () => ({}) },

    status: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "ADMIN_REVIEW", "CONFIRMED", "REJECTED", "CANCELLED"],
      default: "SUBMITTED",
      index: true,
    },

    items: { type: [invoiceItemSchema], required: true },

    subtotal: { type: Number, required: true, min: 0 },
    adminNote: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

// ✅ Index های کاربردی
invoiceSchema.index({ buyer: 1, createdAt: -1 });
invoiceSchema.index({ status: 1, createdAt: -1 });
invoiceSchema.index({ "items.seller": 1, createdAt: -1 });
invoiceSchema.index({ "items.listingRef": 1 });
invoiceSchema.index({ "items.productRef": 1 });

// شماره فاکتور: INV-YYYYMMDD-XXXXX
invoiceSchema.pre("save", async function (next) {
  if (this.invoiceNo) return next();

  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  const prefix = `INV-${y}${m}${day}-`;

  // شمارنده ساده روزانه با count (MVP)
  const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);

  const todayCount = await Invoice.countDocuments({ invoiceNo: { $regex: `^${prefix}` } });
  const seq = String(todayCount + 1).padStart(5, "0");

  this.invoiceNo = `${prefix}${seq}`;
  next();
});

export default mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);
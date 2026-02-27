import mongoose from "mongoose";
const { Schema } = mongoose;

const orderTimelineSchema = new Schema(
  {
    status: { type: String, trim: true, required: true },
    by: { type: Schema.Types.ObjectId, ref: "User", default: null },
    note: { type: String, trim: true, default: "" },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    purchaseRequest: { type: Schema.Types.ObjectId, ref: "PurchaseRequest", required: true, index: true },
    proforma: { type: Schema.Types.ObjectId, ref: "ProformaInvoice", required: true, index: true },

    buyer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    orderNo: { type: String, required: true, unique: true, index: true },

    status: {
      type: String,
      enum: [
        "CONFIRMED",
        "INVOICED",
        "PAID",
        "FULFILLING",
        "FULFILLED",
        "CANCELLED",
      ],
      default: "CONFIRMED",
      index: true,
    },

    timeline: { type: [orderTimelineSchema], default: [] },

    totals: {
      grandTotal: { type: Number, default: 0, min: 0 },
      currency: { type: String, trim: true, default: "IRR" },
    },
  },
  { timestamps: true }
);

orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ seller: 1, status: 1, createdAt: -1 });

export default mongoose.models.Order || mongoose.model("Order", orderSchema);